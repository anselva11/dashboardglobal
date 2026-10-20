import React from 'react';
import {
  DollarSign,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import {
  formatCurrency,
  convertCurrency,
} from '../lib/calculations';

export const FinancialOverview: React.FC = () => {
  const {
    currency,
    exchangeRates,
    exportOrders,
  } = useApp();

  // Dynamic calculations based on actual transactions
  const totalExportSalesIDR = exportOrders.reduce(
    (sum, o) => sum + (o.total_contract_value_idr || 0),
    0
  );
  const recognizedRevenueIDR = exportOrders.reduce(
    (sum, o) => sum + (o.recognized_revenue_idr || 0),
    0
  );
  const collectedCashIDR = exportOrders.reduce(
    (sum, o) => sum + (o.collected_cash_idr || 0),
    0
  );
  const cogsIDR = exportOrders.reduce((sum, o) => sum + (o.cogs_idr || 0), 0);
  const grossProfitIDR = recognizedRevenueIDR - cogsIDR;

  // Accounts receivable = total contracted - collected cash
  const accountsReceivableIDR = Math.max(0, totalExportSalesIDR - collectedCashIDR);
  const supplierPayablesIDR = 380000000; // Pending balance to charcoal & packaging vendors
  const opexIDR = 85000000; // Monthly operating expenses (salaries, office, certifications)
  const netCashFlowIDR = collectedCashIDR - (cogsIDR * 0.7 + opexIDR);

  // Cash flow monthly comparison chart
  const cashFlowData = [
    { month: 'Jul 2026', inflow: 110000000, outflow: 85000000, net: 25000000 },
    { month: 'Aug 2026', inflow: 135000000, outflow: 102000000, net: 33000000 },
    { month: 'Sep 2026', inflow: 148000000, outflow: 115000000, net: 33000000 },
    { month: 'Oct 2026', inflow: collectedCashIDR, outflow: cogsIDR * 0.5 + opexIDR, net: netCashFlowIDR },
  ];

  // Accounts Receivable Aging breakdown
  const agingBuckets = [
    { bucket: 'Current (< 30 days)', amountIDR: 1104480000, pct: '67.0%', status: 'Normal' },
    { bucket: '31 – 60 days', amountIDR: 440000000, pct: '26.7%', status: 'En route' },
    { bucket: '61 – 90 days', amountIDR: 104000000, pct: '6.3%', status: 'Attention' },
    { bucket: '> 90 days overdue', amountIDR: 0, pct: '0.0%', status: 'Clean' },
  ];

  return (
    <div className="space-y-6">
      {/* Management Reporting Disclaimer */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-navy-800 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-navy-950">
              Executive Financial & Cash Flow Management Intelligence
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
              This module is strictly for internal business intelligence, cash flow liquidity, and margin tracking. It does not replace formal statutory accounting or tax filings. Unpaid invoices are never classified as collected cash.
            </p>
          </div>
        </div>

        {/* Currency & Rates Pill */}
        <div className="flex items-center space-x-2 text-xs bg-slate-100 p-1.5 rounded-lg border border-slate-200 self-start sm:self-auto flex-shrink-0">
          <span className="font-semibold text-slate-600">FX Rates:</span>
          <span className="font-mono text-slate-800">1 USD = Rp{exchangeRates.USD.toLocaleString()}</span>
          <span>•</span>
          <span className="font-mono text-slate-800">1 EUR = Rp{exchangeRates.EUR.toLocaleString()}</span>
        </div>
      </div>

      {/* Financial Scorecard Grid (10 Core Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. Gross Export Sales */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Gross Export Sales
          </span>
          <div className="text-lg font-extrabold font-mono text-navy-950 mt-1">
            {formatCurrency(
              convertCurrency(totalExportSalesIDR, 'IDR', currency, exchangeRates),
              currency,
              { compact: true }
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Contract PO value</span>
        </div>

        {/* 2. Recognized Revenue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
            Recognized Revenue
          </span>
          <div className="text-lg font-extrabold font-mono text-navy-950 mt-1">
            {formatCurrency(
              convertCurrency(recognizedRevenueIDR, 'IDR', currency, exchangeRates),
              currency,
              { compact: true }
            )}
          </div>
          <span className="text-[10px] text-emerald-700 mt-1 block">Onboard B/L Issued</span>
        </div>

        {/* 3. Collected Cash */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
            Collected Cash
          </span>
          <div className="text-lg font-extrabold font-mono text-blue-900 mt-1">
            {formatCurrency(
              convertCurrency(collectedCashIDR, 'IDR', currency, exchangeRates),
              currency,
              { compact: true }
            )}
          </div>
          <span className="text-[10px] text-blue-600 mt-1 block">Bank settlement confirmed</span>
        </div>

        {/* 4. Accounts Receivable */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
            Accounts Receivable (AR)
          </span>
          <div className="text-lg font-extrabold font-mono text-amber-800 mt-1">
            {formatCurrency(
              convertCurrency(accountsReceivableIDR, 'IDR', currency, exchangeRates),
              currency,
              { compact: true }
            )}
          </div>
          <span className="text-[10px] text-amber-600 mt-1 block">Buyer balance pending</span>
        </div>

        {/* 5. Supplier Payables */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Supplier Payables (AP)
          </span>
          <div className="text-lg font-extrabold font-mono text-slate-800 mt-1">
            {formatCurrency(
              convertCurrency(supplierPayablesIDR, 'IDR', currency, exchangeRates),
              currency,
              { compact: true }
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Pending factory payment</span>
        </div>

        {/* 6. COGS */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Cost of Goods Sold
          </span>
          <div className="text-lg font-extrabold font-mono text-slate-800 mt-1">
            {formatCurrency(
              convertCurrency(cogsIDR, 'IDR', currency, exchangeRates),
              currency,
              { compact: true }
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Charcoal + Packing + Freight</span>
        </div>

        {/* 7. Operating Expenses */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Operating Expenses (OPEX)
          </span>
          <div className="text-lg font-extrabold font-mono text-slate-800 mt-1">
            {formatCurrency(
              convertCurrency(opexIDR, 'IDR', currency, exchangeRates),
              currency,
              { compact: true }
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Overhead & testing fees</span>
        </div>

        {/* 8. Gross Profit */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            Est. Gross Profit
          </span>
          <div className="text-lg font-extrabold font-mono text-emerald-700 mt-1">
            {formatCurrency(
              convertCurrency(grossProfitIDR, 'IDR', currency, exchangeRates),
              currency,
              { compact: true }
            )}
          </div>
          <span className="text-[10px] text-emerald-700 mt-1 block">Revenue minus COGS</span>
        </div>

        {/* 9. Net Cash Flow */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card">
          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
            Net Cash Flow
          </span>
          <div className="text-lg font-extrabold font-mono text-purple-900 mt-1">
            {formatCurrency(
              convertCurrency(netCashFlowIDR, 'IDR', currency, exchangeRates),
              currency,
              { compact: true }
            )}
          </div>
          <span className="text-[10px] text-purple-600 mt-1 block">Cash in minus cash out</span>
        </div>

        {/* 10. Cash Balance Indicator */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card">
          <span className="text-[10px] font-bold text-navy-900 uppercase tracking-wider block">
            Operating Cash Balance
          </span>
          <div className="text-lg font-extrabold font-mono text-navy-950 mt-1">
            {formatCurrency(
              convertCurrency(collectedCashIDR * 0.45, 'IDR', currency, exchangeRates),
              currency,
              { compact: true }
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">BCA & Mandiri export escrow</span>
        </div>
      </div>

      {/* Cash Flow Trends & AR Aging Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Inflow vs Outflow Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-card">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-950">
                Cash Flow Inflow vs Outflow Trends
              </h3>
              <p className="text-xs text-slate-500">
                Monthly actual cash collections vs operational and supplier disbursements
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
              Positive Liquidity
            </span>
          </div>

          <div className="h-72 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(v) =>
                    formatCurrency(convertCurrency(v, 'IDR', currency, exchangeRates), currency, {
                      compact: true,
                    })
                  }
                />
                <Tooltip
                  formatter={(val: any) => [
                    formatCurrency(
                      convertCurrency(Number(val), 'IDR', currency, exchangeRates),
                      currency
                    ),
                  ]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="inflow" name="Cash Inflow (Collected)" fill="#0B1E36" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outflow" name="Cash Outflow (Disbursed)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accounts Receivable Aging Analysis */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-navy-950">
                  Accounts Receivable (AR) Aging Analysis
                </h3>
                <p className="text-xs text-slate-500">
                  Buyer outstanding payment schedules and collection risks
                </p>
              </div>
              <span className="text-xs font-bold font-mono text-navy-950">
                Total AR: {formatCurrency(convertCurrency(accountsReceivableIDR, 'IDR', currency, exchangeRates), currency, { compact: true })}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {agingBuckets.map((bucket) => (
                <div
                  key={bucket.bucket}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-navy-950">{bucket.bucket}</span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatCurrency(
                        convertCurrency(bucket.amountIDR, 'IDR', currency, exchangeRates),
                        currency
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{bucket.pct} of total outstanding</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                        bucket.status === 'Clean'
                          ? 'bg-emerald-100 text-emerald-800'
                          : bucket.status === 'Attention'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {bucket.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900">
            <span className="font-bold">Export Credit Policy:</span> Standard terms require 30% T/T deposit prior to factory raw material cutting and 70% against Non-Negotiable Bill of Lading copy.
          </div>
        </div>
      </div>
    </div>
  );
};
