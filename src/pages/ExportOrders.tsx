import React, { useState } from 'react';
import {
  Ship,
  FileCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Package,
  Anchor,
  FileText,
  DollarSign,
  Plus,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Flame,
  Truck,
  ArrowRight,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatCurrency,
  convertCurrency,
} from '../lib/calculations';
import type { ExportOrder, ShipmentStage, PaymentStatus } from '../types';

const SHIPMENT_STAGES: { stage: ShipmentStage; label: string; icon: any }[] = [
  { stage: 'order_confirmed', label: '1. Order Confirmed', icon: CheckCircle2 },
  { stage: 'supplier_confirmed', label: '2. Supplier Confirmed', icon: CheckCircle2 },
  { stage: 'production', label: '3. Production', icon: Package },
  { stage: 'quality_control', label: '4. Quality Control', icon: ShieldCheck },
  { stage: 'packing', label: '5. Packing', icon: Package },
  { stage: 'container_loading', label: '6. Container Loading', icon: Truck },
  { stage: 'export_documentation', label: '7. Export Docs', icon: FileText },
  { stage: 'customs_clearance', label: '8. Customs Clearance', icon: FileCheck },
  { stage: 'vessel_departure', label: '9. Vessel Departure', icon: Anchor },
  { stage: 'in_transit', label: '10. In Transit', icon: Ship },
  { stage: 'delivered', label: '11. Delivered', icon: CheckCircle2 },
];

export const ExportOrders: React.FC = () => {
  const {
    exportOrders,
    updateExportOrderStatus,
    addExportOrder,
    currency,
    exchangeRates,
    buyers,
    products,
  } = useApp();

  const [selectedOrder, setSelectedOrder] = useState<ExportOrder>(exportOrders[0]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPayment, setFilterPayment] = useState<string>('ALL');

  // Modal to update status
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newShipmentStatus, setNewShipmentStatus] = useState<ShipmentStage>(
    selectedOrder?.shipment_status || 'order_confirmed'
  );
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>(
    selectedOrder?.payment_status || 'deposit_pending'
  );
  const [containerNo, setContainerNo] = useState(selectedOrder?.container_number || '');
  const [blNumber, setBlNumber] = useState(selectedOrder?.bill_of_lading_no || '');

  // Missing doc alerts across all orders
  const ordersWithMissingDocs = exportOrders.filter((o) =>
    o.documents.some((d) => d.status === 'missing' || d.status === 'pending')
  );

  const filteredOrders = exportOrders.filter((o) => {
    if (filterStatus !== 'ALL' && o.shipment_status !== filterStatus) return false;
    if (filterPayment !== 'ALL' && o.payment_status !== filterPayment) return false;
    return true;
  });

  const getStageIndex = (stage: ShipmentStage) =>
    SHIPMENT_STAGES.findIndex((s) => s.stage === stage);

  const handleOpenUpdate = (order: ExportOrder) => {
    setSelectedOrder(order);
    setNewShipmentStatus(order.shipment_status);
    setNewPaymentStatus(order.payment_status);
    setContainerNo(order.container_number || '');
    setBlNumber(order.bill_of_lading_no || '');
    setIsUpdateModalOpen(true);
  };

  const handleSaveStatus = () => {
    if (!selectedOrder) return;
    updateExportOrderStatus(selectedOrder.id, {
      shipment_status: newShipmentStatus,
      payment_status: newPaymentStatus,
      container_number: containerNo,
      bill_of_lading_no: blNumber,
    });
    setSelectedOrder({
      ...selectedOrder,
      shipment_status: newShipmentStatus,
      payment_status: newPaymentStatus,
      container_number: containerNo,
      bill_of_lading_no: blNumber,
    });
    setIsUpdateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Missing Docs & Shipment Alerts */}
      {ordersWithMissingDocs.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950 flex items-center space-x-2">
                <span>Shipping Documentation & Regulatory Inspection Alert</span>
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Orders with pending certificates:{' '}
                <span className="font-semibold">
                  {ordersWithMissingDocs.map((o) => `${o.order_number} (${o.buyer_name})`).join(', ')}
                </span>
                . Ensure Phytosanitary and SHTC self-heating certificates are filed prior to container stuffing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-navy-950 flex items-center space-x-2">
            <Ship className="h-4 w-4 text-navy-900" />
            <span>Export Orders & Ocean Freight Tracking</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredOrders.length} Shipments
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            End-to-end traceability from factory production to discharge port arrival
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 text-xs">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 font-medium"
          >
            <option value="ALL">All Shipment Stages</option>
            <option value="production">Production</option>
            <option value="packing">Packing</option>
            <option value="container_loading">Container Loading</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
          </select>

          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 font-medium"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="deposit_pending">Deposit Pending</option>
            <option value="deposit_paid">Deposit Paid</option>
            <option value="balance_pending">Balance Pending</option>
            <option value="fully_paid">Fully Paid</option>
          </select>
        </div>
      </div>

      {/* Active Selected Order Milestone Timeline */}
      {selectedOrder && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center space-x-3">
              <span className="text-base font-bold font-mono text-navy-950 bg-slate-100 px-2.5 py-1 rounded-lg">
                {selectedOrder.order_number}
              </span>
              <div>
                <h3 className="text-sm font-bold text-navy-950 flex items-center space-x-2">
                  <span>{selectedOrder.buyer_name}</span>
                  <span className="text-slate-400 font-normal">({selectedOrder.buyer_country})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  PO: <span className="font-mono font-medium text-slate-700">{selectedOrder.po_reference}</span> •{' '}
                  {selectedOrder.quantity_mt} MT • {selectedOrder.container_count}x{selectedOrder.container_type} ({selectedOrder.incoterms})
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <button
                onClick={() => handleOpenUpdate(selectedOrder)}
                className="px-3 py-1.5 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-navy-800 transition-colors shadow-xs"
              >
                Update Order & Payment Status
              </button>
            </div>
          </div>

          {/* 11-step Visual Milestone Timeline */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                11-Step Export Execution Journey
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full capitalize">
                Current: {selectedOrder.shipment_status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="flex items-center justify-between min-w-[950px] relative">
                {/* Connecting Line */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />

                {SHIPMENT_STAGES.map((stg, idx) => {
                  const currentIdx = getStageIndex(selectedOrder.shipment_status);
                  const isCompleted = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div
                      key={stg.stage}
                      className="flex flex-col items-center space-y-1.5 relative z-10 text-center w-20 flex-shrink-0"
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                          isCurrent
                            ? 'bg-navy-900 text-white ring-4 ring-navy-100'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}
                      >
                        {isCompleted && !isCurrent ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`text-[10px] leading-tight ${
                          isCurrent
                            ? 'font-bold text-navy-950'
                            : isCompleted
                            ? 'font-medium text-slate-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {stg.label.split('. ')[1]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Key Shipping Specs & Documentation Checklist Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
            {/* Logistics Specs */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Routing & Cargo Data
              </span>
              <p className="flex justify-between">
                <span className="text-slate-500">Loading Port:</span>
                <span className="font-semibold text-navy-950">{selectedOrder.loading_port}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Destination Port:</span>
                <span className="font-semibold text-navy-950">{selectedOrder.destination_port}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Planned ETD:</span>
                <span className="font-mono font-medium text-slate-800">{selectedOrder.planned_shipment_date}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Container No:</span>
                <span className="font-mono font-bold text-navy-900">{selectedOrder.container_number || 'Pending'}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Bill of Lading:</span>
                <span className="font-mono font-bold text-navy-900">{selectedOrder.bill_of_lading_no || 'Pending departure'}</span>
              </p>
            </div>

            {/* Financial & Payment Terms (Separated) */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Financial Terms (Strict Separation)
              </span>
              <p className="flex justify-between">
                <span className="text-slate-500">Contract Value:</span>
                <span className="font-mono font-bold text-navy-950">
                  {formatCurrency(
                    convertCurrency(selectedOrder.total_contract_value_idr, 'IDR', currency, exchangeRates),
                    currency
                  )}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Recognized Revenue:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {formatCurrency(
                    convertCurrency(selectedOrder.recognized_revenue_idr, 'IDR', currency, exchangeRates),
                    currency
                  )}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Collected Cash:</span>
                <span className="font-mono font-bold text-blue-700">
                  {formatCurrency(
                    convertCurrency(selectedOrder.collected_cash_idr, 'IDR', currency, exchangeRates),
                    currency
                  )}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Payment Status:</span>
                <span className="font-bold capitalize text-navy-900 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                  {selectedOrder.payment_status.replace(/_/g, ' ')}
                </span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Terms: <span className="font-medium text-slate-700">{selectedOrder.payment_terms}</span>
              </p>
            </div>

            {/* Regulatory & Shipping Documents */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Shipping Document Verification
              </span>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {selectedOrder.documents.map((doc) => (
                  <div
                    key={doc.code}
                    className="flex items-center justify-between py-0.5 border-b border-slate-100 last:border-0"
                  >
                    <span className="text-[11px] text-slate-700 truncate pr-2" title={doc.name}>
                      {doc.code} • {doc.name}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase flex-shrink-0 ${
                        doc.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders List Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy-950">
            Export Transactions & Purchase Orders
          </h3>
          <span className="text-xs text-slate-500">
            Click row to view live shipment timeline
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Order / PO</th>
                <th className="py-3 px-3">Buyer & Destination</th>
                <th className="py-3 px-3">Product & Volume</th>
                <th className="py-3 px-3">Contract Value</th>
                <th className="py-3 px-3">Shipment Status</th>
                <th className="py-3 px-3">Payment Status</th>
                <th className="py-3 px-3">ETD</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((ord) => {
                const isSelected = selectedOrder?.id === ord.id;
                return (
                  <tr
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-navy-950">{ord.order_number}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{ord.po_reference}</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-900">{ord.buyer_name}</p>
                      <p className="text-[11px] text-slate-500">
                        {ord.destination_port.split(',')[0]} ({ord.buyer_country})
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="text-slate-800 truncate max-w-[170px]">{ord.product_name}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        {ord.quantity_mt} MT • {ord.container_count}x{ord.container_type} ({ord.incoterms})
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-mono font-bold text-navy-950">
                        {formatCurrency(
                          convertCurrency(ord.total_contract_value_idr, 'IDR', currency, exchangeRates),
                          currency
                        )}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold capitalize bg-slate-100 text-slate-800">
                        {ord.shipment_status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                          ord.payment_status === 'fully_paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.payment_status === 'deposit_paid'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.payment_status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {ord.planned_shipment_date}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenUpdate(ord);
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Order & Payment Status Modal */}
      {isUpdateModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-navy-950">
                  Update Shipment & Payment Status
                </h3>
                <p className="text-slate-500 text-[11px]">
                  Order: <span className="font-mono font-bold text-navy-950">{selectedOrder.order_number}</span> ({selectedOrder.buyer_name})
                </p>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-navy-950"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">11-Step Shipment Milestone *</label>
                <select
                  value={newShipmentStatus}
                  onChange={(e) => setNewShipmentStatus(e.target.value as ShipmentStage)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-medium text-slate-800"
                >
                  {SHIPMENT_STAGES.map((s) => (
                    <option key={s.stage} value={s.stage}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Accounting Payment Status (Separate from Shipping) *</label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-medium text-slate-800"
                >
                  <option value="deposit_pending">Deposit Pending</option>
                  <option value="deposit_paid">Deposit Paid (Advance received)</option>
                  <option value="balance_pending">Balance Pending (Vessel en route)</option>
                  <option value="fully_paid">Fully Paid (100% Collected Cash)</option>
                  <option value="lc_opened">Letter of Credit (LC) Opened & Confirmed</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Container Number</label>
                  <input
                    type="text"
                    value={containerNo}
                    onChange={(e) => setContainerNo(e.target.value)}
                    placeholder="e.g. MSKU-982144-1"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-mono text-navy-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Bill of Lading No.</label>
                  <input
                    type="text"
                    value={blNumber}
                    onChange={(e) => setBlNumber(e.target.value)}
                    placeholder="e.g. CMA202604819"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-mono text-navy-950"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatus}
                className="px-4 py-1.5 bg-navy-900 hover:bg-navy-800 text-white rounded-lg font-bold shadow-sm"
              >
                Save Updates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
