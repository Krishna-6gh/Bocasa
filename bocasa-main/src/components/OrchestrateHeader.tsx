import React, { useState, useRef, useEffect } from 'react';
import { BocasaLogo } from './BocasaLogo';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Check, 
  RefreshCw, 
  Store, 
  Key, 
  Sliders, 
  X, 
  ExternalLink, 
  Zap, 
  Tag,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { ProductSKU, SystemTab, PlatformId } from '../types';

interface OrchestrateHeaderProps {
  activeTab: SystemTab;
  setActiveTab: (tab: SystemTab) => void;
  products: ProductSKU[];
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  geminiActive: boolean;
  isDarkTheme?: boolean;
  setIsDarkTheme?: (isDark: boolean) => void;
  currentUser?: { email: string; storeName?: string; isDemo?: boolean; name?: string } | null;
  onSignOut?: () => void;
}

export const OrchestrateHeader: React.FC<OrchestrateHeaderProps> = ({
  activeTab,
  setActiveTab,
  products,
  selectedProductId,
  setSelectedProductId,
  isDarkTheme = false,
  currentUser,
  onSignOut,
}) => {
  // Sync Status Modal
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isGlobalSyncing, setIsGlobalSyncing] = useState(false);
  const [syncLastTimes, setSyncLastTimes] = useState<Record<PlatformId, string>>({
    amazon: '1m ago',
    flipkart: '3m ago',
    meesho: '8m ago',
  });
  const [syncingPlatforms, setSyncingPlatforms] = useState<Record<PlatformId, boolean>>({
    amazon: false,
    flipkart: false,
    meesho: false,
  });

  // SKU Dropdown
  const [isSkuDropdownOpen, setIsSkuDropdownOpen] = useState(false);
  const [skuSearchFilter, setSkuSearchFilter] = useState('');

  // Notifications
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Profile Menu
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const activeProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Close dropdowns on click outside
  const headerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsSyncModalOpen(false);
        setIsSkuDropdownOpen(false);
        setIsNotificationsOpen(false);
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleManualSync = (platform: PlatformId) => {
    setSyncingPlatforms((prev) => ({ ...prev, [platform]: true }));
    setTimeout(() => {
      setSyncingPlatforms((prev) => ({ ...prev, [platform]: false }));
      setSyncLastTimes((prev) => ({ ...prev, [platform]: 'Just now' }));
    }, 1000);
  };

  const handleGlobalSyncAll = () => {
    setIsGlobalSyncing(true);
    setTimeout(() => {
      setIsGlobalSyncing(false);
      setSyncLastTimes({
        amazon: 'Just now',
        flipkart: 'Just now',
        meesho: 'Just now',
      });
    }, 1400);
  };

  const filteredSkus = products.filter(
    (p) =>
      p.sku.toLowerCase().includes(skuSearchFilter.toLowerCase()) ||
      p.title.toLowerCase().includes(skuSearchFilter.toLowerCase())
  );

  // Title for active page
  const tabTitles: Record<SystemTab, string> = {
    price_compare: 'Price Compare & Reprice Hub',
    seller_dashboard: 'Seller Executive Dashboard',
    decision: 'Autonomous Decision Engine',
    cost_floor: 'Cost Floor & Break-Even Matrix',
    fee_management: 'Platform Fee Matrix',
    auto_pricing: 'Repricing Logs & Automation Engine',
    ai_chat: 'Bocasa AI Copilot & Marketplace Strategist',
    collector: 'Competitor Intelligence Scraper',
    distribution: 'Marketplace Sync Rails',
    demand: 'Demand & Surge Signals',
    architecture: 'System Topology',
    traces_handoff: 'Bocasa Overview',
    tech_stack: 'Technical Specifications',
    roadmap: 'Platform Roadmap',
    settings: 'Store & Platform Settings',
  };

  const notifications = [
    {
      id: 'n1',
      title: 'Flipkart Buy Box Opportunity',
      desc: 'Competitor on Flipkart dropped to ₹1,285. Match to win Buy Box without crossing ₹1,140 floor.',
      time: '14m ago',
      urgent: true,
    },
    {
      id: 'n2',
      title: 'Amazon EasyShip Rate Matrix Sync',
      desc: 'Q1 logistics slabs refreshed with 0% delta against your stored cost floor.',
      time: '1h ago',
      urgent: false,
    },
  ];

  return (
    <header 
      ref={headerRef} 
      className="bg-[var(--paper-card)]/95 backdrop-blur-md border-b border-[var(--card-border)] px-4 sm:px-6 py-2.5 sticky top-0 z-40 transition-colors shadow-2xs"
    >
      <div className="flex items-center justify-between gap-4">
        
        {/* Left: Brand + Active View Context */}
        <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
          <BocasaLogo
            variant="full"
            size="sm"
            isDark={isDarkTheme}
            showBadge={true}
            badgeText="PRO"
            onClick={() => setActiveTab('price_compare')}
          />

          <div className="hidden lg:flex items-center space-x-2 border-l border-[var(--card-border)] pl-3">
            <span className="text-xs font-semibold font-brand text-[var(--text-muted)]">
              {tabTitles[activeTab] || 'Dashboard'}
            </span>
          </div>
        </div>

        {/* Center: Quick Primary Switcher (matching login pill aesthetic) */}
        <div className="hidden sm:flex items-center space-x-1 bg-[var(--paper-50)] p-1 rounded-full border border-[var(--card-border)]">
          <button
            onClick={() => setActiveTab('price_compare')}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'price_compare'
                ? 'bg-[var(--ink-900)] dark:bg-[var(--ink-700)] text-[#FAFAF9] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Price Compare
          </button>
          <button
            onClick={() => setActiveTab('seller_dashboard')}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'seller_dashboard'
                ? 'bg-[var(--ink-900)] dark:bg-[var(--ink-700)] text-[#FAFAF9] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('decision')}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'decision'
                ? 'bg-[var(--ink-900)] dark:bg-[var(--ink-700)] text-[#FAFAF9] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Decision Engine
          </button>
          <button
            id="header-nav-ai-chat"
            onClick={() => setActiveTab('ai_chat')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'ai_chat'
                ? 'bg-[var(--ink-900)] dark:bg-[var(--ink-700)] text-[#FAFAF9] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>AI Copilot</span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
              Chat
            </span>
          </button>
        </div>

        {/* Right: Clean, Compact Global Actions */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
          
          {/* 1. Global Sync Status Pill (Sleek, Compact) */}
          <div className="relative">
            <button
              onClick={() => setIsSyncModalOpen(!isSyncModalOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/70 dark:border-slate-700 text-xs transition cursor-pointer shadow-2xs"
              title="Marketplace sync health"
            >
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 hidden md:inline">
                3/3 Synced
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isSyncModalOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Sync Status Flyout */}
            {isSyncModalOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-4 z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Marketplace Connection Health</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">All 3 seller channels operational</p>
                  </div>
                  <button onClick={() => setIsSyncModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Amazon */}
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">Amazon SP-API</div>
                        <div className="text-[10px] text-slate-400">Synced {syncLastTimes.amazon}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleManualSync('amazon')}
                      disabled={syncingPlatforms.amazon}
                      className="px-2 py-1 text-[10px] font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 transition flex items-center space-x-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${syncingPlatforms.amazon ? 'animate-spin text-blue-500' : ''}`} />
                      <span>Sync</span>
                    </button>
                  </div>

                  {/* Flipkart */}
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">Flipkart Marketplace</div>
                        <div className="text-[10px] text-slate-400">Synced {syncLastTimes.flipkart}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleManualSync('flipkart')}
                      disabled={syncingPlatforms.flipkart}
                      className="px-2 py-1 text-[10px] font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 transition flex items-center space-x-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${syncingPlatforms.flipkart ? 'animate-spin text-blue-500' : ''}`} />
                      <span>Sync</span>
                    </button>
                  </div>

                  {/* Meesho */}
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">Meesho Supplier Direct</div>
                        <div className="text-[10px] text-slate-400">Synced {syncLastTimes.meesho}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleManualSync('meesho')}
                      disabled={syncingPlatforms.meesho}
                      className="px-2 py-1 text-[10px] font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 transition flex items-center space-x-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${syncingPlatforms.meesho ? 'animate-spin text-blue-500' : ''}`} />
                      <span>Sync</span>
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setIsSyncModalOpen(false);
                      setActiveTab('settings');
                    }}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Manage API Credentials
                  </button>

                  <button
                    onClick={handleGlobalSyncAll}
                    disabled={isGlobalSyncing}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition"
                  >
                    <RefreshCw className={`w-3 h-3 ${isGlobalSyncing ? 'animate-spin' : ''}`} />
                    <span>{isGlobalSyncing ? 'Syncing...' : 'Sync All'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Active Product SKU Pill */}
          <div className="relative">
            <button
              onClick={() => setIsSkuDropdownOpen(!isSkuDropdownOpen)}
              className="flex items-center space-x-2 bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 px-3 py-1.5 rounded-full border border-slate-200/70 dark:border-slate-700 text-xs transition cursor-pointer shadow-2xs"
            >
              <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 max-w-[120px] sm:max-w-[150px] truncate">
                {activeProduct.sku}
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isSkuDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* SKU Dropdown Selector */}
            {isSkuDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-3 z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Catalog SKUs</span>
                  <span className="text-[10px] text-slate-400 font-mono">{products.length} Products</span>
                </div>

                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search SKU or title..."
                    value={skuSearchFilter}
                    onChange={(e) => setSkuSearchFilter(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1">
                  {filteredSkus.map((p) => {
                    const isSelected = p.id === selectedProductId;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedProductId(p.id);
                          setIsSkuDropdownOpen(false);
                          setSkuSearchFilter('');
                        }}
                        className={`p-2 rounded-xl cursor-pointer transition flex items-center justify-between text-xs ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="space-y-0.5 truncate pr-2">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{p.sku}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                              {p.category}
                            </span>
                          </div>
                          <div className="text-[11px] truncate font-medium text-slate-600 dark:text-slate-400">{p.title}</div>
                        </div>

                        {isSelected && (
                          <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative transition cursor-pointer"
              title="Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600"></span>
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-3 z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Live Repricing Alerts</div>
                  <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Elegant User Profile Avatar */}
          <div className="relative pl-1 border-l border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer group"
              title="Seller Profile"
            >
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Avatar"
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-amber-500/30 group-hover:ring-amber-500 transition"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
              </div>
              <span className="text-xs font-bold font-brand text-[var(--text-primary)] hidden xl:inline">
                {currentUser?.name || 'Arjun'}
              </span>
              <ChevronDown className={`w-3 h-3 text-[var(--fog-300)] transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[var(--paper-card)] border border-[var(--card-border)] rounded-2xl shadow-xl p-3 z-50 animate-fadeIn">
                <div className="p-3 rounded-xl bg-[var(--paper-50)] border border-[var(--card-border)] mb-2">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/40"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold font-brand text-[var(--text-primary)] truncate">
                        {currentUser?.name || 'Arjun'}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] truncate">
                        {currentUser?.storeName || 'Arjun Retail Brands Pvt Ltd'}
                      </div>
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-semibold mt-0.5 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>BOCASA PRO SELLER</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  <button
                    onClick={() => {
                      setActiveTab('price_compare');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Tag className="w-4 h-4 text-amber-500" />
                    <span>Price Compare & Reprice Hub</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('seller_dashboard');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Store className="w-4 h-4 text-blue-500" />
                    <span>Seller Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('fee_management');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Sliders className="w-4 h-4 text-purple-500" />
                    <span>Platform Fee Matrix</span>
                  </button>

                  {onSignOut && (
                    <div className="pt-1.5 mt-1.5 border-t border-slate-200/80 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onSignOut();
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out / Switch Store</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
