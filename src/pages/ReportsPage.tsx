import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatCurrency,
  convertCurrency,
} from '../lib/calculations';

export const ReportsPage: React.FC = () => {
  const {
    exportOrders,
    buyers,
    currency,
    exchangeRates,
    currentUser,
  } = useApp();

  const [selectedReportType, setSelectedReportType] = useState<string>('monthly_sales');

  const reportOptions = [
    { id: 'monthly_sales', label: '1. Monthly Export Sales & Target Achievement' },
    { id: 'buyer_acquisition', label: '2. International Buyer Acquisition & MQLs' },
    { id: 'product_profitability', label: '3. Commodity Profitability & Gross Margin' },
    { id: 'salesperson_performance', label: '4. Sales Team Execution & Quota' },
    { id: 'export_shipments', label: '5. Export Shipments & Regulatory Status' },
    { id: 'accounts_receivable', label: '6. Accounts Receivable & Payment Aging' },
  ];

  // Dynamic values
  const totalContractedIDR = exportOrders.reduce((sum, o) => sum + o.total_contract_value_idr, 0);
  const recognizedRevenueIDR = exportOrders.reduce((sum, o) => sum + o.recognized_revenue_idr, 0);
  const collectedCashIDR = exportOrders.reduce((sum, o) => sum + o.collected_cash_idr, 0);
  const totalCogsIDR = exportOrders.reduce((sum, o) => sum + o.cogs_idr, 0);
  const grossProfitIDR = recognizedRevenueIDR - totalCogsIDR;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    const filename = `PT_Global_Expor_Report_${selectedReportType}_${new Date().toISOString().split('T')[0]}.csv`;

    if (selectedReportType === 'monthly_sales') {
      headers = ['Order Number', 'Buyer Name', 'Country', 'Commodity', 'Contract Value (IDR)', 'Recognized Revenue', 'Collected Cash', 'Status'];
      rows = exportOrders.map((o) => [
        `"${o.order_number}"`,
        `"${o.buyer_name}"`,
        `"${o.buyer_country}"`,
        `"${o.product_name}"`,
        o.total_contract_value_idr,
        o.recognized_revenue_idr,
        o.collected_cash_idr,
        `"${o.shipment_status}"`,
      ]);
    } else if (selectedReportType === 'buyer_acquisition') {
      headers = ['Buyer Code', 'Company Name', 'Country', 'Contact', 'Email', 'Volume (MT)', 'Est Value (USD)', 'Stage', 'Status'];
      rows = buyers.map((b) => [
        `"${b.buyer_code}"`,
        `"${b.company_name}"`,
        `"${b.country}"`,
        `"${b.contact_person}"`,
        `"${b.email}"`,
        b.est_purchase_volume_mt,
        b.est_deal_value_usd,
        `"${b.stage}"`,
        `"${b.verification_status}"`,
      ]);
    } else {
      headers = ['PO Reference', 'Buyer', 'Destination', 'Quantity MT', 'Total Value (IDR)', 'Shipment Status', 'Payment Terms'];
      rows = exportOrders.map((o) => [
        `"${o.po_reference}"`,
        `"${o.buyer_name}"`,
        `"${o.destination_port}"`,
        o.quantity_mt,
        o.total_contract_value_idr,
        `"${o.shipment_status}"`,
        `"${o.payment_terms}"`,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls (Hidden on print) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
        <div>
          <h2 className="text-base font-bold text-navy-950 flex items-center space-x-2">
            <FileText className="h-4 w-4 text-navy-900" />
            <span>Executive Business Reports & Formal Export Summary</span>
          </h2>
          <p className="text-xs text-slate-500">
            Export-grade audit reporting, CSV tables, and print-ready executive summaries
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none"
          >
            {reportOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1 border border-slate-200"
          >
            <Download className="h-3.5 w-3.5" />
            <span>CSV Export</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1 shadow-sm"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-card p-6 md:p-8 space-y-6">
        {/* Formal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-navy-900 pb-4 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="h-7 w-7 rounded-lg bg-navy-950 text-amber-400 flex items-center justify-center font-extrabold text-sm">
                GE
              </span>
              <h1 className="text-xl font-extrabold text-navy-950 tracking-tight uppercase">
                PT GLOBAL EXPOR INDONESIA
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Menara Palma Lt. 12, Rasuna Said, Jakarta Selatan • NPWP: 01.234.567.8-012.000
            </p>
            <p className="text-[11px] text-slate-400">
              Primary Export Commodity: Indonesian Coconut Shell Charcoal Briquettes (Shisha & BBQ)
            </p>
          </div>

          <div className="text-right text-xs">
            <span className="font-mono font-bold text-navy-900 text-sm">
              REPORT REF: GEI-{selectedReportType.toUpperCase().slice(0, 4)}-2026
            </span>
            <p className="text-slate-500 mt-0.5">
              Date Generated: <span className="font-semibold text-slate-800">20 October 2026</span>
            </p>
            <p className="text-slate-500">
              Generated by: <span className="font-semibold text-slate-800">{currentUser.name} ({currentUser.title})</span>
            </p>
          </div>
        </div>

        {/* Report Overview Headline */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              Contract Value
            </span>
            <span className="text-base font-extrabold font-mono text-navy-950">
              {formatCurrency(
                convertCurrency(totalContractedIDR, 'IDR', currency, exchangeRates),
                currency,
                { compact: true }
              )}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              Recognized Revenue
            </span>
            <span className="text-base font-extrabold font-mono text-emerald-800">
              {formatCurrency(
                convertCurrency(recognizedRevenueIDR, 'IDR', currency, exchangeRates),
                currency,
                { compact: true }
              )}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              Collected Cash
            </span>
            <span className="text-base font-extrabold font-mono text-blue-900">
              {formatCurrency(
                convertCurrency(collectedCashIDR, 'IDR', currency, exchangeRates),
                currency,
                { compact: true }
              )}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              Gross Profit
            </span>
            <span className="text-base font-extrabold font-mono text-emerald-700">
              {formatCurrency(
                convertCurrency(grossProfitIDR, 'IDR', currency, exchangeRates),
                currency,
                { compact: true }
              )}
            </span>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Order / PO</th>
                <th className="py-2.5 px-3">Buyer Company</th>
                <th className="py-2.5 px-3">Country</th>
                <th className="py-2.5 px-3">Export Commodity</th>
                <th className="py-2.5 px-2 text-right">Volume</th>
                <th className="py-2.5 px-3 text-right">Contract Value</th>
                <th className="py-2.5 px-3">Shipment Status</th>
                <th className="py-2.5 px-3">Payment Terms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {exportOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-navy-950">
                    {ord.order_number}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{ord.buyer_name}</td>
                  <td className="py-2.5 px-3">{ord.buyer_country}</td>
                  <td className="py-2.5 px-3 truncate max-w-[150px]">{ord.product_name}</td>
                  <td className="py-2.5 px-2 text-right font-mono">{ord.quantity_mt} MT</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-navy-950">
                    {formatCurrency(
                      convertCurrency(ord.total_contract_value_idr, 'IDR', currency, exchangeRates),
                      currency
                    )}
                  </td>
                  <td className="py-2.5 px-3 capitalize font-medium text-slate-700">
                    {ord.shipment_status.replace(/_/g, ' ')}
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-600">{ord.payment_terms}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Executive Verification Signoff */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-600">
          <div>
            <p className="font-semibold text-navy-950">Management Attestation:</p>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              I hereby certify that all shipment records, laboratory analysis certificates (SHTC / MSDS), and foreign currency conversions recorded herein accurately reflect the operational posture of PT Global Expor Indonesia.
            </p>
          </div>
          <div className="text-right flex flex-col justify-end">
            <div className="w-48 ml-auto border-b border-slate-400 pb-1 font-bold text-navy-950 text-center">
              {currentUser.name}
            </div>
            <p className="text-[11px] text-slate-500 text-center w-48 ml-auto pt-1">
              {currentUser.title}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
