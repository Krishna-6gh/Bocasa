import { FeeMatrixItem, ProductCategory, PlatformId, GSTSlab } from '../types';

export const INITIAL_FEE_MATRIX: FeeMatrixItem[] = [
  // Electronics
  {
    id: 'amz-elec',
    platform: 'amazon',
    category: 'electronics',
    categoryDisplayName: 'Consumer Electronics & Audio',
    commissionPct: 9.5,
    logisticsFee: 68, // Amazon EasyShip Standard (500g)
    closingFee: 25, // Fixed closing fee for ₹500-₹1000 band
    pickPackFee: 15,
    gstRate: 18,
    notes: 'Amazon referral fee 9.5% on electronics up to ₹1,000 + EasyShip standard.',
    lastUpdated: '2026-03-01',
  },
  {
    id: 'fk-elec',
    platform: 'flipkart',
    category: 'electronics',
    categoryDisplayName: 'Consumer Electronics & Audio',
    commissionPct: 8.0,
    logisticsFee: 62, // Flipkart F-Assured Regional (500g)
    closingFee: 22,
    pickPackFee: 14,
    gstRate: 18,
    notes: 'Flipkart marketplace fee 8.0% + collection fee 2% on prepaid orders.',
    lastUpdated: '2026-02-15',
  },
  {
    id: 'msh-elec',
    platform: 'meesho',
    category: 'electronics',
    categoryDisplayName: 'Consumer Electronics & Audio',
    commissionPct: 2.5, // Ultra-low commission model
    logisticsFee: 52, // Meesho 3PL subsidized freight
    closingFee: 0, // No closing fee on Meesho
    pickPackFee: 0, // Self-packed by seller
    gstRate: 18,
    notes: 'Meesho promotional 2.5% fee on electronics; no closing fee.',
    lastUpdated: '2026-01-20',
  },

  // Apparel & Fashion
  {
    id: 'amz-app',
    platform: 'amazon',
    category: 'apparel',
    categoryDisplayName: 'Apparel & Ethnic Wear',
    commissionPct: 13.5,
    logisticsFee: 65,
    closingFee: 30,
    pickPackFee: 15,
    gstRate: 5, // 5% GST for apparel under ₹1000
    notes: 'Amazon high referral category (13.5%) + returns reserve buffer.',
    lastUpdated: '2026-03-01',
  },
  {
    id: 'fk-app',
    platform: 'flipkart',
    category: 'apparel',
    categoryDisplayName: 'Apparel & Ethnic Wear',
    commissionPct: 12.0,
    logisticsFee: 60,
    closingFee: 25,
    pickPackFee: 12,
    gstRate: 5,
    notes: 'Flipkart 12% category fee + reverse logistics surcharge.',
    lastUpdated: '2026-02-15',
  },
  {
    id: 'msh-app',
    platform: 'meesho',
    category: 'apparel',
    categoryDisplayName: 'Apparel & Ethnic Wear',
    commissionPct: 0.0, // Meesho famously runs 0% commission on apparel!
    logisticsFee: 48,
    closingFee: 0,
    pickPackFee: 0,
    gstRate: 5,
    notes: 'Meesho 0% commission on unbranded apparel to court Tier 2/3 manufacturers.',
    lastUpdated: '2026-01-10',
  },

  // Home & Kitchen
  {
    id: 'amz-home',
    platform: 'amazon',
    category: 'home_kitchen',
    categoryDisplayName: 'Home & Kitchen Essentials',
    commissionPct: 11.0,
    logisticsFee: 78, // Heavier volumetric parcel
    closingFee: 25,
    pickPackFee: 18,
    gstRate: 18,
    notes: 'Volumetric weight applies on bulky kitchenware.',
    lastUpdated: '2026-03-01',
  },
  {
    id: 'fk-home',
    platform: 'flipkart',
    category: 'home_kitchen',
    categoryDisplayName: 'Home & Kitchen Essentials',
    commissionPct: 10.5,
    logisticsFee: 72,
    closingFee: 20,
    pickPackFee: 15,
    gstRate: 18,
    notes: 'Includes packaging validation standards.',
    lastUpdated: '2026-02-15',
  },
  {
    id: 'msh-home',
    platform: 'meesho',
    category: 'home_kitchen',
    categoryDisplayName: 'Home & Kitchen Essentials',
    commissionPct: 0.0, // 0% on home goods
    logisticsFee: 58,
    closingFee: 0,
    pickPackFee: 0,
    gstRate: 18,
    notes: '0% seller commission; platform monetizes via ad catalog promotion.',
    lastUpdated: '2026-01-15',
  },

  // Beauty & Personal Care
  {
    id: 'amz-beauty',
    platform: 'amazon',
    category: 'beauty',
    categoryDisplayName: 'Beauty & Personal Care',
    commissionPct: 10.0,
    logisticsFee: 58,
    closingFee: 20,
    pickPackFee: 12,
    gstRate: 18,
    notes: 'Hazmat check for liquids/sprays applies.',
    lastUpdated: '2026-03-01',
  },
  {
    id: 'fk-beauty',
    platform: 'flipkart',
    category: 'beauty',
    categoryDisplayName: 'Beauty & Personal Care',
    commissionPct: 9.0,
    logisticsFee: 55,
    closingFee: 18,
    pickPackFee: 10,
    gstRate: 18,
    notes: 'Includes shelf-life expiry audit fee.',
    lastUpdated: '2026-02-15',
  },
  {
    id: 'msh-beauty',
    platform: 'meesho',
    category: 'beauty',
    categoryDisplayName: 'Beauty & Personal Care',
    commissionPct: 1.5,
    logisticsFee: 45,
    closingFee: 0,
    pickPackFee: 0,
    gstRate: 18,
    notes: 'Nominal 1.5% tech fee; direct COD courier pickup.',
    lastUpdated: '2026-01-18',
  },

  // Sports & Fitness (Pickleball, Rackets, Gym)
  {
    id: 'amz-sports',
    platform: 'amazon',
    category: 'sports',
    categoryDisplayName: 'Sports & Fitness Equipment',
    commissionPct: 10.0,
    logisticsFee: 75, // Weight/Volumetric parcel for paddles & bag
    closingFee: 25,
    pickPackFee: 15,
    gstRate: 18,
    notes: 'Amazon standard 10% fee on sports goods + oversize handling.',
    lastUpdated: '2026-03-01',
  },
  {
    id: 'fk-sports',
    platform: 'flipkart',
    category: 'sports',
    categoryDisplayName: 'Sports & Fitness Equipment',
    commissionPct: 9.0,
    logisticsFee: 70,
    closingFee: 22,
    pickPackFee: 15,
    gstRate: 18,
    notes: 'Flipkart sports goods referral 9.0% + F-Assured handling.',
    lastUpdated: '2026-02-20',
  },
  {
    id: 'msh-sports',
    platform: 'meesho',
    category: 'sports',
    categoryDisplayName: 'Sports & Fitness Equipment',
    commissionPct: 2.0,
    logisticsFee: 55,
    closingFee: 0,
    pickPackFee: 0,
    gstRate: 18,
    notes: 'Meesho zero-closing sports category rate.',
    lastUpdated: '2026-01-25',
  },
];

/**
 * Deterministic Floor Price Calculator as defined in MarginGuard Blueprint Section 3:
 * Floor = (product cost + platform-specific shipping/logistics + platform-specific commission + GST) + seller's minimum margin.
 *
 * Mathematically:
 * SellingPrice = Floor
 * MarketplaceCommissionAmount = (CommissionPct / 100) * Floor
 * GST on Product/Service = GSTAmount
 * Total Expenses = LandedCost + LogisticsFee + ClosingFee + PickPackFee + (CommissionPct/100 * Floor) + GST + MinMargin
 *
 * Solving for Floor Price where Floor = LandedCost + Logistics + Closing + PickPack + (CommissionPct/100 * Floor) + (GST / (100+GST) * Floor) + MinMargin:
 * Or solving transparently with the standard Indian marketplace net payout formula:
 * Net Payout to Seller = SellingPrice - MarketplaceFees(comm% * Price + closing + logistics) - 18% GST on marketplace fees.
 * For true floor: Seller Net Payout MUST EQUAL LandedCost + MinMargin!
 */
export function calculatePlatformFloor(
  landedCost: number,
  minMargin: number,
  feeItem: FeeMatrixItem
): {
  floorPrice: number;
  breakdown: {
    landedCost: number;
    logisticsFee: number;
    closingFee: number;
    pickPackFee: number;
    commissionPct: number;
    estimatedCommissionAmt: number;
    gstOnMarketplaceFees: number;
    productGstEstimate: number;
    minMargin: number;
    totalPlatformFloor: number;
    effectiveNetMarginPct: number;
  };
} {
  const fixedOverheads = feeItem.logisticsFee + feeItem.closingFee + feeItem.pickPackFee;
  // 18% GST is levied by platforms on their commission and logistics services in India (Marketplace GST)
  const gstOnServicesFactor = 0.18;
  const effectiveCommissionRate = (feeItem.commissionPct / 100) * (1 + gstOnServicesFactor);
  
  // Cost needed before variable commission:
  const baseRequired = landedCost + minMargin + fixedOverheads * (1 + gstOnServicesFactor);
  
  // Floor Price = BaseRequired / (1 - EffectiveCommissionRate)
  const calculatedFloor = Math.ceil(baseRequired / (1 - effectiveCommissionRate));
  
  const estimatedCommissionAmt = Math.round((feeItem.commissionPct / 100) * calculatedFloor);
  const gstOnMarketplaceFees = Math.round((fixedOverheads + estimatedCommissionAmt) * gstOnServicesFactor);
  const productGstEstimate = Math.round((calculatedFloor * feeItem.gstRate) / (100 + feeItem.gstRate));
  
  const effectiveNetMarginPct = Math.round((minMargin / calculatedFloor) * 1000) / 10;

  return {
    floorPrice: calculatedFloor,
    breakdown: {
      landedCost,
      logisticsFee: feeItem.logisticsFee,
      closingFee: feeItem.closingFee,
      pickPackFee: feeItem.pickPackFee,
      commissionPct: feeItem.commissionPct,
      estimatedCommissionAmt,
      gstOnMarketplaceFees,
      productGstEstimate,
      minMargin,
      totalPlatformFloor: calculatedFloor,
      effectiveNetMarginPct,
    },
  };
}
