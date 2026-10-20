import { describe, it, expect } from 'vitest';
import {
  calculateWeightedPipeline,
  calculateUnweightedPipeline,
  calculateGrossProfitAndMargin,
  calculatePricingBreakdown,
  calculatePipelineCoverage,
  calculateAchievementPercentage,
  convertCurrency,
  detectDuplicateBuyers,
  DEFAULT_EXCHANGE_RATES,
} from '../lib/calculations';
import type { Opportunity, Buyer } from '../types';

describe('Business Calculation Tests - PT Global Expor Indonesia', () => {
  it('correctly calculates weighted pipeline based on probability', () => {
    const opps: Partial<Opportunity>[] = [
      {
        id: '1',
        stage: 'negotiation',
        est_order_value_idr: 100_000_000,
        probability: 70, // 70M
      },
      {
        id: '2',
        stage: 'quotation_sent',
        est_order_value_idr: 50_000_000,
        probability: 40, // 20M
      },
      {
        id: '3',
        stage: 'closed_won',
        est_order_value_idr: 150_000_000,
        probability: 100, // Should be excluded from open pipeline
      },
      {
        id: '4',
        stage: 'closed_lost',
        est_order_value_idr: 80_000_000,
        probability: 0, // Should be excluded
      },
    ];

    const weighted = calculateWeightedPipeline(opps as Opportunity[]);
    expect(weighted).toBe(90_000_000); // 70M + 20M

    const unweighted = calculateUnweightedPipeline(opps as Opportunity[]);
    expect(unweighted).toBe(150_000_000); // 100M + 50M
  });

  it('correctly computes gross profit and margin with zero-division safeguard', () => {
    const { grossProfit, grossMarginPct } = calculateGrossProfitAndMargin(
      100_000_000,
      75_000_000
    );
    expect(grossProfit).toBe(25_000_000);
    expect(grossMarginPct).toBe(25.0);

    // Safeguard on zero revenue
    const zeroTest = calculateGrossProfitAndMargin(0, 5000);
    expect(zeroTest.grossProfit).toBe(0);
    expect(zeroTest.grossMarginPct).toBe(0);
  });

  it('correctly calculates multi-incoterm export pricing breakdown', () => {
    const baseParams = {
      quantity_mt: 18, // 1x20ft FCL container
      supplier_cost_per_mt_idr: 14_000_000, // 252M
      packaging_per_mt_idr: 1_000_000, // 18M
      inland_trucking_total_idr: 6_000_000,
      handling_stuffing_thc_total_idr: 4_000_000,
      inspection_total_idr: 2_500_000, // Sucofindo
      export_docs_shtc_msds_total_idr: 3_500_000,
      customs_clearance_peb_total_idr: 2_000_000,
      ocean_freight_total_idr: 25_000_000,
      marine_insurance_total_idr: 2_000_000,
      other_applicable_idr: 0,
      selling_price_per_mt_idr: 20_000_000, // 360M revenue
    };

    // Test FOB (excludes ocean freight and insurance)
    const fobBreakdown = calculatePricingBreakdown({
      ...baseParams,
      incoterm: 'FOB',
    });
    expect(fobBreakdown.ocean_freight_idr).toBe(0);
    expect(fobBreakdown.marine_insurance_idr).toBe(0);
    expect(fobBreakdown.sales_revenue_idr).toBe(360_000_000);
    expect(fobBreakdown.total_cogs_idr).toBe(
      252_000_000 + 18_000_000 + 6_000_000 + 4_000_000 + 2_500_000 + 3_500_000 + 2_000_000
    );
    expect(fobBreakdown.gross_profit_idr).toBe(
      360_000_000 - fobBreakdown.total_cogs_idr
    );

    // Test CIF (includes ocean freight and marine insurance)
    const cifBreakdown = calculatePricingBreakdown({
      ...baseParams,
      incoterm: 'CIF',
    });
    expect(cifBreakdown.ocean_freight_idr).toBe(25_000_000);
    expect(cifBreakdown.marine_insurance_idr).toBe(2_000_000);
  });

  it('calculates pipeline coverage ratio and target achievement %', () => {
    expect(calculatePipelineCoverage(450_000_000, 150_000_000)).toBe(3.0);
    expect(calculateAchievementPercentage(120_000_000, 150_000_000)).toBe(80.0);
    expect(calculateAchievementPercentage(0, 0)).toBe(0);
  });

  it('accurately converts currency between IDR, USD, and EUR', () => {
    const usdToIdr = convertCurrency(1000, 'USD', 'IDR', DEFAULT_EXCHANGE_RATES);
    expect(usdToIdr).toBe(16_250_000);

    const idrToUsd = convertCurrency(16_250_000, 'IDR', 'USD', DEFAULT_EXCHANGE_RATES);
    expect(idrToUsd).toBe(1000);
  });

  it('detects potential duplicate buyers by company name and domain', () => {
    const buyers: Partial<Buyer>[] = [
      {
        id: 'b1',
        company_name: 'Al-Madina Charcoal Trading LLC',
        email: 'sales@almadinacharcoal.ae',
        phone: '+971501234567',
      },
    ];

    const dupByName = detectDuplicateBuyers(buyers as Buyer[], {
      company_name: 'al madina charcoal trading',
    });
    expect(dupByName.length).toBe(1);

    const dupByDomain = detectDuplicateBuyers(buyers as Buyer[], {
      company_name: 'Different Name Corp',
      email: 'purchasing@almadinacharcoal.ae',
    });
    expect(dupByDomain.length).toBe(1);

    const uniqueBuyer = detectDuplicateBuyers(buyers as Buyer[], {
      company_name: 'Tokyo Gourmet Imports',
      email: 'info@tokyogourmet.jp',
    });
    expect(uniqueBuyer.length).toBe(0);
  });
});
