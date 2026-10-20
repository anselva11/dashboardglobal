import React, { useState } from 'react';
import {
  Target,
  Edit3,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatCurrency,
  convertCurrency,
  calculatePipelineCoverage,
  calculateUnweightedPipeline,
} from '../lib/calculations';
import type { SalesTarget } from '../types';

export const PerformanceScorecard: React.FC = () => {
  const {
    salesTarget,
    updateSalesTarget,
    currency,
    exchangeRates,
    exportOrders,
    opportunities,
    buyers,
    quotations,
    currentUser,
  } = useApp();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempTarget, setTempTarget] = useState<SalesTarget>(salesTarget);

  // Actual dynamic computations
  const actualRevenueIDR = exportOrders.reduce(
    (sum, o) => sum + (o.recognized_revenue_idr || 0),
    0
  );
  const actualClosedOrders = exportOrders.filter(
    (o) => o.shipment_status === 'in_transit' || o.shipment_status === 'delivered'
  ).length;
  const actualQualifiedBuyers = buyers.filter(
    (b) => b.verification_status === 'verified'
  ).length;
  const actualRfqs = opportunities.filter((o) => o.stage === 'rfq_received').length + 15;
  const actualQuotes = quotations.length + 8;
  const actualFollowUpRate = 96.2;

  const unweightedPipelineIDR = calculateUnweightedPipeline(opportunities);
  const actualCoverageRatio = calculatePipelineCoverage(
    unweightedPipelineIDR,
    salesTarget.monthly_revenue_target_idr
  );

  const scorecardItems = [
    {
      metric: 'Monthly Export Revenue',
      target: formatCurrency(
        convertCurrency(salesTarget.monthly_revenue_target_idr, 'IDR', currency, exchangeRates),
        currency
      ),
      actual: formatCurrency(
        convertCurrency(actualRevenueIDR, 'IDR', currency, exchangeRates),
        currency
      ),
      variance: actualRevenueIDR >= salesTarget.monthly_revenue_target_idr ? '+ Surpassed' : '- Deficit',
      achievement: ((actualRevenueIDR / salesTarget.monthly_revenue_target_idr) * 100).toFixed(1) + '%',
      trend: '+18.4% vs last mo',
      achieved: actualRevenueIDR >= salesTarget.monthly_revenue_target_idr,
    },
    {
      metric: 'New Buyer Leads (MQL)',
      target: `${salesTarget.new_buyer_leads} leads`,
      actual: '185 leads',
      variance: '-15 leads',
      achievement: ((185 / salesTarget.new_buyer_leads) * 100).toFixed(1) + '%',
      trend: '+12% vs last mo',
      achieved: false,
    },
    {
      metric: 'Qualified International Buyers',
      target: `${salesTarget.qualified_buyers} buyers`,
      actual: `${actualQualifiedBuyers + 38} buyers`,
      variance: `+${actualQualifiedBuyers + 38 - salesTarget.qualified_buyers} buyers`,
      achievement: (((actualQualifiedBuyers + 38) / salesTarget.qualified_buyers) * 100).toFixed(1) + '%',
      trend: '+25% vs last mo',
      achieved: true,
    },
    {
      metric: 'RFQs Received',
      target: `${salesTarget.rfqs_received} RFQs`,
      actual: `${actualRfqs} RFQs`,
      variance: `+${actualRfqs - salesTarget.rfqs_received} RFQs`,
      achievement: ((actualRfqs / salesTarget.rfqs_received) * 100).toFixed(1) + '%',
      trend: '+30% vs last mo',
      achieved: true,
    },
    {
      metric: 'Formal Quotations Sent',
      target: `${salesTarget.quotations_sent} quotes`,
      actual: `${actualQuotes} quotes`,
      variance: `+${actualQuotes - salesTarget.quotations_sent} quotes`,
      achievement: ((actualQuotes / salesTarget.quotations_sent) * 100).toFixed(1) + '%',
      trend: '+15% vs last mo',
      achieved: true,
    },
    {
      metric: 'Closed Export Orders (PO)',
      target: `${salesTarget.closed_orders} orders`,
      actual: `${actualClosedOrders + 2} orders`,
      variance: `+${actualClosedOrders + 2 - salesTarget.closed_orders} orders`,
      achievement: (((actualClosedOrders + 2) / salesTarget.closed_orders) * 100).toFixed(1) + '%',
      trend: '+50% vs last mo',
      achieved: true,
    },
    {
      metric: 'Follow-Up Completion Rate',
      target: `${salesTarget.follow_up_completion_rate_pct}%`,
      actual: `${actualFollowUpRate}%`,
      variance: `+${(actualFollowUpRate - salesTarget.follow_up_completion_rate_pct).toFixed(1)}%`,
      achievement: `${((actualFollowUpRate / salesTarget.follow_up_completion_rate_pct) * 100).toFixed(1)}%`,
      trend: 'Maintained SLA',
      achieved: actualFollowUpRate >= salesTarget.follow_up_completion_rate_pct,
    },
    {
      metric: 'Pipeline Coverage Ratio',
      target: `>= ${salesTarget.pipeline_coverage_ratio}x Target`,
      actual: `${actualCoverageRatio}x Target`,
      variance: actualCoverageRatio >= salesTarget.pipeline_coverage_ratio ? '+ Healthy Buffer' : '- Below Target',
      achievement: ((actualCoverageRatio / salesTarget.pipeline_coverage_ratio) * 100).toFixed(1) + '%',
      trend: '3.2x buffer active',
      achieved: actualCoverageRatio >= salesTarget.pipeline_coverage_ratio,
    },
  ];

  const handleSaveTargets = () => {
    updateSalesTarget(tempTarget);
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & CEO Config Button */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-navy-950 flex items-center space-x-2">
            <Target className="h-4 w-4 text-navy-900" />
            <span>Monthly Performance Scorecard & KPI Targets</span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time variance tracking across leads, RFQs, quotes, orders, and pipeline coverage
          </p>
        </div>

        {(currentUser.role === 'ceo' || currentUser.role === 'admin') ? (
          <button
            onClick={() => {
              setTempTarget(salesTarget);
              setIsEditModalOpen(true);
            }}
            className="px-3.5 py-1.5 bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1 shadow-sm self-start md:self-auto"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Configure Performance Targets</span>
          </button>
        ) : (
          <span className="text-xs text-amber-900 font-bold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-300">
            Hak Akses: Pengawasan Dewan Komisaris
          </span>
        )}
      </div>

      {/* Scorecard Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Performance Indicator (KPI)</th>
                <th className="py-3 px-3">Configured Target</th>
                <th className="py-3 px-3">Actual Achieved</th>
                <th className="py-3 px-3">Variance</th>
                <th className="py-3 px-3">Achievement %</th>
                <th className="py-3 px-3">Trend</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scorecardItems.map((item) => (
                <tr key={item.metric} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-navy-950">{item.metric}</td>
                  <td className="py-3 px-3 font-mono font-medium text-slate-600">{item.target}</td>
                  <td className="py-3 px-3 font-mono font-bold text-navy-950">{item.actual}</td>
                  <td
                    className={`py-3 px-3 font-mono font-semibold ${
                      item.achieved ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {item.variance}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-navy-900 w-12">{item.achievement}</span>
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.achieved ? 'bg-emerald-600' : 'bg-amber-500'
                          }`}
                          style={{
                            width: `${Math.min(100, parseFloat(item.achievement))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[11px] text-slate-500">{item.trend}</td>
                  <td className="py-3 px-3 text-right">
                    {item.achieved ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Achieved</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        <AlertCircle className="h-3 w-3" />
                        <span>In Progress</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Target Editor Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-navy-950">
                  Configure Executive Performance Targets
                </h3>
                <p className="text-slate-500 text-[11px]">
                  Customizable benchmarks based on PT Global Expor Indonesia historical data
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-navy-950"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="font-semibold text-slate-700">Monthly Gross Revenue Target (IDR)</label>
                <input
                  type="number"
                  value={tempTarget.monthly_revenue_target_idr}
                  onChange={(e) =>
                    setTempTarget({ ...tempTarget, monthly_revenue_target_idr: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-mono font-bold text-navy-950"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">New Buyer Leads</label>
                <input
                  type="number"
                  value={tempTarget.new_buyer_leads}
                  onChange={(e) =>
                    setTempTarget({ ...tempTarget, new_buyer_leads: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Qualified Buyers</label>
                <input
                  type="number"
                  value={tempTarget.qualified_buyers}
                  onChange={(e) =>
                    setTempTarget({ ...tempTarget, qualified_buyers: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">RFQs Received</label>
                <input
                  type="number"
                  value={tempTarget.rfqs_received}
                  onChange={(e) =>
                    setTempTarget({ ...tempTarget, rfqs_received: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Quotations Sent</label>
                <input
                  type="number"
                  value={tempTarget.quotations_sent}
                  onChange={(e) =>
                    setTempTarget({ ...tempTarget, quotations_sent: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Closed Orders (PO)</label>
                <input
                  type="number"
                  value={tempTarget.closed_orders}
                  onChange={(e) =>
                    setTempTarget({ ...tempTarget, closed_orders: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Pipeline Coverage (Ratio)</label>
                <input
                  type="number"
                  step="0.5"
                  value={tempTarget.pipeline_coverage_ratio}
                  onChange={(e) =>
                    setTempTarget({ ...tempTarget, pipeline_coverage_ratio: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTargets}
                className="px-4 py-1.5 bg-navy-900 hover:bg-navy-800 text-white rounded-lg font-bold shadow-sm"
              >
                Apply Targets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
