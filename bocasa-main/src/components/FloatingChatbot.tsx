import React, { useState, useEffect } from 'react';
import { Bot, X, Send, Sparkles, ArrowRight } from 'lucide-react';
import { ProductSKU } from '../types';

interface FloatingChatbotProps {
  products?: ProductSKU[];
  selectedProduct?: ProductSKU;
  onNavigateTab?: (tab: string) => void;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ selectedProduct, onNavigateTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Subtle tooltip bounce after load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted && !isOpen) {
        setShowTooltip(true);
      }
    }, 2500); // Wait 2.5s before showing tooltip
    
    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 8500); // Hide after 8.5s
    
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [hasInteracted, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setShowTooltip(false);
    setHasInteracted(true);
  };

  const isBelowFloor = selectedProduct 
    ? selectedProduct.currentSellingPrices.amazon < (selectedProduct.landedCost + selectedProduct.minMargin)
    : false;

  const quickActions = selectedProduct ? [
    `Explain the price for ${selectedProduct.title.substring(0, 15)}...`,
    isBelowFloor ? "Why is this product below the safe floor?" : "Can I safely lower the price?",
    "Show my highest-risk products",
    "How was the safe floor calculated?"
  ] : [
    "Explain my pricing strategy",
    "Show my highest-risk products",
    "How are safe floors calculated?",
    "What is the decision engine?"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Chat Panel */}
      <div 
        className={`pointer-events-auto transition-all duration-300 origin-bottom-right mb-4 ${
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none absolute bottom-full right-0'
        }`}
      >
        <div className="w-[calc(100vw-48px)] sm:w-[340px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-[#111827] p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-inner">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">BOKASA AI</h3>
                <p className="text-[10px] text-slate-400">Your pricing copilot</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 h-[320px] overflow-y-auto bg-slate-50 dark:bg-slate-950 space-y-4 hide-scrollbar">
            
            {/* Welcome Message */}
            <div className="flex space-x-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center shrink-0 mt-1 shadow-xs border border-blue-200 dark:border-blue-800">
                <Bot className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-sm p-3 shadow-xs">
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Hi there! I'm monitoring your catalog. 
                  {selectedProduct && (
                    <span className="block mt-2 font-medium text-blue-700 dark:text-blue-400">
                      I see you're looking at <span className="font-bold">{selectedProduct.sku}</span>. 
                      {isBelowFloor ? ' It looks like it is currently priced below the safe floor. Should we fix that?' : ' It looks healthy right now.'}
                    </span>
                  )}
                  <span className="block mt-2">What do you need help with?</span>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Suggested Questions</p>
              <div className="flex flex-col space-y-2">
                {quickActions.map((action, idx) => (
                  <button 
                    key={idx}
                    className="text-left px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-blue-600 dark:text-blue-400 font-medium hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-between group shadow-xs hover:shadow-sm"
                  >
                    <span>{action}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-4px] group-hover:translate-x-0" />
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ask Bokasa AI..."
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full pl-4 pr-10 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-sm">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      <div 
        className={`pointer-events-auto absolute bottom-[68px] right-2 transition-all duration-500 ease-out ${
          showTooltip 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <div className="bg-[#111827] text-white text-xs font-medium px-4 py-2.5 rounded-2xl rounded-br-sm shadow-xl border border-slate-800 flex items-center space-x-2 whitespace-nowrap group hover:scale-105 cursor-pointer transition-transform" onClick={handleOpen}>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Need help with this price?</span>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={handleOpen}
        className={`pointer-events-auto relative w-14 h-14 rounded-full bg-[#111827] shadow-xl flex items-center justify-center text-white hover:scale-110 transition-all duration-200 group ring-4 ring-white dark:ring-[#F8FAFC] ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 hover:shadow-2xl'}`}
        title="Open BOKASA AI"
      >
        <div className="absolute inset-0 bg-blue-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity"></div>
        <Bot className="w-6 h-6 transition-transform group-hover:scale-110" />
        {/* Online Dot */}
        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#F8FAFC] rounded-full shadow-sm"></span>
      </button>

    </div>
  );
};
