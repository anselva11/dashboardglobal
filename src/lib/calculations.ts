import type {
  Currency,
  ExchangeRates,
  Opportunity,
  PricingBreakdown,
  Incoterm,
  Buyer,
} from '../types';

export const DEFAULT_EXCHANGE_RATES: ExchangeRates = {
  IDR: 1,
  USD: 16250,
  EUR: 17500,
};

/**
 * Currency conversion utility
 */
export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
  rates: ExchangeRates = DEFAULT_EXCHANGE_RATES
): number {
  if (from === to || amount === 0) return amount;
  // Convert from source currency to IDR base
  const amountInIDR = from === 'IDR' ? amount : amount * rates[from];
  // Convert from IDR base to target currency
  if (to === 'IDR') return Math.round(amountInIDR);
  return Number((amountInIDR / rates[to]).toFixed(2));
}

/**
 * Currency formatter with Indonesian standard notation
 */
export function formatCurrency(
  amount: number,
  currency: Currency = 'IDR',
  options: { compact?: boolean } = {}
): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    amount = 0;
  }

  if (currency === 'IDR') {
    if (options.compact) {
      if (Math.abs(amount) >= 1_000_000_000) {
        return `Rp${(amount / 1_000_000_000).toFixed(1)} Miliar`;
      }
      if (Math.abs(amount) >= 1_000_000) {
        return `Rp${(amount / 1_000_000).toFixed(1)} Juta`;
      }
      if (Math.abs(amount) >= 1_000) {
        return `Rp${(amount / 1_000).toFixed(0)} Rb`;
      }
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace(/\s/g, '');
  }

  if (currency === 'USD') {
    if (options.compact && Math.abs(amount) >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(2)}M`;
    }
    if (options.compact && Math.abs(amount) >= 1_000) {
      return `$${(amount / 1_000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  if (currency === 'EUR') {
    if (options.compact && Math.abs(amount) >= 1_000_000) {
      return `€${(amount / 1_000_000).toFixed(2)}M`;
    }
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  return `${amount}`;
}

/**
 * Calculate Weighted Pipeline
 * Weighted Pipeline = Estimated Deal Value × Probability of Closing
 */
export function calculateWeightedPipeline(opportunities: Opportunity[]): number {
  return opportunities
    .filter((opp) => opp.stage !== 'closed_won' && opp.stage !== 'closed_lost')
    .reduce((sum, opp) => {
      const prob = Math.max(0, Math.min(100, opp.probability || 0)) / 100;
      return sum + (opp.est_order_value_idr || 0) * prob;
    }, 0);
}

/**
 * Calculate Unweighted Pipeline
 */
export function calculateUnweightedPipeline(opportunities: Opportunity[]): number {
  return opportunities
    .filter((opp) => opp.stage !== 'closed_won' && opp.stage !== 'closed_lost')
    .reduce((sum, opp) => sum + (opp.est_order_value_idr || 0), 0);
}

/**
 * Calculate Gross Profit and Gross Margin Percentage
 * Gross Profit = Recognized Sales Revenue - Cost of Goods Sold
 * Gross Margin (%) = (Gross Profit / Recognized Sales Revenue) * 100
 */
export function calculateGrossProfitAndMargin(
  revenue: number,
  cogs: number
): { grossProfit: number; grossMarginPct: number } {
  const grossProfit = revenue - cogs;
  if (!revenue || revenue <= 0) {
    return { grossProfit: 0, grossMarginPct: 0 };
  }
  const grossMarginPct = (grossProfit / revenue) * 100;
  return {
    grossProfit,
    grossMarginPct: Number(grossMarginPct.toFixed(2)),
  };
}

export interface PricingCalculatorParams {
  quantity_mt: number;
  supplier_cost_per_mt_idr: number;
  packaging_per_mt_idr: number;
  inland_trucking_total_idr: number;
  handling_stuffing_thc_total_idr: number;
  inspection_total_idr: number;
  export_docs_shtc_msds_total_idr: number;
  customs_clearance_peb_total_idr: number;
  ocean_freight_total_idr: number; // Only for CFR/CIF
  marine_insurance_total_idr: number; // Only for CIF
  other_applicable_idr: number;
  selling_price_per_mt_idr: number;
  incoterm: Incoterm;
}

/**
 * Calculate multi-incoterm export quotation breakdown
 * Ensures zero duplicate charging based on agreed Incoterm
 */
export function calculatePricingBreakdown(
  params: PricingCalculatorParams
): PricingBreakdown {
  const {
    quantity_mt,
    supplier_cost_per_mt_idr,
    packaging_per_mt_idr,
    inland_trucking_total_idr,
    handling_stuffing_thc_total_idr,
    inspection_total_idr,
    export_docs_shtc_msds_total_idr,
    customs_clearance_peb_total_idr,
    ocean_freight_total_idr,
    marine_insurance_total_idr,
    other_applicable_idr,
    selling_price_per_mt_idr,
    incoterm,
  } = params;

  const validQty = Math.max(1, quantity_mt);

  const supplier_cost_idr = supplier_cost_per_mt_idr * validQty;
  const packaging_cost_idr = packaging_per_mt_idr * validQty;
  const inland_trucking_idr = inland_trucking_total_idr;
  const handling_stuffing_thc_idr = handling_stuffing_thc_total_idr;
  const sucofindo_inspection_idr = inspection_total_idr;
  const export_docs_shtc_msds_idr = export_docs_shtc_msds_total_idr;
  const customs_clearance_peb_idr = customs_clearance_peb_total_idr;

  // Ocean freight only applicable for CFR or CIF
  const ocean_freight_idr =
    incoterm === 'CFR' || incoterm === 'CIF' ? ocean_freight_total_idr : 0;

  // Marine insurance only applicable for CIF
  const marine_insurance_idr =
    incoterm === 'CIF' ? marine_insurance_total_idr : 0;

  const total_cogs_idr =
    supplier_cost_idr +
    packaging_cost_idr +
    inland_trucking_idr +
    handling_stuffing_thc_idr +
    sucofindo_inspection_idr +
    export_docs_shtc_msds_idr +
    customs_clearance_peb_idr +
    ocean_freight_idr +
    marine_insurance_idr +
    (other_applicable_idr || 0);

  const sales_revenue_idr = selling_price_per_mt_idr * validQty;
  const { grossProfit, grossMarginPct } = calculateGrossProfitAndMargin(
    sales_revenue_idr,
    total_cogs_idr
  );

  return {
    supplier_cost_idr,
    packaging_cost_idr,
    inland_trucking_idr,
    handling_stuffing_thc_idr,
    sucofindo_inspection_idr,
    export_docs_shtc_msds_idr,
    customs_clearance_peb_idr,
    ocean_freight_idr,
    marine_insurance_idr,
    other_applicable_idr: other_applicable_idr || 0,
    total_cogs_idr,
    sales_revenue_idr,
    gross_profit_idr: grossProfit,
    gross_margin_pct: grossMarginPct,
  };
}

/**
 * Pipeline Coverage Ratio:
 * Total Active Pipeline / Monthly Revenue Target
 * Benchmark: >= 3.0x coverage
 */
export function calculatePipelineCoverage(
  pipelineValue: number,
  monthlyTarget: number
): number {
  if (!monthlyTarget || monthlyTarget <= 0) return 0;
  return Number((pipelineValue / monthlyTarget).toFixed(2));
}

/**
 * Target Achievement Percentage
 */
export function calculateAchievementPercentage(
  actual: number,
  target: number
): number {
  if (!target || target <= 0) return 0;
  return Number(((actual / target) * 100).toFixed(1));
}

/**
 * Potential duplicate buyer detection
 * Compares company name, email domain, or phone
 */
export function detectDuplicateBuyers(
  existingBuyers: Buyer[],
  candidate: { company_name: string; email?: string; phone?: string; id?: string }
): Buyer[] {
  const normalize = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const normTargetCompany = normalize(candidate.company_name);
  if (!normTargetCompany) return [];

  const candidateDomain = candidate.email?.split('@')[1]?.toLowerCase().trim();

  return existingBuyers.filter((b) => {
    if (candidate.id && b.id === candidate.id) return false;

    // Check company name match or high substring match
    const normB = normalize(b.company_name);
    if (normB === normTargetCompany) return true;
    if (
      normB.length > 5 &&
      normTargetCompany.length > 5 &&
      (normB.includes(normTargetCompany) || normTargetCompany.includes(normB))
    ) {
      return true;
    }

    // Check email domain match (exclude generic providers like gmail, yahoo, hotmail)
    const genericDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    if (
      candidateDomain &&
      !genericDomains.includes(candidateDomain) &&
      b.email?.toLowerCase().endsWith(`@${candidateDomain}`)
    ) {
      return true;
    }

    // Check exact phone match
    if (
      candidate.phone &&
      candidate.phone.replace(/[^0-9]/g, '').length >= 8 &&
      b.phone.replace(/[^0-9]/g, '') === candidate.phone.replace(/[^0-9]/g, '')
    ) {
      return true;
    }

    return false;
  });
}
