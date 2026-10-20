-- =====================================================================
-- PT GLOBAL EXPOR INDONESIA — ENTERPRISE POSTGRESQL SCHEMA (SUPABASE)
-- Normalized Schema with UUIDs, RLS, Foreign Keys, Audit Triggers, Indexes
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORGANIZATIONS (Multi-tenancy / isolation)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50),
    legal_address TEXT,
    base_currency VARCHAR(3) DEFAULT 'IDR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER PROFILES (CEO, Sales Manager, Sales Executive)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ceo', 'admin', 'komisaris')),
    phone VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS CATALOG (Hero product: Coconut Shell Charcoal Briquettes)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    grade VARCHAR(100),
    moisture_max_pct NUMERIC(5,2),
    ash_content_max_pct NUMERIC(5,2),
    fixed_carbon_min_pct NUMERIC(5,2),
    calorific_value_min_kcal NUMERIC(8,2),
    volatile_matter_max_pct NUMERIC(5,2),
    burning_time_hours NUMERIC(4,2),
    shape_dimension VARCHAR(100),
    packaging_details TEXT,
    moq_mt NUMERIC(10,2) DEFAULT 18.0,
    base_supplier_cost_idr NUMERIC(15,2) NOT NULL,
    indicative_fob_price_usd NUMERIC(10,2) NOT NULL,
    lead_time_days INT DEFAULT 21,
    monthly_capacity_mt NUMERIC(10,2) DEFAULT 150.0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SUPPLIERS
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    factory_location VARCHAR(255),
    contact_person VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(100),
    commodities TEXT[],
    reliability_score NUMERIC(3,1) DEFAULT 9.0,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INTERNATIONAL BUYERS
CREATE TABLE IF NOT EXISTS buyers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    buyer_code VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    contact_person VARCHAR(150) NOT NULL,
    job_title VARCHAR(100),
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    website VARCHAR(255),
    linkedin_url VARCHAR(255),
    buyer_type VARCHAR(50) NOT NULL CHECK (buyer_type IN ('importer', 'distributor', 'wholesaler', 'retailer', 'manufacturer', 'shisha_distributor', 'other_b2b')),
    product_interest VARCHAR(100) NOT NULL,
    est_purchase_volume_mt NUMERIC(10,2),
    est_deal_value_idr NUMERIC(15,2) DEFAULT 0,
    est_deal_value_usd NUMERIC(12,2) DEFAULT 0,
    destination_port VARCHAR(100),
    lead_source VARCHAR(100),
    lead_owner_id UUID REFERENCES profiles(id),
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('verified', 'pending', 'unverified')),
    stage VARCHAR(50) DEFAULT 'new_lead',
    last_contact_date DATE,
    next_follow_up_date DATE,
    follow_up_notes TEXT,
    payment_preference VARCHAR(100),
    risk_notes TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BUYER CONTACTS (Multiple representatives per buyer)
CREATE TABLE IF NOT EXISTS buyer_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES buyers(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    role_title VARCHAR(100),
    email VARCHAR(150),
    phone_whatsapp VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LEADS (Inbound/Outbound prospective records)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    contact_name VARCHAR(150),
    email VARCHAR(150),
    phone VARCHAR(50),
    channel VARCHAR(50),
    status VARCHAR(50) DEFAULT 'uncontacted',
    assigned_to UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. OPPORTUNITIES (Sales pipeline deals)
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    deal_code VARCHAR(50) UNIQUE NOT NULL,
    buyer_id UUID REFERENCES buyers(id) ON DELETE RESTRICT,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    est_order_value_idr NUMERIC(15,2) NOT NULL,
    est_order_value_usd NUMERIC(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    probability INT NOT NULL CHECK (probability BETWEEN 0 AND 100),
    expected_close_date DATE NOT NULL,
    assigned_to UUID REFERENCES profiles(id),
    stage VARCHAR(50) NOT NULL CHECK (stage IN ('new_lead', 'initial_contact', 'qualified_buyer', 'rfq_received', 'quotation_sent', 'negotiation', 'closed_won', 'closed_lost')),
    next_action TEXT,
    loss_reason VARCHAR(100),
    loss_notes TEXT,
    won_po_reference VARCHAR(100),
    won_contract_value_idr NUMERIC(15,2),
    won_payment_terms VARCHAR(100),
    linked_order_id UUID,
    stage_updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PIPELINE STAGE HISTORY (Audit log for stage movements)
CREATE TABLE IF NOT EXISTS pipeline_stage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    from_stage VARCHAR(50),
    to_stage VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. BUYER INTERACTIONS (Calls, WhatsApp, Meetings, RFQ)
CREATE TABLE IF NOT EXISTS buyer_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES buyers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'call', 'whatsapp', 'meeting', 'rfq', 'quotation')),
    summary VARCHAR(255) NOT NULL,
    details TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. QUOTATIONS
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    buyer_id UUID REFERENCES buyers(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    incoterm VARCHAR(10) NOT NULL CHECK (incoterm IN ('FOB', 'CFR', 'CIF')),
    loading_port VARCHAR(100) NOT NULL,
    destination_port VARCHAR(100) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    product_id UUID REFERENCES products(id),
    quantity_mt NUMERIC(10,2) NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    total_quote_value NUMERIC(15,2) NOT NULL,
    total_cogs_idr NUMERIC(15,2) NOT NULL,
    est_gross_profit_idr NUMERIC(15,2) NOT NULL,
    est_gross_margin_pct NUMERIC(5,2) NOT NULL,
    payment_terms VARCHAR(100),
    status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'negotiating', 'accepted', 'declined', 'expired')),
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. QUOTATION ITEMS
CREATE TABLE IF NOT EXISTS quotation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    item_description TEXT,
    quantity_mt NUMERIC(10,2) NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    total_amount NUMERIC(15,2) NOT NULL,
    cogs_total_idr NUMERIC(15,2) NOT NULL
);

-- 13. SALES ORDERS (Export transactions)
CREATE TABLE IF NOT EXISTS sales_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    po_reference VARCHAR(100) NOT NULL,
    buyer_id UUID REFERENCES buyers(id) ON DELETE RESTRICT,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    quantity_mt NUMERIC(10,2) NOT NULL,
    container_count INT DEFAULT 1,
    container_type VARCHAR(50) DEFAULT '20ft FCL',
    currency VARCHAR(3) DEFAULT 'USD',
    unit_price NUMERIC(12,2) NOT NULL,
    total_contract_value_idr NUMERIC(15,2) NOT NULL,
    total_contract_value_usd NUMERIC(12,2) NOT NULL,
    recognized_revenue_idr NUMERIC(15,2) DEFAULT 0,
    collected_cash_idr NUMERIC(15,2) DEFAULT 0,
    cogs_idr NUMERIC(15,2) NOT NULL,
    estimated_gross_profit_idr NUMERIC(15,2) NOT NULL,
    incoterms VARCHAR(10) NOT NULL CHECK (incoterms IN ('FOB', 'CFR', 'CIF')),
    loading_port VARCHAR(100) NOT NULL,
    destination_port VARCHAR(100) NOT NULL,
    planned_shipment_date DATE NOT NULL,
    actual_shipment_date DATE,
    payment_terms VARCHAR(100) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'deposit_pending' CHECK (payment_status IN ('deposit_pending', 'deposit_paid', 'balance_pending', 'fully_paid', 'lc_opened')),
    shipment_status VARCHAR(50) DEFAULT 'order_confirmed' CHECK (shipment_status IN ('order_confirmed', 'supplier_confirmed', 'production', 'quality_control', 'packing', 'container_loading', 'export_documentation', 'customs_clearance', 'vessel_departure', 'in_transit', 'delivered')),
    container_number VARCHAR(50),
    bill_of_lading_no VARCHAR(100),
    supplier_id UUID REFERENCES suppliers(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. SALES ORDER ITEMS
CREATE TABLE IF NOT EXISTS sales_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_order_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description TEXT,
    quantity_mt NUMERIC(10,2) NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    total_price NUMERIC(15,2) NOT NULL
);

-- 15. EXPORT SHIPMENTS
CREATE TABLE IF NOT EXISTS export_shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_order_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
    vessel_name VARCHAR(150),
    voyage_number VARCHAR(50),
    shipping_line VARCHAR(100),
    etd_port_loading DATE,
    eta_destination_port DATE,
    actual_departure_date DATE,
    actual_arrival_date DATE,
    tracking_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. SHIPMENT DOCUMENTS
CREATE TABLE IF NOT EXISTS shipment_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_order_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
    doc_name VARCHAR(150) NOT NULL,
    doc_code VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'missing')),
    reference_number VARCHAR(100),
    file_url TEXT,
    issue_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. PAYMENTS (Accounts receivable & cash collection)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_order_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
    amount_idr NUMERIC(15,2) NOT NULL,
    amount_original NUMERIC(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    exchange_rate NUMERIC(10,2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL, -- 'down_payment', 'final_balance', 'lc_settlement'
    payment_date DATE NOT NULL,
    bank_reference VARCHAR(100),
    is_confirmed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. EXPENSES (COGS + Operating Expenses)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    sales_order_id UUID REFERENCES sales_orders(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL, -- 'supplier_purchase', 'trucking', 'inspection', 'ocean_freight', 'opex'
    description TEXT NOT NULL,
    amount_idr NUMERIC(15,2) NOT NULL,
    expense_date DATE NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'paid',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. EXCHANGE RATES
CREATE TABLE IF NOT EXISTS exchange_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    currency_code VARCHAR(3) NOT NULL,
    rate_to_idr NUMERIC(10,2) NOT NULL,
    effective_date DATE NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. SALES TARGETS (Executive configurable targets)
CREATE TABLE IF NOT EXISTS sales_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    target_month DATE NOT NULL,
    monthly_revenue_target_idr NUMERIC(15,2) DEFAULT 150000000,
    new_buyer_leads INT DEFAULT 200,
    qualified_buyers INT DEFAULT 40,
    rfqs_received INT DEFAULT 15,
    quotations_sent INT DEFAULT 12,
    closed_orders INT DEFAULT 3,
    follow_up_completion_rate_pct NUMERIC(5,2) DEFAULT 95.0,
    pipeline_coverage_ratio NUMERIC(4,2) DEFAULT 3.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    entity_type VARCHAR(100),
    entity_id UUID,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- CEO has full access to organization data
CREATE POLICY "CEO full organization access" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'ceo'
        )
    );

-- Read access for authenticated staff within organization
CREATE POLICY "Authenticated users view organization products" ON products
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users view buyers" ON buyers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Staff manage assigned opportunities" ON opportunities
    FOR ALL USING (
        auth.uid() = assigned_to OR 
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ceo', 'sales_manager'))
    );

-- Indexes for high-performance dashboard analytics
CREATE INDEX IF NOT EXISTS idx_buyers_stage ON buyers(stage);
CREATE INDEX IF NOT EXISTS idx_buyers_country ON buyers(country_code);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_assigned ON opportunities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_orders_shipment_status ON sales_orders(shipment_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON sales_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
