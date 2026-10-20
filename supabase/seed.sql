-- =====================================================================
-- PT GLOBAL EXPOR INDONESIA — SEED DATA
-- Realistic Indonesian Export Trading Data (Clearly tagged DEMO)
-- =====================================================================

INSERT INTO organizations (id, name, tax_id, legal_address, base_currency)
VALUES 
('a0000000-0000-0000-0000-000000000001', 'PT Global Expor Indonesia', '01.234.567.8-012.000', 'Menara Palma Lt. 12, Jl. H.R. Rasuna Said Kav. 6, Jakarta Selatan, 12950', 'IDR')
ON CONFLICT DO NOTHING;

-- Initial Exchange Rates
INSERT INTO exchange_rates (currency_code, rate_to_idr, effective_date)
VALUES 
('USD', 16250.00, CURRENT_DATE),
('EUR', 17500.00, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- Product Catalog
INSERT INTO products (
    id, organization_id, product_code, name, category, grade, 
    moisture_max_pct, ash_content_max_pct, fixed_carbon_min_pct, calorific_value_min_kcal, volatile_matter_max_pct, burning_time_hours,
    shape_dimension, packaging_details, moq_mt, base_supplier_cost_idr, indicative_fob_price_usd, is_primary
) VALUES 
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'PRD-CHAR-01',
    'Coconut Shell Charcoal Briquettes - Premium Shisha / Hookah',
    'Coconut Products',
    'Grade Premium Platinum',
    4.50, 2.10, 83.50, 7550.00, 13.00, 2.50,
    'Cube 25x25x25mm (Custom 26mm available)',
    '1kg inner box printed with customer brand + 10kg master corrugated carton (shrink-wrapped)',
    18.00, 14200000.00, 1350.00, TRUE
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'PRD-CHAR-02',
    'Coconut Shell Charcoal Briquettes - BBQ Hexagonal',
    'Coconut Products',
    'Grade A BBQ',
    5.00, 2.50, 80.00, 7300.00, 14.00, 4.00,
    'Hexagonal 50x100mm with 10mm center hole',
    '10kg / 20kg Kraft paper bag with poly lining',
    18.00, 12500000.00, 1180.00, FALSE
),
(
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'PRD-VCO-01',
    'Virgin Coconut Oil (VCO) Cold Pressed Organic',
    'Coconut Products',
    'Extra Virgin Food / Cosmetic Grade',
    0.10, 0.05, 0.00, 8600.00, 0.00, 0.00,
    'Liquid / Solid < 24°C',
    '200L Steel Drum or 1000L IBC Tote (Flexitank available)',
    16.00, 32000000.00, 2450.00, FALSE
),
(
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'PRD-SPICE-CIN',
    'Indonesian Cassia Vera AA Cinnamon Sticks',
    'Spices',
    'AA Clean 8cm - 10cm',
    12.00, 4.00, 0.00, 0.00, 0.00, 0.00,
    'Sticks 8cm length cut',
    '25kg export carton box with moisture-proof liner',
    10.00, 48000000.00, 3800.00, FALSE
),
(
    'b0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000001',
    'PRD-COFF-GAYO',
    'Sumatra Gayo Highland Arabica Specialty Green Beans',
    'Coffee',
    'Grade 1 Double Picked Screen 16-18',
    11.50, 1.20, 0.00, 0.00, 0.00, 0.00,
    'Whole Unroasted Green Beans',
    '60kg Jute Bag with GrainPro Hermetic hermetic barrier',
    19.20, 95000000.00, 7200.00, FALSE
),
(
    'b0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000001',
    'PRD-SPICE-NUT',
    'North Maluku Nutmeg ABCD Grade with Mace',
    'Spices',
    'Grade ABCD Sound',
    10.00, 3.00, 0.00, 0.00, 0.00, 0.00,
    'Whole Dried Kernel',
    '50kg gunny bag',
    10.00, 88000000.00, 6800.00, FALSE
)
ON CONFLICT DO NOTHING;

-- Initial CEO Sales Target
INSERT INTO sales_targets (
    id, organization_id, target_month, monthly_revenue_target_idr,
    new_buyer_leads, qualified_buyers, rfqs_received, quotations_sent, closed_orders,
    follow_up_completion_rate_pct, pipeline_coverage_ratio
) VALUES (
    't0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    DATE_TRUNC('month', CURRENT_DATE),
    150000000.00,
    200, 40, 15, 12, 3, 95.0, 3.0
) ON CONFLICT DO NOTHING;
