import React from 'react';
import { BocasaLogo } from './BocasaLogo';
import { 
  ShieldCheck, 
  Layers, 
  Search, 
  Calculator, 
  Cpu, 
  Send, 
  TrendingUp, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  LayoutDashboard,
  Sliders,
  Sparkles
} from 'lucide-react';
import { ProductSKU, SystemTab } from '../types';

interface NavbarProps {
  activeTab: SystemTab;
  setActiveTab: (tab: SystemTab) => void;
  products: ProductSKU[];
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  geminiActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  products,
  selectedProductId,
  setSelectedProductId,
  geminiActive,
}) => {
  const activeProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const navItems: { id: SystemTab; label: string; shortLabel: string; icon: React.ReactNode; highlight?: boolean }[] = [
    { id: 'seller_dashboard', label: 'Seller Dashboard', shortLabel: 'Seller Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, highlight: true },
    { id: 'fee_management', label: 'Fee Matrix Manager', shortLabel: 'Fee Management', icon: <Sliders className="w-4 h-4" />, highlight: true },
    { id: 'auto_pricing', label: 'Automated Pricing & Guardrails', shortLabel: 'Auto-Pricing', icon: <Sparkles className="w-4 h-4" />, highlight: true },
    { id: 'architecture', label: '1. Five Layers System Shape', shortLabel: 'System Shape', icon: <Layers className="w-4 h-4" /> },
    { id: 'collector', label: '2. Competitor Collection', shortLabel: 'Layer 1: Collector', icon: <Search className="w-4 h-4" /> },
    { id: 'cost_floor', label: '3. Cost & Floor Engine', shortLabel: 'Layer 2: Cost Engine', icon: <Calculator className="w-4 h-4" /> },
    { id: 'decision', label: '4. Decision Engine & AI', shortLabel: 'Layer 3: Decisions', icon: <Cpu className="w-4 h-4" /> },
    { id: 'distribution', label: '5. Distribution Rails', shortLabel: 'Layer 4: Distribution', icon: <Send className="w-4 h-4" /> },
    { id: 'demand', label: '6. Demand Intelligence', shortLabel: 'Layer 5: Demand', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'tech_stack', label: '7. Tech Stack & DDL', shortLabel: 'Stack & Schema', icon: <Database className="w-4 h-4" /> },
    { id: 'roadmap', label: '8. Phased Build Order', shortLabel: 'Roadmap', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-sm">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <BocasaLogo
            variant="full"
            size="sm"
            isDark={true}
            showBadge={true}
            badgeText="ENGINE"
            onClick={() => setActiveTab('seller_dashboard')}
          />
          <div className="hidden lg:block border-l border-slate-800 pl-3">
            <p className="text-xs text-slate-400">
              India Multi-Marketplace Pricing Architecture & Engine
            </p>
          </div>
        </div>

        {/* Active SKU Picker and Integration Rails Status */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Active Product Selector */}
          <div className="flex items-center space-x-2 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700 text-xs transition-all duration-200 hover:scale-[1.01]">
            <span className="text-slate-400">Target SKU:</span>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              aria-label="Select Target SKU"
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer max-w-[180px] sm:max-w-[260px] truncate transition-all duration-200 hover:scale-[1.01] focus:ring-2 focus:ring-emerald-500/40 rounded"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.sku} — {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Integration Status Badges */}
          <div className="hidden md:flex items-center space-x-1.5 text-[11px] font-mono">
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700" title="Amazon SP-API OAuth Connected">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
              Amazon SP-API
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700" title="Flipkart Seller API Registered">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
              Flipkart API
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700" title="Meesho Channel Integrator: Fynd Konnect">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mr-1.5"></span>
              Meesho (Fynd)
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded border ${
              geminiActive ? 'bg-indigo-950 text-indigo-300 border-indigo-800' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`} title="Gemini 3.8 Flash Decision Explainer">
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${geminiActive ? 'bg-indigo-400' : 'bg-slate-400'}`}></span>
              Gemini 3.8
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none" aria-label="Blueprint Navigation">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-[1.01] active:ring-2 active:ring-emerald-500/40 ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {item.icon}
                <span>{item.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
