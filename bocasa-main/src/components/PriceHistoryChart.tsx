import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { 
  ExternalLink, 
  Zap,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Activity,
  SlidersHorizontal,
  ChevronRight,
  TrendingDown,
  ShieldAlert,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { ProductSKU, PlatformId, FeeMatrixItem } from '../types';
import { 
  getCompetitorsForProduct, 
  generate30DayPriceHistory, 
  generateZoomedTickHistory 
} from '../utils/priceHistoryGenerator';
import { calculatePlatformFloor } from '../data/defaultFeeMatrix';

interface PriceHistoryChartProps {
  product: ProductSKU;
  feeMatrix: FeeMatrixItem[];
  defaultPlatform?: PlatformId;
  onSwitchPlatform?: (platform: PlatformId) => void;
  className?: string;
}

export type ChartAxisMode = 'dual_axis_inr' | 'dual_axis_pct' | 'price_only';

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  product,
  feeMatrix,
  defaultPlatform = 'meesho',
  onSwitchPlatform,
  className = '',
}) => {
  // Current active platform for competitor perspective
  const [platform, setPlatform] = useState<PlatformId>(
    product.id === 'sku-kurti-02' ? 'meesho' : defaultPlatform
  );

  // Sync platform when defaultPlatform prop changes
  React.useEffect(() => {
    if (defaultPlatform) {
      setPlatform(defaultPlatform);
    }
  }, [defaultPlatform]);

  // Timeframe selector: 30 days (default), 7 days, or 2.25 days (screenshot tick view)
  const [timeRange, setTimeRange] = useState<'30d' | '7d' | '2.25d'>('30d');

  // Dual-Axis Chart Display Modes
  const [axisMode, setAxisMode] = useState<ChartAxisMode>('dual_axis_inr');

  // Toggle visual threshold highlight bands & secondary competitor gap
  const [showThresholdBands, setShowThresholdBands] = useState<boolean>(true);
  const [showCompGapLine, setShowCompGapLine] = useState<boolean>(true);

  // Competitor metadata
  const competitors = useMemo(() => getCompetitorsForProduct(product), [product]);
  const comp1 = competitors[0] || { name: 'Top Competitor', behaviour: 'undercutter', price: 379, stockStatus: 'in_stock', color: '#f59e0b' };
  const comp2 = competitors[1] || { name: 'Secondary Rival', behaviour: 'flaky', price: 409, stockStatus: 'in_stock', color: '#8b5cf6' };
  const comp3 = competitors[2] || { name: 'Marketplace Seller', behaviour: 'festival', price: 469, stockStatus: 'in_stock', color: '#0ea5e9' };

  // Calculate platform floor price
  const feeItem = feeMatrix.find((f) => f.platform === platform && f.category === product.category) || feeMatrix[0];
  const floorCalc = calculatePlatformFloor(product.landedCost, product.minMargin, feeItem);
  const floorPrice = product.id === 'sku-kurti-02' ? 418 : floorCalc.floorPrice;

  // Threshold definitions relative to calculated floor
  const minMarginTarget = product.minMargin || 50;
  const targetMarginTarget = product.targetMargin || 120;

  // Generate base historical data
  const rawChartData = useMemo(() => {
    if (timeRange === '2.25d') {
      return generateZoomedTickHistory(product, floorPrice, platform);
    }
    const full30 = generate30DayPriceHistory(product, floorPrice, platform);
    if (timeRange === '7d') {
      return full30.slice(-7);
    }
    return full30; // 30 days
  }, [product, floorPrice, platform, timeRange]);

  // Enrich data points with dual-axis 'Price Gap' metrics relative to calculated floor
  const chartData = useMemo(() => {
    return rawChartData.map((d) => {
      const yourGapINR = d.yourPrice - floorPrice;
      const comp1GapINR = d.competitor1Price - floorPrice;
      const naiveGapINR = d.naivePrice - floorPrice;
      
      const yourGapPct = floorPrice > 0 ? Number(((yourGapINR / floorPrice) * 100).toFixed(1)) : 0;
      const comp1GapPct = floorPrice > 0 ? Number(((comp1GapINR / floorPrice) * 100).toFixed(1)) : 0;
      const naiveGapPct = floorPrice > 0 ? Number(((naiveGapINR / floorPrice) * 100).toFixed(1)) : 0;
      const compSpread = d.yourPrice - d.competitor1Price;

      // Price Gap threshold classification
      let yourZone: 'safe' | 'caution' | 'danger' = 'safe';
      if (yourGapINR < 0) {
        yourZone = 'danger';
      } else if (yourGapINR < minMarginTarget) {
        yourZone = 'caution';
      } else {
        yourZone = 'safe';
      }

      let comp1Zone: 'safe' | 'caution' | 'danger' = 'safe';
      if (comp1GapINR < 0) {
        comp1Zone = 'danger';
      } else if (comp1GapINR < minMarginTarget) {
        comp1Zone = 'caution';
      } else {
        comp1Zone = 'safe';
      }

      return {
        ...d,
        yourGapINR,
        comp1GapINR,
        naiveGapINR,
        yourGapPct,
        comp1GapPct,
        naiveGapPct,
        compSpread,
        yourZone,
        comp1Zone,
      };
    });
  }, [rawChartData, floorPrice, minMarginTarget]);

  // Determine Left Y-axis (Price ₹) min/max dynamically
  const { minY, maxY } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    chartData.forEach((d) => {
      min = Math.min(min, d.yourPrice, d.naivePrice, d.floorPrice, d.competitor1Price, d.competitor2Price || Infinity, d.competitor3Price || Infinity);
      max = Math.max(max, d.yourPrice, d.naivePrice, d.floorPrice, d.competitor1Price, d.competitor2Price || -Infinity, d.competitor3Price || -Infinity);
    });

    const paddedMin = Math.max(0, Math.floor((min * 0.92) / 10) * 10);
    const paddedMax = Math.ceil((max * 1.06) / 10) * 10;
    return { minY: paddedMin, maxY: paddedMax };
  }, [chartData]);

  // Determine Right Y-axis (Price Gap to Floor) min/max dynamically
  const { minGapY, maxGapY, minGapPctY, maxGapPctY } = useMemo(() => {
    let minGap = 0;
    let maxGap = 0;
    let minPct = 0;
    let maxPct = 0;

    chartData.forEach((d) => {
      minGap = Math.min(minGap, d.yourGapINR, d.comp1GapINR, d.naiveGapINR);
      maxGap = Math.max(maxGap, d.yourGapINR, d.comp1GapINR, d.naiveGapINR);

      minPct = Math.min(minPct, d.yourGapPct, d.comp1GapPct, d.naiveGapPct);
      maxPct = Math.max(maxPct, d.yourGapPct, d.comp1GapPct, d.naiveGapPct);
    });

    // Add safe headroom to keep zero and thresholds distinct
    const paddedMinGap = Math.min(-30, Math.floor(minGap * 1.25));
    const paddedMaxGap = Math.max(targetMarginTarget + 40, Math.ceil(maxGap * 1.2));

    const paddedMinPct = Math.min(-10, Math.floor(minPct * 1.25));
    const paddedMaxPct = Math.max(25, Math.ceil(maxPct * 1.2));

    return {
      minGapY: paddedMinGap,
      maxGapY: paddedMaxGap,
      minGapPctY: paddedMinPct,
      maxGapPctY: paddedMaxPct,
    };
  }, [chartData, targetMarginTarget]);

  // Latest historical data point for operational decision KPIs
  const latestPoint = chartData[chartData.length - 1] || chartData[0];
  const latestYourPrice = latestPoint?.yourPrice ?? product.currentSellingPrices[platform];
  const latestYourGap = latestPoint?.yourGapINR ?? 0;
  const latestYourGapPct = latestPoint?.yourGapPct ?? 0;
  const latestComp1Price = latestPoint?.competitor1Price ?? comp1.price;
  const latestComp1Gap = latestPoint?.comp1GapINR ?? (latestComp1Price - floorPrice);
  const latestComp1GapPct = latestPoint?.comp1GapPct ?? (floorPrice > 0 ? Number((((latestComp1Price - floorPrice) / floorPrice) * 100).toFixed(1)) : 0);

  // Platform switch logic
  const handlePlatformToggle = () => {
    const nextPlatform: PlatformId = platform === 'meesho' ? 'flipkart' : (platform === 'flipkart' ? 'amazon' : 'meesho');
    setPlatform(nextPlatform);
    if (onSwitchPlatform) onSwitchPlatform(nextPlatform);
  };

  const nextPlatformName = platform === 'meesho' ? 'Flipkart' : (platform === 'flipkart' ? 'Amazon' : 'Meesho');
  const displayTitle = product.id === 'sku-kurti-02' ? 'Cotton Printed Kurti' : (product.title.length > 38 ? `${product.title.slice(0, 36)}...` : product.title);

  // Threshold values converted for current axis mode (INR vs %)
  const minMarginThreshold = axisMode === 'dual_axis_pct' 
    ? (floorPrice > 0 ? Number(((minMarginTarget / floorPrice) * 100).toFixed(0)) : 10)
    : minMarginTarget;

  const targetMarginThreshold = axisMode === 'dual_axis_pct' 
    ? (floorPrice > 0 ? Number(((targetMarginTarget / floorPrice) * 100).toFixed(0)) : 25)
    : targetMarginTarget;

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* 1. Header Bar: Title + Platform Badge + Switch Link */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {displayTitle}
          </h2>
          
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            {(['amazon', 'flipkart', 'meesho'] as PlatformId[]).map((p) => {
              const isSelected = platform === p;
              const name = p === 'amazon' ? 'Amazon' : p === 'flipkart' ? 'Flipkart' : 'Meesho';
              const price = product.currentSellingPrices[p];
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPlatform(p);
                    if (onSwitchPlatform) onSwitchPlatform(p);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                    isSelected
                      ? p === 'amazon'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : p === 'flipkart'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title={`View price trajectory on ${name}`}
                >
                  <span>{name}</span>
                  {price ? <span className="font-mono text-[10px] opacity-90">₹{price}</span> : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* View Mode and Timeframe Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dual-Axis Mode Selector */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700 text-xs font-semibold">
            <button
              id="chart-mode-dual-inr-btn"
              onClick={() => setAxisMode('dual_axis_inr')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                axisMode === 'dual_axis_inr'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Dual-axis with Price on Left and Price Gap to Floor (₹) on Right"
            >
              Dual-Axis (₹ Gap)
            </button>
            <button
              id="chart-mode-dual-pct-btn"
              onClick={() => setAxisMode('dual_axis_pct')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                axisMode === 'dual_axis_pct'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Dual-axis with Price on Left and Margin Buffer (%) on Right"
            >
              Dual-Axis (% Gap)
            </button>
            <button
              id="chart-mode-price-only-btn"
              onClick={() => setAxisMode('price_only')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                axisMode === 'price_only'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Single-axis Price Trend"
            >
              Price Only
            </button>
          </div>

          {/* Timeframe selector: 30 Days / 7 Days / 2.25 Days */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700 text-xs font-semibold">
            <button
              id="chart-range-30d-btn"
              onClick={() => setTimeRange('30d')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeRange === '30d'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              30 Days
            </button>
            <button
              id="chart-range-7d-btn"
              onClick={() => setTimeRange('7d')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeRange === '7d'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              7 Days
            </button>
            <button
              id="chart-range-2d-btn"
              onClick={() => setTimeRange('2.25d')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeRange === '2.25d'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              2.25 Days (6h)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Visual Decision-Making KPI Cards: Price Gap & Floor Threshold Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        
        {/* KPI 1: Active MarginGuard Price Gap to Floor */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Your Price Gap to Floor
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center space-x-1 ${
              latestYourGap >= minMarginTarget
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : latestYourGap >= 0
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}>
              <ShieldCheck className="w-3 h-3" />
              <span>
                {latestYourGap >= minMarginTarget ? 'Optimal Buffer' : (latestYourGap >= 0 ? 'Tight Margin' : 'Floor Breach')}
              </span>
            </span>
          </div>

          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
              {latestYourGap >= 0 ? `+₹${latestYourGap}` : `-₹${Math.abs(latestYourGap)}`}
            </span>
            <span className="text-xs font-semibold font-mono text-slate-500 dark:text-slate-400">
              ({latestYourGapPct >= 0 ? `+${latestYourGapPct}%` : `${latestYourGapPct}%`})
            </span>
          </div>

          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
            Selling at <strong className="text-slate-900 dark:text-slate-100">₹{latestYourPrice}</strong> maintains a <strong className="text-emerald-600 dark:text-emerald-400">₹{latestYourGap}</strong> safe buffer above break-even floor (<strong className="text-rose-600">₹{floorPrice}</strong>).
          </p>
        </div>

        {/* KPI 2: Top Competitor Price Gap to Your Floor */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[170px]" title={comp1.name}>
              {comp1.name} Gap to Floor
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center space-x-1 ${
              latestComp1Gap < 0
                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}>
              {latestComp1Gap < 0 ? <ShieldAlert className="w-3 h-3 text-rose-600" /> : <Activity className="w-3 h-3" />}
              <span>{latestComp1Gap < 0 ? 'Predatory Sub-Floor' : 'Above Cost Floor'}</span>
            </span>
          </div>

          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-2xl font-black font-mono tracking-tight ${
              latestComp1Gap < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
            }`}>
              {latestComp1Gap >= 0 ? `+₹${latestComp1Gap}` : `-₹${Math.abs(latestComp1Gap)}`}
            </span>
            <span className="text-xs font-semibold font-mono text-slate-500 dark:text-slate-400">
              ({latestComp1GapPct >= 0 ? `+${latestComp1GapPct}%` : `${latestComp1GapPct}%`})
            </span>
          </div>

          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
            {latestComp1Gap < 0 ? (
              <>
                Rival is selling at <strong className="text-slate-900 dark:text-slate-100">₹{latestComp1Price}</strong> (<strong className="text-rose-600">₹{Math.abs(latestComp1Gap)} below your floor</strong>). Following burns capital on every order.
              </>
            ) : (
              <>
                Rival is priced at <strong className="text-slate-900 dark:text-slate-100">₹{latestComp1Price}</strong>, leaving an open arbitrage window.
              </>
            )}
          </p>
        </div>

        {/* KPI 3: Algorithmic Guardrail Verdict */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Decision Engine Verdict
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Auto-Protected
            </span>
          </div>

          <div className="mt-2">
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                {latestComp1Gap < 0 ? 'HOLD CEILING AT SAFE FLOOR' : 'COMPETITIVE SPREAD ENGAGED'}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
              {latestComp1Gap < 0 ? (
                <>
                  Naive repricer dropped to <span className="font-mono font-bold text-rose-600">₹{latestPoint.naivePrice}</span>. Bocasa prevented following, defending <strong className="text-emerald-600">₹{floorPrice - latestComp1Price}/unit</strong> margin.
                </>
              ) : (
                <>
                  Your price of <span className="font-mono font-bold text-emerald-600">₹{latestYourPrice}</span> captures the Buy Box while exceeding the ₹{minMarginTarget} minimum profit buffer.
                </>
              )}
            </p>
          </div>
        </div>

      </div>

      {/* 3. Main Dual-Axis Price History & Price Gap Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        
        {/* Card Header with Axis Indicators & Threshold Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {axisMode === 'price_only' 
                  ? 'Historical Price Movement' 
                  : 'Dual-Axis Price Comparison & Floor Gap Analysis'}
              </h3>
              {axisMode !== 'price_only' && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 font-mono">
                  Dual-Axis Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {axisMode !== 'price_only' ? (
                <>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Left Axis:</span> Selling Price (₹) &nbsp;·&nbsp;
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Right Axis:</span> {axisMode === 'dual_axis_pct' ? 'Margin Buffer (% above floor)' : 'Price Gap to Calculated Floor (₹)'}
                </>
              ) : (
                'Tracking daily competitor pricing, naive auto-repricer behavior, and True Floor bounds'
              )}
            </p>
          </div>

          {/* Interactive Visual Threshold Toggles */}
          {axisMode !== 'price_only' && (
            <div className="flex items-center space-x-2 text-xs">
              <button
                id="toggle-threshold-bands-btn"
                onClick={() => setShowThresholdBands(!showThresholdBands)}
                className={`px-2.5 py-1 rounded-lg border transition-all flex items-center space-x-1.5 cursor-pointer ${
                  showThresholdBands
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {showThresholdBands ? <Eye className="w-3.5 h-3.5 text-blue-500" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Threshold Bands</span>
              </button>

              <button
                id="toggle-comp-gap-line-btn"
                onClick={() => setShowCompGapLine(!showCompGapLine)}
                className={`px-2.5 py-1 rounded-lg border transition-all flex items-center space-x-1.5 cursor-pointer ${
                  showCompGapLine
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-amber-500" />
                <span>Rival Gap Line</span>
              </button>
            </div>
          )}
        </div>

        {/* Recharts Dual-Axis Composed Chart */}
        <div className="w-full h-84 sm:h-96 relative -ml-2 sm:ml-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: axisMode !== 'price_only' ? 55 : 20, left: 10, bottom: 5 }}
            >
              <defs>
                {/* Emerald Gradient for MarginGuard Price Gap Buffer (Right Axis) */}
                <linearGradient id="bufferGapGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.28} />
                  <stop offset="60%" stopColor="#10b981" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.02} />
                </linearGradient>

                {/* Red Gradient for Sub-Floor Loss Zone (Left Axis) */}
                <linearGradient id="lossZoneGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.08} />
                </linearGradient>
              </defs>

              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="#e2e8f0" 
                className="dark:stroke-slate-800" 
              />

              {/* X-Axis: Date or Timestamp */}
              <XAxis
                dataKey={timeRange === '2.25d' ? 'timestamp' : 'date'}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={timeRange === '30d' ? 4 : (timeRange === '7d' ? 0 : 2)}
              />

              {/* PRIMARY LEFT Y-AXIS: Selling Price (₹) */}
              <YAxis
                yAxisId="left"
                domain={[minY, maxY]}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                tickFormatter={(val) => `₹${val}`}
                width={52}
              />

              {/* SECONDARY RIGHT Y-AXIS: Price Gap to Floor (₹ or %) */}
              {axisMode !== 'price_only' && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={axisMode === 'dual_axis_pct' ? [minGapPctY, maxGapPctY] : [minGapY, maxGapY]}
                  tickLine={false}
                  axisLine={{ stroke: '#10b981' }}
                  tick={{ fill: '#059669', fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(val) => axisMode === 'dual_axis_pct' 
                    ? `${val > 0 ? '+' : ''}${val}%` 
                    : `${val > 0 ? '+' : ''}₹${val}`
                  }
                  width={56}
                />
              )}

              {/* ============================================================== */}
              {/* THRESHOLD VISUALIZATIONS RELATIVE TO CALCULATED FLOOR          */}
              {/* ============================================================== */}

              {/* Left Axis: Shaded Loss Zone underneath Calculated True Floor */}
              <ReferenceArea
                yAxisId="left"
                y1={minY}
                y2={floorPrice}
                fill="#fecaca"
                fillOpacity={0.25}
                className="dark:fill-rose-950/30"
              />

              {/* Left Axis: True Floor Horizontal Line */}
              <ReferenceLine
                yAxisId="left"
                y={floorPrice}
                stroke="#dc2626"
                strokeDasharray="4 4"
                strokeWidth={1.8}
              />

              {/* Right Axis: Price Gap Threshold Highlights (Dual-Axis Mode) */}
              {axisMode !== 'price_only' && showThresholdBands && (
                <>
                  {/* Threshold Zone 1: Critical Loss Breach (< 0) */}
                  <ReferenceArea
                    yAxisId="right"
                    y1={axisMode === 'dual_axis_pct' ? minGapPctY : minGapY}
                    y2={0}
                    fill="#fee2e2"
                    fillOpacity={0.25}
                    className="dark:fill-rose-950/40"
                  />

                  {/* Threshold Zone 2: Tight Margin Alert Zone (0 to minMargin) */}
                  <ReferenceArea
                    yAxisId="right"
                    y1={0}
                    y2={minMarginThreshold}
                    fill="#fef3c7"
                    fillOpacity={0.20}
                    className="dark:fill-amber-950/30"
                  />

                  {/* Threshold Zone 3: Optimal Margin Zone (minMargin to Top) */}
                  <ReferenceArea
                    yAxisId="right"
                    y1={minMarginThreshold}
                    y2={axisMode === 'dual_axis_pct' ? maxGapPctY : maxGapY}
                    fill="#d1fae5"
                    fillOpacity={0.10}
                    className="dark:fill-emerald-950/20"
                  />
                </>
              )}

              {/* Right Axis: Horizontal Reference Threshold Lines */}
              {axisMode !== 'price_only' && (
                <>
                  {/* Zero-Gap Floor Threshold (Break-Even) */}
                  <ReferenceLine
                    yAxisId="right"
                    y={0}
                    stroke="#dc2626"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: 'Floor (₹0 Gap)',
                      position: 'insideRight',
                      fill: '#dc2626',
                      fontSize: 10,
                      fontWeight: 700,
                      offset: 6,
                    }}
                  />

                  {/* Min Margin Guardrail Threshold */}
                  <ReferenceLine
                    yAxisId="right"
                    y={minMarginThreshold}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                    label={{
                      value: `Min Margin (+${axisMode === 'dual_axis_pct' ? minMarginThreshold + '%' : '₹' + minMarginThreshold})`,
                      position: 'insideRight',
                      fill: '#d97706',
                      fontSize: 10,
                      fontWeight: 600,
                      offset: 6,
                    }}
                  />

                  {/* Target Margin Threshold */}
                  <ReferenceLine
                    yAxisId="right"
                    y={targetMarginThreshold}
                    stroke="#059669"
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                    label={{
                      value: `Target Margin (+${axisMode === 'dual_axis_pct' ? targetMarginThreshold + '%' : '₹' + targetMarginThreshold})`,
                      position: 'insideRight',
                      fill: '#059669',
                      fontSize: 10,
                      fontWeight: 600,
                      offset: 6,
                    }}
                  />
                </>
              )}

              {/* Rich Dual-Axis Tooltip */}
              <Tooltip 
                content={
                  <CustomPriceTooltip 
                    floorPrice={floorPrice} 
                    minMarginTarget={minMarginTarget}
                    comp1Name={comp1.name} 
                    comp2Name={comp2.name} 
                    comp3Name={comp3.name}
                    axisMode={axisMode}
                  />
                } 
              />

              {/* ============================================================== */}
              {/* SERIES 1: RIGHT Y-AXIS (PRICE GAP / MARGIN BUFFER TO FLOOR)    */}
              {/* ============================================================== */}
              {axisMode !== 'price_only' && (
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey={axisMode === 'dual_axis_pct' ? 'yourGapPct' : 'yourGapINR'}
                  name="Your Margin Buffer to Floor"
                  fill="url(#bufferGapGradient)"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#059669', stroke: '#ffffff', strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: '#059669' }}
                />
              )}

              {axisMode !== 'price_only' && showCompGapLine && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey={axisMode === 'dual_axis_pct' ? 'comp1GapPct' : 'comp1GapINR'}
                  name={`${comp1.name} Gap to Floor`}
                  stroke="#d97706"
                  strokeWidth={1.8}
                  strokeDasharray="3 3"
                  dot={false}
                  activeDot={{ r: 4, fill: '#d97706' }}
                />
              )}

              {/* ============================================================== */}
              {/* SERIES 2: LEFT Y-AXIS (ACTUAL SELLING PRICES IN INR)            */}
              {/* ============================================================== */}

              {/* 1. Your Price (Bocasa) - Solid Green Line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="yourPrice"
                name="Your price (Bocasa)"
                stroke="#059669"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
              />

              {/* 2. Naive Auto-Match Repricer - Dashed Grey Line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="naivePrice"
                name="Naive auto-match repricer"
                stroke="#94a3b8"
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#94a3b8' }}
              />

              {/* 3. Top Competitor (e.g. Sneha Fashion) - Solid Amber Line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="competitor1Price"
                name={comp1.name}
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2 }}
              />

              {/* 4. Second Competitor (e.g. Jaipur Kurti House) - Purple Line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="competitor2Price"
                name={comp2.name}
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#8b5cf6' }}
              />

              {/* 5. Third Competitor (e.g. TrendyWear) - Cyan Line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="competitor3Price"
                name={comp3.name}
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#0ea5e9' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 4. Comprehensive Legend with Dual-Axis Explanations */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          
          {/* Series Color Markers */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            
            {/* Your price (Bocasa) */}
            <div className="flex items-center space-x-2">
              <span className="w-4 h-1 rounded-full bg-emerald-600 inline-block"></span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">Your price (Bocasa)</span>
            </div>

            {/* Price Gap Buffer (Right Axis) */}
            {axisMode !== 'price_only' && (
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-sm bg-emerald-400/40 border border-emerald-500 inline-block"></span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  Floor Gap Buffer ({axisMode === 'dual_axis_pct' ? '% Axis' : '₹ Axis'})
                </span>
              </div>
            )}

            {/* Naive auto-match repricer */}
            <div className="flex items-center space-x-2">
              <span className="w-4 h-0.5 border-b-2 border-dashed border-slate-400 inline-block"></span>
              <span className="text-slate-600 dark:text-slate-400">Naive auto-match repricer</span>
            </div>

            {/* True floor (loss zone below) */}
            <div className="flex items-center space-x-2">
              <span className="w-4 h-0.5 border-b-2 border-dashed border-red-500 inline-block"></span>
              <span className="text-slate-600 dark:text-slate-400">
                True floor <span className="text-rose-500 font-medium">(₹{floorPrice})</span>
              </span>
            </div>

            {/* Competitor 1 (Sneha Fashion) */}
            <div className="flex items-center space-x-2">
              <span className="w-4 h-0.5 rounded-full bg-amber-500 inline-block"></span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">{comp1.name}</span>
            </div>

            {/* Competitor 2 */}
            <div className="flex items-center space-x-2">
              <span className="w-4 h-0.5 rounded-full bg-purple-500 inline-block"></span>
              <span className="text-slate-600 dark:text-slate-400">{comp2.name}</span>
            </div>

            {/* Competitor 3 */}
            <div className="flex items-center space-x-2">
              <span className="w-4 h-0.5 rounded-full bg-sky-500 inline-block"></span>
              <span className="text-slate-600 dark:text-slate-400">{comp3.name}</span>
            </div>
          </div>

          {/* Threshold Zone Visual Guide (Color Blocks) */}
          {axisMode !== 'price_only' && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-xs">
              <div className="font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center space-x-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
                <span>Price Gap Decision Threshold Matrix (Relative to Calculated Floor ₹{floorPrice}):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <div>
                    <span className="font-bold text-emerald-800 dark:text-emerald-200">Safe Zone (Gap ≥ +₹{minMarginTarget}):</span>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-sans mt-0.5">
                      Healthy Buy Box profit margin protected above all platform fees.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-2 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                  <div>
                    <span className="font-bold text-amber-800 dark:text-amber-200">Caution Zone (₹0 ≤ Gap &lt; +₹{minMarginTarget}):</span>
                    <p className="text-[10px] text-amber-700 dark:text-amber-300 font-sans mt-0.5">
                      Positive gross margin, but vulnerable to return shipping spikes.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-2 rounded-lg bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                  <div>
                    <span className="font-bold text-rose-800 dark:text-rose-200">Danger Zone (Gap &lt; ₹0):</span>
                    <p className="text-[10px] text-rose-700 dark:text-rose-300 font-sans mt-0.5">
                      Critical Floor Breach. Orders incur immediate operational losses.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. Competitor Behaviour Table */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-600 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800/80">
                  <th className="pb-2.5 font-bold">Competitor (seller-chosen URL)</th>
                  <th className="pb-2.5 font-bold">Behaviour</th>
                  <th className="pb-2.5 font-bold text-right pr-4">Price</th>
                  <th className="pb-2.5 font-bold text-right pr-6">Gap to Your Floor</th>
                  <th className="pb-2.5 font-bold text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {competitors.map((c, idx) => {
                  const isBelowFloor = c.price < floorPrice;
                  const gapToFloor = c.price - floorPrice;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      
                      {/* Competitor Name + URL Link */}
                      <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center space-x-1.5">
                          <span>{c.name}</span>
                          {c.url && (
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-blue-500 transition"
                              title="Inspect competitor listing"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Behaviour */}
                      <td className="py-3 text-slate-500 dark:text-slate-400">
                        <span className="capitalize">{c.behaviour}</span>
                      </td>

                      {/* Price */}
                      <td className="py-3 text-right pr-4 font-mono">
                        <span className={`font-bold text-sm ${isBelowFloor ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
                          ₹{c.price}
                        </span>
                      </td>

                      {/* Price Gap to Floor */}
                      <td className="py-3 text-right pr-6 font-mono">
                        <span className={`font-bold text-xs ${
                          gapToFloor >= minMarginTarget
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : gapToFloor >= 0
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400 font-extrabold'
                        }`}>
                          {gapToFloor >= 0 ? `+₹${gapToFloor}` : `-₹${Math.abs(gapToFloor)}`}
                        </span>
                        {isBelowFloor && (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold text-[10px] ml-1.5 inline-block">
                            (below floor)
                          </span>
                        )}
                      </td>

                      {/* Stock Status */}
                      <td className="py-3 text-right">
                        {c.stockStatus === 'in_stock' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                            in stock
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800">
                            out of stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Protection Insight Footnote */}
        <div className="p-3.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/70 text-xs flex items-center justify-between text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center space-x-2.5">
            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>Bocasa Protection Summary:</strong> When <span className="font-semibold">{comp1.name}</span> undercut to ₹{comp1.price}, naive auto-repricers followed directly into the sub-floor red zone. Bocasa held your price at ₹{latestYourPrice}, defending a <strong>+₹{latestYourGap}</strong> safe margin buffer and preserving profitability on every unit shipped.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

// ============================================================================
// Enhanced Custom Tooltip: Displays Dual-Axis Metrics & Threshold Zone Status
// ============================================================================
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  floorPrice: number;
  minMarginTarget: number;
  comp1Name: string;
  comp2Name: string;
  comp3Name: string;
  axisMode: ChartAxisMode;
}

const CustomPriceTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  floorPrice,
  minMarginTarget,
  comp1Name,
  comp2Name,
  comp3Name,
  axisMode,
}) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  const isNaiveInLoss = data.naivePrice < floorPrice;
  const isComp1InLoss = data.competitor1Price < floorPrice;
  const yourGap = data.yourGapINR ?? (data.yourPrice - floorPrice);
  const comp1Gap = data.comp1GapINR ?? (data.competitor1Price - floorPrice);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 shadow-2xl text-xs space-y-2.5 min-w-[240px] z-50">
      {/* Header: Date + Calculated Floor Anchor */}
      <div className="font-bold text-slate-800 dark:text-slate-200 pb-1.5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <span>{data.fullDate || data.date || data.timestamp}</span>
        <span className="font-mono text-[11px] text-rose-600 font-bold">
          Floor: ₹{floorPrice}
        </span>
      </div>

      {/* Section 1: Selling Prices (Left Axis) */}
      <div className="space-y-1.5 font-mono">
        <div className="text-[10px] uppercase tracking-wider font-sans font-bold text-slate-400">
          Left Axis: Selling Prices
        </div>

        {/* MarginGuard price */}
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span className="font-sans font-medium">Your price:</span>
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{data.yourPrice}</span>
        </div>

        {/* Naive auto repricer */}
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1.5 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span className="font-sans">Naive Repricer:</span>
          </span>
          <span className={`font-semibold ${isNaiveInLoss ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
            ₹{data.naivePrice} {isNaiveInLoss && '(Breached)'}
          </span>
        </div>

        {/* Competitor 1 */}
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="font-sans truncate max-w-[120px]">{comp1Name}:</span>
          </span>
          <span className={`font-bold ${isComp1InLoss ? 'text-rose-600' : 'text-amber-600 dark:text-amber-400'}`}>
            ₹{data.competitor1Price}
          </span>
        </div>

        {/* Competitor 2 */}
        {data.competitor2Price && (
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span className="font-sans truncate max-w-[120px]">{comp2Name}:</span>
            </span>
            <span className="font-medium text-purple-600 dark:text-purple-400">₹{data.competitor2Price}</span>
          </div>
        )}

        {/* Competitor 3 */}
        {data.competitor3Price && (
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <span className="font-sans truncate max-w-[120px]">{comp3Name}:</span>
            </span>
            <span className="font-medium text-sky-600 dark:text-sky-400">₹{data.competitor3Price}</span>
          </div>
        )}
      </div>

      {/* Section 2: Right Axis (Price Gap to Calculated Floor) */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 font-mono">
        <div className="text-[10px] uppercase tracking-wider font-sans font-bold text-slate-400">
          Right Axis: Price Gap to Floor
        </div>

        {/* Your Gap Buffer */}
        <div className="flex items-center justify-between">
          <span className="text-slate-700 dark:text-slate-300 font-sans font-medium">Your Safety Buffer:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {yourGap >= 0 ? `+₹${yourGap}` : `-₹${Math.abs(yourGap)}`} 
            <span className="text-[10px] ml-1 font-normal">({data.yourGapPct >= 0 ? `+${data.yourGapPct}%` : `${data.yourGapPct}%`})</span>
          </span>
        </div>

        {/* Competitor Gap */}
        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400 font-sans truncate max-w-[120px]">{comp1Name} Gap:</span>
          <span className={`font-semibold ${comp1Gap < 0 ? 'text-rose-600 font-bold' : 'text-amber-600 dark:text-amber-400'}`}>
            {comp1Gap >= 0 ? `+₹${comp1Gap}` : `-₹${Math.abs(comp1Gap)}`}
            <span className="text-[10px] ml-1 font-normal">({data.comp1GapPct >= 0 ? `+${data.comp1GapPct}%` : `${data.comp1GapPct}%`})</span>
          </span>
        </div>

        {/* Threshold Status Badge */}
        <div className="pt-1 flex items-center justify-between text-[11px] font-sans">
          <span className="text-slate-500">Threshold Status:</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            yourGap >= minMarginTarget
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : yourGap >= 0
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
          }`}>
            {yourGap >= minMarginTarget ? 'Safe Margin Buffer' : (yourGap >= 0 ? 'Caution (Tight)' : 'Critical Breach')}
          </span>
        </div>
      </div>
    </div>
  );
};
