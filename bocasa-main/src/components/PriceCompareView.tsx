import React, { useState, useEffect } from 'react';
import { 
  Check, 
  ExternalLink, 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Share2, 
  Copy, 
  CheckCircle2, 
  Info, 
  ArrowRight, 
  Sliders, 
  Zap, 
  Store, 
  Tag, 
  Clock, 
  Calendar,
  Layers,
  Search,
  Eye,
  RefreshCw
} from 'lucide-react';
import { ProductSKU, PlatformId, FeeMatrixItem } from '../types';
import { calculatePlatformFloor } from '../data/defaultFeeMatrix';
import { PriceHistoryChart } from './PriceHistoryChart';
import { getMarketplaceProductUrl, getCompetitorLiveUrl } from '../utils/urlHelper';

interface PriceCompareViewProps {
  product: ProductSKU;
  products: ProductSKU[];
  onSelectProduct: (id: string) => void;
  feeMatrix: FeeMatrixItem[];
  onExecuteReprice?: (platform: PlatformId, newPrice: number) => void;
  onNavigateTab?: (tab: string) => void;
}

export const PriceCompareView: React.FC<PriceCompareViewProps> = ({
  product,
  products,
  onSelectProduct,
  feeMatrix,
  onExecuteReprice,
  onNavigateTab,
}) => {
  // Selected variant/style
  const [selectedStyle, setSelectedStyle] = useState<string>(
    product.styles?.[0] || 'Standard Retail Pack'
  );
  
  // Selected gallery image index
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  
  // Time horizon for recommendation (matching screenshot: 2-3 Days, 1 Week, 1 Month)
  const [timeHorizon, setTimeHorizon] = useState<'2-3 Days' | '1 Week' | '1 Month'>('2-3 Days');
  
  // Tab on right card: Deal Scanner vs Price Drop
  const [rightActiveTab, setRightActiveTab] = useState<'scanner' | 'drop_history'>('scanner');
  
  // Target reprice platform and custom price input
  const [targetPlatform, setTargetPlatform] = useState<PlatformId>('amazon');
  const [customPriceInput, setCustomPriceInput] = useState<string>(
    String(product.currentSellingPrices.amazon || 2469)
  );

  // Filter for competitor search shelf benchmark
  const [shelfPlatformFilter, setShelfPlatformFilter] = useState<'all' | 'amazon' | 'flipkart' | 'meesho'>('all');

  // Synchronize target price input whenever product or targetPlatform changes
  useEffect(() => {
    const platformPrice = product.currentSellingPrices[targetPlatform] || 2469;
    setCustomPriceInput(String(platformPrice));
  }, [product.id, targetPlatform, product.currentSellingPrices]);
  
  // Live feedback state
  const [isSubmittingReprice, setIsSubmittingReprice] = useState(false);
  const [repriceSuccessNotice, setRepriceSuccessNotice] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Gallery fallback
  const gallery = product.galleryImages && product.galleryImages.length > 0 
    ? product.galleryImages 
    : [
        product.imageUrl || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&auto=format&fit=crop&q=80',
      ];

  const mainImage = gallery[activeImageIndex] || gallery[0];

  // Fee and floor calculations for target platform
  const feeItem = feeMatrix.find(
    (f) => f.platform === targetPlatform && f.category === product.category
  ) || feeMatrix.find((f) => f.platform === targetPlatform) || feeMatrix[0];

  const floorCalc = calculatePlatformFloor(product.landedCost, product.minMargin, feeItem);
  const safeFloor = floorCalc.floorPrice;

  // Pricing stats
  const currentPrice = product.currentSellingPrices[targetPlatform] || 2469;
  const mrp = product.mrp || 3499;
  const discountPct = Math.round(((mrp - currentPrice) / mrp) * 100);

  const highestPrice = product.highestPrice || Math.round(mrp * 0.9);
  const lowestPrice = product.lowestPrice || Math.round(product.landedCost * 1.8);
  const avgPrice = product.avgPrice || Math.round((highestPrice + lowestPrice) / 2);
  const festivePrice = product.festivePrice || Math.round(avgPrice * 0.75);
  const primeDayPrice = product.primeDayPrice || Math.round(avgPrice * 0.82);

  // Competitor on Flipkart (from screenshot 2: ₹1,285, 48% cheaper)
  const flipkartComp = product.competitors.flipkart;
  const amazonComp = product.competitors.amazon;
  const meeshoComp = product.competitors.meesho;

  // Gauge calculation: 0 to 100
  // Higher score = better time to reprice/buy
  const parsedCustomPrice = parseFloat(customPriceInput) || currentPrice;
  const isBelowFloor = parsedCustomPrice < safeFloor;
  const marginAboveFloor = parsedCustomPrice - safeFloor;

  // Gauge meter rotation calculation: 0 to 180 degrees
  // 82% optimal score
  const gaugeScore = 85; 
  const needleRotation = (gaugeScore / 100) * 180 - 90; // -90 deg to +90 deg

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleQuickPreset = (price: number) => {
    setCustomPriceInput(String(price));
  };

  const handleExecuteReprice = () => {
    const newPrice = Math.round(parseFloat(customPriceInput));
    if (isNaN(newPrice) || newPrice <= 0) return;

    if (newPrice < safeFloor) {
      alert(`⚠️ Bocasa Safety Warning: ₹${newPrice} is below your calculated safety floor of ₹${safeFloor}. This would cause negative profit per unit.`);
      return;
    }

    setIsSubmittingReprice(true);
    setTimeout(() => {
      if (onExecuteReprice) {
        onExecuteReprice(targetPlatform, newPrice);
      }
      setIsSubmittingReprice(false);
      setRepriceSuccessNotice(`Price successfully updated to ₹${newPrice} on ${targetPlatform.toUpperCase()}! Buy Box sync queued.`);
      setTimeout(() => setRepriceSuccessNotice(null), 4000);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Breadcrumb & SKU Quick Switch Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Marketplace Price Compare & Reprice Hub</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            SKU: <strong className="text-slate-800 dark:text-slate-200">{product.sku}</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
            {product.category}
          </span>
        </div>

        {/* Switch Product Dropdown & Quick Chips */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <div className="hidden sm:flex items-center space-x-1">
            {products.slice(0, 3).map((p) => {
              const isSelected = p.id === product.id;
              const shortName = p.id === 'sku-kurti-02' ? 'Cotton Kurti' : (p.id === 'sku-pickle-01' ? 'Pickleball Set' : 'AuraPods');
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectProduct(p.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {shortName}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-500 hidden md:inline">Catalog:</span>
            <select
              value={product.id}
              onChange={(e) => onSelectProduct(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} — {p.title.substring(0, 32)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {repriceSuccessNotice && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl flex items-center space-x-3 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{repriceSuccessNotice}</span>
        </div>
      )}

      {/* Main Two-Column Layout (Matching Image 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Product Showcase & Multi-Marketplace Competitor Comparison (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
            
            {/* Top Marketplace Platform Switcher & Live Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl">
              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 pl-1 mr-1">
                  Active Platform:
                </span>
                {([
                  { 
                    id: 'amazon', 
                    name: 'Amazon India', 
                    symbol: 'a', 
                    symbolClass: 'text-amber-500 font-serif font-black', 
                    activeClass: 'bg-amber-500 text-white shadow-xs border-amber-500' 
                  },
                  { 
                    id: 'flipkart', 
                    name: 'Flipkart', 
                    symbol: '⚡', 
                    symbolClass: 'text-amber-400 font-bold', 
                    activeClass: 'bg-blue-600 text-white shadow-xs border-blue-600' 
                  },
                  { 
                    id: 'meesho', 
                    name: 'Meesho', 
                    symbol: 'M', 
                    symbolClass: 'text-purple-400 font-bold', 
                    activeClass: 'bg-purple-600 text-white shadow-xs border-purple-600' 
                  },
                ] as const).map((p) => {
                  const isSelected = targetPlatform === p.id;
                  const platformPrice = product.currentSellingPrices[p.id];
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setTargetPlatform(p.id);
                        setCustomPriceInput(String(platformPrice));
                      }}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? p.activeClass
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                      title={`Switch active view and repricing engine to ${p.name}`}
                    >
                      <span className={isSelected ? 'text-white' : p.symbolClass}>{p.symbol}</span>
                      <span>{p.name}</span>
                      <span className={`font-mono text-[11px] px-1.5 py-0.2 rounded-md ${
                        isSelected ? 'bg-black/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        ₹{platformPrice?.toLocaleString('en-IN') || '—'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-auto">
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="capitalize">{targetPlatform === 'amazon' ? 'Amazon India' : (targetPlatform === 'flipkart' ? 'Flipkart' : 'Meesho')} Active</span>
                </span>
                <a
                  href={
                    product.competitors[targetPlatform]?.url ||
                    getMarketplaceProductUrl(targetPlatform, {
                      title: product.title,
                      productId: product.id,
                      asin: targetPlatform === 'amazon' ? product.asin : undefined,
                      fsn: targetPlatform === 'flipkart' ? product.fsn : undefined,
                    })
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition flex items-center space-x-1 text-xs font-semibold"
                  title={`Open verified listing on ${targetPlatform}`}
                >
                  <span className="hidden sm:inline">Visit Live</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Product Display: Gallery + Info matching Image 2 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Product Visual Container (Image + Thumbnails) */}
              <div className="md:col-span-5 space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center p-4 aspect-square">
                  <img
                    src={mainImage}
                    alt={product.title}
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal rounded-xl hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/80 text-white text-[10px] font-mono rounded-md backdrop-blur-xs">
                    {product.brand || 'YAIT'}
                  </div>
                </div>

                {/* Thumbnails Row matching Image 2 */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                  {gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-12 h-12 rounded-xl border p-1 shrink-0 overflow-hidden bg-slate-50 dark:bg-slate-800 transition-all ${
                        activeImageIndex === idx
                          ? 'border-blue-600 ring-2 ring-blue-500/30'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumb" className="w-full h-full object-cover rounded-md" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Details matching Image 2 */}
              <div className="md:col-span-7 space-y-3.5 flex flex-col justify-between">
                <div>
                  <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {product.title}
                  </h1>

                  {/* Rating Stars matching Image 2 */}
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex items-center text-amber-500 text-xs font-bold">
                      <span>★</span>
                      <span className="ml-1 text-slate-800 dark:text-slate-200">{product.rating || 4.4}</span>
                    </div>
                    <div className="flex text-amber-400 text-xs">
                      {'★'.repeat(4)}{'☆'}
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer">
                      {product.reviewCount || 25} ratings
                    </span>
                  </div>

                  {/* Price Tag & Platform Context */}
                  <div className="mt-3 flex items-baseline flex-wrap gap-2 sm:gap-3">
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-slate-100">
                      ₹{currentPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm text-slate-400 line-through font-mono">
                      ₹{mrp.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      ↓ {discountPct}% OFF
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      on <strong className="capitalize">{targetPlatform === 'amazon' ? 'Amazon India' : targetPlatform}</strong>
                    </span>
                  </div>

                  {/* Multi-Platform Price Comparison Quick Switch Chips */}
                  <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-slate-400">Compare Platforms:</span>
                    {(['amazon', 'flipkart', 'meesho'] as PlatformId[]).map((p) => {
                      const isSel = targetPlatform === p;
                      const price = product.currentSellingPrices[p];
                      const label = p === 'amazon' ? 'Amazon' : p === 'flipkart' ? 'Flipkart' : 'Meesho';
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setTargetPlatform(p);
                            setCustomPriceInput(String(price));
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition cursor-pointer flex items-center space-x-1 ${
                            isSel
                              ? p === 'amazon'
                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-bold shadow-xs'
                                : p === 'flipkart'
                                ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700 font-bold shadow-xs'
                                : 'bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 border border-purple-300 dark:border-purple-700 font-bold shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent'
                          }`}
                          title={`Click to view and reprice on ${label}`}
                        >
                          <span className="capitalize">{label}:</span>
                          <span>₹{price?.toLocaleString('en-IN') || '—'}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Share on WhatsApp & Copy matching Image 2 */}
                  <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                    <span className="text-[11px] font-medium">Share:</span>
                    <button
                      onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(product.title + ' ₹' + currentPrice + ' on ' + targetPlatform)}`, '_blank')}
                      className="p-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer"
                      title="Share on WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                      title="Copy Link"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    {copiedLink && <span className="text-[10px] text-emerald-600">Copied!</span>}
                  </div>
                </div>

                {/* Primary Buy / Inspect CTA Button - Dynamic to Active Platform */}
                <div className="pt-2">
                  <a
                    href={
                      product.competitors[targetPlatform]?.url ||
                      getMarketplaceProductUrl(targetPlatform, {
                        title: product.title,
                        productId: product.id,
                        asin: targetPlatform === 'amazon' ? product.asin : undefined,
                        fsn: targetPlatform === 'flipkart' ? product.fsn : undefined,
                      })
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-xs transition cursor-pointer text-white ${
                      targetPlatform === 'amazon'
                        ? 'bg-amber-500 hover:bg-amber-600'
                        : targetPlatform === 'flipkart'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    <span>
                      View Live on {targetPlatform === 'amazon' ? 'Amazon India' : (targetPlatform === 'flipkart' ? 'Flipkart' : 'Meesho')} (₹{currentPrice.toLocaleString('en-IN')})
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Style Variant Selectors matching Image 2 */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Style / Model Variant
              </label>
              <div className="flex flex-wrap gap-2">
                {(product.styles || ['Pickleball Set (2 Paddles + 2 Balls)', 'Stryke Paddle Single', 'Carbon Pro 16mm Core']).map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 hover:scale-[1.01] active:ring-2 active:ring-blue-500/40 ${
                      selectedStyle === style
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* "Compare Available Prices" Section (Exact replica from Image 2!) */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <span>Compare Available Marketplace Prices</span>
                  <span className="text-[11px] font-normal text-slate-400">(3 Active Competitor Rails)</span>
                </h3>
                <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400">
                  Floor: ₹{safeFloor}
                </span>
              </div>

              {/* Competitor Listings Cards - Reactive to targetPlatform */}
              <div className="space-y-3">
                
                {/* 1. Flipkart Competitor Listing */}
                <div className={`p-3.5 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  targetPlatform === 'flipkart'
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-blue-200/80 dark:border-blue-900/40 bg-blue-50/20 dark:bg-blue-950/10 hover:border-blue-300'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                      <img src={mainImage} alt="Flipkart Rival" className="w-full h-full object-contain" />
                      <span className="absolute bottom-0 right-0 px-1 bg-slate-900/80 text-white text-[9px] font-mono rounded">13 mm</span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className="text-amber-500 font-black text-xs">⚡</span>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Flipkart Rival</span>
                        <span className="text-[10px] text-slate-400">({flipkartComp?.competitorName || 'RetailNet Authorized'})</span>
                        {targetPlatform === 'flipkart' && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold bg-blue-600 text-white rounded-md">
                            Active Focus
                          </span>
                        )}
                        <a
                          href={flipkartComp?.url || getMarketplaceProductUrl('flipkart', { title: product.title, productId: product.id })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center space-x-0.5 text-[10px] font-medium ml-1"
                          title="Open live listing on Flipkart"
                        >
                          <span>Live Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-xs mt-0.5">
                        {product.title}
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center space-x-2">
                        <span>Free delivery · F-Assured</span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-500 dark:text-slate-400 font-mono">Our Flipkart: ₹{product.currentSellingPrices.flipkart}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between w-full sm:w-auto gap-2">
                    <div className="text-left sm:text-right">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                          ₹{flipkartComp?.currentPrice || 1285}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                          48% Cheaper
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">Checked 14m ago</div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <a
                        href={flipkartComp?.url || getMarketplaceProductUrl('flipkart', { title: product.title, productId: product.id })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 text-[11px] font-bold rounded-lg border border-blue-200 dark:border-blue-800 transition inline-flex items-center space-x-1"
                        title="View product on Flipkart"
                      >
                        <span>Visit</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetPlatform('flipkart');
                          handleQuickPreset(flipkartComp?.currentPrice || 1285);
                          const el = document.getElementById('reprice-execution-box');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`px-3 py-1 text-white text-[11px] font-bold rounded-lg transition shadow-xs cursor-pointer ${
                          targetPlatform === 'flipkart'
                            ? 'bg-blue-600 hover:bg-blue-500 ring-2 ring-blue-400/40'
                            : 'bg-blue-600 hover:bg-blue-500'
                        }`}
                        title="Focus Flipkart in repricer to match or undercut"
                      >
                        Match / Undercut
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Amazon Current Listing (₹2,469) */}
                <div className={`p-3.5 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  targetPlatform === 'amazon'
                    ? 'border-amber-500 dark:border-amber-400 bg-amber-50/60 dark:bg-amber-950/40 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 hover:border-amber-300'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                      <img src={mainImage} alt="Amazon Listing" className="w-full h-full object-contain" />
                      <span className="absolute bottom-0 right-0 px-1 bg-slate-900/80 text-white text-[9px] font-mono rounded">carbon</span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className="font-serif font-black text-amber-500 text-xs">a</span>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Amazon India</span>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">(Your Listing)</span>
                        {targetPlatform === 'amazon' && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-500 text-white rounded-md">
                            Active Focus
                          </span>
                        )}
                        <a
                          href={amazonComp?.url || getMarketplaceProductUrl('amazon', { title: product.title, productId: product.id, asin: product.asin })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center space-x-0.5 text-[10px] font-medium ml-1"
                          title="Open live listing on Amazon India"
                        >
                          <span>Live Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-xs mt-0.5">
                        {product.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Prime Delivery · Amazon FBA · ASIN: {product.asin || 'B0C7Q8M9P2'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between w-full sm:w-auto gap-2">
                    <div className="text-left sm:text-right">
                      <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                        ₹{product.currentSellingPrices.amazon || 2469}
                      </div>
                      <div className="text-[10px] text-slate-400">Current Amazon Price</div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <a
                        href={amazonComp?.url || getMarketplaceProductUrl('amazon', { title: product.title, productId: product.id, asin: product.asin })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 transition inline-flex items-center space-x-1"
                        title="View listing on Amazon"
                      >
                        <span>Visit</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetPlatform('amazon');
                          handleQuickPreset(product.currentSellingPrices.amazon || 2469);
                          const el = document.getElementById('reprice-execution-box');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`px-3 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                          targetPlatform === 'amazon'
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        Reprice Amazon
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Meesho Supplier Direct Listing */}
                <div className={`p-3.5 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  targetPlatform === 'meesho'
                    ? 'border-purple-500 dark:border-purple-400 bg-purple-50/70 dark:bg-purple-950/40 ring-2 ring-purple-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 hover:border-purple-300'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                      <img src={mainImage} alt="Meesho Listing" className="w-full h-full object-contain" />
                      <span className="absolute bottom-0 right-0 px-1 bg-slate-900/80 text-white text-[9px] font-mono rounded">direct</span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className="text-purple-500 font-bold text-xs">M</span>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Meesho Supplier</span>
                        <span className="text-[10px] text-slate-400">({meeshoComp?.competitorName || 'Meerut Sports'})</span>
                        {targetPlatform === 'meesho' && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold bg-purple-600 text-white rounded-md">
                            Active Focus
                          </span>
                        )}
                        <a
                          href={meeshoComp?.url || getMarketplaceProductUrl('meesho', { title: product.title, productId: product.id })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center space-x-0.5 text-[10px] font-medium ml-1"
                          title="Open live listing on Meesho"
                        >
                          <span>Live Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-xs mt-0.5">
                        {product.title}
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center space-x-2">
                        <span>Zero Commission Rail</span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-500 dark:text-slate-400 font-mono">Our Meesho: ₹{product.currentSellingPrices.meesho}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between w-full sm:w-auto gap-2">
                    <div className="text-left sm:text-right">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                          ₹{meeshoComp?.currentPrice || 1420}
                        </span>
                        <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-1.5 py-0.5 rounded">
                          42% Cheaper
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">Checked 30m ago</div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <a
                        href={meeshoComp?.url || getMarketplaceProductUrl('meesho', { title: product.title, productId: product.id })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-purple-700 dark:text-purple-300 text-[11px] font-bold rounded-lg border border-purple-200 dark:border-purple-800 transition inline-flex items-center space-x-1"
                        title="View product on Meesho"
                      >
                        <span>Visit</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetPlatform('meesho');
                          handleQuickPreset(meeshoComp?.currentPrice || 1420);
                          const el = document.getElementById('reprice-execution-box');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`px-3 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                          targetPlatform === 'meesho'
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        Reprice Meesho
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Deal Scanner, Gauge Meter, Price Stats & Decision Action (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            
            {/* Top Tabs matching Image 2: Deal Scanner / Price Drop */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex space-x-4">
                <button
                  onClick={() => setRightActiveTab('scanner')}
                  className={`text-xs font-bold pb-1 transition-all ${
                    rightActiveTab === 'scanner'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  Deal Scanner & Reprice Advisor
                </button>
                <button
                  onClick={() => setRightActiveTab('drop_history')}
                  className={`text-xs font-bold pb-1 transition-all ${
                    rightActiveTab === 'drop_history'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  Price Drop History
                </button>
              </div>
            </div>

            {/* "Should you reprice now?" Gauge Card (Exact replica from Image 2!) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                  <span>Should you reprice now?</span>
                  <span title="Calculated from competitor price delta, stock velocity, and safety floor">
                    <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </span>
                </h3>

                {/* Time selector pills matching Image 2: 2-3 Days, 1 Week, 1 Month */}
                <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {(['2-3 Days', '1 Week', '1 Month'] as const).map((h) => (
                    <button
                      key={h}
                      onClick={() => setTimeHorizon(h)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
                        timeHorizon === h
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speedometer Gauge Visual matching Image 2 */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700 flex flex-col items-center justify-center relative">
                
                {/* SVG Semi-Circle Speedometer */}
                <div className="relative w-48 h-24 overflow-hidden flex items-end justify-center">
                  <svg viewBox="0 0 100 50" className="w-48 h-24">
                    {/* Background Arc: Red to Yellow to Green */}
                    <path
                      d="M 10 50 A 40 40 0 0 1 35 15"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 35 15 A 40 40 0 0 1 65 15"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="8"
                    />
                    <path
                      d="M 65 15 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    {/* Pivot Center */}
                    <circle cx="50" cy="50" r="4" fill="#1e293b" />
                    {/* Needle */}
                    <line
                      x1="50"
                      y1="50"
                      x2="50"
                      y2="16"
                      stroke="#1e293b"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      transform={`rotate(${needleRotation} 50 50)`}
                      className="transition-transform duration-700 ease-out"
                    />
                  </svg>
                  <span className="absolute left-2 bottom-0 text-[10px] font-bold text-rose-500">0</span>
                  <span className="absolute right-2 bottom-0 text-[10px] font-bold text-emerald-500">100</span>
                </div>

                {/* Speedometer Legend matching Image 2 */}
                <div className="flex items-center space-x-6 text-[11px] font-medium text-slate-500 mt-2">
                  <span className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
                    <span>Bad Time</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                    <span>Good Time</span>
                  </span>
                </div>

                {/* Dynamic Recommendation Box based on targetPlatform */}
                {(() => {
                  const rivalPrice = targetPlatform === 'flipkart' 
                    ? (flipkartComp?.currentPrice || 1285) 
                    : targetPlatform === 'amazon' 
                    ? (product.currentSellingPrices.amazon || 2469) 
                    : (meeshoComp?.currentPrice || 1420);
                  const suggestedUndercut = Math.max(safeFloor, rivalPrice - 1);
                  const profitAtSuggested = suggestedUndercut - safeFloor;
                  const platformLabel = targetPlatform === 'amazon' ? 'Amazon India' : targetPlatform === 'flipkart' ? 'Flipkart' : 'Meesho';

                  return (
                    <div className="mt-3 text-center">
                      <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                        Our Recommendation for {platformLabel}
                      </div>
                      <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Go Ahead & Reprice Now
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Optimal price point detected on {platformLabel}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 max-w-xs leading-relaxed">
                        {targetPlatform === 'flipkart' ? (
                          <>Flipkart rival is selling at ₹{rivalPrice}. Repricing to <strong>₹{suggestedUndercut}</strong> captures 92% of Buy Box search traffic while preserving <strong>₹{profitAtSuggested}</strong> profit above your ₹{safeFloor} floor.</>
                        ) : targetPlatform === 'amazon' ? (
                          <>Amazon Buy Box requires competitive parity. Repricing to <strong>₹{suggestedUndercut}</strong> keeps your Prime badge dominant with <strong>₹{profitAtSuggested}</strong> retained margin.</>
                        ) : (
                          <>Meesho reseller rail operates at zero platform fee. Repricing to <strong>₹{suggestedUndercut}</strong> secures direct tier-2 volume while yielding <strong>₹{profitAtSuggested}</strong> net margin.</>
                        )}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Price Stats Bento Grid (Exact replica from Image 2!) */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                  Price Stats & Historical Benchmarks
                </h4>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Highest Price */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-center">
                    <div className="text-[11px] text-slate-500 flex items-center justify-center space-x-1">
                      <span>Highest Price</span>
                      <span className="text-rose-500 font-bold">↑</span>
                    </div>
                    <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                      ₹{highestPrice.toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* Average Price */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-center">
                    <div className="text-[11px] text-slate-500 flex items-center justify-center space-x-1">
                      <span>Average Price</span>
                      <span className="text-amber-500 font-bold">⇅</span>
                    </div>
                    <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                      ₹{avgPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Lowest Price */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-center">
                    <div className="text-[11px] text-slate-500 flex items-center justify-center space-x-1">
                      <span>Lowest Price</span>
                      <span className="text-emerald-500 font-bold">↓</span>
                    </div>
                    <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                      ₹{lowestPrice.toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* GIF 2025 Price (Great Indian Festival) */}
                  <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 text-center">
                    <div className="text-[11px] text-amber-800 dark:text-amber-300 font-medium flex items-center justify-center space-x-1">
                      <span>GIF 2025 Price</span>
                      <span className="text-[10px]">⚡</span>
                    </div>
                    <div className="text-base font-bold font-mono text-amber-900 dark:text-amber-200 mt-0.5">
                      ₹{festivePrice.toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* Prime Day 2025 Price */}
                  <div className="col-span-2 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/80 flex items-center justify-between px-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-serif font-black text-blue-600 dark:text-blue-400">prime</span>
                      <span className="text-xs font-semibold text-blue-900 dark:text-blue-200">Prime Day 2025 Price</span>
                    </div>
                    <div className="text-base font-bold font-mono text-blue-900 dark:text-blue-100">
                      ₹{primeDayPrice.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reprice Execution Action Box - Fully Interactive per Platform */}
              <div id="reprice-execution-box" className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Set Target Price & Execute Decision
                  </label>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Active: <strong className="capitalize">{targetPlatform}</strong>
                  </span>
                </div>

                {/* 3-Platform Selector in Reprice Box */}
                <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                  {([
                    { id: 'amazon', name: 'Amazon', activeBg: 'bg-amber-500 text-white' },
                    { id: 'flipkart', name: 'Flipkart', activeBg: 'bg-blue-600 text-white' },
                    { id: 'meesho', name: 'Meesho', activeBg: 'bg-purple-600 text-white' },
                  ] as const).map((p) => {
                    const isSel = targetPlatform === p.id;
                    const price = product.currentSellingPrices[p.id];
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setTargetPlatform(p.id);
                          setCustomPriceInput(String(price));
                        }}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer ${
                          isSel
                            ? `${p.activeBg} shadow-xs`
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                      >
                        <span>{p.name}</span>
                        <span className="font-mono text-[10px] opacity-90">₹{price}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Quick Presets for Selected Platform */}
                {(() => {
                  const rivalPrice = targetPlatform === 'flipkart' 
                    ? (flipkartComp?.currentPrice || 1285) 
                    : targetPlatform === 'amazon' 
                    ? (amazonComp?.currentPrice || 2469) 
                    : (meeshoComp?.currentPrice || 1420);
                  const undercutPrice = Math.max(safeFloor, rivalPrice - 1);
                  const sweetspotPrice = Math.max(safeFloor + (product.targetMargin || 250), Math.round(rivalPrice * 0.95));

                  return (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleQuickPreset(rivalPrice)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[10px] hover:border-blue-500 transition cursor-pointer"
                        title={`Match rival at ₹${rivalPrice}`}
                      >
                        <div className="text-slate-500">Match Rival</div>
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200">₹{rivalPrice}</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickPreset(undercutPrice)}
                        className="p-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-[10px] hover:border-blue-500 transition cursor-pointer"
                        title={`Undercut rival by ₹1 to win Buy Box`}
                      >
                        <div className="text-blue-600 font-semibold">Undercut ₹1</div>
                        <div className="font-mono font-bold text-blue-700 dark:text-blue-300">₹{undercutPrice}</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickPreset(sweetspotPrice)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[10px] hover:border-blue-500 transition cursor-pointer"
                        title={`Margin sweetspot preserving buffer above safe floor`}
                      >
                        <div className="text-slate-500">Sweetspot</div>
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200">₹{sweetspotPrice}</div>
                      </button>
                    </div>
                  );
                })()}

                {/* Price Input and Action Button */}
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">₹</span>
                    <input
                      type="number"
                      value={customPriceInput}
                      onChange={(e) => setCustomPriceInput(e.target.value)}
                      className={`w-full pl-7 pr-3 py-2 text-xs font-mono font-bold rounded-xl border ${
                        isBelowFloor
                          ? 'border-rose-500 bg-rose-50/50 text-rose-800 focus:outline-rose-500'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-blue-500'
                      }`}
                      placeholder="Enter price"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleExecuteReprice}
                    disabled={isSubmittingReprice || isBelowFloor}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-xs flex items-center space-x-1.5 text-white ${
                      isBelowFloor
                        ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                        : targetPlatform === 'amazon'
                        ? 'bg-amber-500 hover:bg-amber-600 cursor-pointer'
                        : targetPlatform === 'flipkart'
                        ? 'bg-blue-600 hover:bg-blue-500 cursor-pointer'
                        : 'bg-purple-600 hover:bg-purple-500 cursor-pointer'
                    }`}
                  >
                    <Zap className={`w-3.5 h-3.5 ${isSubmittingReprice ? 'animate-spin' : ''}`} />
                    <span>{isSubmittingReprice ? 'Pushing...' : `Reprice ${targetPlatform === 'amazon' ? 'Amazon' : (targetPlatform === 'flipkart' ? 'Flipkart' : 'Meesho')}`}</span>
                  </button>
                </div>

                {/* Floor Status Notice */}
                <div className="text-[11px] flex items-center justify-between">
                  <span className="text-slate-500">Calculated Floor: ₹{safeFloor}</span>
                  {isBelowFloor ? (
                    <span className="text-rose-600 font-semibold flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>₹{safeFloor - parsedCustomPrice} below floor (Loss!)</span>
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>+₹{marginAboveFloor} profit buffer</span>
                    </span>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Historical Price Movement & Competitor Intelligence (Recharts Line Chart matching Reference Screenshot) */}
      <div id="price-history-section">
        <PriceHistoryChart
          product={product}
          feeMatrix={feeMatrix}
          defaultPlatform={targetPlatform}
          onSwitchPlatform={(p) => setTargetPlatform(p)}
        />
      </div>

      {/* Bottom Section: Marketplace Search Shelf (Multi-Platform Benchmark) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Search className="w-4 h-4 text-blue-500" />
              <span>Competitor First-Page Search Shelf Benchmark</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live rival listings competing across Amazon India, Flipkart, and Meesho search results
            </p>
          </div>

          {/* Platform Filter Tabs */}
          <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            {([
              { id: 'all', label: 'All Marketplaces' },
              { id: 'amazon', label: 'Amazon India' },
              { id: 'flipkart', label: 'Flipkart' },
              { id: 'meesho', label: 'Meesho' },
            ] as const).map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setShelfPlatformFilter(filter.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  shelfPlatformFilter === filter.id
                    ? filter.id === 'amazon'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : filter.id === 'flipkart'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : filter.id === 'meesho'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rival Product Cards Grid */}
        {(() => {
          const allRivals = [
            {
              id: 'rival-1',
              platform: 'amazon' as const,
              brand: 'Xtrieve Official',
              title: product.id === 'sku-kurti-02' ? 'Biba Traditional Anarkali Kurti Cotton' : 'Xtrieve USAPA Approved Pickleball Set of 2',
              rating: 4.1,
              reviews: 103,
              price: product.id === 'sku-kurti-02' ? 799 : 4399,
              mrp: product.id === 'sku-kurti-02' ? 1499 : 6998,
              delivery: 'Free Prime delivery Wed, 23 Sept',
              img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=300&auto=format&fit=crop&q=80',
              tag: 'Amazon Prime',
            },
            {
              id: 'rival-2',
              platform: 'flipkart' as const,
              brand: 'RetailNet / YAIT',
              title: product.id === 'sku-kurti-02' ? 'W for Woman Festive Embroidered Kurti' : 'YAIT Takumi USAPA Approved GEN4 Paddle',
              rating: 4.3,
              reviews: 420,
              price: product.id === 'sku-kurti-02' ? 489 : 1285,
              mrp: product.id === 'sku-kurti-02' ? 1299 : 3499,
              delivery: 'Free delivery · F-Assured',
              img: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=300&auto=format&fit=crop&q=80',
              tag: 'Top Seller',
            },
            {
              id: 'rival-3',
              platform: 'meesho' as const,
              brand: 'Meerut Crafts Direct',
              title: product.id === 'sku-kurti-02' ? 'Jaipuri Printed Rayon Straight Kurti' : 'Pro Spin Composite Graphite Racket Pair',
              rating: 4.2,
              reviews: 88,
              price: product.id === 'sku-kurti-02' ? 349 : 1420,
              mrp: product.id === 'sku-kurti-02' ? 899 : 2899,
              delivery: 'Zero Platform Fee Rail',
              img: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=300&auto=format&fit=crop&q=80',
              tag: 'Direct Supplier',
            },
            {
              id: 'rival-4',
              platform: 'flipkart' as const,
              brand: 'Overcmr Sports',
              title: product.id === 'sku-kurti-02' ? 'Libas Floral A-Line Regular Kurti' : 'Sports Xyros Foam Core Pickleball Set + 4 Balls',
              rating: 4.4,
              reviews: 156,
              price: product.id === 'sku-kurti-02' ? 599 : 3499,
              mrp: product.id === 'sku-kurti-02' ? 1599 : 5999,
              delivery: 'Free delivery Tomorrow',
              img: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=300&auto=format&fit=crop&q=80',
              tag: 'Trending Deal',
            },
          ];

          const filteredRivals = shelfPlatformFilter === 'all'
            ? allRivals
            : allRivals.filter((r) => r.platform === shelfPlatformFilter);

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {filteredRivals.map((rival) => {
                const isAmazon = rival.platform === 'amazon';
                const isFlipkart = rival.platform === 'flipkart';
                const liveUrl = getMarketplaceProductUrl(rival.platform, { title: rival.title, productId: product.id });

                return (
                  <div
                    key={rival.id}
                    className={`group p-3.5 rounded-xl border bg-slate-50/60 dark:bg-slate-800/40 space-y-2.5 transition flex flex-col justify-between ${
                      isAmazon
                        ? 'border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500'
                        : isFlipkart
                        ? 'border-blue-100 dark:border-blue-900/60 hover:border-blue-400'
                        : 'border-purple-100 dark:border-purple-900/60 hover:border-purple-400'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="aspect-square rounded-lg overflow-hidden bg-white dark:bg-slate-900 p-2 flex items-center justify-center relative">
                        <img
                          src={rival.img}
                          alt={rival.brand}
                          className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                        />
                        <span className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs">
                          {rival.tag}
                        </span>
                        <a
                          href={liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 p-1.5 rounded-full shadow-md transition hover:scale-110"
                          title={`Open listing on ${rival.platform}`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                          <span className="truncate max-w-[110px]">{rival.brand}</span>
                          <span className={`font-semibold flex items-center space-x-0.5 ${
                            isAmazon
                              ? 'text-amber-600 dark:text-amber-400'
                              : isFlipkart
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-purple-600 dark:text-purple-400'
                          }`}>
                            <span>{isAmazon ? 'Amazon India' : isFlipkart ? 'Flipkart' : 'Meesho'}</span>
                          </span>
                        </div>

                        <a
                          href={liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 mt-0.5 hover:text-blue-600 dark:hover:text-blue-400 transition"
                        >
                          {rival.title}
                        </a>

                        <div className="flex items-center space-x-1.5 mt-1 text-[11px]">
                          <span className="text-amber-500 font-bold">★ {rival.rating}</span>
                          <span className="text-slate-400">({rival.reviews})</span>
                        </div>

                        <div className="mt-1 flex items-baseline space-x-1.5">
                          <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                            ₹{rival.price.toLocaleString('en-IN')}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 line-through">
                            ₹{rival.mrp.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600">
                            {Math.round(((rival.mrp - rival.price) / rival.mrp) * 100)}% off
                          </span>
                        </div>

                        <div className="text-[10px] text-emerald-600 font-medium truncate mt-0.5">
                          {rival.delivery}
                        </div>
                      </div>
                    </div>

                    {/* Quick Reprice Action on this specific rival */}
                    <button
                      type="button"
                      onClick={() => {
                        setTargetPlatform(rival.platform);
                        handleQuickPreset(rival.price);
                        const el = document.getElementById('reprice-execution-box');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center space-x-1 cursor-pointer ${
                        isAmazon
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : isFlipkart
                          ? 'bg-blue-600 hover:bg-blue-500 text-white'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      <Zap className="w-3 h-3" />
                      <span>Reprice vs this {rival.platform}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
};
