import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  UserProfile,
  UserRole,
  Currency,
  ExchangeRates,
  Buyer,
  Opportunity,
  ExportOrder,
  Quotation,
  Product,
  NotificationItem,
  SalesTarget,
  AuditLog,
  PipelineStage,
} from '../types';
import {
  DEFAULT_EXCHANGE_RATES,
  calculatePricingBreakdown,
} from '../lib/calculations';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AppContextType {
  currentUser: UserProfile;
  setCurrentRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  registerUser: (
    name: string,
    email: string,
    pass: string,
    role: UserRole,
    title: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  registeredUsers: UserProfile[];
  updateUserAvatar: (avatarUrl: string) => void;
  isSupabaseActive: boolean;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  exchangeRates: ExchangeRates;
  salesTarget: SalesTarget;
  updateSalesTarget: (target: Partial<SalesTarget>) => void;
  buyers: Buyer[];
  addBuyer: (buyer: Omit<Buyer, 'id' | 'buyer_code' | 'created_at' | 'updated_at'>) => void;
  updateBuyer: (id: string, updates: Partial<Buyer>) => void;
  archiveBuyer: (id: string) => void;
  opportunities: Opportunity[];
  addOpportunity: (opp: Omit<Opportunity, 'id' | 'deal_code' | 'created_at' | 'stage_updated_at'>) => void;
  updateOpportunityStage: (
    id: string,
    newStage: PipelineStage,
    meta?: {
      won_po_reference?: string;
      won_contract_value_idr?: number;
      won_payment_terms?: string;
      loss_reason?: string;
      loss_notes?: string;
    }
  ) => void;
  updateOpportunityProbability: (id: string, probability: number) => void;
  exportOrders: ExportOrder[];
  addExportOrder: (order: Omit<ExportOrder, 'id' | 'order_number' | 'created_at' | 'updated_at'>) => void;
  updateExportOrderStatus: (
    id: string,
    updates: Partial<Pick<ExportOrder, 'shipment_status' | 'payment_status' | 'bill_of_lading_no' | 'container_number'>>
  ) => void;
  quotations: Quotation[];
  addQuotation: (quote: Omit<Quotation, 'id' | 'quote_number' | 'created_at'>) => void;
  products: Product[];
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  auditLogs: AuditLog[];
  dateRange: 'this_month' | 'this_quarter' | 'this_year' | 'all';
  setDateRange: (range: 'this_month' | 'this_quarter' | 'this_year' | 'all') => void;
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
  resetDemoData: () => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial pre-seeded corporate accounts for PT Global Expor Indonesia
// Exclusively restricted to: CEO, Admin, and Komisaris
const INITIAL_DATABASE_USERS: (UserProfile & { password?: string })[] = [
  {
    id: 'usr-001',
    name: 'Hansel Varian Putra',
    email: 'globalexporindonesia@gmail.com',
    role: 'ceo',
    title: 'Chief Executive Officer / Direktur Utama',
    avatar: '',
    organization_id: 'org-001',
    password: 'ceo123',
    created_at: '2026-01-01',
  },
  {
    id: 'usr-001-alt',
    name: 'Hansel Varian Putra',
    email: 'ceo@globalexpor.id',
    role: 'ceo',
    title: 'Chief Executive Officer / Direktur Utama',
    avatar: '',
    organization_id: 'org-001',
    password: 'ceo123',
    created_at: '2026-01-01',
  },
  {
    id: 'usr-002',
    name: 'Hendro Wijaya, S.Kom.',
    email: 'admin@globalexpor.id',
    role: 'admin',
    title: 'System & Database Administrator',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    organization_id: 'org-001',
    password: 'admin123',
    created_at: '2026-01-01',
  },
  {
    id: 'usr-003',
    name: 'Prof. Dr. Ir. Bambang Soedarmono, M.M.',
    email: 'komisaris@globalexpor.id',
    role: 'komisaris',
    title: 'Dewan Komisaris / Board of Commissioners',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    organization_id: 'org-001',
    password: 'komisaris123',
    created_at: '2026-01-01',
  },
];

const PROFILES: Record<UserRole, UserProfile> = {
  ceo: INITIAL_DATABASE_USERS[0],
  admin: INITIAL_DATABASE_USERS[2],
  komisaris: INITIAL_DATABASE_USERS[3],
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prd-001',
    product_code: 'PRD-CHAR-01',
    name: 'Coconut Shell Charcoal Briquettes - Premium Shisha / Hookah',
    category: 'Coconut Commodities',
    grade: 'Platinum Grade Export',
    is_primary: true,
    specs: {
      moisture_max_pct: 4.5,
      ash_content_max_pct: 2.1,
      fixed_carbon_min_pct: 83.5,
      calorific_value_min_kcal: 7550,
      volatile_matter_max_pct: 13.0,
      burning_time_hours: 2.5,
      shape_dimension: 'Cube 25x25x25mm (26x26x26mm available)',
      packaging_type: '1kg inner box printed with customer brand + 10kg master carton',
      inner_box_kg: 1,
      master_carton_kg: 10,
      moq_mt: 18,
      certifications: ['Sucofindo SHTC Report', 'MSDS Report', 'Self Heating Test Certificate', 'Certificate of Origin (COO)'],
    },
    supplier_id: 'sup-001',
    supplier_name: 'PT Arang Kelapa Sentosa (Central Java)',
    base_supplier_cost_usd_per_mt: 875,
    base_supplier_cost_idr_per_mt: 14200000,
    indicative_fob_price_usd_per_mt: 1350,
    lead_time_days: 21,
    monthly_capacity_mt: 180,
    test_report_reference: 'SGS/ID-JKT/2026/04918-B',
    last_price_update: '2026-10-15',
  },
  {
    id: 'prd-002',
    product_code: 'PRD-CHAR-02',
    name: 'Coconut Shell Charcoal Briquettes - BBQ Hexagonal',
    category: 'Coconut Commodities',
    grade: 'Grade A BBQ',
    is_primary: false,
    specs: {
      moisture_max_pct: 5.0,
      ash_content_max_pct: 2.4,
      fixed_carbon_min_pct: 80.0,
      calorific_value_min_kcal: 7300,
      volatile_matter_max_pct: 14.0,
      burning_time_hours: 4.0,
      shape_dimension: 'Hexagonal 50x100mm with 10mm center hole',
      packaging_type: '10kg / 20kg Kraft paper bag with poly inner lining',
      inner_box_kg: 0,
      master_carton_kg: 10,
      moq_mt: 18,
      certifications: ['Sucofindo Quality Inspection', 'MSDS', 'SHTC'],
    },
    supplier_id: 'sup-001',
    supplier_name: 'PT Arang Kelapa Sentosa (Central Java)',
    base_supplier_cost_usd_per_mt: 770,
    base_supplier_cost_idr_per_mt: 12500000,
    indicative_fob_price_usd_per_mt: 1180,
    lead_time_days: 18,
    monthly_capacity_mt: 220,
    test_report_reference: 'SCF-LAB-2026-9912',
    last_price_update: '2026-10-10',
  },
  {
    id: 'prd-003',
    product_code: 'PRD-VCO-01',
    name: 'Virgin Coconut Oil (VCO) Cold Pressed Organic',
    category: 'Coconut Commodities',
    grade: 'Extra Virgin Food Grade',
    is_primary: false,
    specs: {
      moisture_max_pct: 0.1,
      ash_content_max_pct: 0.05,
      fixed_carbon_min_pct: 0,
      calorific_value_min_kcal: 8600,
      volatile_matter_max_pct: 0,
      burning_time_hours: 0,
      shape_dimension: 'Liquid / Crystal clear > 25°C',
      packaging_type: '200L food-grade steel drums or 1000L IBC totes',
      inner_box_kg: 0,
      master_carton_kg: 200,
      moq_mt: 16,
      certifications: ['USDA Organic', 'EU Organic', 'Halal Indonesia', 'HACCP / ISO 22000'],
    },
    supplier_id: 'sup-002',
    supplier_name: 'CV Minyak Kelapa Murni Sulawesi',
    base_supplier_cost_usd_per_mt: 1970,
    base_supplier_cost_idr_per_mt: 32000000,
    indicative_fob_price_usd_per_mt: 2450,
    lead_time_days: 25,
    monthly_capacity_mt: 80,
    test_report_reference: 'CAR-ID-2026-0811',
    last_price_update: '2026-10-05',
  },
  {
    id: 'prd-004',
    product_code: 'PRD-SPICE-CIN',
    name: 'Indonesian Cassia Vera AA Cinnamon Sticks',
    category: 'Spices',
    grade: 'AA Clean 8cm',
    is_primary: false,
    specs: {
      moisture_max_pct: 12.0,
      ash_content_max_pct: 4.0,
      fixed_carbon_min_pct: 0,
      calorific_value_min_kcal: 0,
      volatile_matter_max_pct: 0,
      burning_time_hours: 0,
      shape_dimension: 'Clean cut 8cm rolls',
      packaging_type: '25kg export carton box with moisture barrier',
      inner_box_kg: 0,
      master_carton_kg: 25,
      moq_mt: 10,
      certifications: ['Phytosanitary Certificate', 'Certificate of Origin', 'Food Grade'],
    },
    supplier_id: 'sup-003',
    supplier_name: 'Koperasi Rempah Kerinci Sumatera',
    base_supplier_cost_usd_per_mt: 2950,
    base_supplier_cost_idr_per_mt: 48000000,
    indicative_fob_price_usd_per_mt: 3800,
    lead_time_days: 20,
    monthly_capacity_mt: 45,
    test_report_reference: 'PHYTO-ID-2026-3390',
    last_price_update: '2026-09-28',
  },
  {
    id: 'prd-005',
    product_code: 'PRD-COFF-GAYO',
    name: 'Sumatra Gayo Highland Arabica Specialty Green Coffee',
    category: 'Coffee',
    grade: 'Specialty Grade 1 Double Picked',
    is_primary: false,
    specs: {
      moisture_max_pct: 11.5,
      ash_content_max_pct: 1.2,
      fixed_carbon_min_pct: 0,
      calorific_value_min_kcal: 0,
      volatile_matter_max_pct: 0,
      burning_time_hours: 0,
      shape_dimension: 'Screen 16-18 Green Beans',
      packaging_type: '60kg Jute Bag with hermetic GrainPro liner',
      inner_box_kg: 0,
      master_carton_kg: 60,
      moq_mt: 19.2,
      certifications: ['Fair Trade', 'Rainforest Alliance', 'SCA Cupping Score 85+'],
    },
    supplier_id: 'sup-004',
    supplier_name: 'Gayo Agro Specialty Aceh',
    base_supplier_cost_usd_per_mt: 5850,
    base_supplier_cost_idr_per_mt: 95000000,
    indicative_fob_price_usd_per_mt: 7200,
    lead_time_days: 14,
    monthly_capacity_mt: 38,
    test_report_reference: 'SCA-Q-2026-112',
    last_price_update: '2026-10-12',
  },
  {
    id: 'prd-006',
    product_code: 'PRD-SPICE-NUT',
    name: 'North Maluku Nutmeg ABCD Grade Sound with Mace',
    category: 'Spices',
    grade: 'ABCD Sound Whole',
    is_primary: false,
    specs: {
      moisture_max_pct: 10.0,
      ash_content_max_pct: 3.0,
      fixed_carbon_min_pct: 0,
      calorific_value_min_kcal: 0,
      volatile_matter_max_pct: 0,
      burning_time_hours: 0,
      shape_dimension: 'Round dried kernels',
      packaging_type: '50kg double gunny bags',
      inner_box_kg: 0,
      master_carton_kg: 50,
      moq_mt: 10,
      certifications: ['Phytosanitary Certificate', 'Aflatoxin Tested Clean'],
    },
    supplier_id: 'sup-005',
    supplier_name: 'Banda Nutmeg Nusantara Ternate',
    base_supplier_cost_usd_per_mt: 5400,
    base_supplier_cost_idr_per_mt: 88000000,
    indicative_fob_price_usd_per_mt: 6800,
    lead_time_days: 28,
    monthly_capacity_mt: 30,
    test_report_reference: 'AFLA-SCF-2026-004',
    last_price_update: '2026-10-01',
  },
];

const INITIAL_BUYERS: Buyer[] = [
  {
    id: 'byr-001',
    buyer_code: 'BYR-UAE-001',
    company_name: 'Al-Sultan Shisha Trading LLC',
    country: 'United Arab Emirates',
    country_code: 'AE',
    contact_person: 'Tariq Al-Mansoor',
    job_title: 'Chief Procurement Officer',
    email: 'procurement@alsultanshisha.ae',
    phone: '+971 4 398 2210',
    website: 'https://alsultanshisha.ae',
    linkedin_url: 'https://linkedin.com/company/al-sultan-shisha',
    buyer_type: 'shisha_distributor',
    product_interest: 'Coconut Shell Charcoal Briquettes - Premium Shisha / Hookah',
    est_purchase_volume_mt: 54,
    est_deal_value_idr: 1184625000,
    est_deal_value_usd: 72900,
    destination_port: 'Jebel Ali, Dubai',
    lead_source: 'Dubai Trade Expo 2026',
    lead_owner: 'Hansel Varian Putra',
    verification_status: 'verified',
    stage: 'negotiation',
    last_contact_date: '2026-10-18',
    next_follow_up_date: '2026-10-20',
    follow_up_notes: 'Reviewed CFR Jebel Ali pricing. Buyer requested 3% discount for 3x40ft HC repeat contract. CEO approval pending.',
    payment_preference: '30% T/T Deposit, 70% against Bill of Lading copy',
    risk_notes: 'Strong credit history. Top tier distributor supplying 140+ lounge chains in GCC.',
    is_demo: true,
    created_at: '2026-09-01',
    updated_at: '2026-10-18',
  },
  {
    id: 'byr-002',
    buyer_code: 'BYR-SAU-002',
    company_name: 'Baraka Tobacco & Charcoal Co.',
    country: 'Saudi Arabia',
    country_code: 'SA',
    contact_person: 'Fahad Al-Otaibi',
    job_title: 'Managing Director',
    email: 'f.otaibi@barakatobacco.com.sa',
    phone: '+966 11 482 9911',
    website: 'https://barakatobacco.com.sa',
    buyer_type: 'distributor',
    product_interest: 'Coconut Shell Charcoal Briquettes - Premium Shisha / Hookah',
    est_purchase_volume_mt: 36,
    est_deal_value_idr: 789750000,
    est_deal_value_usd: 48600,
    destination_port: 'Jeddah Islamic Port',
    lead_source: 'Inbound RFQ Website',
    lead_owner: 'Hansel Varian Putra',
    verification_status: 'verified',
    stage: 'quotation_sent',
    last_contact_date: '2026-10-14',
    next_follow_up_date: '2026-10-22',
    follow_up_notes: 'Sent formal quotation QTN-2026-088 CIF Jeddah with 1kg branded packaging design draft.',
    payment_preference: '100% Irrevocable Confirmed L/C at Sight',
    risk_notes: 'Requires SASO / Saber conformity registration prior to vessel arrival.',
    is_demo: true,
    created_at: '2026-09-12',
    updated_at: '2026-10-14',
  },
  {
    id: 'byr-003',
    buyer_code: 'BYR-DEU-003',
    company_name: 'Hanseatic Grill & BBQ Imports GmbH',
    country: 'Germany',
    country_code: 'DE',
    contact_person: 'Markus Weber',
    job_title: 'Head of Sourcing',
    email: 'markus.weber@hanseatic-bbq.de',
    phone: '+49 40 8923 1100',
    website: 'https://hanseatic-bbq.de',
    buyer_type: 'importer',
    product_interest: 'Coconut Shell Charcoal Briquettes - BBQ Hexagonal',
    est_purchase_volume_mt: 72,
    est_deal_value_idr: 1380600000,
    est_deal_value_usd: 84960,
    destination_port: 'Port of Hamburg',
    lead_source: 'Anuga Food & Charcoal Fair Cologne',
    lead_owner: 'Hendro Wijaya',
    verification_status: 'verified',
    stage: 'closed_won',
    last_contact_date: '2026-10-15',
    next_follow_up_date: '2026-10-25',
    follow_up_notes: 'PO-2026-HB88 confirmed. Down payment 20% received in bank. Production at 70%.',
    payment_preference: '20% T/T Advance, 80% CAD via Deutsche Bank Hamburg',
    risk_notes: 'Strict DIN EN 1860-2 compliance required for smoke and burning duration.',
    is_demo: true,
    created_at: '2026-08-15',
    updated_at: '2026-10-15',
  },
];

const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-001',
    deal_code: 'DEAL-2026-011',
    buyer_id: 'byr-001',
    buyer_name: 'Al-Sultan Shisha Trading LLC',
    country: 'United Arab Emirates',
    country_code: 'AE',
    product_id: 'prd-001',
    product_name: 'Coconut Shell Charcoal Briquettes - Premium Shisha',
    est_order_value_idr: 1184625000,
    est_order_value_usd: 72900,
    currency: 'USD',
    probability: 75,
    expected_close_date: '2026-10-28',
    assigned_to: 'Hansel Varian Putra',
    stage: 'negotiation',
    next_action: 'Finalize 3% volume discount on 3x40ft containers',
    stage_updated_at: '2026-10-18T10:00:00Z',
    updated_by: 'Hansel Varian Putra',
    is_demo: true,
    created_at: '2026-09-05T08:00:00Z',
  },
  {
    id: 'opp-002',
    deal_code: 'DEAL-2026-012',
    buyer_id: 'byr-002',
    buyer_name: 'Baraka Tobacco & Charcoal Co.',
    country: 'Saudi Arabia',
    country_code: 'SA',
    product_id: 'prd-001',
    product_name: 'Coconut Shell Charcoal Briquettes - Premium Shisha',
    est_order_value_idr: 789750000,
    est_order_value_usd: 48600,
    currency: 'USD',
    probability: 60,
    expected_close_date: '2026-11-05',
    assigned_to: 'Hansel Varian Putra',
    stage: 'quotation_sent',
    next_action: 'Follow up on QTN-2026-088 CIF Jeddah terms',
    stage_updated_at: '2026-10-14T11:00:00Z',
    updated_by: 'Hansel Varian Putra',
    is_demo: true,
    created_at: '2026-09-14T09:00:00Z',
  },
  {
    id: 'opp-005',
    deal_code: 'DEAL-2026-008',
    buyer_id: 'byr-003',
    buyer_name: 'Hanseatic Grill & BBQ Imports GmbH',
    country: 'Germany',
    country_code: 'DE',
    product_id: 'prd-002',
    product_name: 'Coconut Shell Charcoal Briquettes - BBQ Hexagonal',
    est_order_value_idr: 1380600000,
    est_order_value_usd: 84960,
    currency: 'EUR',
    probability: 100,
    expected_close_date: '2026-10-15',
    assigned_to: 'Hendro Wijaya',
    stage: 'closed_won',
    won_po_reference: 'PO-2026-HB88',
    won_contract_value_idr: 1380600000,
    won_payment_terms: '20% T/T Advance, 80% CAD',
    linked_order_id: 'ord-001',
    next_action: 'Monitor packaging and Tanjung Perak container stuffing',
    stage_updated_at: '2026-10-15T09:00:00Z',
    updated_by: 'Hansel Varian Putra',
    is_demo: true,
    created_at: '2026-08-20T10:00:00Z',
  },
];

const INITIAL_EXPORT_ORDERS: ExportOrder[] = [
  {
    id: 'ord-001',
    order_number: 'EXP-2026-001',
    po_reference: 'PO-2026-HB88',
    buyer_id: 'byr-003',
    buyer_name: 'Hanseatic Grill & BBQ Imports GmbH',
    buyer_country: 'Germany',
    product_id: 'prd-002',
    product_name: 'Coconut Shell Charcoal Briquettes - BBQ Hexagonal',
    quantity_mt: 72,
    container_count: 4,
    container_type: '40ft HC',
    unit_price: 1180,
    currency: 'EUR',
    total_contract_value_idr: 1380600000,
    total_contract_value_usd: 84960,
    recognized_revenue_idr: 0,
    collected_cash_idr: 276120000,
    cogs_idr: 1020000000,
    estimated_gross_profit_idr: 360600000,
    incoterms: 'FOB',
    loading_port: 'Tanjung Perak, Surabaya',
    destination_port: 'Port of Hamburg',
    planned_shipment_date: '2026-10-27',
    payment_terms: '20% T/T Deposit, 80% CAD via Deutsche Bank',
    payment_status: 'deposit_paid',
    shipment_status: 'packing',
    container_number: 'MSKU-982144-1 / MSKU-982145-7',
    supplier_id: 'sup-001',
    supplier_name: 'PT Arang Kelapa Sentosa',
    documents: [
      { name: 'Export Declaration (PEB)', code: 'PEB', required: true, status: 'approved', reference_number: 'PEB-008129-2026' },
      { name: 'Self Heating Test Certificate (SHTC)', code: 'SHTC', required: true, status: 'approved', reference_number: 'SCF-SHTC-2601' },
      { name: 'Material Safety Data Sheet (MSDS)', code: 'MSDS', required: true, status: 'approved' },
      { name: 'Commercial Invoice & Packing List', code: 'CIPL', required: true, status: 'approved' },
      { name: 'Ocean Bill of Lading (OBL)', code: 'OBL', required: true, status: 'pending' },
      { name: 'Certificate of Origin (Form A / ICO)', code: 'COO', required: true, status: 'pending' },
    ],
    risk_alerts: [],
    is_demo: true,
    created_at: '2026-10-15',
    updated_at: '2026-10-18',
  },
  {
    id: 'ord-003',
    order_number: 'EXP-2026-003',
    po_reference: 'PO-AST-2026-01',
    buyer_id: 'byr-001',
    buyer_name: 'Al-Sultan Shisha Trading LLC',
    buyer_country: 'United Arab Emirates',
    product_id: 'prd-001',
    product_name: 'Coconut Shell Charcoal Briquettes - Premium Shisha',
    quantity_mt: 18,
    container_count: 1,
    container_type: '20ft FCL',
    unit_price: 1350,
    currency: 'USD',
    total_contract_value_idr: 394875000,
    total_contract_value_usd: 24300,
    recognized_revenue_idr: 394875000,
    collected_cash_idr: 394875000,
    cogs_idr: 288000000,
    estimated_gross_profit_idr: 106875000,
    incoterms: 'CFR',
    loading_port: 'Tanjung Priok, Jakarta',
    destination_port: 'Jebel Ali, Dubai',
    planned_shipment_date: '2026-09-10',
    actual_shipment_date: '2026-09-12',
    payment_terms: '30% T/T Deposit, 70% against BL copy',
    payment_status: 'fully_paid',
    shipment_status: 'delivered',
    container_number: 'ONEU-554192-8',
    bill_of_lading_no: 'ONE-DXB-2026-90',
    supplier_id: 'sup-001',
    supplier_name: 'PT Arang Kelapa Sentosa',
    documents: [
      { name: 'Export Declaration (PEB)', code: 'PEB', required: true, status: 'approved' },
      { name: 'Self Heating Test Certificate (SHTC)', code: 'SHTC', required: true, status: 'approved' },
      { name: 'Material Safety Data Sheet (MSDS)', code: 'MSDS', required: true, status: 'approved' },
      { name: 'Ocean Bill of Lading (OBL)', code: 'OBL', required: true, status: 'approved' },
      { name: 'Certificate of Origin (COO)', code: 'COO', required: true, status: 'approved' },
    ],
    risk_alerts: [],
    is_demo: true,
    created_at: '2026-09-02',
    updated_at: '2026-09-28',
  },
];

const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'qtn-001',
    quote_number: 'QTN-2026-088',
    buyer_id: 'byr-002',
    buyer_name: 'Baraka Tobacco & Charcoal Co.',
    buyer_country: 'Saudi Arabia',
    date: '2026-10-14',
    expiry_date: '2026-11-14',
    incoterm: 'CIF',
    loading_port: 'Tanjung Priok, Jakarta',
    destination_port: 'Jeddah Islamic Port',
    currency: 'USD',
    product_id: 'prd-001',
    product_name: 'Coconut Shell Charcoal Briquettes - Premium Shisha',
    quantity_mt: 36,
    unit_price: 1350,
    total_quote_value: 48600,
    total_cogs: 36000,
    est_gross_profit: 12600,
    est_gross_margin_pct: 25.9,
    payment_terms: '100% Confirmed Irrevocable LC at Sight',
    pricing_breakdown: calculatePricingBreakdown({
      quantity_mt: 36,
      supplier_cost_per_mt_idr: 14200000,
      packaging_per_mt_idr: 1000000,
      inland_trucking_total_idr: 12000000,
      handling_stuffing_thc_total_idr: 8000000,
      inspection_total_idr: 4500000,
      export_docs_shtc_msds_total_idr: 6000000,
      customs_clearance_peb_total_idr: 3000000,
      ocean_freight_total_idr: 48000000,
      marine_insurance_total_idr: 4000000,
      other_applicable_idr: 0,
      selling_price_per_mt_idr: 21937500,
      incoterm: 'CIF',
    }),
    status: 'sent',
    notes: 'Includes custom 1kg box branding with bilingual Arabic/English printing.',
    created_by: 'Hansel Varian Putra',
    created_at: '2026-10-14',
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-001',
    title: 'Overdue Follow-up: Levant Hookah Lounge',
    message: 'Follow-up with Zaid Qasim (Jordan) is overdue for FOB Jakarta Charcoal RFQ.',
    type: 'follow_up',
    severity: 'urgent',
    is_read: false,
    created_at: '2026-10-19T08:00:00Z',
    link_tab: 'crm',
  },
  {
    id: 'notif-002',
    title: 'Quotation Review Due: Al-Sultan Shisha',
    message: 'Tariq Al-Mansoor is waiting for CEO discount review on 3x40ft HC charcoal order.',
    type: 'follow_up',
    severity: 'warning',
    is_read: false,
    created_at: '2026-10-20T07:30:00Z',
    link_tab: 'pipeline',
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-10-18T10:00:00Z',
    user_name: 'Hansel Varian Putra',
    user_role: 'ceo',
    action: 'STAGE_UPDATED',
    details: 'Moved deal DEAL-2026-011 (Al-Sultan Shisha) to Negotiation',
    entity_type: 'opportunity',
    entity_id: 'opp-001',
  },
  {
    id: 'log-002',
    timestamp: '2026-10-15T09:00:00Z',
    user_name: 'Hansel Varian Putra',
    user_role: 'ceo',
    action: 'DEAL_WON_AND_ORDER_CREATED',
    details: 'Closed Won deal DEAL-2026-008 (Hanseatic Grill). Export Order EXP-2026-001 automatically generated.',
    entity_type: 'opportunity',
    entity_id: 'opp-005',
  },
];

const INITIAL_TARGET: SalesTarget = {
  monthly_revenue_target_idr: 150000000,
  new_buyer_leads: 200,
  qualified_buyers: 40,
  rfqs_received: 15,
  quotations_sent: 12,
  closed_orders: 3,
  follow_up_completion_rate_pct: 95.0,
  pipeline_coverage_ratio: 3.0,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Stored users in persistent local database
  const [registeredUsers, setRegisteredUsers] = useState<(UserProfile & { password?: string })[]>(() => {
    const saved = localStorage.getItem('gei_users_db');
    if (saved) {
      try {
        const sanitized = saved
          .replace(/Budi Santoso(, S\.T\., M\.M\.)?/g, 'Hansel Varian Putra')
          .replace(/https:\/\/images\.unsplash\.com\/photo-1507003211169-0a1dd7228f2d[^\s"']*/g, '');
        const parsed: (UserProfile & { password?: string })[] = JSON.parse(sanitized);

        // Sanitize out any removed photo
        parsed.forEach((u) => {
          if (u.avatar && u.avatar.includes('photo-1507003211169')) {
            u.avatar = '';
          }
        });

        // Ensure globalexporindonesia@gmail.com is present in local database
        const hasEmail = parsed.some((u) => u.email.toLowerCase() === 'globalexporindonesia@gmail.com');
        if (!hasEmail) {
          parsed.unshift({
            id: 'usr-001',
            name: 'Hansel Varian Putra',
            email: 'globalexporindonesia@gmail.com',
            role: 'ceo',
            title: 'Chief Executive Officer / Direktur Utama',
            avatar: '',
            organization_id: 'org-001',
            password: 'ceo123',
            created_at: '2026-01-01',
          });
        }
        return parsed;
      } catch {
        return INITIAL_DATABASE_USERS;
      }
    }
    return INITIAL_DATABASE_USERS;
  });

  // Current session & active profile
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('gei_active_user');
    if (saved) {
      try {
        const sanitized = saved
          .replace(/Budi Santoso(, S\.T\., M\.M\.)?/g, 'Hansel Varian Putra')
          .replace(/https:\/\/images\.unsplash\.com\/photo-1507003211169-0a1dd7228f2d[^\s"']*/g, '');
        const parsed: UserProfile = JSON.parse(sanitized);
        if (parsed.avatar && parsed.avatar.includes('photo-1507003211169')) {
          parsed.avatar = '';
        }
        return parsed;
      } catch {
        return INITIAL_DATABASE_USERS[0];
      }
    }
    return INITIAL_DATABASE_USERS[0];
  });

  // Privacy & Security: Always require login on fresh run/tab/build
  // Check sessionStorage only if user logged in during current browser tab session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      localStorage.removeItem('gei_auth_session');
    } catch {
      // ignore
    }
    const session = sessionStorage.getItem('gei_auth_session');
    return session === 'true';
  });

  const [currency, setCurrency] = useState<Currency>('IDR');
  const [exchangeRates] = useState<ExchangeRates>(DEFAULT_EXCHANGE_RATES);
  const [salesTarget, setSalesTarget] = useState<SalesTarget>(() => {
    const saved = localStorage.getItem('gei_sales_target');
    return saved ? JSON.parse(saved) : INITIAL_TARGET;
  });
  const [buyers, setBuyers] = useState<Buyer[]>(() => {
    const saved = localStorage.getItem('gei_buyers');
    if (saved) {
      try {
        const sanitized = saved.replace(/Budi Santoso/g, 'Hansel Varian Putra');
        return JSON.parse(sanitized);
      } catch {
        return INITIAL_BUYERS;
      }
    }
    return INITIAL_BUYERS;
  });
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    const saved = localStorage.getItem('gei_opportunities');
    if (saved) {
      try {
        const sanitized = saved.replace(/Budi Santoso/g, 'Hansel Varian Putra');
        return JSON.parse(sanitized);
      } catch {
        return INITIAL_OPPORTUNITIES;
      }
    }
    return INITIAL_OPPORTUNITIES;
  });
  const [exportOrders, setExportOrders] = useState<ExportOrder[]>(() => {
    const saved = localStorage.getItem('gei_export_orders');
    return saved ? JSON.parse(saved) : INITIAL_EXPORT_ORDERS;
  });
  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem('gei_quotations');
    if (saved) {
      try {
        const sanitized = saved.replace(/Budi Santoso/g, 'Hansel Varian Putra');
        return JSON.parse(sanitized);
      } catch {
        return INITIAL_QUOTATIONS;
      }
    }
    return INITIAL_QUOTATIONS;
  });
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    return INITIAL_AUDIT_LOGS;
  });
  const [dateRange, setDateRange] = useState<'this_month' | 'this_quarter' | 'this_year' | 'all'>('this_month');
  const [globalSearch, setGlobalSearch] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('gei_users_db', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    localStorage.setItem('gei_active_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    if (isAuthenticated) {
      sessionStorage.setItem('gei_auth_session', 'true');
    } else {
      sessionStorage.removeItem('gei_auth_session');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('gei_sales_target', JSON.stringify(salesTarget));
  }, [salesTarget]);

  useEffect(() => {
    localStorage.setItem('gei_buyers', JSON.stringify(buyers));
  }, [buyers]);

  useEffect(() => {
    localStorage.setItem('gei_opportunities', JSON.stringify(opportunities));
  }, [opportunities]);

  useEffect(() => {
    localStorage.setItem('gei_export_orders', JSON.stringify(exportOrders));
  }, [exportOrders]);

  useEffect(() => {
    localStorage.setItem('gei_quotations', JSON.stringify(quotations));
  }, [quotations]);

  // Login handler
  const login = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. If Supabase is active, try Supabase Auth first
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: pass,
        });

        if (!error && data.user) {
          // Fetch profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            // Check role restriction: ONLY CEO, Admin, or Komisaris
            if (profile.role !== 'ceo' && profile.role !== 'admin' && profile.role !== 'komisaris') {
              await supabase.auth.signOut();
              return {
                success: false,
                message: 'Akses ditolak: Hanya akun CEO, Admin, atau Komisaris yang berhak masuk.',
              };
            }

            const authedProfile: UserProfile = {
              id: profile.id,
              name: profile.full_name || 'Executive User',
              email: profile.email,
              role: profile.role,
              title: profile.role === 'ceo' ? 'Chief Executive Officer' : profile.role === 'admin' ? 'System Administrator' : 'Dewan Komisaris',
              avatar: profile.avatar_url && !profile.avatar_url.includes('photo-1507003211169') ? profile.avatar_url : '',
              organization_id: profile.organization_id || 'org-001',
            };
            setCurrentUser(authedProfile);
            setIsAuthenticated(true);
            return { success: true };
          }
        }
      } catch (e) {
        console.warn('Supabase auth fallback to local database:', e);
      }
    }

    // 2. Query persistent local database
    let matchedUser = registeredUsers.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    // If logging in with globalexporindonesia@gmail.com or ceo alias and not found, auto-link to Hansel Varian Putra (CEO)
    if (!matchedUser && (normalizedEmail === 'globalexporindonesia@gmail.com' || normalizedEmail === 'ceo@globalexpor.id')) {
      const newCeoUser: UserProfile & { password?: string } = {
        id: 'usr-001',
        name: 'Hansel Varian Putra',
        email: normalizedEmail,
        role: 'ceo',
        title: 'Chief Executive Officer / Direktur Utama',
        avatar: '',
        organization_id: 'org-001',
        password: pass,
        created_at: '2026-01-01',
      };
      setRegisteredUsers((prev) => [newCeoUser, ...prev.filter((u) => u.email !== normalizedEmail)]);
      matchedUser = newCeoUser;
    }

    if (!matchedUser) {
      return { success: false, message: 'Email tidak ditemukan di database resmi.' };
    }

    // For Hansel Varian Putra (CEO), dynamically accept and memorize the password provided
    if (normalizedEmail === 'globalexporindonesia@gmail.com' || normalizedEmail === 'ceo@globalexpor.id') {
      if (pass && matchedUser.password !== pass) {
        matchedUser.password = pass;
        setRegisteredUsers((prev) =>
          prev.map((u) => (u.email.toLowerCase() === normalizedEmail ? { ...u, password: pass } : u))
        );
      }
    } else if (matchedUser.password && matchedUser.password !== pass) {
      return { success: false, message: 'Kata sandi (password) salah.' };
    }

    // Strict role verification
    if (matchedUser.role !== 'ceo' && matchedUser.role !== 'admin' && matchedUser.role !== 'komisaris') {
      return {
        success: false,
        message: 'Akses ditolak: Akun Anda tidak memiliki hak akses (Hanya Admin, CEO, dan Komisaris).',
      };
    }

    setCurrentUser(matchedUser);
    setIsAuthenticated(true);
    return { success: true };
  };

  // Register & Save to Database handler
  const registerUser = async (
    name: string,
    email: string,
    pass: string,
    role: UserRole,
    title: string
  ): Promise<{ success: boolean; message?: string }> => {
    // Validate role: ONLY ceo, admin, komisaris
    if (role !== 'ceo' && role !== 'admin' && role !== 'komisaris') {
      return {
        success: false,
        message: 'Role tidak sah. Hanya peran Admin, CEO, dan Komisaris yang diperbolehkan.',
      };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already registered
    if (registeredUsers.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return {
        success: false,
        message: `Email ${email} sudah terdaftar di database. Silakan masuk (login).`,
      };
    }

    const newUserId = `usr-${Date.now()}`;
    const newUser: UserProfile & { password?: string } = {
      id: newUserId,
      name,
      email: normalizedEmail,
      role,
      title,
      avatar:
        role === 'ceo'
          ? ''
          : role === 'admin'
          ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      organization_id: 'org-001',
      password: pass,
      created_at: new Date().toISOString().split('T')[0],
    };

    // Save to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: pass,
        });

        if (!authError && authData.user) {
          await supabase.from('profiles').insert([
            {
              id: authData.user.id,
              organization_id: 'a0000000-0000-0000-0000-000000000001',
              email: normalizedEmail,
              full_name: name,
              role,
              is_active: true,
            },
          ]);
        }
      } catch (err) {
        console.warn('Supabase register error:', err);
      }
    }

    // Persist into database store
    setRegisteredUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);

    // Audit log
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user_name: name,
      user_role: role,
      action: 'USER_REGISTERED_TO_DATABASE',
      details: `New account registered to database with role ${role.toUpperCase()}: ${email}`,
      entity_type: 'profile',
      entity_id: newUserId,
    };
    setAuditLogs((prev) => [log, ...prev]);

    return { success: true };
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    sessionStorage.removeItem('gei_auth_session');
    localStorage.removeItem('gei_auth_session');
    setIsAuthenticated(false);
  };

  const setCurrentRole = (role: UserRole) => {
    const existing = registeredUsers.find((u) => u.role === role);
    if (existing) {
      setCurrentUser(existing);
    } else {
      setCurrentUser(PROFILES[role]);
    }
  };

  const updateUserAvatar = (avatarUrl: string) => {
    const cleanAvatar = avatarUrl.includes('photo-1507003211169') ? '' : avatarUrl;
    setCurrentUser((prev) => ({ ...prev, avatar: cleanAvatar }));
    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, avatar: cleanAvatar } : u))
    );
  };

  const updateSalesTarget = (targetUpdates: Partial<SalesTarget>) => {
    setSalesTarget((prev) => ({ ...prev, ...targetUpdates }));
  };

  const addBuyer = (buyerData: Omit<Buyer, 'id' | 'buyer_code' | 'created_at' | 'updated_at'>) => {
    const codeNumber = String(buyers.length + 1).padStart(3, '0');
    const newBuyer: Buyer = {
      ...buyerData,
      id: `byr-${Date.now()}`,
      buyer_code: `BYR-${buyerData.country_code || 'EXP'}-${codeNumber}`,
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
      is_demo: isDemoMode,
    };
    setBuyers((prev) => [newBuyer, ...prev]);

    const log: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user_name: currentUser.name,
      user_role: currentUser.role,
      action: 'BUYER_CREATED',
      details: `Created new buyer profile: ${newBuyer.company_name} (${newBuyer.country})`,
      entity_type: 'buyer',
      entity_id: newBuyer.id,
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const updateBuyer = (id: string, updates: Partial<Buyer>) => {
    setBuyers((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates, updated_at: new Date().toISOString().split('T')[0] } : b))
    );
  };

  const archiveBuyer = (id: string) => {
    setBuyers((prev) => prev.map((b) => (b.id === id ? { ...b, is_archived: true } : b)));
  };

  const addOpportunity = (oppData: Omit<Opportunity, 'id' | 'deal_code' | 'created_at' | 'stage_updated_at'>) => {
    const newOpp: Opportunity = {
      ...oppData,
      id: `opp-${Date.now()}`,
      deal_code: `DEAL-2026-${String(opportunities.length + 1).padStart(3, '0')}`,
      stage_updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      is_demo: isDemoMode,
    };
    setOpportunities((prev) => [newOpp, ...prev]);
  };

  const updateOpportunityStage = (
    id: string,
    newStage: PipelineStage,
    meta?: {
      won_po_reference?: string;
      won_contract_value_idr?: number;
      won_payment_terms?: string;
      loss_reason?: string;
      loss_notes?: string;
    }
  ) => {
    let linkedOrderId: string | undefined;

    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id !== id) return opp;

        if (newStage === 'closed_won') {
          const finalValueIDR = meta?.won_contract_value_idr || opp.est_order_value_idr;
          const orderNum = `EXP-2026-${String(exportOrders.length + 1).padStart(3, '0')}`;
          linkedOrderId = `ord-${Date.now()}`;

          const newOrder: ExportOrder = {
            id: linkedOrderId,
            order_number: orderNum,
            po_reference: meta?.won_po_reference || `PO-AUTO-${Date.now().toString().slice(-4)}`,
            buyer_id: opp.buyer_id,
            buyer_name: opp.buyer_name,
            buyer_country: opp.country,
            product_id: opp.product_id,
            product_name: opp.product_name,
            quantity_mt: 18,
            container_count: 1,
            container_type: '20ft FCL',
            unit_price: 1350,
            currency: opp.currency,
            total_contract_value_idr: finalValueIDR,
            total_contract_value_usd: Math.round(finalValueIDR / DEFAULT_EXCHANGE_RATES.USD),
            recognized_revenue_idr: 0,
            collected_cash_idr: 0,
            cogs_idr: Math.round(finalValueIDR * 0.75),
            estimated_gross_profit_idr: Math.round(finalValueIDR * 0.25),
            incoterms: 'FOB',
            loading_port: 'Tanjung Priok, Jakarta',
            destination_port: 'Overseas Port',
            planned_shipment_date: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
            payment_terms: meta?.won_payment_terms || '30% T/T Advance, 70% against BL copy',
            payment_status: 'deposit_pending',
            shipment_status: 'order_confirmed',
            supplier_id: 'sup-001',
            supplier_name: 'PT Arang Kelapa Sentosa',
            documents: [
              { name: 'Export Declaration (PEB)', code: 'PEB', required: true, status: 'pending' },
              { name: 'Self Heating Test Certificate (SHTC)', code: 'SHTC', required: true, status: 'pending' },
              { name: 'Material Safety Data Sheet (MSDS)', code: 'MSDS', required: true, status: 'approved' },
              { name: 'Commercial Invoice & Packing List', code: 'CIPL', required: true, status: 'pending' },
            ],
            risk_alerts: [],
            is_demo: isDemoMode,
            created_at: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString().split('T')[0],
          };

          setExportOrders((currentOrders) => [newOrder, ...currentOrders]);
        }

        return {
          ...opp,
          stage: newStage,
          probability: newStage === 'closed_won' ? 100 : newStage === 'closed_lost' ? 0 : opp.probability,
          stage_updated_at: new Date().toISOString(),
          updated_by: currentUser.name,
          won_po_reference: meta?.won_po_reference || opp.won_po_reference,
          won_contract_value_idr: meta?.won_contract_value_idr || opp.won_contract_value_idr,
          won_payment_terms: meta?.won_payment_terms || opp.won_payment_terms,
          loss_reason: meta?.loss_reason || opp.loss_reason,
          loss_notes: meta?.loss_notes || opp.loss_notes,
          linked_order_id: linkedOrderId || opp.linked_order_id,
        };
      })
    );

    const audit: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user_name: currentUser.name,
      user_role: currentUser.role,
      action: 'STAGE_UPDATED',
      details: `Moved deal to ${newStage.toUpperCase()} by ${currentUser.name}`,
      entity_type: 'opportunity',
      entity_id: id,
    };
    setAuditLogs((prev) => [audit, ...prev]);
  };

  const updateOpportunityProbability = (id: string, probability: number) => {
    setOpportunities((prev) =>
      prev.map((opp) => (opp.id === id ? { ...opp, probability: Math.max(0, Math.min(100, probability)) } : opp))
    );
  };

  const addExportOrder = (orderData: Omit<ExportOrder, 'id' | 'order_number' | 'created_at' | 'updated_at'>) => {
    const orderNum = `EXP-2026-${String(exportOrders.length + 1).padStart(3, '0')}`;
    const newOrder: ExportOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      order_number: orderNum,
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
      is_demo: isDemoMode,
    };
    setExportOrders((prev) => [newOrder, ...prev]);
  };

  const updateExportOrderStatus = (
    id: string,
    updates: Partial<Pick<ExportOrder, 'shipment_status' | 'payment_status' | 'bill_of_lading_no' | 'container_number'>>
  ) => {
    setExportOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== id) return ord;
        const updated = { ...ord, ...updates, updated_at: new Date().toISOString().split('T')[0] };

        if ((updates.shipment_status === 'in_transit' || updates.shipment_status === 'delivered') && ord.recognized_revenue_idr === 0) {
          updated.recognized_revenue_idr = ord.total_contract_value_idr;
        }

        if (updates.payment_status === 'fully_paid') {
          updated.collected_cash_idr = ord.total_contract_value_idr;
        }

        return updated;
      })
    );
  };

  const addQuotation = (quoteData: Omit<Quotation, 'id' | 'quote_number' | 'created_at'>) => {
    const quoteNum = `QTN-2026-${String(quotations.length + 1).padStart(3, '0')}`;
    const newQuote: Quotation = {
      ...quoteData,
      id: `qtn-${Date.now()}`,
      quote_number: quoteNum,
      created_at: new Date().toISOString().split('T')[0],
    };
    setQuotations((prev) => [newQuote, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const resetDemoData = () => {
    setSalesTarget(INITIAL_TARGET);
    setBuyers(INITIAL_BUYERS);
    setOpportunities(INITIAL_OPPORTUNITIES);
    setExportOrders(INITIAL_EXPORT_ORDERS);
    setQuotations(INITIAL_QUOTATIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    localStorage.removeItem('gei_sales_target');
    localStorage.removeItem('gei_buyers');
    localStorage.removeItem('gei_opportunities');
    localStorage.removeItem('gei_export_orders');
    localStorage.removeItem('gei_quotations');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentRole,
        updateUserAvatar,
        isAuthenticated,
        login,
        registerUser,
        logout,
        registeredUsers,
        isSupabaseActive: isSupabaseConfigured,
        currency,
        setCurrency,
        exchangeRates,
        salesTarget,
        updateSalesTarget,
        buyers,
        addBuyer,
        updateBuyer,
        archiveBuyer,
        opportunities,
        addOpportunity,
        updateOpportunityStage,
        updateOpportunityProbability,
        exportOrders,
        addExportOrder,
        updateExportOrderStatus,
        quotations,
        addQuotation,
        products,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        auditLogs,
        dateRange,
        setDateRange,
        globalSearch,
        setGlobalSearch,
        resetDemoData,
        isDemoMode,
        setIsDemoMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
