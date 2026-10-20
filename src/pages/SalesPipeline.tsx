import React, { useState } from 'react';
import {
  Kanban,
  CheckCircle2,
  XCircle,
  Flame,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatCurrency,
  convertCurrency,
} from '../lib/calculations';
import type { Opportunity, PipelineStage } from '../types';

const PIPELINE_COLUMNS: { stage: PipelineStage; label: string; color: string }[] = [
  { stage: 'new_lead', label: '1. New Lead', color: 'border-slate-300 bg-slate-50' },
  { stage: 'initial_contact', label: '2. Initial Contact', color: 'border-blue-200 bg-blue-50/30' },
  { stage: 'qualified_buyer', label: '3. Qualified Buyer', color: 'border-teal-200 bg-teal-50/30' },
  { stage: 'rfq_received', label: '4. RFQ Received', color: 'border-amber-200 bg-amber-50/30' },
  { stage: 'quotation_sent', label: '5. Quotation Sent', color: 'border-indigo-200 bg-indigo-50/30' },
  { stage: 'negotiation', label: '6. Negotiation', color: 'border-purple-200 bg-purple-50/30' },
  { stage: 'closed_won', label: '7. PO / Closed Won', color: 'border-emerald-300 bg-emerald-50/40' },
  { stage: 'closed_lost', label: '8. Closed Lost', color: 'border-red-200 bg-red-50/30' },
];

export const SalesPipeline: React.FC = () => {
  const {
    opportunities,
    updateOpportunityStage,
    currency,
    exchangeRates,
    currentUser,
  } = useApp();

  const [selectedProductFilter, setSelectedProductFilter] = useState('ALL');
  const [selectedOwnerFilter, setSelectedOwnerFilter] = useState('ALL');

  // Closed Won confirmation modal state
  const [winningOpp, setWinningOpp] = useState<Opportunity | null>(null);
  const [wonPOReference, setWonPOReference] = useState('');
  const [wonContractValueIDR, setWonContractValueIDR] = useState(0);
  const [wonPaymentTerms, setWonPaymentTerms] = useState(
    '30% T/T Advance, 70% against BL copy'
  );

  // Closed Lost reason modal state
  const [losingOpp, setLosingOpp] = useState<Opportunity | null>(null);
  const [lossReason, setLossReason] = useState('Price competition');
  const [lossNotes, setLossNotes] = useState('');

  // Filter opportunities
  const filteredOpps = opportunities.filter((o) => {
    if (selectedProductFilter !== 'ALL' && !o.product_name.includes(selectedProductFilter)) {
      return false;
    }
    if (selectedOwnerFilter !== 'ALL' && o.assigned_to !== selectedOwnerFilter) {
      return false;
    }
    return true;
  });

  const handleMoveStage = (opp: Opportunity, targetStage: PipelineStage) => {
    if (targetStage === 'closed_won') {
      setWinningOpp(opp);
      setWonPOReference(`PO-${opp.country_code}-${Date.now().toString().slice(-4)}`);
      setWonContractValueIDR(opp.est_order_value_idr);
      return;
    }
    if (targetStage === 'closed_lost') {
      setLosingOpp(opp);
      return;
    }
    updateOpportunityStage(opp.id, targetStage);
  };

  const handleConfirmWon = () => {
    if (!winningOpp) return;
    updateOpportunityStage(winningOpp.id, 'closed_won', {
      won_po_reference: wonPOReference,
      won_contract_value_idr: wonContractValueIDR,
      won_payment_terms: wonPaymentTerms,
    });
    setWinningOpp(null);
  };

  const handleConfirmLost = () => {
    if (!losingOpp) return;
    updateOpportunityStage(losingOpp.id, 'closed_lost', {
      loss_reason: lossReason,
      loss_notes: lossNotes,
    });
    setLosingOpp(null);
  };

  return (
    <div className="space-y-6">
      {/* Kanban Header & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-navy-950 flex items-center space-x-2">
            <Kanban className="h-4 w-4 text-navy-900" />
            <span>International Sales Pipeline (Kanban)</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredOpps.length} Opportunities
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Track deal progression from inbound inquiry to purchase order fulfillment
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <select
            value={selectedProductFilter}
            onChange={(e) => setSelectedProductFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 font-medium"
          >
            <option value="ALL">All Commodities</option>
            <option value="Charcoal">Coconut Shell Charcoal</option>
            <option value="Coffee">Sumatra Coffee</option>
            <option value="Cinnamon">Cinnamon</option>
          </select>

          <select
            value={selectedOwnerFilter}
            onChange={(e) => setSelectedOwnerFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 font-medium"
          >
            <option value="ALL">All Sales Execs</option>
            <option value="Hansel Varian Putra">Hansel Varian Putra</option>
            <option value="Hendro Wijaya">Hendro Wijaya</option>
            <option value="Siti Rahma">Siti Rahma</option>
            <option value="Rian Pratama">Rian Pratama</option>
          </select>
        </div>
      </div>

      {/* Kanban Columns Horizontal Container */}
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4 min-w-[1600px] items-start">
          {PIPELINE_COLUMNS.map((col) => {
            const colOpps = filteredOpps.filter((o) => o.stage === col.stage);
            const totalValueIDR = colOpps.reduce((sum, o) => sum + o.est_order_value_idr, 0);

            return (
              <div
                key={col.stage}
                className={`w-72 flex-shrink-0 rounded-xl border p-3 shadow-subtle ${col.color}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 mb-3">
                  <div className="overflow-hidden">
                    <h3 className="text-xs font-bold text-navy-950 truncate">{col.label}</h3>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {formatCurrency(
                        convertCurrency(totalValueIDR, 'IDR', currency, exchangeRates),
                        currency,
                        { compact: true }
                      )}
                    </p>
                  </div>
                  <span className="h-5 w-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-navy-950 shadow-xs">
                    {colOpps.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 min-h-[350px]">
                  {colOpps.length === 0 ? (
                    <div className="h-28 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-[11px] text-slate-400">
                      No deals in stage
                    </div>
                  ) : (
                    colOpps.map((opp) => (
                      <div
                        key={opp.id}
                        className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-card hover:shadow-card-hover transition-all text-xs space-y-2.5 relative group"
                      >
                        {/* Card Header: Country & Deal Code */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {opp.country_code} • {opp.deal_code}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {opp.probability}% win
                          </span>
                        </div>

                        {/* Buyer Name & Commodity */}
                        <div>
                          <p className="font-bold text-navy-950 text-xs leading-snug">
                            {opp.buyer_name}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5 truncate flex items-center space-x-1">
                            {opp.product_name.includes('Charcoal') && (
                              <Flame className="h-3 w-3 text-amber-500 flex-shrink-0" />
                            )}
                            <span className="truncate">{opp.product_name}</span>
                          </p>
                        </div>

                        {/* Deal Value */}
                        <div className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">Value:</span>
                          <span className="font-mono font-bold text-navy-950 text-xs">
                            {formatCurrency(
                              convertCurrency(opp.est_order_value_idr, 'IDR', currency, exchangeRates),
                              currency
                            )}
                          </span>
                        </div>

                        {/* Next Action & Assigned */}
                        <div className="space-y-1 text-[11px] text-slate-600">
                          <p className="line-clamp-2">
                            <span className="font-semibold text-navy-900">Next:</span> {opp.next_action}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                            <span>Close: {opp.expected_close_date}</span>
                            <span className="font-medium text-slate-600">{opp.assigned_to}</span>
                          </div>
                        </div>

                        {/* Stage Progression Action Bar */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                          {col.stage !== 'new_lead' && (
                            <button
                              onClick={() => {
                                const currentIndex = PIPELINE_COLUMNS.findIndex((c) => c.stage === col.stage);
                                if (currentIndex > 0) {
                                  handleMoveStage(opp, PIPELINE_COLUMNS[currentIndex - 1].stage);
                                }
                              }}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-navy-900"
                              title="Move back"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                          )}

                          <div className="flex items-center space-x-1 ml-auto">
                            {col.stage !== 'closed_won' && (
                              <button
                                onClick={() => handleMoveStage(opp, 'closed_won')}
                                className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center space-x-0.5"
                                title="Close Won and auto-generate Export Order"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Won</span>
                              </button>
                            )}
                            {col.stage !== 'closed_lost' && (
                              <button
                                onClick={() => handleMoveStage(opp, 'closed_lost')}
                                className="px-2 py-0.5 rounded bg-red-100 hover:bg-red-200 text-red-800 text-[10px] font-bold flex items-center space-x-0.5"
                                title="Close Lost with reason"
                              >
                                <XCircle className="h-3 w-3" />
                                <span>Lost</span>
                              </button>
                            )}
                            {col.stage !== 'closed_won' && col.stage !== 'closed_lost' && (
                              <button
                                onClick={() => {
                                  const currentIndex = PIPELINE_COLUMNS.findIndex((c) => c.stage === col.stage);
                                  if (currentIndex < PIPELINE_COLUMNS.length - 2) {
                                    handleMoveStage(opp, PIPELINE_COLUMNS[currentIndex + 1].stage);
                                  }
                                }}
                                className="p-1 hover:bg-slate-100 rounded text-navy-900 font-bold"
                                title="Advance to next stage"
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Closed Won Confirmation Modal */}
      {winningOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-navy-950 flex items-center space-x-1.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>Confirm Closed Won Opportunity</span>
                </h3>
                <p className="text-slate-500 text-[11px]">
                  Creating export fulfillment record for {winningOpp.buyer_name}
                </p>
              </div>
              <button
                onClick={() => setWinningOpp(null)}
                className="p-1 text-slate-400 hover:text-navy-950"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">PO / Contract Reference *</label>
                <input
                  type="text"
                  value={wonPOReference}
                  onChange={(e) => setWonPOReference(e.target.value)}
                  placeholder="e.g. PO-2026-AST-99"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-mono font-bold text-navy-950"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Final Order Value (IDR) *</label>
                <input
                  type="number"
                  value={wonContractValueIDR}
                  onChange={(e) => setWonContractValueIDR(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-mono font-bold text-navy-950"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Payment Terms *</label>
                <input
                  type="text"
                  value={wonPaymentTerms}
                  onChange={(e) => setWonPaymentTerms(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-slate-800"
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] space-y-1">
                <p className="font-bold flex items-center space-x-1">
                  <span>Automatic Export Order Generation</span>
                </p>
                <p>
                  Confirming this deal will automatically create a tracked record in{' '}
                  <span className="font-semibold">Export Orders & Shipments</span> with initial production and document checklist.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => setWinningOpp(null)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWon}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm"
              >
                Confirm & Create Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Closed Lost Modal */}
      {losingOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-navy-950 flex items-center space-x-1.5">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span>Record Closed Lost Opportunity</span>
                </h3>
                <p className="text-slate-500 text-[11px]">
                  Document loss reason for {losingOpp.buyer_name}
                </p>
              </div>
              <button
                onClick={() => setLosingOpp(null)}
                className="p-1 text-slate-400 hover:text-navy-950"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Primary Loss Reason *</label>
                <select
                  value={lossReason}
                  onChange={(e) => setLossReason(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-slate-800"
                >
                  <option value="Price competition">Price competition / Competitor cheaper</option>
                  <option value="Lead time too long">Lead time too long / Factory full</option>
                  <option value="Technical spec mismatch">Technical spec mismatch (Ash / Moisture)</option>
                  <option value="Payment terms disagreement">Payment terms disagreement (Refused T/T)</option>
                  <option value="Shipping & freight costs">Ocean freight rates too volatile</option>
                  <option value="Buyer unresponsive">Buyer unresponsive / Project cancelled</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Sales Analysis Notes *</label>
                <textarea
                  value={lossNotes}
                  onChange={(e) => setLossNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Buyer opted for local Vietnamese supplier due to $40/MT ocean freight difference. Keep in contact for Q1."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-slate-800"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => setLosingOpp(null)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLost}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-sm"
              >
                Save Lost Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
