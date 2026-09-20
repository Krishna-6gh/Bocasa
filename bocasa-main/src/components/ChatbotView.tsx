import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  TrendingUp, 
  ShieldCheck, 
  DollarSign, 
  HelpCircle, 
  ArrowRight, 
  RefreshCw,
  Zap,
  ShoppingBag
} from 'lucide-react';
import { ProductSKU, PlatformId, ChatMessage } from '../types';
import { ChatMarkdown } from './ChatMarkdown';

interface ChatbotViewProps {
  products: ProductSKU[];
  selectedProduct: ProductSKU;
  onSelectProduct: (productId: string) => void;
  onNavigateTab?: (tab: any) => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    role: 'assistant',
    content: `### 👋 Welcome to Bocasa AI Copilot!

I am your autonomous pricing and marketplace strategist specialized in **Amazon India**, **Flipkart**, and **Meesho**.

Here is what I can do for your store:
- **Floor Math & Profit Guarantees**: Break down your exact break-even floor considering referral fees, closing fees, logistics, and mandatory 18% GST.
- **Predatory Undercutting Defense**: Advise when to hold price at floor rather than blindly follow rivals into negative margins.
- **Meesho vs Flipkart vs Amazon**: Calculate channel arbitrage to maximize net profit across 0% commission vs FBA.
- **Festive Surge Pricing**: Calibrate price multipliers for the Great Indian Festival and Big Billion Days.

*Ask a question below, or select any of the quick prompt cards to get started!*`,
    timestamp: 'Just now',
    source: 'gemini-3.8-flash',
  },
];

const QUICK_PROMPTS = [
  {
    title: 'Defend Undercutting',
    prompt: 'Why should I hold at floor instead of matching the ₹379 competitor on Meesho?',
    icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />,
  },
  {
    title: 'Break-Even Formula',
    prompt: 'How is my break-even floor calculated for Cotton Kurti with ₹260 landed cost?',
    icon: <DollarSign className="w-3.5 h-3.5 text-blue-500" />,
  },
  {
    title: 'Meesho 0% Commission',
    prompt: 'Explain the margin advantage of Meesho 0% commission compared to Flipkart and Amazon.',
    icon: <Zap className="w-3.5 h-3.5 text-amber-500" />,
  },
  {
    title: 'Festive Surge Strategy',
    prompt: 'What dynamic repricing rules should I activate during Big Billion Days and festive sales?',
    icon: <TrendingUp className="w-3.5 h-3.5 text-purple-500" />,
  },
];

export const ChatbotView: React.FC<ChatbotViewProps> = ({
  products,
  selectedProduct,
  onSelectProduct,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputPrompt.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          currentProduct: selectedProduct,
          activePlatform: selectedPlatform,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Apologies, I encountered an issue processing that query. Please try again.',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'gemini-3.8-flash',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `fallback-${Date.now()}`,
        role: 'assistant',
        content: `### 🛡️ Bocasa Advisory Notice

I've recorded your query regarding **${selectedProduct.title}**.

- **Current Floor**: ₹${selectedProduct.lowestPrice || 364}
- **Landed Cost**: ₹${selectedProduct.landedCost}
- **Recommended Strategy**: Never price below your break-even floor. On Meesho, preserve the ₹${selectedProduct.lowestPrice} floor; on Amazon and Flipkart, add estimated marketplace commissions (8.5%–14.5% + 18% GST).

*Please check your internet connection or server logs if API latency continues.*`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        source: 'deterministic_fallback',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex-1 min-w-0 space-y-1">
              <h1 className="text-4xl md:text-[40px] font-extrabold font-brand text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                AI Pricing Copilot & Marketplace Strategist
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Powered by Gemini &amp; Bocasa's Break-Even Engine for Amazon IN, Flipkart, and Meesho sellers.
            </p>
          </div>
        </div>

        {/* Controls: Context Selector & Actions */}
        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          {/* Active Product Context Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <ShoppingBag className="w-3.5 h-3.5 text-blue-500 ml-1.5" />
            <select
              value={selectedProduct.id}
              onChange={(e) => onSelectProduct(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none pr-2 cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {p.title.length > 25 ? p.title.substring(0, 25) + '...' : p.title} (₹{p.lowestPrice} floor)
                </option>
              ))}
            </select>
          </div>

          {/* Platform filter */}
          <div className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            {(['all', 'amazon', 'flipkart', 'meesho'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPlatform(p)}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold capitalize transition ${
                  selectedPlatform === p
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleClearChat}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Chat Interface Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Context Card & Quick Action Buttons */}
        <div className="lg:col-span-1 space-y-4">
          {/* Active SKU Context Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                ACTIVE SKU CONTEXT
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">
                {selectedProduct.sku}
              </span>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                {selectedProduct.title}
              </h3>
              <p className="text-[11px] text-slate-500 capitalize">{selectedProduct.category}</p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Landed Cost:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">₹{selectedProduct.landedCost}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Min Target Margin:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">+₹{selectedProduct.minMargin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lowest Safe Floor:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">₹{selectedProduct.lowestPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Selling:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  ₹{selectedProduct.currentSellingPrices?.[selectedPlatform === 'all' ? 'meesho' : selectedPlatform] || selectedProduct.avgPrice}
                </span>
              </div>
            </div>

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('cost_floor')}
                className="w-full mt-2 py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition flex items-center justify-between border border-slate-200 dark:border-slate-700"
              >
                <span>Inspect Break-Even Table</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Prompts Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2.5">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
              SUGGESTED SELLER QUERIES
            </span>
            <div className="space-y-2">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp.prompt)}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 transition group"
                >
                  <div className="flex items-center space-x-2">
                    {qp.icon}
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {qp.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 pl-5">
                    {qp.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Chat Conversation Stream & Input Box */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col h-[680px] overflow-hidden">
          {/* Conversation history area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${isAssistant ? 'justify-start' : 'justify-end flex-row-reverse space-x-reverse'}`}
                >
                  {isAssistant ? (
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 text-xs font-bold font-mono">
                      YOU
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 ${
                      isAssistant
                        ? 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-xs'
                        : 'bg-blue-600 text-white shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between space-x-3 mb-1.5">
                      <span className="text-[11px] font-bold font-mono">
                        {isAssistant ? 'Bocasa Copilot' : 'Seller'}
                      </span>
                      <div className="flex items-center space-x-2">
                        {isAssistant && msg.source && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                            {msg.source}
                          </span>
                        )}
                        <span className={`text-[10px] ${isAssistant ? 'text-slate-400' : 'text-blue-200'}`}>
                          {msg.timestamp}
                        </span>
                        {isAssistant && (
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                            title="Copy reply text"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {isAssistant ? (
                      <ChatMarkdown content={msg.content} />
                    ) : (
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4 shadow-xs flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  <span>Bocasa is analyzing catalog fees and competitor benchmarks...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick chip tray above input */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center space-x-2 overflow-x-auto text-[11px]">
            <span className="text-slate-400 shrink-0 font-medium">Quick ask:</span>
            <button
              onClick={() => handleSendMessage(`Calculate break-even for landed cost ₹${selectedProduct.landedCost}`)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 shrink-0 transition"
            >
              Floor for ₹{selectedProduct.landedCost} cost
            </button>
            <button
              onClick={() => handleSendMessage("What are the hidden deductions on Flipkart closing fees?")}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 shrink-0 transition"
            >
              Flipkart closing fees
            </button>
            <button
              onClick={() => handleSendMessage("Why is Meesho 0% commission safer for low-ticket fashion?")}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 shrink-0 transition"
            >
              Meesho 0% commission benefits
            </button>
          </div>

          {/* Input field and send button */}
          <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="Ask about floor formulas, competitor undercutting, Flipkart fees, Buy Box..."
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !inputPrompt.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 disabled:active:scale-100 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center space-x-1.5"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
