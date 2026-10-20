import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  ChevronRight,
  X,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  Building2,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApp } from '../context/AppContext';
import {
  formatCurrency,
  convertCurrency,
  detectDuplicateBuyers,
} from '../lib/calculations';
import type { Buyer, BuyerType, VerificationStatus, PipelineStage } from '../types';

const buyerSchema = z.object({
  company_name: z.string().min(2, 'Company name is required'),
  country: z.string().min(2, 'Country is required'),
  country_code: z.string().min(2, '2 or 3 letter ISO code required').max(3),
  contact_person: z.string().min(2, 'Contact person is required'),
  job_title: z.string().min(2, 'Job title is required'),
  email: z.string().email('Valid business email required'),
  phone: z.string().min(6, 'Valid international phone or WhatsApp required'),
  website: z.string().url('Valid website URL required (e.g. https://company.com)'),
  linkedin_url: z.string().optional(),
  buyer_type: z.enum([
    'importer',
    'distributor',
    'wholesaler',
    'retailer',
    'manufacturer',
    'shisha_distributor',
    'other_b2b',
  ]),
  product_interest: z.string().min(2, 'Product interest required'),
  est_purchase_volume_mt: z.number().min(1, 'Volume in MT must be at least 1'),
  est_deal_value_usd: z.number().min(100, 'Deal value required'),
  destination_port: z.string().min(2, 'Destination port required'),
  lead_source: z.string().min(2, 'Lead source required'),
  lead_owner: z.string().min(2, 'Lead owner required'),
  verification_status: z.enum(['verified', 'pending', 'unverified']),
  stage: z.enum([
    'new_lead',
    'initial_contact',
    'qualified_buyer',
    'rfq_received',
    'quotation_sent',
    'negotiation',
    'closed_won',
    'closed_lost',
  ]),
  next_follow_up_date: z.string().min(4, 'Next follow up date required'),
  follow_up_notes: z.string().min(3, 'Follow up notes required'),
  payment_preference: z.string().min(2, 'Payment preference required'),
  risk_notes: z.string().optional(),
});

type BuyerFormData = z.infer<typeof buyerSchema>;

export const BuyerCRM: React.FC = () => {
  const {
    buyers,
    addBuyer,
    updateBuyer,
    archiveBuyer,
    currency,
    exchangeRates,
    products,
    currentUser,
    globalSearch,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState('ALL');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedOwner, setSelectedOwner] = useState('ALL');
  const [sortBy, setSortBy] = useState<'value' | 'follow_up' | 'company'>('follow_up');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [potentialDuplicateWarning, setPotentialDuplicateWarning] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      buyer_type: 'shisha_distributor',
      verification_status: 'pending',
      stage: 'new_lead',
      lead_owner: currentUser.name,
      est_purchase_volume_mt: 18,
      est_deal_value_usd: 24300,
      product_interest: 'Coconut Shell Charcoal Briquettes - Premium Shisha / Hookah',
      payment_preference: '30% T/T Advance, 70% against BL copy',
      next_follow_up_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      destination_port: 'Jebel Ali, Dubai',
      lead_source: 'Inbound Trade Inquiry',
    },
  });

  // Watch company name and email to trigger duplicate detector
  const watchCompany = watch('company_name');
  const watchEmail = watch('email');

  React.useEffect(() => {
    if (watchCompany && watchCompany.length > 3) {
      const dups = detectDuplicateBuyers(buyers, {
        company_name: watchCompany,
        email: watchEmail,
      });
      if (dups.length > 0) {
        setPotentialDuplicateWarning(
          `Potential duplicate detected: "${dups[0].company_name}" (${dups[0].country}) already exists in CRM.`
        );
      } else {
        setPotentialDuplicateWarning(null);
      }
    } else {
      setPotentialDuplicateWarning(null);
    }
  }, [watchCompany, watchEmail, buyers]);

  // Overdue follow-up detector (relative to current demo date 2026-10-20)
  const overdueBuyers = useMemo(() => {
    return buyers.filter((b) => {
      if (b.is_archived || !b.next_follow_up_date) return false;
      return new Date(b.next_follow_up_date) < new Date('2026-10-20');
    });
  }, [buyers]);

  // Filtered & Sorted Buyers
  const filteredBuyers = useMemo(() => {
    const q = (search || globalSearch).toLowerCase().trim();

    return buyers
      .filter((b) => {
        if (b.is_archived) return false;
        if (q && !b.company_name.toLowerCase().includes(q) && !b.contact_person.toLowerCase().includes(q) && !b.country.toLowerCase().includes(q)) {
          return false;
        }
        if (selectedCountry !== 'ALL' && b.country !== selectedCountry) return false;
        if (selectedProduct !== 'ALL' && !b.product_interest.includes(selectedProduct)) return false;
        if (selectedStage !== 'ALL' && b.stage !== selectedStage) return false;
        if (selectedStatus !== 'ALL' && b.verification_status !== selectedStatus) return false;
        if (selectedOwner !== 'ALL' && b.lead_owner !== selectedOwner) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'value') {
          return (b.est_deal_value_idr || 0) - (a.est_deal_value_idr || 0);
        }
        if (sortBy === 'company') {
          return a.company_name.localeCompare(b.company_name);
        }
        // default follow_up
        return new Date(a.next_follow_up_date || '').getTime() - new Date(b.next_follow_up_date || '').getTime();
      });
  }, [buyers, search, globalSearch, selectedCountry, selectedProduct, selectedStage, selectedStatus, selectedOwner, sortBy]);

  const uniqueCountries = Array.from(new Set(buyers.map((b) => b.country)));

  const handleExportCSV = () => {
    const headers = [
      'Buyer Code',
      'Company Name',
      'Country',
      'Contact Person',
      'Email',
      'Phone',
      'Buyer Type',
      'Product Interest',
      'Est Volume (MT)',
      'Est Deal Value (USD)',
      'Destination Port',
      'Stage',
      'Verification Status',
      'Next Follow-up',
      'Owner',
    ];

    const rows = filteredBuyers.map((b) => [
      `"${b.buyer_code}"`,
      `"${b.company_name}"`,
      `"${b.country}"`,
      `"${b.contact_person}"`,
      `"${b.email}"`,
      `"${b.phone}"`,
      `"${b.buyer_type}"`,
      `"${b.product_interest}"`,
      b.est_purchase_volume_mt,
      b.est_deal_value_usd,
      `"${b.destination_port}"`,
      `"${b.stage}"`,
      `"${b.verification_status}"`,
      `"${b.next_follow_up_date}"`,
      `"${b.lead_owner}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PT_Global_Expor_Buyers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onSubmitNewBuyer = (data: BuyerFormData) => {
    const valueIDR = data.est_deal_value_usd * exchangeRates.USD;
    addBuyer({
      ...data,
      est_deal_value_idr: valueIDR,
      last_contact_date: new Date().toISOString().split('T')[0],
      risk_notes: data.risk_notes || 'Clean background check.',
      is_archived: false,
    });
    setIsAddModalOpen(false);
    reset();
  };

  return (
    <div className="space-y-6">
      {/* Overdue Follow-up Notice */}
      {overdueBuyers.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-100 text-red-700">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-950 flex items-center space-x-2">
                <span>{overdueBuyers.length} Overdue Follow-Up Actions Required</span>
              </h3>
              <p className="text-xs text-red-700 mt-0.5">
                International buyers expecting feedback or quotation clarification:
                <span className="font-semibold ml-1">
                  {overdueBuyers.map((b) => `${b.company_name} (${b.country})`).join(', ')}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedStage('ALL');
              setSelectedStatus('ALL');
              setSearch(overdueBuyers[0].company_name);
            }}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors self-start sm:self-auto flex-shrink-0"
          >
            Review Overdue
          </button>
        </div>
      )}

      {/* Action Header & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-card space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-navy-950 flex items-center space-x-2">
              <Users className="h-4 w-4 text-navy-900" />
              <span>International Buyer CRM</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {filteredBuyers.length} Buyers
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Centralized international buyer accounts, contact history, and compliance status
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1 border border-slate-200"
              title="Export filtered records to CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add International Buyer</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company, contact..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-navy-700"
            />
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Country filter */}
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700"
          >
            <option value="ALL">All Countries</option>
            {uniqueCountries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Stage filter */}
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700"
          >
            <option value="ALL">All Pipeline Stages</option>
            <option value="new_lead">New Lead</option>
            <option value="initial_contact">Initial Contact</option>
            <option value="qualified_buyer">Qualified Buyer</option>
            <option value="rfq_received">RFQ Received</option>
            <option value="quotation_sent">Quotation Sent</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed_won">Closed Won</option>
            <option value="closed_lost">Closed Lost</option>
          </select>

          {/* Verification status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700"
          >
            <option value="ALL">All Verification Statuses</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending Verification</option>
            <option value="unverified">Unverified</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 font-medium"
          >
            <option value="follow_up">Sort: Next Follow-up</option>
            <option value="value">Sort: Estimated Deal Value</option>
            <option value="company">Sort: Company Name</option>
          </select>
        </div>
      </div>

      {/* Buyers Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Company & Country</th>
                <th className="py-3 px-3">Contact Person</th>
                <th className="py-3 px-3">Product Interest</th>
                <th className="py-3 px-3">Est. Value</th>
                <th className="py-3 px-3">Stage</th>
                <th className="py-3 px-3">Verification</th>
                <th className="py-3 px-3">Next Action</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBuyers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No buyers match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredBuyers.map((b) => {
                  const isOverdue =
                    b.next_follow_up_date && new Date(b.next_follow_up_date) < new Date('2026-10-20');

                  return (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedBuyer(b)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                        isOverdue ? 'bg-red-50/20' : ''
                      }`}
                    >
                      {/* Company & Country */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {b.country_code}
                          </span>
                          <div>
                            <p className="font-bold text-navy-950 text-xs hover:text-navy-700">
                              {b.company_name}
                            </p>
                            <p className="text-[11px] text-slate-500 flex items-center space-x-1">
                              <span>{b.country}</span>
                              <span>•</span>
                              <span className="capitalize">{b.buyer_type.replace(/_/g, ' ')}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-800">{b.contact_person}</p>
                        <p className="text-[11px] text-slate-500">{b.job_title}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">{b.email}</p>
                      </td>

                      {/* Product Interest */}
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 truncate max-w-[180px]">
                          {b.product_interest}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Vol: <span className="font-semibold">{b.est_purchase_volume_mt} MT</span> ({b.destination_port})
                        </p>
                      </td>

                      {/* Est Value */}
                      <td className="py-3 px-3">
                        <p className="font-mono font-bold text-navy-950">
                          {formatCurrency(
                            convertCurrency(b.est_deal_value_idr, 'IDR', currency, exchangeRates),
                            currency
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          (${b.est_deal_value_usd.toLocaleString()} USD)
                        </p>
                      </td>

                      {/* Stage */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                            b.stage === 'closed_won'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.stage === 'negotiation'
                              ? 'bg-indigo-100 text-indigo-800'
                              : b.stage === 'quotation_sent'
                              ? 'bg-blue-100 text-blue-800'
                              : b.stage === 'closed_lost'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.stage.replace(/_/g, ' ')}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Owner: {b.lead_owner}</p>
                      </td>

                      {/* Verification Status */}
                      <td className="py-3 px-3">
                        {b.verification_status === 'verified' ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold text-[11px]">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Verified</span>
                          </span>
                        ) : b.verification_status === 'pending' ? (
                          <span className="inline-flex items-center space-x-1 text-amber-700 font-medium text-[11px]">
                            <ShieldQuestion className="h-3.5 w-3.5" />
                            <span>Pending</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-slate-500 font-normal text-[11px]">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            <span>Unverified</span>
                          </span>
                        )}
                      </td>

                      {/* Next Action */}
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1">
                          <span
                            className={`font-semibold text-[11px] ${
                              isOverdue ? 'text-red-600 font-bold' : 'text-slate-700'
                            }`}
                          >
                            {b.next_follow_up_date}
                          </span>
                          {isOverdue && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-100 text-red-700 font-bold uppercase">
                              Overdue
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate max-w-[160px]">
                          {b.follow_up_notes}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBuyer(b);
                          }}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-navy-950 transition-colors"
                          title="View Buyer Profile"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Buyer Detail Drawer */}
      {selectedBuyer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-navy-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-slate-200">
            {/* Header */}
            <div>
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-navy-900 text-white">
                      {selectedBuyer.buyer_code}
                    </span>
                    <h3 className="text-base font-bold text-navy-950">
                      {selectedBuyer.company_name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedBuyer.country} • {selectedBuyer.buyer_type.replace(/_/g, ' ')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBuyer(null)}
                  className="p-1.5 text-slate-400 hover:text-navy-900 rounded-lg hover:bg-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5 text-xs">
                {/* Contact Information */}
                <div>
                  <h4 className="font-bold text-navy-950 uppercase tracking-wider text-[11px] mb-2 border-b border-slate-100 pb-1">
                    Contact & Communication
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 text-[10px]">Contact Person:</span>
                      <p className="font-semibold text-slate-900">{selectedBuyer.contact_person}</p>
                      <p className="text-[11px] text-slate-500">{selectedBuyer.job_title}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Email:</span>
                      <p className="font-mono font-medium text-blue-700">{selectedBuyer.email}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Phone / WhatsApp:</span>
                      <p className="font-mono font-medium text-slate-800">{selectedBuyer.phone}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Website:</span>
                      <a
                        href={selectedBuyer.website}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-navy-700 hover:underline flex items-center space-x-1"
                      >
                        <span className="truncate">{selectedBuyer.website}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Commercial Opportunity */}
                <div>
                  <h4 className="font-bold text-navy-950 uppercase tracking-wider text-[11px] mb-2 border-b border-slate-100 pb-1">
                    Commercial Terms & Commodity Requirements
                  </h4>
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-400 text-[10px]">Commodity:</span>
                      <p className="font-bold text-navy-950">{selectedBuyer.product_interest}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Est. Deal Value:</span>
                      <p className="font-mono font-bold text-emerald-700">
                        {formatCurrency(
                          convertCurrency(selectedBuyer.est_deal_value_idr, 'IDR', currency, exchangeRates),
                          currency
                        )}{' '}
                        (${selectedBuyer.est_deal_value_usd.toLocaleString()})
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Est. Volume:</span>
                      <p className="font-semibold text-slate-900">{selectedBuyer.est_purchase_volume_mt} Metric Tons</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Destination Port:</span>
                      <p className="font-semibold text-slate-900">{selectedBuyer.destination_port}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 text-[10px]">Payment Preference:</span>
                      <p className="font-medium text-slate-800">{selectedBuyer.payment_preference}</p>
                    </div>
                  </div>
                </div>

                {/* Follow-up Notes & Risk Assessment */}
                <div>
                  <h4 className="font-bold text-navy-950 uppercase tracking-wider text-[11px] mb-2 border-b border-slate-100 pb-1">
                    Follow-Up Notes & Risk Notes
                  </h4>
                  <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-amber-900">Next Action:</span>
                      <p className="text-slate-800 mt-0.5 leading-relaxed">{selectedBuyer.follow_up_notes}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-900">Due Date:</span>
                      <span className="font-mono font-bold text-navy-950 ml-2">
                        {selectedBuyer.next_follow_up_date}
                      </span>
                    </div>
                    {selectedBuyer.risk_notes && (
                      <div className="pt-2 border-t border-amber-200/60">
                        <span className="text-[10px] font-bold text-slate-700">Risk Notes:</span>
                        <p className="text-slate-700 text-[11px] mt-0.5">{selectedBuyer.risk_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  archiveBuyer(selectedBuyer.id);
                  setSelectedBuyer(null);
                }}
                className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Archive Buyer</span>
              </button>
              <button
                onClick={() => setSelectedBuyer(null)}
                className="px-4 py-1.5 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-navy-800"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add International Buyer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-navy-950">
                  Register New International Buyer
                </h3>
                <p className="text-xs text-slate-500">
                  Add verified B2B buyer account for export sales pipeline tracking
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-navy-900 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Duplicate Warning Alert */}
            {potentialDuplicateWarning && (
              <div className="mx-5 mt-4 p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 text-xs flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span>{potentialDuplicateWarning}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmitNewBuyer)}
              className="p-5 overflow-y-auto space-y-4 text-xs"
            >
              {/* Row 1: Company & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700">Company Name *</label>
                  <input
                    {...register('company_name')}
                    placeholder="e.g. Al-Mansoor Charcoal Trading LLC"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-navy-700"
                  />
                  {errors.company_name && (
                    <p className="text-[10px] text-red-600">{errors.company_name.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Country *</label>
                  <input
                    {...register('country')}
                    placeholder="e.g. United Arab Emirates"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-navy-700"
                  />
                  {errors.country && (
                    <p className="text-[10px] text-red-600">{errors.country.message}</p>
                  )}
                </div>
              </div>

              {/* Row 2: ISO Code & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">ISO Code (2-3 chars) *</label>
                  <input
                    {...register('country_code')}
                    placeholder="e.g. AE"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-navy-700 uppercase"
                  />
                  {errors.country_code && (
                    <p className="text-[10px] text-red-600">{errors.country_code.message}</p>
                  )}
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-slate-700">Buyer Type *</label>
                  <select
                    {...register('buyer_type')}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-navy-700"
                  >
                    <option value="shisha_distributor">Shisha / Hookah Product Distributor</option>
                    <option value="importer">Importer</option>
                    <option value="distributor">Distributor</option>
                    <option value="wholesaler">Wholesaler</option>
                    <option value="retailer">Retailer</option>
                    <option value="manufacturer">Manufacturer</option>
                    <option value="other_b2b">Other B2B Buyer</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Contact Person, Job Title, Email, Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Contact Person *</label>
                  <input
                    {...register('contact_person')}
                    placeholder="e.g. Tariq Al-Mansoor"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-navy-700"
                  />
                  {errors.contact_person && (
                    <p className="text-[10px] text-red-600">{errors.contact_person.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Job Title *</label>
                  <input
                    {...register('job_title')}
                    placeholder="e.g. Head of Sourcing"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-navy-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Business Email *</label>
                  <input
                    {...register('email')}
                    placeholder="tariq@almansoor.ae"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-navy-700"
                  />
                  {errors.email && (
                    <p className="text-[10px] text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Phone or WhatsApp *</label>
                  <input
                    {...register('phone')}
                    placeholder="+971 50 123 4567"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-navy-700"
                  />
                  {errors.phone && (
                    <p className="text-[10px] text-red-600">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* Row 4: Website & Port */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Website URL *</label>
                  <input
                    {...register('website')}
                    placeholder="https://almansoor.ae"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-navy-700"
                  />
                  {errors.website && (
                    <p className="text-[10px] text-red-600">{errors.website.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Destination Port *</label>
                  <input
                    {...register('destination_port')}
                    placeholder="e.g. Jebel Ali, Dubai"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-navy-700"
                  />
                </div>
              </div>

              {/* Row 5: Product Interest & Purchase Volume */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700">Commodity Interest *</label>
                  <select
                    {...register('product_interest')}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-navy-700"
                  >
                    <option value="Coconut Shell Charcoal Briquettes - Premium Shisha / Hookah">
                      Coconut Shell Charcoal Briquettes - Premium Shisha (Primary)
                    </option>
                    <option value="Coconut Shell Charcoal Briquettes - BBQ Hexagonal">
                      Coconut Shell Charcoal Briquettes - BBQ Hexagonal
                    </option>
                    <option value="Virgin Coconut Oil (VCO) Cold Pressed Organic">
                      Virgin Coconut Oil (VCO) Cold Pressed Organic
                    </option>
                    <option value="Indonesian Cassia Vera AA Cinnamon Sticks">
                      Indonesian Cassia Vera AA Cinnamon Sticks
                    </option>
                    <option value="Sumatra Gayo Highland Arabica Specialty Green Coffee">
                      Sumatra Gayo Highland Arabica Specialty Green Coffee
                    </option>
                    <option value="North Maluku Nutmeg ABCD Grade with Mace">
                      North Maluku Nutmeg ABCD Grade with Mace
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Est. Volume (MT) *</label>
                  <input
                    type="number"
                    {...register('est_purchase_volume_mt', { valueAsNumber: true })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-navy-700 font-mono"
                  />
                </div>
              </div>

              {/* Row 6: Deal Value USD & Next Follow-Up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Estimated Deal Value (USD) *</label>
                  <input
                    type="number"
                    {...register('est_deal_value_usd', { valueAsNumber: true })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-navy-700 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Next Follow-Up Date *</label>
                  <input
                    type="date"
                    {...register('next_follow_up_date')}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-navy-700"
                  />
                </div>
              </div>

              {/* Row 7: Notes & Payment Terms */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Follow-up Notes & Required Action *</label>
                <textarea
                  {...register('follow_up_notes')}
                  rows={2}
                  placeholder="e.g. Sent CIF Jebel Ali charcoal quotation draft. Follow up on container sample inspection."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-navy-700"
                />
              </div>

              {/* Submit buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-lg font-bold shadow-sm"
                >
                  Save Buyer Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
