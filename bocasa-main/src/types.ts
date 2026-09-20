export type PlatformId = 'amazon' | 'flipkart' | 'meesho';

export type ProductCategory = 
  | 'electronics' 
  | 'apparel' 
  | 'home_kitchen' 
  | 'beauty' 
  | 'footwear'
  | 'sports';

export type GSTSlab = 0 | 5 | 12 | 18 | 28;

export interface FeeMatrixItem {
  id: string;
  platform: PlatformId;
  category: ProductCategory;
  categoryDisplayName: string;
  commissionPct: number; // e.g. 9.5 for 9.5%
  logisticsFee: number; // Fixed/Weight-based shipping charge in INR
  closingFee: number; // Marketplace fixed closing/transaction fee in INR
  pickPackFee: number; // Warehouse handling fee in INR
  gstRate: GSTSlab;
  notes: string;
  lastUpdated: string;
}

export interface CompetitorItem {
  platform: PlatformId;
  url: string;
  competitorName: string;
  currentPrice: number;
  mrp: number;
  inStock: boolean;
  fulfillment: string; // 'FBA' | 'F-Assured' | 'Seller-Ship' | 'Meesho Direct'
  lastScraped: string;
  sellerRating: number;
  priceHistory: { timestamp: string; price: number }[];
}

export interface ProductSKU {
  id: string;
  sku: string;
  title: string;
  category: ProductCategory;
  landedCost: number; // Ex-factory / procurement landed cost (INR)
  minMargin: number; // Absolute minimum profit target seller demands (INR)
  targetMargin: number; // Desired margin during normal demand (INR)
  mrp: number;
  salesTier: 'tier1_fast' | 'tier2_standard'; // 1-2h polling vs 1-2x/day
  currentSellingPrices: Record<PlatformId, number>;
  competitors: Record<PlatformId, CompetitorItem>;
  fsn?: string; // Flipkart Serial Number
  asin?: string; // Amazon ASIN
  meeshoPid?: string; // Meesho Product ID
  brand?: string;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  galleryImages?: string[];
  styles?: string[];
  highestPrice?: number;
  lowestPrice?: number;
  avgPrice?: number;
  festivePrice?: number;
  primeDayPrice?: number;
  competitorsList?: CompetitorTracked[];
  priceHistory30d?: HistoricalPricePoint[];
}

export interface CompetitorTracked {
  name: string;
  behaviour: 'undercutter' | 'flaky' | 'festival' | 'stable' | 'aggressive';
  price: number;
  stockStatus: 'in_stock' | 'out_of_stock';
  platform?: PlatformId;
  url?: string;
  color?: string;
}

export interface HistoricalPricePoint {
  date: string; // e.g. "20 Aug", "27 Sept"
  fullDate?: string;
  timestamp?: string;
  yourPrice: number; // MarginGuard price
  naivePrice: number; // Naive auto-match repricer
  floorPrice: number; // True floor (loss zone below)
  competitor1Price: number; // Top competitor (e.g. Sneha Fashion)
  competitor2Price?: number; // Competitor 2 (e.g. Jaipur Kurti House)
  competitor3Price?: number; // Competitor 3 (e.g. TrendyWear)
  // Dual-Axis Price Gap metrics relative to calculated floor:
  priceGapFloor?: number; // Your Price minus Floor Price (₹)
  comp1GapFloor?: number; // Competitor 1 Price minus Floor Price (₹)
  naiveGapFloor?: number; // Naive Repricer minus Floor Price (₹)
  gapPctFloor?: number; // Your price margin percentage above floor (%)
  compSpread?: number; // Price difference vs top competitor (₹)
}

export interface FloorBreakdown {
  platform: PlatformId;
  landedCost: number;
  logisticsFee: number;
  closingFee: number;
  commissionPct: number;
  commissionAmount: number;
  gstAmount: number;
  minMargin: number;
  totalFloor: number;
  effectiveGrossMarginPct: number;
}

export type DecisionAction = 
  | 'HOLD_AT_FLOOR' 
  | 'MATCH' 
  | 'UNDERCUT' 
  | 'DEMAND_SURGE_BOOST' 
  | 'COMPETITOR_OOS_BOOST';

export interface DecisionResult {
  platform: PlatformId;
  recommendedPrice: number;
  currentPrice: number;
  competitorPrice: number;
  floorPrice: number;
  action: DecisionAction;
  actionTitle: string;
  explanation: string;
  explanationSource: 'gemini-3.8-flash' | 'deterministic_rules' | 'fallback';
  demandScore: number;
  diffFromFloor: number;
  marginPreserved: number;
  flagCompetitor: boolean;
}

export interface FestivalEvent {
  id: string;
  name: string;
  nameHindi?: string;
  startDate: string;
  endDate: string;
  platforms: PlatformId[];
  demandMultiplier: number;
  categoryImpact: ProductCategory[];
  description: string;
}

export interface DemandState {
  googleTrendsScore: number; // 0-100
  activeFestival: FestivalEvent | null;
  seasonalityIndex: number; // 0.8 to 1.4
  competitorOutOfStock: boolean;
  compositeDemandScore: number; // 0-100
}

export interface AutoRepricingSettings {
  enabled: boolean;
  frequencyMinutes: number; // e.g., 60 for 1 hour
  maxDailyPriceChangePct: number; // e.g., 10 for 10% max daily price change guardrail
  minProfitMarginINR: number; // safety net: absolute minimum profit required across all repricing
  platformsEnabled: {
    amazon: boolean;
    flipkart: boolean;
    meesho: boolean;
  };
  dryRunMode: boolean; // if true, simulates dispatches without sending live API calls
  lastRunTimestamp?: string;
  totalRepriceCount: number;
}

export interface RepriceLogItem {
  id: string;
  timestamp: string;
  productId: string;
  productSku: string;
  productTitle: string;
  platform: PlatformId;
  oldPrice: number;
  newPrice: number;
  changePct: number;
  floorPrice: number;
  competitorPrice: number;
  decisionAction: DecisionAction;
  explanation: string;
  status: 'SUCCESS' | 'GUARDRAIL_BLOCKED' | 'FAILED';
  guardrailNote?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: string;
}

export type SystemTab = 
  | 'price_compare'
  | 'traces_handoff'
  | 'seller_dashboard'
  | 'fee_management'
  | 'auto_pricing'
  | 'ai_chat'
  | 'architecture' 
  | 'collector' 
  | 'cost_floor' 
  | 'decision' 
  | 'distribution' 
  | 'demand' 
  | 'tech_stack' 
  | 'roadmap'
  | 'settings';
