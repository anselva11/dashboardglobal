import React, { useState } from 'react';
import {
  TrendingUp,
  Flame,
  Layers,
  Sliders,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useApp } from '../context/AppContext';
import {
  formatCurrency,
  convertCurrency,
  calculateWeightedPipeline,
  calculateUnweightedPipeline,
} from '../lib/calculations';

export const SalesAnalytics: React.FC = () => {
  const {
    currency,
    exchangeRates,
    salesTarget,
    opportunities,
    exportOrders,
    updateOpportunityProbability,
  } = useApp();

  const [timeView, setTimeView] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('monthly');

  // Revenue actual vs target datasets for views
  const trendData = {
    daily: [
      { period: '10 Oct', actual: 45000000, target: 50000000, previous: 38000000 },
      { period: '12 Oct', actual: 60000000, target: 50000000, previous: 42000000 },
      { period: '14 Oct', actual: 35000000, target: 50000000, previous: 55000000 },
      { period: '16 Oct', actual: 75000000, target: 50000000, previous: 48000000 },
      { period: '18 Oct', actual: 95000000, target: 50000000, previous: 62000000 },
      { period: '20 Oct', actual: 80000000, target: 50000000, previous: 70000000 },
    ],
    weekly: [
      { period: 'W38 (Sep)', actual: 120000000, target: 110000000, previous: 90000000 },
      { period: 'W39 (Sep)', actual: 140000000, target: 120000000, previous: 105000000 },
      { period: 'W40 (Oct)', actual: 135000000, target: 125000000, previous: 115000000 },
      { period: 'W41 (Oct)', actual: 155000000, target: 130000000, previous: 120000000 },
      { period: 'W42 (Oct)', actual: 168000000, target: 140000000, previous: 135000000 },
    ],
    monthly: [
      { period: 'Jul 2026', actual: 110000000, target: salesTarget.monthly_revenue_target_idr, previous: 95000000 },
      { period: 'Aug 2026', actual: 135000000, target: salesTarget.monthly_revenue_target_idr, previous: 105000000 },
      { period: 'Sep 2026', actual: 148000000, target: salesTarget.monthly_revenue_target_idr, previous: 120000000 },
      { period: 'Oct 2026 (MTD)', actual: 165000000, target: salesTarget.monthly_revenue_target_idr, previous: 130000000 },
    ],
    quarterly: [
      { period: 'Q4 2025', actual: 340000000, target: 360000000, previous: 280000000 },
      { period: 'Q1 2026', actual: 390000000, target: 400000000, previous: 310000000 },
      { period: 'Q2 2026', actual: 440000000, target: 450000000, previous: 350000000 },
      { period: 'Q3 2026', actual: 495000000, target: 450000000, previous: 390000000 },
    ],
  };

  // Funnel calculations across all 8 stages
  const funnelStages = [
    { name: '1. New Leads', count: 185, dropOff: '—' },
    { name: '2. Contacted', count: 92, dropOff: '49.7%' },
    { name: '3. Qualified Buyers', count: 44, dropOff: '47.8%' },
    { name: '4. RFQ Received', count: 22, dropOff: '50.0%' },
    { name: '5. Quotation Sent', count: 14, dropOff: '63.6%' },
    { name: '6. Negotiation', count: 8, dropOff: '57.1%' },
    { name: '7. PO / Closed Won', count: 5, dropOff: '62.5%' },
    { name: '8. Closed Lost', count: 3, dropOff: '—' },
  ];

  // Product performance breakdown
  const productPerformance = [
    {
      name: 'Coconut Shell Charcoal Briquettes',
      isPrimary: true,
      category: 'Hero Commodity',
      salesValueIDR: 2565225000,
      orderCount: 5,
      grossProfitIDR: 677225000,
      avgOrderValueIDR: 513045000,
      contributionPct: 53.3,
      color: '#0B1E36',
    },
    {
      name: 'Sumatra Gayo Specialty Coffee',
      isPrimary: false,
      category: 'Specialty Beans',
      salesValueIDR: 2246400000,
      orderCount: 1,
      grossProfitIDR: 396400000,
      avgOrderValueIDR: 2246400000,
      contributionPct: 46.7,
      color: '#C59B27',
    },
    {
      name: 'Virgin Coconut Oil (VCO)',
      isPrimary: false,
      category: 'Coconut Derivatives',
      salesValueIDR: 0,
      orderCount: 0,
      grossProfitIDR: 0,
      avgOrderValueIDR: 0,
      contributionPct: 0.0,
      color: '#10B981',
    },
    {
      name: 'Indonesian Cassia Vera Cinnamon',
      isPrimary: false,
      category: 'Spices',
      salesValueIDR: 0,
      orderCount: 0,
      grossProfitIDR: 0,
      avgOrderValueIDR: 0,
      contributionPct: 0.0,
      color: '#F59E0B',
    },
    {
      name: 'North Maluku Nutmeg ABCD',
      isPrimary: false,
      category: 'Spices',
      salesValueIDR: 0,
      orderCount: 0,
      grossProfitIDR: 0,
      avgOrderValueIDR: 0,
      contributionPct: 0.0,
      color: '#8B5CF6',
    },
  ];

  // Forecast Pipeline
  const actualSalesIDR = exportOrders.reduce(
    (sum, o) => sum + (o.recognized_revenue_idr || 0),
    0
  );
  const unweightedPipelineIDR = calculateUnweightedPipeline(opportunities);
  const weightedPipelineIDR = calculateWeightedPipeline(opportunities);
  const forecastedSalesTotalIDR = actualSalesIDR + weightedPipelineIDR;

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-card">
        <div>
          <h2 className="text-base font-bold text-navy-950">
            Export Sales Performance & Revenue Intelligence
          </h2>
          <p className="text-xs text-slate-500">
            Multi-period actual vs target, stage-to-stage conversion funnel, and commodity analytics
          </p>
        </div>

        {/* Time Resolution Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs self-start sm:self-auto">
          {(['daily', 'weekly', 'monthly', 'quarterly'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setTimeView(view)}
              className={`px-3 py-1.5 rounded-md capitalize font-semibold transition-all ${
                timeView === view
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-navy-950 flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-navy-800" />
              <span className="capitalize">{timeView} Revenue Trends</span>
            </h3>
            <p className="text-xs text-slate-500">
              Comparing recognized sales vs executive revenue target vs previous period
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1">
              <span className="h-3 w-3 rounded-sm bg-navy-900 inline-block" />
              <span className="text-slate-600 font-medium">Actual Sales</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="h-3 w-3 rounded-sm bg-emerald-500 inline-block" />
              <span className="text-slate-600 font-medium">Target</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="h-3 w-3 rounded-sm bg-slate-300 inline-block" />
              <span className="text-slate-600 font-medium">Previous Period</span>
            </span>
          </div>
        </div>

        <div className="h-80 mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData[timeView]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748B' }} />
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
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              />
              <Bar dataKey="previous" name="Previous Period" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Actual Sales" fill="#0B1E36" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" name="Target" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Funnel & Product Contribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* International Sales Funnel */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-card">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-navy-950 flex items-center space-x-2">
              <Layers className="h-4 w-4 text-navy-800" />
              <span>International Sales Funnel (8 Stages)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Stage-by-stage progression from inbound lead to PO Closed Won
            </p>
          </div>

          <div className="mt-4 space-y-2.5">
            {funnelStages.map((stg, idx) => {
              const maxLeads = 185;
              const widthPct = Math.max(12, (stg.count / maxLeads) * 100);
              const isClosedWon = stg.name.includes('Closed Won');
              const isClosedLost = stg.name.includes('Closed Lost');

              return (
                <div key={stg.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-navy-950">{stg.name}</span>
                    <div className="flex items-center space-x-2 text-slate-500">
                      <span className="font-mono text-navy-900">{stg.count} deals</span>
                      {stg.dropOff !== '—' && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                          {stg.dropOff} conv
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-5 w-full bg-slate-100 rounded-md overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded transition-all duration-500 flex items-center px-2 text-[10px] font-bold text-white ${
                        isClosedWon
                          ? 'bg-emerald-600'
                          : isClosedLost
                          ? 'bg-red-500'
                          : 'bg-gradient-to-r from-navy-900 to-navy-700'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    >
                      {stg.count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Product Performance Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-navy-950 flex items-center space-x-2">
                <Flame className="h-4 w-4 text-amber-500" />
                <span>Product Performance & Profitability</span>
              </h3>
              <p className="text-xs text-slate-500">
                Coconut shell charcoal briquettes as default primary export commodity
              </p>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-2">Orders</th>
                    <th className="py-2.5 px-2 text-right">Sales Value</th>
                    <th className="py-2.5 px-2 text-right">Est. Gross Profit</th>
                    <th className="py-2.5 px-3 text-right">Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productPerformance.map((prd) => (
                    <tr
                      key={prd.name}
                      className={`hover:bg-slate-50 transition-colors ${
                        prd.isPrimary ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-medium text-navy-950">
                        <div className="flex items-center space-x-1.5">
                          {prd.isPrimary && (
                            <span className="p-0.5 rounded bg-amber-400 text-navy-950" title="Primary Hero Commodity">
                              <Flame className="h-3 w-3" />
                            </span>
                          )}
                          <span className="truncate max-w-[150px] font-semibold">{prd.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">{prd.category}</span>
                      </td>
                      <td className="py-2.5 px-2 font-mono">{prd.orderCount}</td>
                      <td className="py-2.5 px-2 text-right font-mono font-semibold text-navy-950">
                        {formatCurrency(
                          convertCurrency(prd.salesValueIDR, 'IDR', currency, exchangeRates),
                          currency,
                          { compact: true }
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-semibold text-emerald-700">
                        {formatCurrency(
                          convertCurrency(prd.grossProfitIDR, 'IDR', currency, exchangeRates),
                          currency,
                          { compact: true }
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-semibold text-slate-800">
                          {prd.contributionPct.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Primary Commodity Capacity:</span>
            <span className="font-bold text-navy-950">180 MT/month • SHTC Sucofindo Certified</span>
          </div>
        </div>
      </div>

      {/* Sales Forecast & Weighted Pipeline Section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-navy-950 flex items-center space-x-2">
              <Sliders className="h-4 w-4 text-navy-800" />
              <span>Sales Forecast & Weighted Opportunity Pipeline</span>
            </h3>
            <p className="text-xs text-slate-500">
              Formula: Weighted Pipeline = Estimated Deal Value × Probability of Closing.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200">
            Editable Probability Model
          </span>
        </div>

        {/* 4 Forecast KPI Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Actual Recognized Sales
            </span>
            <div className="text-lg font-bold font-mono text-navy-950 mt-1">
              {formatCurrency(
                convertCurrency(actualSalesIDR, 'IDR', currency, exchangeRates),
                currency
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Delivered & transit orders</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Unweighted Pipeline
            </span>
            <div className="text-lg font-bold font-mono text-blue-900 mt-1">
              {formatCurrency(
                convertCurrency(unweightedPipelineIDR, 'IDR', currency, exchangeRates),
                currency
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Sum of all open opportunities</p>
          </div>

          <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200">
            <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider">
              Weighted Pipeline
            </span>
            <div className="text-lg font-bold font-mono text-navy-950 mt-1">
              {formatCurrency(
                convertCurrency(weightedPipelineIDR, 'IDR', currency, exchangeRates),
                currency
              )}
            </div>
            <p className="text-[10px] text-blue-700 mt-0.5">Probability-discounted value</p>
          </div>

          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
              Forecasted Total Sales
            </span>
            <div className="text-lg font-bold font-mono text-emerald-800 mt-1">
              {formatCurrency(
                convertCurrency(forecastedSalesTotalIDR, 'IDR', currency, exchangeRates),
                currency
              )}
            </div>
            <p className="text-[10px] text-emerald-700 mt-0.5">Actual + Weighted Pipeline</p>
          </div>
        </div>

        {/* Interactive Probability Adjuster for Open Deals */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider mb-2">
            Opportunity Probability & Forecast Assumptions
          </h4>
          <div className="space-y-3">
            {opportunities
              .filter((o) => o.stage !== 'closed_won' && o.stage !== 'closed_lost')
              .map((opp) => (
                <div
                  key={opp.id}
                  className="p-3 rounded-lg border border-slate-200 bg-white hover:border-navy-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-[200px]">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-navy-950">{opp.buyer_name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-mono">
                        {opp.country_code}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] truncate">{opp.product_name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">
                      Stage: {opp.stage.replace(/_/g, ' ')} • Close: {opp.expected_close_date}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500">Unweighted Value</p>
                      <p className="font-mono font-bold text-navy-950">
                        {formatCurrency(
                          convertCurrency(opp.est_order_value_idr, 'IDR', currency, exchangeRates),
                          currency
                        )}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-600">Prob:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={opp.probability}
                        onChange={(e) =>
                          updateOpportunityProbability(opp.id, Number(e.target.value))
                        }
                        className="w-24 accent-navy-900 cursor-pointer"
                      />
                      <span className="font-mono font-bold text-navy-950 w-8 text-right">
                        {opp.probability}%
                      </span>
                    </div>

                    <div className="text-right min-w-[120px]">
                      <p className="text-[10px] text-slate-500">Weighted</p>
                      <p className="font-mono font-bold text-emerald-700">
                        {formatCurrency(
                          convertCurrency(
                            opp.est_order_value_idr * (opp.probability / 100),
                            'IDR',
                            currency,
                            exchangeRates
                          ),
                          currency
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
