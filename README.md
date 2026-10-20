# PT Global Expor Indonesia — Enterprise Export Intelligence & Sales Platform

An enterprise-grade, modern business intelligence, international buyer CRM, and export logistics management platform engineered specifically for **PT Global Expor Indonesia**, an Indonesian export trading company specializing in coconut shell charcoal briquettes (shisha and BBQ grades) alongside specialty agricultural commodities.

---

## 1. Executive Summary & Capabilities

- **Executive Overview & 8 Dynamic KPI Cards**:
  - Total Export Sales (Gross contract value)
  - Configurable Monthly Revenue Target (Default: Rp150,000,000, range: Rp100M–Rp250M or custom input)
  - Revenue Achievement Percentage (Recognized company revenue vs target)
  - Active International Buyers (Across UAE, Saudi Arabia, Germany, Netherlands, USA, Jordan, Turkey)
  - Qualified Leads & Opportunities
  - Open Quotations (Value and count)
  - Active Export Orders (Live freight tracking)
  - Estimated Gross Profit (Recognized revenue minus COGS)

- **Revenue Recognition Framework**:
  - In strict compliance with export trading practice, **Gross Export Contract Value** is separated from **Recognized Company Revenue** (recognized upon Onboard Bill of Lading issue), **Collected Cash** (settled deposits and wire transfers), and **Gross Profit**.
  - All demo figures are clearly tagged with a `DEMO DATA` badge and can be reset at any time.

- **Sales Analytics & Forecasting**:
  - Multi-period view: Daily, Weekly, Monthly, and Quarterly views with actual vs target lines.
  - 8-Stage Conversion Funnel: New Leads → Contacted → Qualified → RFQ → Quote Sent → Negotiation → PO / Closed Won → Closed Lost.
  - Product Profitability Matrix: Coconut Shell Charcoal Briquettes (hero commodity), Virgin Coconut Oil (VCO), Cinnamon, Coffee, and Nutmeg.
  - Weighted Sales Forecast: `Weighted Pipeline = Estimated Deal Value × Probability of Closing` with interactive probability assumption sliders.

- **International Buyer CRM**:
  - Full B2B account profiles: Buyer ID, Company Name, Country, Contact, Job Title, Business Email, Phone/WhatsApp, Website, Buyer Type (Importer, Distributor, Shisha Distributor, etc.), Volume (MT), Deal Value, Destination Port, Owner, Verification Status, and Follow-Up Notes.
  - Duplicate record detection across company names, domains, and phone numbers.
  - Overdue follow-up alerts banner with direct action links.
  - Form validation with React Hook Form + Zod.
  - Filter by Country, Commodity, Owner, Stage, Verification Status.
  - CSV export.

- **Kanban Sales Pipeline**:
  - 8 stages with drag & advance capabilities.
  - Stage progression modal for **Closed Won**: confirms finalized order value, PO reference, payment terms, and automatically creates a linked Export Order.
  - Stage progression modal for **Closed Lost**: requires structured loss reason and notes.

- **Export Order & Shipment Management**:
  - End-to-end traceability from PO confirmation to destination port arrival.
  - 11-step visual milestone progress bar: Order Confirmed → Supplier Confirmed → Production → Quality Control → Packing → Container Loading → Export Documentation → Customs Clearance → Vessel Departure → In Transit → Delivered.
  - Regulatory document tracking: PEB Export Declaration, Sucofindo SHTC (Self-Heating Test Certificate), MSDS, Phytosanitary Certificate, and Ocean Bill of Lading.
  - Separation of shipment status from accounting payment status.

- **Export Pricing Calculator (FOB / CFR / CIF)**:
  - Technical specification sheet for Coconut Shell Charcoal Briquettes (Moisture <4.5%, Ash <2.1%, Fixed Carbon >83.5%, Calorific >7,550 kcal/kg, Cube 25x25x25mm).
  - Multi-Incoterm cost breakdown calculator: Supplier Base Cost + Inner/Master Packaging + Inland Trucking + Handling/THC + Sucofindo Inspection + SHTC/MSDS + PEB Customs + Ocean Freight + Marine Insurance.
  - Direct 1-click draft quotation creation.

- **Financial Overview & Cash Flow**:
  - Gross Export Sales vs Recognized Revenue vs Collected Cash vs Accounts Receivable (AR) vs Supplier Payables (AP) vs COGS vs Gross Profit vs Net Cash Flow.
  - Multi-currency switcher (IDR, USD, EUR) with live conversion engine.
  - AR Aging schedule (<30 days, 31-60 days, 61-90 days, >90 days overdue).

- **Performance Scorecard & Role-Based Access (RBAC)**:
  - Target vs Actual vs Variance vs Achievement % scorecard.
  - Active profile switcher supporting:
    1. **CEO / Administrator**: Full dashboard control, target configuration, pricing approval, financial reporting.
    2. **Sales Manager**: Pipeline management, assigning leads, reviewing quotes, follow-up tracking.
    3. **Sales Executive**: Assigned buyers, recording interactions, draft quotes, updating opportunities.

- **Activity & Follow-Up Center**:
  - Overdue follow-ups, follow-ups due today, pending quote responses, delayed shipments, missing documents.

- **Executive Reports & Export**:
  - Printable executive summaries with formal company letterhead and signature blocks.
  - Filter-aware CSV exports.

---

## 2. Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Corporate Design Tokens
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Responsive Area, Bar, and Funnel Charts)
- **Form Management**: React Hook Form + Zod Schema Validation
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Unit Testing**: Vitest automated calculation suite

---

## 3. Database Design — Supabase PostgreSQL

A normalized database schema is available in:
- `supabase/migrations/20260101000000_pt_global_expor_schema.sql` (22 normalized tables, foreign keys, timestamps, indexes, and Row Level Security policies)
- `supabase/seed.sql` (Realistic Indonesian export trading dataset)

Tables included:
1. `organizations`
2. `profiles`
3. `products`
4. `suppliers`
5. `buyers`
6. `buyer_contacts`
7. `leads`
8. `opportunities`
9. `pipeline_stage_history`
10. `buyer_interactions`
11. `quotations`
12. `quotation_items`
13. `sales_orders`
14. `sales_order_items`
15. `export_shipments`
16. `shipment_documents`
17. `payments`
18. `expenses`
19. `exchange_rates`
20. `sales_targets`
21. `notifications`
22. `audit_logs`

---

## 4. Quick Start & Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Clone or navigate to the project directory
cd c:\Users\Ansel\Documents\Dashboard

# Install dependencies
npm install --legacy-peer-deps
```

### Running the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### Running Automated Calculation Tests
```bash
npm test
```
Runs the 6 automated unit tests validating:
- Weighted and unweighted pipeline math
- Zero-division guarded gross profit and margin formulas
- Multi-Incoterm export pricing breakdowns (FOB vs CFR vs CIF)
- Pipeline coverage ratios and target achievement percentages
- Currency conversions across IDR, USD, and EUR
- Potential duplicate buyer detection algorithms

### Building for Production
```bash
npm run build
```

---

## 5. Connecting Live Supabase Database

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL Editor in Supabase and run `supabase/migrations/20260101000000_pt_global_expor_schema.sql`.
3. Run `supabase/seed.sql` to populate initial Indonesian export commodities and buyers.
4. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
5. Enter your project URL and anonymous key:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
6. Restart the development server. The dashboard will automatically detect live Supabase connectivity.
