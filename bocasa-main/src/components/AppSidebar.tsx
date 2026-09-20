import React from 'react';
import { 
  Sun, 
  Moon, 
  LayoutGrid, 
  Bot, 
  DollarSign, 
  Wrench, 
  Plug, 
  Settings,
  Search,
  TrendingUp,
  Sparkles,
  Tag,
  MessageSquareText,
  Plus
} from 'lucide-react';
import { SystemTab } from '../types';

interface AppSidebarProps {
  activeTab: SystemTab;
  setActiveTab: (tab: SystemTab) => void;
  isDarkTheme: boolean;
  setIsDarkTheme: (isDark: boolean) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  setActiveTab,
  isDarkTheme,
  setIsDarkTheme,
}) => {
  const navSections = [
    {
      title: 'SETUP',
      items: [
        { id: 'fee_management', icon: <Wrench className="w-4 h-4" />, label: 'Fee Matrix' },
        { id: 'cost_floor', icon: <DollarSign className="w-4 h-4" />, label: 'Cost & Floor' },
      ]
    },
    {
      title: 'DAILY WORKFLOW',
      items: [
        { id: 'price_compare', icon: <Tag className="w-4 h-4" />, label: 'Price Hub' },
        { id: 'decision', icon: <Bot className="w-4 h-4" />, label: 'Decision Engine' },
        { id: 'collector', icon: <Search className="w-4 h-4" />, label: 'Competitor Tracker' },
        { id: 'demand', icon: <TrendingUp className="w-4 h-4" />, label: 'Demand Signals' },
        { id: 'auto_pricing', icon: <Sparkles className="w-4 h-4" />, label: 'Auto Repricing' },
      ]
    },
    {
      title: 'CATALOG & ANALYTICS',
      items: [
        { id: 'seller_dashboard', icon: <LayoutGrid className="w-4 h-4" />, label: 'Dashboard' },
        { id: 'ai_chat', icon: <MessageSquareText className="w-4 h-4" />, label: 'AI Copilot', badge: 'AI' },
        { id: 'distribution', icon: <Plug className="w-4 h-4" />, label: 'Distribution' },
      ]
    }
  ];

  return (
    <aside className="w-60 bg-[var(--paper-card)] border-r border-[var(--card-border)] flex flex-col h-screen sticky top-0 shrink-0 z-40 transition-colors shadow-sm">
      
      {/* Logo & Add Product — compact top area */}
      <div className="px-5 pt-5 pb-3 shrink-0">
        <div 
          onClick={() => setActiveTab('price_compare')}
          className="flex items-center space-x-2.5 mb-4 cursor-pointer group"
          title="Go to Dashboard"
        >
          <div className="w-10 h-10 rounded-xl bg-[#111827] text-white flex items-center justify-center font-extrabold text-lg shrink-0 shadow-md transition-transform duration-200 group-hover:scale-105">
            B
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-extrabold text-lg font-brand text-[var(--text-primary)] leading-none tracking-tight">Bocasa</span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 leading-none tracking-wider uppercase mt-0.5">MarginGuard PRO</span>
          </div>
        </div>

        <button 
          onClick={() => setActiveTab('seller_dashboard')}
          className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--paper-50)] text-[var(--text-primary)] font-semibold text-[13px] hover:bg-[var(--ink-900)] hover:text-white dark:hover:bg-white dark:hover:text-[var(--ink-900)] transition-all shadow-2xs group"
        >
          <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" />
          <span>Add Product</span>
          <span className="bg-amber-500 text-white text-[8px] font-bold px-1.5 py-px rounded ml-1 tracking-wider">NEW</span>
        </button>
      </div>

      {/* Navigation — compact, no scroll */}
      <nav className="flex-1 px-4 space-y-4 py-1">
        {navSections.map((section, idx) => (
          <div key={idx}>
            <div className="px-2.5 mb-1.5 text-[10px] font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase">
              {section.title}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id as SystemTab)}
                      className={`w-full flex items-center justify-between px-2.5 py-[7px] rounded-lg text-[13px] font-semibold transition-all duration-150 group ${
                        isActive
                          ? 'bg-[var(--ink-900)] dark:bg-white text-[#FAFAF9] dark:text-[var(--ink-900)] shadow-sm'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--paper-50)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className={`${isActive ? 'text-amber-400 dark:text-amber-600' : 'text-[var(--text-muted)] group-hover:text-amber-500 transition-colors'}`}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] font-black px-1.5 py-px rounded tracking-wide ${
                          isActive 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom — Settings + Theme, compact */}
      <div className="px-4 pb-4 pt-3 border-t border-[var(--card-border-subtle)] space-y-3 shrink-0 bg-[var(--paper-card)]">
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center justify-center space-x-2 py-2 rounded-lg font-bold text-[13px] transition-all shadow-2xs ${
            activeTab === 'settings' 
              ? 'bg-[var(--ink-900)] dark:bg-white text-white dark:text-[var(--ink-900)]' 
              : 'bg-[var(--paper-50)] text-[var(--text-primary)] border border-[var(--card-border)] hover:bg-[var(--ink-900)] hover:text-white dark:hover:bg-white dark:hover:text-[var(--ink-900)]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>

        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase">Theme</span>
          <div className="flex bg-[var(--paper-50)] rounded-md p-0.5 border border-[var(--card-border)]">
            <button
              onClick={() => setIsDarkTheme(false)}
              className={`p-1 rounded transition-all duration-150 ${
                !isDarkTheme 
                  ? 'bg-white dark:bg-slate-800 shadow-xs text-amber-500' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsDarkTheme(true)}
              className={`p-1 rounded transition-all duration-150 ${
                isDarkTheme 
                  ? 'bg-slate-700 text-amber-400 shadow-xs' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

