import React, { useState, useId } from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowUpRight, 
  Sliders, 
  Check, 
  Edit3, 
  ExternalLink, 
  Search, 
  Filter, 
  Package, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  TrendingDown, 
  Clock, 
  Zap, 
  Tag, 
  Eye, 
  BarChart2, 
  Calculator, 
  Flame, 
  Layers, 
  ArrowRight,
  Plus,
  Link as LinkIcon,
  X,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Store,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { ProductSKU, FeeMatrixItem, PlatformId, SystemTab } from '../types';
import { calculatePlatformFloor } from '../data/defaultFeeMatrix';

interface SellerDashboardViewProps {
  products: ProductSKU[];
  feeMatrix: FeeMatrixItem[];
  onUpdateMinMargin: (productId: string, newMinMargin: number) => void;
  onUpdateLandedCost?: (productId: string, newLandedCost: number) => void;
  onSelectProduct: (productId: string) => void;
  onNavigateTab: (tab: SystemTab) => void;
  onAddProduct?: (newProduct: ProductSKU) => void;
}

type FilterStatus = 'all' | 'protected' | 'risk' | 'fast_tier';

export const SellerDashboardView: React.FC<SellerDashboardViewProps> = ({
  products,
  feeMatrix,
  onUpdateMinMargin,
  onUpdateLandedCost,
  onSelectProduct,
  onNavigateTab,
  onAddProduct,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>('amazon');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingMarginId, setEditingMarginId] = useState<string | null>(null);
  const [tempMarginValue, setTempMarginValue] = useState<number>(0);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Modals state
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importUrlInput, setImportUrlInput] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Product Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newCategory, setNewCategory] = useState<string>('electronics');
  const [newLandedCost, setNewLandedCost] = useState<number>(500);
  const [newMinMargin, setNewMinMargin] = useState<number>(150);
  const [newTargetMargin, setNewTargetMargin] = useState<number>(280);
  const [newMrp, setNewMrp] = useState<number>(1999);
  const [newSellingPrice, setNewSellingPrice] = useState<number>(1299);
  const [newAsin, setNewAsin] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getProductDemandScore = (product: ProductSKU): number => {
    const isOos = !product.competitors.meesho?.inStock || !product.competitors.amazon?.inStock || !product.competitors.flipkart?.inStock;
    const baseDemand = product.category === 'electronics' ? 84 : product.category === 'apparel' ? 76 : product.category === 'beauty' ? 88 : 72;
    return isOos ? Math.min(100, baseDemand + 14) : baseDemand;
  };

  const categories = Array.from(new Set(products.map(p => p.category)));

  // Platform styling metadata
  const platformMeta: Record<PlatformId, { name: string; dot: string; border: string; accent: string; badgeBg: string }> = {
    amazon: {
      name: 'Amazon IN',
      dot: 'bg-[#FF9900]',
      border: 'hover:border-[#FF9900]/40',
      accent: '#FF9900',
      badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
    },
    flipkart: {
      name: 'Flipkart',
      dot: 'bg-[#2874F0]',
      border: 'hover:border-[#2874F0]/40',
      accent: '#2874F0',
      badgeBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
    },
    meesho: {
      name: 'Meesho',
      dot: 'bg-[#E01A67]',
      border: 'hover:border-[#E01A67]/40',
      accent: '#E01A67',
      badgeBg: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20'
    }
  };

  const startEditingMargin = (product: ProductSKU) => {
    setEditingMarginId(product.id);
    setTempMarginValue(product.minMargin);
  };

  const saveMargin = (productId: string) => {
    onUpdateMinMargin(productId, Math.max(0, tempMarginValue));
    setEditingMarginId(null);
    showToast('Minimum margin floor updated successfully.');
  };

  // Evaluate each product against current platform floor rules
  const evaluatedProducts = products.map((product) => {
    const feeItem = feeMatrix.find(
      (f) => f.platform === selectedPlatform && f.category === product.category
    ) || feeMatrix[0];
    const floorCalc = calculatePlatformFloor(product.landedCost, product.minMargin, feeItem);
    const floorPrice = floorCalc.floorPrice;
    const currentPrice = product.currentSellingPrices[selectedPlatform] ?? 0;
    const competitor = product.competitors[selectedPlatform];
    const isPriceAboveFloor = currentPrice >= floorPrice;
    const isUndercut = competitor && competitor.currentPrice < currentPrice;
    const profitAboveFloor = currentPrice - floorPrice;
    const marginBufferPct = floorPrice > 0 ? Math.round(((currentPrice - floorPrice) / floorPrice) * 100) : 0;
    const demandScore = getProductDemandScore(product);

    return {
      product,
      feeItem,
      floorCalc,
      floorPrice,
      currentPrice,
      competitor,
      isPriceAboveFloor,
      isUndercut,
      profitAboveFloor,
      marginBufferPct,
      demandScore
    };
  });

  // Filter products
  const filteredProducts = evaluatedProducts.filter(({ product, isPriceAboveFloor, isUndercut }) => {
    const matchesSearch = 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.asin && product.asin.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

    let matchesStatus = true;
    if (statusFilter === 'protected') {
      matchesStatus = isPriceAboveFloor;
    } else if (statusFilter === 'risk') {
      matchesStatus = !isPriceAboveFloor || isUndercut;
    } else if (statusFilter === 'fast_tier') {
      matchesStatus = product.salesTier === 'tier1_fast';
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalSkus = products.length;
  const protectedProductsCount = evaluatedProducts.filter((p) => p.isPriceAboveFloor).length;
  const undercuttingCompetitorCount = evaluatedProducts.filter((p) => p.isUndercut).length;
  const tier1Count = products.filter((p) => p.salesTier === 'tier1_fast').length;

  // Handle adding new product
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSku.trim()) {
      alert('Please provide at least a Product Title and SKU code.');
      return;
    }

    const created: ProductSKU = {
      id: `sku-${Date.now()}`,
      sku: newSku.trim().toUpperCase(),
      title: newTitle.trim(),
      category: newCategory as any,
      brand: newBrand.trim() || 'Direct Seller',
      rating: 4.5,
      reviewCount: 12,
      imageUrl: newImageUrl.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80',
      landedCost: Number(newLandedCost) || 300,
      minMargin: Number(newMinMargin) || 120,
      targetMargin: Number(newTargetMargin) || 240,
      mrp: Number(newMrp) || 1499,
      salesTier: 'tier1_fast',
      asin: newAsin.trim().toUpperCase() || `B0${Math.random().toString(36).substr(2, 7).toUpperCase()}`,
      fsn: `FSN${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      currentSellingPrices: {
        amazon: Number(newSellingPrice) || 999,
        flipkart: Math.round((Number(newSellingPrice) || 999) * 0.98),
        meesho: Math.round((Number(newSellingPrice) || 999) * 0.88),
      },
      competitors: {
        amazon: {
          platform: 'amazon',
          url: 'https://www.amazon.in',
          competitorName: 'Leading Brand Official Store',
          currentPrice: Math.round((Number(newSellingPrice) || 999) * 0.96),
          mrp: Number(newMrp) || 1499,
          inStock: true,
          fulfillment: 'Amazon FBA Prime',
          lastScraped: 'Just now',
          sellerRating: 4.4,
          priceHistory: [{ timestamp: '10:00', price: Math.round((Number(newSellingPrice) || 999) * 0.96) }],
        },
        flipkart: {
          platform: 'flipkart',
          url: 'https://www.flipkart.com',
          competitorName: 'TopRate Retailers',
          currentPrice: Math.round((Number(newSellingPrice) || 999) * 0.94),
          mrp: Number(newMrp) || 1499,
          inStock: true,
          fulfillment: 'F-Assured',
          lastScraped: '10m ago',
          sellerRating: 4.2,
          priceHistory: [{ timestamp: '10:00', price: Math.round((Number(newSellingPrice) || 999) * 0.94) }],
        },
        meesho: {
          platform: 'meesho',
          url: 'https://www.meesho.com',
          competitorName: 'Direct Wholesaler Hub',
          currentPrice: Math.round((Number(newSellingPrice) || 999) * 0.85),
          mrp: Number(newMrp) || 1499,
          inStock: true,
          fulfillment: 'Standard 3PL',
          lastScraped: '15m ago',
          sellerRating: 4.0,
          priceHistory: [{ timestamp: '10:00', price: Math.round((Number(newSellingPrice) || 999) * 0.85) }],
        },
      },
    };

    if (onAddProduct) {
      onAddProduct(created);
    }
    setIsAddProductModalOpen(false);
    showToast(`SKU ${created.sku} added to catalog with active cost floor protection.`);
    
    // Reset form
    setNewTitle('');
    setNewSku('');
    setNewBrand('');
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrlInput.trim()) return;
    setImportLoading(true);
    setTimeout(() => {
      setImportLoading(false);
      setIsImportModalOpen(false);
      setImportUrlInput('');
      showToast('Catalog scraper synced competitor listings successfully.');
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--ink-950)] text-[#FAFAF9] px-4 py-3 rounded-xl border border-amber-500/40 shadow-xl flex items-center space-x-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* 1. Grand Executive Hero Header */}
      <div className="pt-2 pb-1">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            {/* Top Micro-Context Indicator */}
            <div className="flex items-center space-x-2 text-[11px] font-mono uppercase tracking-wider mb-2 text-[var(--text-muted)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-[var(--text-primary)]">BOKASA Pricing</span>
            </div>

            {/* Bold, Punchy Contrasting Typography */}
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
              <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--ink-800)] dark:text-slate-200 font-brand">
                Welcome back,
              </span>
              <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-brand tracking-tight text-[var(--ink-950)] dark:text-white">
                <span className="bg-gradient-to-r from-[var(--amber-600)] via-[var(--amber-500)] to-[#D4974D] bg-clip-text text-transparent">
                  Arjun
                </span>
                <span className="text-[var(--ink-950)] dark:text-white">.</span>
              </span>
            </div>

          </div>


        </div>
      </div>

      {/* 2. Top Banner, Channel Selector & Primary Actions */}
      <div className="bg-[var(--paper-card)] border border-[var(--card-border)] rounded-2xl p-5 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Section Info & Status Tags */}
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-mono uppercase tracking-wider mb-1.5 text-[var(--text-muted)]">
              <span>Product Catalog</span>
              <ChevronRight className="w-3 h-3 text-[var(--fog-300)]" />
              <span className="text-[var(--text-primary)] font-semibold">Live Pricing & Protection</span>
            </div>

            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              <h1 className="text-4xl md:text-[40px] font-extrabold font-brand text-[var(--text-primary)] tracking-tight leading-tight">
                Margin & Floor Protection
              </h1>
            </div>
          </div>

          {/* Active Marketplace Selector (Elevated Pill Bar) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:self-center shrink-0">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Target Marketplace:</span>
            <div className="flex p-1 bg-[var(--paper-50)] rounded-xl border border-[var(--card-border)] shadow-2xs">
              {(['amazon', 'flipkart', 'meesho'] as PlatformId[]).map((p) => {
                const meta = platformMeta[p];
                const isActive = selectedPlatform === p;
                return (
                  <button
                    key={p}
                    onClick={() => setSelectedPlatform(p)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-[var(--ink-900)] dark:bg-[var(--ink-700)] text-[#FAFAF9] shadow-xs'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--paper-card)]/60'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${meta.dot}`}></span>
                    <span>{meta.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sync Info Strip */}
        <div className="mt-4 pt-4 border-t border-[var(--card-border-subtle)] flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Last synced: <strong className="text-[var(--text-primary)] font-mono">2 mins ago</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Tax: <strong className="text-[var(--text-primary)] font-mono">18% GST</strong></span>
          </div>
        </div>
      </div>

      {/* 3. Executive KPI Cards (Redesigned with Semantic Colors & Depth & Interactive Filters) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Monitored Catalog */}
        <div 
          onClick={() => setStatusFilter('all')}
          className={`cursor-pointer bg-[var(--paper-card)]/90 backdrop-blur-md p-5 rounded-2xl border shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group ${statusFilter === 'all' ? 'border-[var(--ink-900)] dark:border-white ring-1 ring-[var(--ink-900)] dark:ring-white' : 'border-[var(--card-border)]'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] md:text-sm font-brand-wide text-[var(--text-muted)] font-bold tracking-wide uppercase">
              MONITORED SKUS
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-500/10 flex items-center justify-center text-[var(--text-secondary)]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-brand text-[var(--text-primary)] tabular-numbers mt-2 flex items-baseline space-x-1.5">
            <span>{totalSkus}</span>
            <span className="text-xs font-normal text-[var(--text-muted)] font-sans">Active Listings</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-2.5 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-ping"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 -ml-4"></span>
            <span>3 Marketplaces Live • 100% In Stock</span>
          </div>
        </div>

        {/* KPI 2: Floor Compliance */}
        <div 
          onClick={() => setStatusFilter('protected')}
          className={`cursor-pointer bg-[var(--paper-card)]/90 backdrop-blur-md p-5 rounded-2xl border shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group border-l-4 border-l-emerald-500 ${statusFilter === 'protected' ? 'border-emerald-500 ring-1 ring-emerald-500/50' : 'border-[var(--card-border)]'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] md:text-sm font-brand-wide text-emerald-700 dark:text-emerald-400 font-bold tracking-wide uppercase">
              FLOOR COMPLIANCE
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-brand text-emerald-600 dark:text-emerald-400 tabular-numbers mt-2 flex items-baseline space-x-1.5">
            <span>{protectedProductsCount}</span>
            <span className="text-xs font-normal text-[var(--text-muted)] font-sans">/ {totalSkus} Protected</span>
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-2.5 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0" />
            <span>All above safe floor</span>
          </div>
        </div>

        {/* KPI 3: Competitor Undercuts */}
        <div 
          onClick={() => setStatusFilter('risk')}
          className={`cursor-pointer bg-[var(--paper-card)]/90 backdrop-blur-md p-5 rounded-2xl border shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group border-l-4 border-l-amber-500 ${statusFilter === 'risk' ? 'border-amber-500 ring-1 ring-amber-500/50' : 'border-[var(--card-border)]'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] md:text-sm font-brand-wide text-amber-700 dark:text-amber-400 font-bold tracking-wide uppercase">
              COMPETITOR UNDERCUTS
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-brand text-amber-600 dark:text-amber-400 tabular-numbers mt-2 flex items-baseline space-x-1.5">
            <span>{undercuttingCompetitorCount}</span>
            <span className="text-xs font-normal text-[var(--text-muted)] font-sans">Price Wars Active</span>
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-2.5 flex items-center">
            <Zap className="w-3.5 h-3.5 mr-1 shrink-0" />
            <span>Competitor priced lower</span>
          </div>
        </div>

        {/* KPI 4: Demand Velocity Index */}
        <div 
          onClick={() => setStatusFilter('fast_tier')}
          className={`cursor-pointer bg-[var(--paper-card)]/90 backdrop-blur-md p-5 rounded-2xl border shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group border-l-4 border-l-blue-500 ${statusFilter === 'fast_tier' ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-[var(--card-border)]'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] md:text-sm font-brand-wide text-blue-700 dark:text-blue-400 font-bold tracking-wide uppercase">
              HIGH DEMAND / FAST TIER
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-brand text-[var(--text-primary)] tabular-numbers mt-2 flex items-baseline space-x-1.5">
            <span>{tier1Count}</span>
            <span className="text-xs font-normal text-[var(--text-muted)] font-sans">Tier 1 SKUs</span>
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-2.5 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1 shrink-0" />
            <span>High velocity products</span>
          </div>
        </div>
      </div>

      {/* 4. Interactive Search, Filter Controls & Prominent Actions */}
      <div className="bg-[var(--paper-card)] border border-[var(--card-border)] rounded-2xl p-4 shadow-xs transition-colors space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Search Bar with Shortcut Hint */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-[var(--fog-300)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search catalog by SKU, product name, brand, ASIN, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--paper-50)] border border-[var(--card-border)] rounded-xl pl-10 pr-16 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--fog-300)] focus:outline-none focus:border-amber-500 transition-all duration-200"
            />
            {searchQuery ? (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Clear
              </button>
            ) : (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[var(--paper-card)] border border-[var(--card-border)] text-[10px] font-mono text-[var(--text-muted)]">
                ⌘K
              </span>
            )}
          </div>

          {/* Action Buttons: Prominent '+ Add Product Manually' + Companion Buttons */}
          <div className="flex items-center flex-wrap gap-2 shrink-0">
            {/* Companion 1: Import / Sync URL */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-2 bg-[var(--paper-50)] hover:bg-[var(--paper-card)] text-[var(--text-primary)] rounded-xl text-xs font-semibold border border-[var(--card-border)] hover:border-[var(--fog-300)] shadow-2xs transition-all flex items-center space-x-1.5"
              title="Import listing from Amazon, Flipkart or Meesho URL"
            >
              <LinkIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>Import URL</span>
            </button>

            {/* Companion 2: Repricing Rules */}
            <button
              onClick={() => onNavigateTab('auto_pricing')}
              className="px-3 py-2 bg-[var(--paper-50)] hover:bg-[var(--paper-card)] text-[var(--text-primary)] rounded-xl text-xs font-semibold border border-[var(--card-border)] hover:border-[var(--fog-300)] shadow-2xs transition-all flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Repricing Rules</span>
            </button>

            {/* Companion 3: Manage Fee Matrix */}
            <button
              onClick={() => onNavigateTab('fee_management')}
              className="px-3 py-2 bg-[var(--paper-50)] hover:bg-[var(--paper-card)] text-[var(--text-primary)] rounded-xl text-xs font-semibold border border-[var(--card-border)] hover:border-[var(--fog-300)] shadow-2xs transition-all flex items-center space-x-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>Fee Matrix</span>
            </button>

            {/* PROMINENT CTA: + Add Product Manually */}
            <button
              id="btnAddProductManually"
              onClick={() => setIsAddProductModalOpen(true)}
              className="px-4 py-2 bg-[var(--ink-950)] hover:bg-[var(--ink-800)] dark:bg-[var(--ink-700)] text-[#FAFAF9] rounded-xl text-xs font-bold border border-amber-500/40 shadow-xs hover:shadow-md transition-all flex items-center space-x-2 group hover:scale-[1.01]"
            >
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                +
              </span>
              <span>Add Product Manually</span>
            </button>
          </div>
        </div>

        {/* Filter Chips & Refined Category Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-[var(--card-border-subtle)]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[var(--text-muted)] mr-1">Status:</span>
            
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-[var(--ink-900)] dark:bg-[var(--ink-700)] text-[#FAFAF9] shadow-2xs'
                  : 'bg-[var(--paper-50)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--card-border)]'
              }`}
            >
              All SKUs ({totalSkus})
            </button>
            
            <button
              onClick={() => setStatusFilter('protected')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                statusFilter === 'protected'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-[var(--paper-50)] text-[var(--text-secondary)] hover:text-emerald-600 border border-[var(--card-border)]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Protected ({protectedProductsCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('risk')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                statusFilter === 'risk'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-[var(--paper-50)] text-[var(--text-secondary)] hover:text-amber-600 border border-[var(--card-border)]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Price War / Undercuts ({undercuttingCompetitorCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('fast_tier')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                statusFilter === 'fast_tier'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-[var(--paper-50)] text-[var(--text-secondary)] hover:text-blue-600 border border-[var(--card-border)]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Tier 1 Fast-Moving ({tier1Count})</span>
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-semibold text-[var(--text-muted)]">Category:</span>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-[var(--paper-50)] border border-[var(--card-border)] text-xs font-medium text-[var(--text-primary)] rounded-xl pl-3 pr-8 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
              >
                <option value="all">All Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Modular Product Card-Row List (Structured SaaS Design) */}
      <div className="bg-[var(--paper-card)] border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-xs transition-colors">
        
        {/* Table Banner Header */}
        <div className="p-4 border-b border-[var(--card-border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-[var(--paper-card)]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold font-brand text-[var(--text-primary)] tracking-tight">
                Product Catalog
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                Showing {filteredProducts.length} of {totalSkus} monitored listings on {platformMeta[selectedPlatform].name}
              </p>
            </div>
          </div>


        </div>

        {/* Product Cards List */}
        <div className="space-y-3 p-4">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-sm text-[var(--text-muted)] bg-[var(--paper-card)] border border-[var(--card-border)] rounded-2xl">
              <Package className="w-10 h-10 mx-auto text-[var(--fog-300)] mb-3" />
              <p className="font-semibold text-[var(--text-primary)]">No matching products found</p>
              <p className="text-xs mt-1">Try adjusting your search query or status filter.</p>
            </div>
          ) : (
            filteredProducts.map(({
              product,
              feeItem,
              floorPrice,
              currentPrice,
              competitor,
              isPriceAboveFloor,
              isUndercut,
              profitAboveFloor,
              demandScore
            }) => {
              const hasFloorBreach = !isPriceAboveFloor;
              const isExpanded = expandedRowId === product.id;
              
              // Status Styling
              const statusColor = hasFloorBreach ? 'rose' : (isUndercut ? 'amber' : 'emerald');
              
              // Recommendation Logic
              let recommendationTitle = "";
              let recommendationBody = "";
              let recommendationColor = "";
              
              if (hasFloorBreach) {
                recommendationTitle = "HOLD PRICE";
                recommendationBody = `Competitor is below your safe floor (₹${floorPrice}). Matching ₹${competitor?.currentPrice} would reduce your margin below the allowed limit.`;
                recommendationColor = "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400";
              } else if (isUndercut) {
                recommendationTitle = `LOWER TO ₹${competitor!.currentPrice}`;
                recommendationBody = `You can remain competitive while preserving ₹${(competitor!.currentPrice - floorPrice).toFixed(0)} of safety margin.`;
                recommendationColor = "text-amber-800 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400";
              } else {
                recommendationTitle = "RAISE PRICE";
                recommendationBody = "Demand is high and you have the buy box. You can safely capture more margin.";
                recommendationColor = "text-emerald-800 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400";
                if (!competitor?.inStock) {
                   recommendationBody = "Competitor is out of stock. You can safely capture more margin.";
                }
              }

              return (
                <div 
                  key={product.id}
                  className={`bg-[var(--paper-card)] rounded-[16px] border shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden ${
                    isExpanded ? 'border-[var(--ink-900)] dark:border-white ring-1 ring-[var(--ink-900)] dark:ring-white' : 'border-[var(--card-border)]'
                  }`}
                >
                  {/* COLLAPSED VIEW (Always visible header) */}
                  <div 
                    onClick={() => setExpandedRowId(isExpanded ? null : product.id)}
                    className={`cursor-pointer flex items-center gap-4 p-4 lg:p-5 border-l-4 ${
                      statusColor === 'rose' ? 'border-l-rose-500' : statusColor === 'amber' ? 'border-l-amber-500' : 'border-l-emerald-500'
                    } ${isExpanded ? 'bg-[var(--paper-50)]/50' : 'hover:bg-[var(--paper-50)]/30'}`}
                  >
                    {/* Product Image */}
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl overflow-hidden bg-[var(--paper-50)] border border-[var(--card-border)] shrink-0 shadow-2xs">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-[var(--fog-300)]" /></div>
                      )}
                    </div>
                    
                    {/* Product Identity */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {product.brand && (
                          <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{product.brand}</span>
                        )}
                        <span className="text-[10px] font-mono text-[var(--text-muted)] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded capitalize border border-[var(--card-border)]">{product.category.replace('_', ' ')}</span>
                      </div>
                      <div className="font-bold text-sm lg:text-base text-[var(--text-primary)] truncate" title={product.title}>
                        {product.title}
                      </div>
                    </div>

                    {/* Pricing Core Info */}
                    <div className="hidden md:flex flex-col items-end shrink-0 w-24">
                      <span className="text-[10px] uppercase font-mono text-[var(--text-muted)]">Your Price</span>
                      <span className="font-bold font-mono text-base text-[var(--text-primary)]">₹{currentPrice}</span>
                    </div>

                    <div className="hidden md:flex flex-col items-end shrink-0 w-24">
                      <span className="text-[10px] uppercase font-mono text-[var(--text-muted)]">Competitor</span>
                      <span className="font-bold font-mono text-base text-[var(--text-primary)]">₹{competitor?.currentPrice || 'N/A'}</span>
                    </div>

                    {/* Safety Buffer */}
                    <div className="hidden lg:flex flex-col items-end shrink-0 w-32" title="Amount your current price is above your minimum profitable price.">
                      <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] flex items-center gap-1">
                        Safety Buffer <Info className="w-3 h-3 text-[var(--fog-300)]" />
                      </span>
                      {hasFloorBreach ? (
                        <span className="text-sm font-bold font-mono text-rose-600 dark:text-rose-400">-₹{Math.abs(profitAboveFloor)}</span>
                      ) : (
                        <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">+₹{profitAboveFloor}</span>
                      )}
                    </div>

                    {/* Demand Score */}
                    <div className="hidden xl:flex flex-col items-end shrink-0 w-24" title="Calculated demand velocity based on category and competitor stock">
                      <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] flex items-center gap-1">
                        Demand <Info className="w-3 h-3 text-[var(--fog-300)]" />
                      </span>
                      <div className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-bold text-sm text-[var(--text-primary)]">{demandScore}</span>
                      </div>
                    </div>

                    {/* Status Indicator */}
                    <div className="shrink-0 w-28 flex justify-end">
                      {hasFloorBreach ? (
                         <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 shadow-2xs">Margin At Risk</span>
                      ) : (
                         <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">Margin Safe</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onSelectProduct(product.id); onNavigateTab('price_compare'); }}
                        className="px-3 py-1.5 bg-[var(--paper-50)] hover:bg-[var(--ink-900)] hover:text-white dark:hover:bg-white dark:hover:text-[var(--ink-900)] text-[var(--text-primary)] rounded-lg text-xs font-semibold border border-[var(--card-border)] shadow-2xs transition-all hidden sm:block"
                      >
                        Compare
                      </button>
                      <button className="p-1.5 text-[var(--text-muted)] hover:bg-[var(--paper-card)] border border-transparent hover:border-[var(--card-border)] rounded-lg transition-colors">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* EXPANDED VIEW */}
                  <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 border-t border-[var(--card-border-subtle)]' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <div className="p-5 lg:p-6 bg-[var(--paper-card)] flex flex-col xl:flex-row gap-6">
                        
                        {/* Left Column: Data Grid */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                          
                          {/* 1. PRICING SUMMARY */}
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider mb-2">Pricing Summary</h4>
                            <div className="space-y-2.5 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-[var(--text-secondary)]">Your Price</span>
                                <span className="font-mono font-bold text-[var(--text-primary)]">₹{currentPrice}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[var(--text-secondary)]">Competitor Price</span>
                                <span className="font-mono font-bold text-[var(--text-primary)]">₹{competitor?.currentPrice || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center border-t border-[var(--card-border-subtle)] pt-2.5" title="The absolute minimum selling price required to break even">
                                <span className="text-[var(--text-secondary)] flex items-center gap-1 border-b border-dotted border-[var(--text-muted)] cursor-help">Safe Floor</span>
                                <span className="font-mono font-bold text-[var(--text-primary)]">₹{floorPrice}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[var(--text-secondary)]">Safety Buffer</span>
                                <span className={`font-mono font-bold ${hasFloorBreach ? 'text-rose-500' : 'text-emerald-500'}`}>
                                  {hasFloorBreach ? '-' : '+'}₹{Math.abs(profitAboveFloor)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 2. COST BREAKDOWN */}
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider mb-2">Cost Breakdown</h4>
                            <div className="space-y-2.5 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-[var(--text-secondary)]">Product Cost (COGS)</span>
                                <span className="font-mono text-[var(--text-primary)]">₹{product.landedCost}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[var(--text-secondary)]">Comm. ({feeItem.commissionPct}%)</span>
                                <span className="font-mono text-[var(--text-primary)]">₹{Math.round(feeItem.commissionPct * currentPrice / 100)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[var(--text-secondary)]">Shipping & Fees</span>
                                <span className="font-mono text-[var(--text-primary)]">₹{feeItem.logisticsFee + feeItem.closingFee + feeItem.pickPackFee}</span>
                              </div>
                              <div className="flex justify-between items-center border-t border-[var(--card-border-subtle)] pt-2.5">
                                <span className="text-[var(--text-secondary)]">Target Profit</span>
                                <span className="font-mono font-bold text-[var(--text-primary)]">₹{product.targetMargin}</span>
                              </div>
                            </div>
                          </div>

                          {/* 3. MARKET INTELLIGENCE */}
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider mb-2">Market Intelligence</h4>
                            <div className="space-y-2.5 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-[var(--text-secondary)]">Competitor Seller</span>
                                <span className="font-medium text-[var(--text-primary)] text-right max-w-[120px] truncate" title={competitor?.competitorName}>{competitor?.competitorName || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[var(--text-secondary)]">Stock Status</span>
                                <span>
                                  {competitor?.inStock ? (
                                    <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 rounded text-[10px] font-bold border border-emerald-500/20">IN STOCK</span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-600 rounded text-[10px] font-bold border border-rose-500/20">OOS</span>
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[var(--text-secondary)]">Last Updated</span>
                                <span className="text-xs text-[var(--text-primary)]">{competitor?.lastScraped || 'N/A'}</span>
                              </div>
                              <div className="pt-2.5 border-t border-[var(--card-border-subtle)] flex items-center justify-between">
                                <span className="text-[var(--text-secondary)] text-xs">SKU: <span className="font-mono text-[var(--text-primary)]">{product.sku}</span></span>
                                {product.asin && <span className="text-[var(--text-secondary)] text-xs">ASIN: <span className="font-mono text-[var(--text-primary)]">{product.asin}</span></span>}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column: Recommendation & Actions */}
                        <div className="xl:w-80 flex flex-col gap-4 border-t xl:border-t-0 xl:border-l border-[var(--card-border-subtle)] pt-4 xl:pt-0 xl:pl-6">
                           
                           {/* BOKASA RECOMMENDATION CARD */}
                           <div className={`p-4 rounded-xl border shadow-2xs ${recommendationColor}`}>
                             <div className="flex items-center gap-1.5 mb-2 opacity-80">
                               <Sparkles className="w-4 h-4" />
                               <span className="text-[10px] font-bold font-mono tracking-wide uppercase">Bokasa Recommendation</span>
                             </div>
                             <div className="font-black font-brand text-xl mb-1.5">{recommendationTitle}</div>
                             <p className="text-xs opacity-90 leading-relaxed font-medium">{recommendationBody}</p>
                           </div>

                           {/* EXPANDED ACTIONS */}
                           <div className="grid grid-cols-2 gap-2 mt-auto">
                              <button 
                                onClick={() => { onSelectProduct(product.id); onNavigateTab('cost_floor'); }}
                                className="px-3 py-2 bg-[var(--paper-50)] hover:bg-[var(--paper-card)] text-[var(--text-primary)] rounded-lg text-xs font-semibold border border-[var(--card-border)] hover:border-amber-500 shadow-2xs transition-all flex items-center justify-center gap-1.5"
                              >
                                <Calculator className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Floor Breakdown
                              </button>
                              <button 
                                onClick={() => { onSelectProduct(product.id); onNavigateTab('auto_pricing'); }}
                                className="px-3 py-2 bg-[var(--paper-50)] hover:bg-[var(--paper-card)] text-[var(--text-primary)] rounded-lg text-xs font-semibold border border-[var(--card-border)] hover:border-amber-500 shadow-2xs transition-all flex items-center justify-center gap-1.5"
                              >
                                <Sliders className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Repricing Rule
                              </button>
                           </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[var(--paper-50)]/70 border-t border-[var(--card-border)] flex items-center justify-end text-xs text-[var(--text-muted)]">
          <span className="font-mono text-[11px]">Prices include 18% GST</span>
        </div>

      </div>

      {/* 6. MODAL: + Add Product Manually */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[var(--paper-card)] border border-[var(--card-border)] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-scaleIn">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-[var(--card-border)] flex items-center justify-between bg-[var(--paper-50)]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-brand text-[var(--text-primary)]">
                    Add Product to Monitored Catalog
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Add a new product to your monitored catalog
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddProductModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateProduct} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Carbon Pro 16mm Pickleball Paddle Set with Cover"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[var(--paper-50)] border border-[var(--card-border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SPORT-CARBON-01"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full bg-[var(--paper-50)] border border-[var(--card-border)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. YAIT Sports"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full bg-[var(--paper-50)] border border-[var(--card-border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[var(--paper-50)] border border-[var(--card-border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="electronics">Electronics</option>
                    <option value="sports">Sports</option>
                    <option value="apparel">Apparel</option>
                    <option value="home_kitchen">Home & Kitchen</option>
                    <option value="beauty">Beauty & Personal Care</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                    ASIN / Listing ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B0CPICKLE88"
                    value={newAsin}
                    onChange={(e) => setNewAsin(e.target.value)}
                    className="w-full bg-[var(--paper-50)] border border-[var(--card-border)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Financial Architecture Input Grid */}
              <div className="p-3.5 rounded-xl bg-[var(--paper-50)] border border-[var(--card-border)] space-y-3">
                <div className="text-[11px] font-mono uppercase text-[var(--text-muted)] font-semibold">
                  Cost & Minimum Margin Architecture
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[10.5px] font-medium text-[var(--text-secondary)] mb-0.5">
                      Landed Cost (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={newLandedCost}
                      onChange={(e) => setNewLandedCost(Number(e.target.value))}
                      className="w-full bg-[var(--paper-card)] border border-[var(--card-border)] rounded-lg px-2.5 py-1.5 font-mono text-xs text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-medium text-[var(--text-secondary)] mb-0.5">
                      Floor Margin (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={newMinMargin}
                      onChange={(e) => setNewMinMargin(Number(e.target.value))}
                      className="w-full bg-[var(--paper-card)] border border-[var(--card-border)] rounded-lg px-2.5 py-1.5 font-mono text-xs text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-medium text-[var(--text-secondary)] mb-0.5">
                      Selling Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={newSellingPrice}
                      onChange={(e) => setNewSellingPrice(Number(e.target.value))}
                      className="w-full bg-[var(--paper-card)] border border-[var(--card-border)] rounded-lg px-2.5 py-1.5 font-mono text-xs text-[var(--text-primary)]"
                    />
                  </div>
                </div>

                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  <span>Calculated floor safeguards will automatically prevent undercutting past ₹{newLandedCost + newMinMargin}.</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Product Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full bg-[var(--paper-50)] border border-[var(--card-border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-[var(--card-border)] flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--ink-950)] hover:bg-[var(--ink-800)] dark:bg-[var(--ink-700)] text-[#FAFAF9] rounded-xl text-xs font-bold border border-amber-500/40 shadow-xs flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Save & Protect SKU</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: Import URL / Competitor Scraper */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[var(--paper-card)] border border-[var(--card-border)] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
            <div className="p-5 border-b border-[var(--card-border)] flex items-center justify-between bg-[var(--paper-50)]">
              <div className="flex items-center space-x-2">
                <LinkIcon className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold font-brand text-[var(--text-primary)]">
                  Import Marketplace Listing URL
                </h3>
              </div>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="p-5 space-y-3.5">
              <p className="text-xs text-[var(--text-secondary)]">
                Paste an Amazon IN, Flipkart, or Meesho product URL to automatically sync real-time competitor prices and reviews.
              </p>
              
              <div>
                <input
                  type="url"
                  required
                  placeholder="https://www.amazon.in/dp/B0CPICKLE99..."
                  value={importUrlInput}
                  onChange={(e) => setImportUrlInput(e.target.value)}
                  className="w-full bg-[var(--paper-50)] border border-[var(--card-border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[var(--text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importLoading}
                  className="px-4 py-2 bg-[var(--ink-950)] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5"
                >
                  {importLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <span>Import & Track</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
