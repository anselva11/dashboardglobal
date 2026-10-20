export type UserRole = 'ceo' | 'admin' | 'komisaris';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatar: string;
  organization_id: string;
  password?: string;
  created_at?: string;
}

export type Currency = 'IDR' | 'USD' | 'EUR';

export interface ExchangeRates {
  IDR: number; // base 1 IDR = 1 IDR
  USD: number; // 1 USD in IDR (e.g. 16250)
  EUR: number; // 1 EUR in IDR (e.g. 17500)
}

export type BuyerType =
  | 'importer'
  | 'distributor'
  | 'wholesaler'
  | 'retailer'
  | 'manufacturer'
  | 'shisha_distributor'
  | 'other_b2b';

export type VerificationStatus = 'verified' | 'pending' | 'unverified';

export type PipelineStage =
  | 'new_lead'
  | 'initial_contact'
  | 'qualified_buyer'
  | 'rfq_received'
  | 'quotation_sent'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';

export interface Buyer {
  id: string;
  buyer_code: string;
  company_name: string;
  country: string;
  country_code: string;
  contact_person: string;
  job_title: string;
  email: string;
  phone: string;
  website: string;
  linkedin_url?: string;
  buyer_type: BuyerType;
  product_interest: string;
  est_purchase_volume_mt: number;
  est_deal_value_idr: number;
  est_deal_value_usd: number;
  destination_port: string;
  lead_source: string;
  lead_owner: string;
  verification_status: VerificationStatus;
  stage: PipelineStage;
  last_contact_date: string;
  next_follow_up_date: string;
  follow_up_notes: string;
  payment_preference: string;
  risk_notes: string;
  is_archived?: boolean;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface BuyerInteraction {
  id: string;
  buyer_id: string;
  type: 'email' | 'call' | 'whatsapp' | 'meeting' | 'rfq' | 'quotation';
  summary: string;
  details: string;
  created_by: string;
  created_at: string;
}

export interface Opportunity {
  id: string;
  deal_code: string;
  buyer_id: string;
  buyer_name: string;
  country: string;
  country_code: string;
  product_id: string;
  product_name: string;
  est_order_value_idr: number;
  est_order_value_usd: number;
  currency: Currency;
  probability: number; // 0 to 100
  expected_close_date: string;
  assigned_to: string;
  stage: PipelineStage;
  next_action: string;
  loss_reason?: string;
  loss_notes?: string;
  won_po_reference?: string;
  won_contract_value_idr?: number;
  won_payment_terms?: string;
  linked_order_id?: string;
  stage_updated_at: string;
  updated_by: string;
  is_demo?: boolean;
  created_at: string;
}

export interface ProductSpecification {
  moisture_max_pct: number;
  ash_content_max_pct: number;
  fixed_carbon_min_pct: number;
  calorific_value_min_kcal: number;
  volatile_matter_max_pct: number;
  burning_time_hours: number;
  shape_dimension: string;
  packaging_type: string;
  inner_box_kg: number;
  master_carton_kg: number;
  moq_mt: number;
  certifications: string[];
}

export interface Product {
  id: string;
  product_code: string;
  name: string;
  category: string;
  grade: string;
  specs: ProductSpecification;
  supplier_id: string;
  supplier_name: string;
  base_supplier_cost_usd_per_mt: number;
  base_supplier_cost_idr_per_mt: number;
  indicative_fob_price_usd_per_mt: number;
  lead_time_days: number;
  monthly_capacity_mt: number;
  test_report_reference: string;
  is_primary: boolean;
  last_price_update: string;
}

export type Incoterm = 'FOB' | 'CFR' | 'CIF';

export interface PricingBreakdown {
  supplier_cost_idr: number;
  packaging_cost_idr: number;
  inland_trucking_idr: number;
  handling_stuffing_thc_idr: number;
  sucofindo_inspection_idr: number;
  export_docs_shtc_msds_idr: number;
  customs_clearance_peb_idr: number;
  ocean_freight_idr: number;
  marine_insurance_idr: number;
  other_applicable_idr: number;
  total_cogs_idr: number;
  sales_revenue_idr: number;
  gross_profit_idr: number;
  gross_margin_pct: number;
}

export interface Quotation {
  id: string;
  quote_number: string;
  buyer_id: string;
  buyer_name: string;
  buyer_country: string;
  date: string;
  expiry_date: string;
  incoterm: Incoterm;
  loading_port: string;
  destination_port: string;
  currency: Currency;
  product_id: string;
  product_name: string;
  quantity_mt: number;
  unit_price: number;
  total_quote_value: number;
  total_cogs: number;
  est_gross_profit: number;
  est_gross_margin_pct: number;
  pricing_breakdown: PricingBreakdown;
  payment_terms: string;
  status: 'draft' | 'sent' | 'negotiating' | 'accepted' | 'declined' | 'expired';
  notes: string;
  created_by: string;
  created_at: string;
}

export type ShipmentStage =
  | 'order_confirmed'
  | 'supplier_confirmed'
  | 'production'
  | 'quality_control'
  | 'packing'
  | 'container_loading'
  | 'export_documentation'
  | 'customs_clearance'
  | 'vessel_departure'
  | 'in_transit'
  | 'delivered';

export type PaymentStatus =
  | 'deposit_pending'
  | 'deposit_paid'
  | 'balance_pending'
  | 'fully_paid'
  | 'lc_opened';

export interface ShippingDocument {
  name: string;
  code: string;
  required: boolean;
  status: 'approved' | 'pending' | 'missing';
  reference_number?: string;
  issue_date?: string;
}

export interface ExportOrder {
  id: string;
  order_number: string;
  po_reference: string;
  buyer_id: string;
  buyer_name: string;
  buyer_country: string;
  product_id: string;
  product_name: string;
  quantity_mt: number;
  container_count: number;
  container_type: '20ft FCL' | '40ft HC';
  unit_price: number;
  currency: Currency;
  total_contract_value_idr: number;
  total_contract_value_usd: number;
  recognized_revenue_idr: number;
  collected_cash_idr: number;
  cogs_idr: number;
  estimated_gross_profit_idr: number;
  incoterms: Incoterm;
  loading_port: string;
  destination_port: string;
  planned_shipment_date: string;
  actual_shipment_date?: string;
  payment_terms: string;
  payment_status: PaymentStatus;
  shipment_status: ShipmentStage;
  container_number?: string;
  bill_of_lading_no?: string;
  supplier_id: string;
  supplier_name: string;
  documents: ShippingDocument[];
  risk_alerts: string[];
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinancialSummary {
  gross_export_sales_idr: number;
  recognized_revenue_idr: number;
  collected_cash_idr: number;
  accounts_receivable_idr: number;
  supplier_payables_idr: number;
  operating_expenses_idr: number;
  cost_of_goods_sold_idr: number;
  estimated_gross_profit_idr: number;
  net_cash_flow_idr: number;
  cash_balance_idr: number;
}

export interface SalesTarget {
  monthly_revenue_target_idr: number;
  new_buyer_leads: number;
  qualified_buyers: number;
  rfqs_received: number;
  quotations_sent: number;
  closed_orders: number;
  follow_up_completion_rate_pct: number;
  pipeline_coverage_ratio: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'follow_up' | 'quotation' | 'closing_soon' | 'payment' | 'shipment_delay' | 'missing_doc';
  severity: 'info' | 'warning' | 'urgent';
  is_read: boolean;
  created_at: string;
  link_tab?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user_name: string;
  user_role: string;
  action: string;
  details: string;
  entity_type: string;
  entity_id: string;
}
