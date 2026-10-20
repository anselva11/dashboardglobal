import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedPage, StaggerList, FadeUp, AnimatedCard, staggerContainer, fadeUpItem } from '../components/motion';
import {
  TrendingUp,
  Target,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  Ship,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Sliders,
  ExternalLink,
  Flame,
  PlusCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import {
  formatCurrency,
  convertCurrency,
  calculateAchievementPercentage,
} from '../lib/calculations';

interface DashboardOverviewProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigateTab }) => {
  const {
    currency,
    exchangeRates,
    salesTarget,
    updateSalesTarget,
    exportOrders,
    buyers,
    opportunities,
    quotations,
    currentUser,
  } = useApp();

  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [customTargetInput, setCustomTargetInput] = useState(
    salesTarget.monthly_revenue_target_idr.toString()
  );

  // Dynamic calculations from underlying orders and pipeline records
  const totalExportSalesIDR = exportOrders.reduce(
    (sum, ord) => sum + (ord.total_contract_value_idr || 0),
    0
  );
  const recognizedRevenueIDR = exportOrders.reduce(
    (sum, ord) => sum + (ord.recognized_revenue_idr || 0),
    0
  );
  const collectedCashIDR = exportOrders.reduce(
    (sum, ord) => sum + (ord.collected_cash_idr || 0),
    0
  );
  const totalCogsIDR = exportOrders.reduce(
    (sum, ord) => sum + (ord.cogs_idr || 0),
    0
  );
  const estimatedGrossProfitIDR = recognizedRevenueIDR - totalCogsIDR;

  const targetMonthlyIDR = salesTarget.monthly_revenue_target_idr;
  const achievementPct = calculateAchievementPercentage(
    recognizedRevenueIDR,
    targetMonthlyIDR
  );

  const activeBuyersCount = buyers.filter((b) => !b.is_archived).length;
  const qualifiedLeadsCount = opportunities.filter(
    (o) =>
      o.stage === 'qualified_buyer' ||
      o.stage === 'rfq_received' ||
      o.stage === 'quotation_sent' ||
      o.stage === 'negotiation'
  ).length;

  const openQuotes = quotations.filter(
    (q) => q.status === 'sent' || q.status === 'negotiating'
  );
  const openQuotesCount = openQuotes.length;
  const openQuotesValueUSD = openQuotes.reduce(
    (sum, q) => sum + q.total_quote_value,
    0
  );
  const openQuotesValueIDR = openQuotesValueUSD * exchangeRates.USD;

  const activeExportOrders = exportOrders.filter(
    (o) => o.shipment_status !== 'delivered'
  );
  const activeExportOrdersCount = activeExportOrders.length;

  // Chart data: Monthly actual vs target
  const monthlyPerformanceData = [
    { month: 'Jul 2026', target: targetMonthlyIDR, actual: 110000000, previous: 95000000 },
    { month: 'Aug 2026', target: targetMonthlyIDR, actual: 135000000, previous: 105000000 },
    { month: 'Sep 2026', target: targetMonthlyIDR, actual: 148000000, previous: 120000000 },
    { month: 'Oct 2026 (MTD)', target: targetMonthlyIDR, actual: recognizedRevenueIDR, previous: 130000000 },
  ];

  const handleSaveTarget = () => {
    const val = Number(customTargetInput);
    if (!isNaN(val) && val > 0) {
      updateSalesTarget({ monthly_revenue_target_idr: val });
      setIsEditingTarget(false);
    }
  };

  return (
    <AnimatedPage>
    <StaggerList className="space-y-6">
      {/* Accounting Clarity Callout Banner */}
      <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-4 shadow-subtle">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-700 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-navy-950">
                Accounting & Revenue Recognition Framework
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                In export logistics, <span className="font-semibold text-navy-900">Gross Export Contract Value</span> is distinct from{' '}
                <span className="font-semibold text-emerald-800">Recognized Revenue</span> (recognized upon Onboard Bill of Lading issue),{' '}
                <span className="font-semibold text-blue-800">Collected Cash</span> (settled deposits/wires), and{' '}
                <span className="font-semibold text-indigo-800">Gross Profit</span> (Revenue minus COGS).
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-medium self-end lg:self-center">
            <span className="px-2.5 py-1 bg-white rounded-lg border border-blue-200 text-blue-900 shadow-xs">
              Base Target: {formatCurrency(targetMonthlyIDR, currency, { compact: true })}
            </span>
            {(currentUser.role === 'ceo' || currentUser.role === 'admin') ? (
              <button
                onClick={() => setIsEditingTarget(!isEditingTarget)}
                className="flex items-center space-x-1 px-3 py-1 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors shadow-xs"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Adjust Target</span>
              </button>
            ) : (
              <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300 text-[10px]">
                Dewan Komisaris Audit View
              </span>
            )}
          </div>
        </div>

        {/* CEO Target Editor Drawer */}
        {isEditingTarget && (
          <div className="mt-4 pt-4 border-t border-blue-200 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3.5 rounded-lg border border-blue-200">
              <div className="space-y-1">
                <span className="text-xs font-bold text-navy-950">
                  Configure Monthly Gross Revenue Target
                </span>
                <p className="text-[11px] text-slate-500">
                  Select preset between Rp100,000,000 – Rp250,000,000 or enter custom amount.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[100000000, 150000000, 180000000, 200000000, 250000000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        setCustomTargetInput(preset.toString());
                        updateSalesTarget({ monthly_revenue_target_idr: preset });
                      }}
                      className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                        salesTarget.monthly_revenue_target_idr === preset
                          ? 'bg-navy-900 text-white font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Rp{(preset / 1000000).toFixed(0)}M
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={customTargetInput}
                    onChange={(e) => setCustomTargetInput(e.target.value)}
                    className="w-36 pl-8 pr-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg outline-none focus:border-navy-700"
                  />
                </div>
                <button
                  onClick={handleSaveTarget}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingTarget(false)}
                  className="px-2.5 py-1.5 text-slate-600 rounded-lg text-xs hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Export Sales */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="group relative bg-white p-4 rounded-xl border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-navy-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              1. Total Export Sales
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-100 transition-colors">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-extrabold text-navy-950 font-mono tracking-tight">
              {formatCurrency(
                convertCurrency(totalExportSalesIDR, 'IDR', currency, exchangeRates),
                currency
              )}
            </div>
            <div className="mt-1 flex items-center space-x-1.5 text-xs">
              <span className="flex items-center text-emerald-600 font-semibold">
                <ArrowUpRight className="h-3.5 w-3.5" /> +18.4%
              </span>
              <span className="text-slate-500">vs prev period</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
              Gross contract value of all confirmed POs
            </p>
          </div>
        </div>

        {/* KPI 2: Monthly Revenue Target */}
        <div
          onClick={() => currentUser.role === 'ceo' && setIsEditingTarget(true)}
          className="group relative bg-white p-4 rounded-xl border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-navy-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              2. Monthly Target
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100 transition-colors">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-extrabold text-navy-950 font-mono tracking-tight">
              {formatCurrency(
                convertCurrency(targetMonthlyIDR, 'IDR', currency, exchangeRates),
                currency
              )}
            </div>
            <div className="mt-1 flex items-center space-x-1 text-xs text-slate-500">
              <span>Configurable CEO Baseline</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
              Default: Rp150M (Click to customize)
            </p>
          </div>
        </div>

        {/* KPI 3: Revenue Achievement Percentage */}
        <div
          onClick={() => onNavigateTab('scorecard')}
          className="group relative bg-white p-4 rounded-xl border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-navy-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              3. Target Achievement
            </span>
            <div
              className={`p-2 rounded-lg transition-colors ${
                achievementPct >= 100
                  ? 'bg-emerald-50 text-emerald-700'
                  : achievementPct >= 75
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-extrabold text-navy-950 font-mono tracking-tight">
              {achievementPct.toFixed(1)}%
            </div>
            {/* Progress bar */}
            <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  achievementPct >= 100 ? 'bg-emerald-600' : 'bg-navy-900'
                }`}
                style={{ width: `${Math.min(100, achievementPct)}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
              Recognized: {formatCurrency(convertCurrency(recognizedRevenueIDR, 'IDR', currency, exchangeRates), currency, { compact: true })}
            </p>
          </div>
        </div>

        {/* KPI 4: Active Buyers */}
        <div
          onClick={() => onNavigateTab('crm')}
          className="group relative bg-white p-4 rounded-xl border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-navy-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              4. Active Buyers
            </span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700 group-hover:bg-teal-100 transition-colors">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-extrabold text-navy-950 font-mono tracking-tight">
              {activeBuyersCount}
            </div>
            <div className="mt-1 flex items-center space-x-1.5 text-xs text-slate-500">
              <span className="text-emerald-600 font-semibold flex items-center">
                <ArrowUpRight className="h-3.5 w-3.5" /> +2 New
              </span>
              <span>across 6 nations</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
              Middle East, Europe, USA, Asia
            </p>
          </div>
        </div>

        {/* KPI 5: Qualified Leads */}
        <div
          onClick={() => onNavigateTab('pipeline')}
          className="group relative bg-white p-4 rounded-xl border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-navy-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              5. Qualified Leads
            </span>
            <div className="p-2 rounded-lg bg-cyan-50 text-cyan-700 group-hover:bg-cyan-100 transition-colors">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-extrabold text-navy-950 font-mono tracking-tight">
              {qualifiedLeadsCount}
            </div>
            <div className="mt-1 flex items-center space-x-1.5 text-xs text-slate-500">
              <span className="text-emerald-600 font-semibold">4 in negotiation</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
              High purchase volume probability
            </p>
          </div>
        </div>

        {/* KPI 6: Open Quotations */}
        <div
          onClick={() => onNavigateTab('products')}
          className="group relative bg-white p-4 rounded-xl border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-navy-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              6. Open Quotations
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-100 transition-colors">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-extrabold text-navy-950 font-mono tracking-tight">
              {openQuotesCount}{' '}
              <span className="text-xs font-normal text-slate-500">
                (
                {formatCurrency(
                  convertCurrency(openQuotesValueIDR, 'IDR', currency, exchangeRates),
                  currency,
                  { compact: true }
                )}
                )
              </span>
            </div>
            <div className="mt-1 flex items-center space-x-1 text-xs text-amber-700 font-medium">
              <span>CIF Jeddah & CFR Jebel Ali</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
              Active commercial export offers
            </p>
          </div>
        </div>

        {/* KPI 7: Active Export Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="group relative bg-white p-4 rounded-xl border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-navy-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              7. Active Export Orders
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 transition-colors">
              <Ship className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-extrabold text-navy-950 font-mono tracking-tight">
              {activeExportOrdersCount}
            </div>
            <div className="mt-1 flex items-center space-x-1.5 text-xs text-slate-500">
              <span className="text-emerald-700 font-semibold">1 In Transit • 2 Loading</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
              Tanjung Priok, Tanjung Perak, Belawan
            </p>
          </div>
        </div>

        {/* KPI 8: Estimated Gross Profit */}
        <div
          onClick={() => onNavigateTab('financials')}
          className="group relative bg-white p-4 rounded-xl border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-navy-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              8. Est. Gross Profit
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700 group-hover:bg-purple-100 transition-colors">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-extrabold text-emerald-700 font-mono tracking-tight">
              {formatCurrency(
                convertCurrency(estimatedGrossProfitIDR, 'IDR', currency, exchangeRates),
                currency,
                { compact: true }
              )}
            </div>
            <div className="mt-1 flex items-center space-x-1 text-xs text-slate-600">
              <span className="font-semibold text-emerald-600">22.8%</span>
              <span>avg gross margin</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
              Revenue minus COGS realized
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts & Progress Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Performance Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200/90 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-sm font-bold text-navy-950 flex items-center space-x-2">
                <span>Revenue Performance vs Target</span>
                <span className="text-xs font-normal text-slate-500">(2026 MTD)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Recognized export revenue compared with monthly executive target
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs font-semibold text-navy-800 hover:text-navy-950 flex items-center space-x-1"
            >
              <span>Detailed Analytics</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-72 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyPerformanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B1E36" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0B1E36" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(val) =>
                    formatCurrency(
                      convertCurrency(val, 'IDR', currency, exchangeRates),
                      currency,
                      { compact: true }
                    )
                  }
                />
                <Tooltip
                  formatter={(value: any) => [
                    formatCurrency(
                      convertCurrency(Number(value), 'IDR', currency, exchangeRates),
                      currency
                    ),
                  ]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="actual"
                  name="Recognized Revenue"
                  stroke="#0B1E36"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorActual)"
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  name="Monthly Target (Rp150M)"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorTarget)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Export Orders Snapshot (1 col) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-navy-950 flex items-center space-x-2">
                <Ship className="h-4 w-4 text-navy-900" />
                <span>Live Export Shipments</span>
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {activeExportOrders.length} In Progress
              </span>
            </div>

            <div className="mt-3 space-y-3">
              {exportOrders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  onClick={() => onNavigateTab('orders')}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-900 font-mono">
                      {order.order_number}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded uppercase font-semibold bg-white border border-slate-200 text-slate-700">
                      {order.incoterms} • {order.container_count}x{order.container_type}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 mt-1 truncate">
                    {order.buyer_name}
                  </p>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                    <span>
                      {order.loading_port.split(',')[0]} → {order.destination_port.split(',')[0]}
                    </span>
                    <span className="font-mono font-semibold text-navy-900">
                      {formatCurrency(
                        convertCurrency(order.total_contract_value_idr, 'IDR', currency, exchangeRates),
                        currency,
                        { compact: true }
                      )}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-medium text-slate-600 capitalize">
                      {order.shipment_status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('orders')}
            className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-navy-950 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1"
          >
            <span>View All Export Orders & Documentation</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Hero Commodity Highlight & Quick Action Hub */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white rounded-xl p-5 shadow-card border border-navy-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
              <Flame className="h-3.5 w-3.5" />
              <span>Core Commodity: Coconut Shell Charcoal Briquettes</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Shisha & BBQ Charcoal Export Operations
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Premium platinum grade cubes (25x25x25mm) with Sucofindo SHTC self-heating test compliance, low ash (&lt;2.2%), and 7,500+ kcal/kg calorific value ready for shipment from Tanjung Priok and Tanjung Perak.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab('products')}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Calculate Export Pricing (FOB/CIF)</span>
            </button>
            <button
              onClick={() => onNavigateTab('crm')}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1.5 border border-white/20"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Register New Buyer</span>
            </button>
          </div>
        </div>
      </div>
    </StaggerList>
    </AnimatedPage>
  );
};
