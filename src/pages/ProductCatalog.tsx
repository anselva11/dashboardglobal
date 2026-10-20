import React, { useState } from 'react';
import {
  Boxes,
  Flame,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatCurrency,
  convertCurrency,
  calculatePricingBreakdown,
} from '../lib/calculations';
import type { Product, Incoterm } from '../types';

export const ProductCatalog: React.FC = () => {
  const {
    products,
    currency,
    exchangeRates,
    buyers,
    addQuotation,
    currentUser,
  } = useApp();

  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);

  // Pricing Calculator State
  const [incoterm, setIncoterm] = useState<Incoterm>('FOB');
  const [quantityMT, setQuantityMT] = useState(18); // Default 1x20ft container
  const [supplierCostPerMT, setSupplierCostPerMT] = useState(
    selectedProduct.base_supplier_cost_idr_per_mt
  );
  const [packagingPerMT, setPackagingPerMT] = useState(1000000); // 1kg printed inner + master box
  const [inlandTrucking, setInlandTrucking] = useState(6000000); // Central Java factory -> Tanjung Priok/Perak
  const [handlingStuffingTHC, setHandlingStuffingTHC] = useState(4000000);
  const [inspectionCost, setInspectionCost] = useState(2500000); // Sucofindo quality/moisture test
  const [exportDocsCost, setExportDocsCost] = useState(3500000); // SHTC self-heating test report + MSDS + COO
  const [customsPEB, setCustomsPEB] = useState(2000000);
  const [oceanFreight, setOceanFreight] = useState(25000000); // For CFR/CIF ($1,500/container)
  const [marineInsurance, setMarineInsurance] = useState(2500000); // For CIF (All-risk policy)
  const [sellingPricePerMT, setSellingPricePerMT] = useState(
    selectedProduct.indicative_fob_price_usd_per_mt * exchangeRates.USD
  );

  // Quote Generation State
  const [selectedBuyerId, setSelectedBuyerId] = useState(buyers[0]?.id || '');
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState<string | null>(null);

  // When selected product changes, reset pricing calculator base
  const handleSelectProduct = (prd: Product) => {
    setSelectedProduct(prd);
    setSupplierCostPerMT(prd.base_supplier_cost_idr_per_mt);
    setSellingPricePerMT(prd.indicative_fob_price_usd_per_mt * exchangeRates.USD);
  };

  // Run calculation formula
  const pricingResult = calculatePricingBreakdown({
    quantity_mt: quantityMT,
    supplier_cost_per_mt_idr: supplierCostPerMT,
    packaging_per_mt_idr: packagingPerMT,
    inland_trucking_total_idr: inlandTrucking,
    handling_stuffing_thc_total_idr: handlingStuffingTHC,
    inspection_total_idr: inspectionCost,
    export_docs_shtc_msds_total_idr: exportDocsCost,
    customs_clearance_peb_total_idr: customsPEB,
    ocean_freight_total_idr: oceanFreight,
    marine_insurance_total_idr: marineInsurance,
    other_applicable_idr: 0,
    selling_price_per_mt_idr: sellingPricePerMT,
    incoterm,
  });

  const handleCreateQuotation = () => {
    const buyer = buyers.find((b) => b.id === selectedBuyerId) || buyers[0];
    const totalUSD = Number((pricingResult.sales_revenue_idr / exchangeRates.USD).toFixed(2));
    const cogsUSD = Number((pricingResult.total_cogs_idr / exchangeRates.USD).toFixed(2));

    addQuotation({
      buyer_id: buyer.id,
      buyer_name: buyer.company_name,
      buyer_country: buyer.country,
      date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      incoterm,
      loading_port: 'Tanjung Priok, Jakarta',
      destination_port: buyer.destination_port,
      currency: 'USD',
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      quantity_mt: quantityMT,
      unit_price: Number((totalUSD / quantityMT).toFixed(2)),
      total_quote_value: totalUSD,
      total_cogs: cogsUSD,
      est_gross_profit: totalUSD - cogsUSD,
      est_gross_margin_pct: pricingResult.gross_margin_pct,
      pricing_breakdown: pricingResult,
      payment_terms: buyer.payment_preference || '30% T/T Advance, 70% against BL copy',
      status: 'draft',
      notes: `Generated via Export Pricing Engine for ${selectedProduct.name} (${incoterm} ${buyer.destination_port}).`,
      created_by: currentUser.name,
    });

    setQuoteSuccessMsg(`Draft Quotation successfully created for ${buyer.company_name}!`);
    setTimeout(() => setQuoteSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-navy-950 flex items-center space-x-2">
            <Boxes className="h-4 w-4 text-navy-900" />
            <span>Product Catalog & Export Pricing Engine</span>
          </h2>
          <p className="text-xs text-slate-500">
            Technical commodity specifications, laboratory test certificates, and FOB/CFR/CIF margin modeling
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-900 font-semibold flex items-center space-x-1">
            <Flame className="h-3.5 w-3.5 text-amber-600" />
            <span>Hero Product: Coconut Shell Charcoal</span>
          </span>
        </div>
      </div>

      {/* Product Selection Tabs / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((prd) => {
          const isSelected = selectedProduct.id === prd.id;
          return (
            <div
              key={prd.id}
              onClick={() => handleSelectProduct(prd)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'border-navy-900 bg-navy-950 text-white shadow-card-hover'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-card text-slate-900'
              }`}
            >
              {prd.is_primary && (
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-navy-950 uppercase tracking-wide">
                  Hero Product
                </span>
              )}
              <span className={`text-[10px] font-mono font-semibold ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                {prd.product_code} • {prd.category}
              </span>
              <h3 className={`text-sm font-bold mt-1 line-clamp-2 ${isSelected ? 'text-white' : 'text-navy-950'}`}>
                {prd.name}
              </h3>
              <p className={`text-xs mt-1 font-medium ${isSelected ? 'text-amber-300' : 'text-slate-600'}`}>
                {prd.grade}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-200/20 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className={`text-[10px] block ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                    Indicative FOB:
                  </span>
                  <span className="font-mono font-bold">${prd.indicative_fob_price_usd_per_mt}/MT</span>
                </div>
                <div>
                  <span className={`text-[10px] block ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                    MOQ:
                  </span>
                  <span className="font-mono font-bold">{prd.specs.moq_mt} MT (1 FCL)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Technical Specification & Pricing Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Technical Specification Matrix */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-card space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-950 flex items-center space-x-2">
                {selectedProduct.is_primary && <Flame className="h-4 w-4 text-amber-500" />}
                <span>Technical Specifications & Lab Reports</span>
              </h3>
              <p className="text-xs text-slate-500">
                {selectedProduct.name} ({selectedProduct.grade})
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              Lab Ref: {selectedProduct.test_report_reference}
            </span>
          </div>

          {/* Configurable Technical Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Moisture Content</span>
              <span className="text-sm font-extrabold font-mono text-navy-950">
                &lt; {selectedProduct.specs.moisture_max_pct}%
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Ash Content</span>
              <span className="text-sm font-extrabold font-mono text-emerald-700">
                &lt; {selectedProduct.specs.ash_content_max_pct}% (White)
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Fixed Carbon</span>
              <span className="text-sm font-extrabold font-mono text-navy-950">
                &gt; {selectedProduct.specs.fixed_carbon_min_pct}%
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Calorific Value</span>
              <span className="text-sm font-extrabold font-mono text-amber-700">
                &gt; {selectedProduct.specs.calorific_value_min_kcal} kcal/kg
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Volatile Matter</span>
              <span className="text-sm font-extrabold font-mono text-navy-950">
                &lt; {selectedProduct.specs.volatile_matter_max_pct}%
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Burning Duration</span>
              <span className="text-sm font-extrabold font-mono text-navy-950">
                &gt; {selectedProduct.specs.burning_time_hours} Hours
              </span>
            </div>
          </div>

          {/* Physical & Packaging Details */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <p className="flex justify-between">
              <span className="text-slate-500">Shape & Dimensions:</span>
              <span className="font-semibold text-slate-900">{selectedProduct.specs.shape_dimension}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-500">Packaging Type:</span>
              <span className="font-semibold text-slate-900">{selectedProduct.specs.packaging_type}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-500">Monthly Capacity:</span>
              <span className="font-semibold text-slate-900">{selectedProduct.monthly_capacity_mt} MT / Month</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-500">Standard Lead Time:</span>
              <span className="font-semibold text-slate-900">{selectedProduct.lead_time_days} Days from deposit</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-500">Supplier Factory:</span>
              <span className="font-semibold text-slate-900">{selectedProduct.supplier_name}</span>
            </p>
          </div>

          {/* Certifications & Compliance Badges */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Certified Export Testing & Compliance
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedProduct.specs.certifications.map((cert) => (
                <span
                  key={cert}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1"
                >
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  <span>{cert}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Interactive Pricing Calculator */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-card space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-950 flex items-center space-x-2">
                <Calculator className="h-4 w-4 text-navy-900" />
                <span>Export Quotation Pricing Calculator</span>
              </h3>
              <p className="text-xs text-slate-500">
                Formula: COGS = Supplier + Packaging + Inland + Inspection + Docs + Ocean + Insurance
              </p>
            </div>

            {/* Incoterm Radio Tabs */}
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              {(['FOB', 'CFR', 'CIF'] as Incoterm[]).map((inc) => (
                <button
                  key={inc}
                  onClick={() => setIncoterm(inc)}
                  className={`px-3 py-1 rounded-md font-bold transition-colors ${
                    incoterm === inc
                      ? 'bg-navy-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-navy-900'
                  }`}
                >
                  {inc}
                </button>
              ))}
            </div>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Contract Volume (MT)</label>
              <input
                type="number"
                value={quantityMT}
                onChange={(e) => setQuantityMT(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Selling Price / MT (IDR)</label>
              <input
                type="number"
                value={sellingPricePerMT}
                onChange={(e) => setSellingPricePerMT(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-mono text-navy-950 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Supplier Base Cost / MT (IDR)</label>
              <input
                type="number"
                value={supplierCostPerMT}
                onChange={(e) => setSupplierCostPerMT(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Packaging / MT (IDR)</label>
              <input
                type="number"
                value={packagingPerMT}
                onChange={(e) => setPackagingPerMT(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Inland Trucking & Stuffing (IDR)</label>
              <input
                type="number"
                value={inlandTrucking + handlingStuffingTHC}
                onChange={(e) => {
                  const half = Number(e.target.value) / 2;
                  setInlandTrucking(half);
                  setHandlingStuffingTHC(half);
                }}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Inspection & Docs (SHTC/MSDS/PEB)</label>
              <input
                type="number"
                value={inspectionCost + exportDocsCost + customsPEB}
                onChange={(e) => {
                  const third = Number(e.target.value) / 3;
                  setInspectionCost(third);
                  setExportDocsCost(third);
                  setCustomsPEB(third);
                }}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-mono"
              />
            </div>

            {/* Freight & Insurance Conditional Fields */}
            {(incoterm === 'CFR' || incoterm === 'CIF') && (
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Ocean Freight (IDR)</label>
                <input
                  type="number"
                  value={oceanFreight}
                  onChange={(e) => setOceanFreight(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-mono"
                />
              </div>
            )}

            {incoterm === 'CIF' && (
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Marine Insurance (IDR)</label>
                <input
                  type="number"
                  value={marineInsurance}
                  onChange={(e) => setMarineInsurance(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none font-mono"
                />
              </div>
            )}
          </div>

          {/* Pricing Results Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Total Recognized Revenue:</span>
              <span className="font-mono font-bold text-navy-950 text-sm">
                {formatCurrency(
                  convertCurrency(pricingResult.sales_revenue_idr, 'IDR', currency, exchangeRates),
                  currency
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600">Total Product Cost (COGS):</span>
              <span className="font-mono font-bold text-slate-700">
                {formatCurrency(
                  convertCurrency(pricingResult.total_cogs_idr, 'IDR', currency, exchangeRates),
                  currency
                )}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800">Estimated Gross Profit:</span>
                <span className="text-[11px] text-slate-500 block">
                  Margin: <span className="font-extrabold text-emerald-700">{pricingResult.gross_margin_pct}%</span>
                </span>
              </div>
              <span className="font-mono font-extrabold text-emerald-700 text-base">
                {formatCurrency(
                  convertCurrency(pricingResult.gross_profit_idr, 'IDR', currency, exchangeRates),
                  currency
                )}
              </span>
            </div>
          </div>

          {/* Direct Quotation Generation */}
          <div className="pt-2 space-y-2">
            {quoteSuccessMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center space-x-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{quoteSuccessMsg}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <select
                value={selectedBuyerId}
                onChange={(e) => setSelectedBuyerId(e.target.value)}
                className="w-full sm:w-2/3 px-3 py-1.5 border border-slate-300 rounded-lg outline-none text-xs font-medium"
              >
                {buyers.map((b) => (
                  <option key={b.id} value={b.id}>
                    Quote for: {b.company_name} ({b.country})
                  </option>
                ))}
              </select>

              <button
                onClick={handleCreateQuotation}
                className="w-full sm:w-1/3 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center justify-center space-x-1"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Create Quotation Draft</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
