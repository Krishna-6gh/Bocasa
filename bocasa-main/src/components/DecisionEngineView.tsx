import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Sliders, 
  Copy, 
  Check,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { ProductSKU, FeeMatrixItem, PlatformId, DecisionAction, DecisionResult } from '../types';
import { calculatePlatformFloor } from '../data/defaultFeeMatrix';

interface DecisionEngineViewProps {
  product: ProductSKU;
  feeMatrix: FeeMatrixItem[];
  geminiActive: boolean;
}

export const DecisionEngineView: React.FC<DecisionEngineViewProps> = ({
  product,
  feeMatrix,
  geminiActive,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>('amazon');
  const [competitorPrice, setCompetitorPrice] = useState<number>(product.competitors.amazon.currentPrice);
  const [competitorInStock, setCompetitorInStock] = useState<boolean>(product.competitors.amazon.inStock);
  const [demandScore, setDemandScore] = useState<number>(68); // 0-100
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [explanationSource, setExplanationSource] = useState<string>('');
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  // Fee and Floor Calculation
  const feeItem = feeMatrix.find((f) => f.platform === selectedPlatform && f.category === product.category) || feeMatrix[0];
  const floorCalc = calculatePlatformFloor(product.landedCost, product.minMargin, feeItem);
  const floorPrice = floorCalc.floorPrice;

  // Run Deterministic Decision Math (Section 6)
  const diffFromFloor = competitorPrice - floorPrice;
  let action: DecisionAction = 'MATCH';
  let actionTitle = 'Match Competitor';
  let recommendedPrice = competitorPrice;
  let flagCompetitor = false;

  if (!competitorInStock) {
    // Opportunity: Competitor is OUT OF STOCK!
    action = 'COMPETITOR_OOS_BOOST';
    actionTitle = 'Competitor Out-of-Stock: Harvest Premium';
    // Price higher than competitor, closer to regular target margin or MRP ceiling
    const targetPrice = product.landedCost + product.targetMargin + 100;
    recommendedPrice = Math.min(product.mrp, Math.max(floorPrice + 50, targetPrice));
  } else if (competitorPrice < floorPrice) {
    // Competitor dropped BELOW floor -> HOLD at floor and FLAG
    action = 'HOLD_AT_FLOOR';
    actionTitle = 'Hold at Floor & Flag Predatory Drop';
    recommendedPrice = floorPrice;
    flagCompetitor = true;
  } else if (diffFromFloor > 50 && demandScore > 75) {
    // High festive demand -> nudge price upward in safe band
    action = 'DEMAND_SURGE_BOOST';
    actionTitle = 'Festive Demand Boost within Safe Band';
    const nudgeAmount = Math.round((demandScore / 100) * 25);
    recommendedPrice = Math.min(product.mrp, competitorPrice + nudgeAmount);
  } else if (diffFromFloor > 10) {
    // Safe margin buffer -> undercut by ₹1 to win buybox priority
    action = 'UNDERCUT';
    actionTitle = 'Undercut by ₹1 to Win Buybox';
    recommendedPrice = competitorPrice - 1;
  } else {
    // Match exactly
    action = 'MATCH';
    actionTitle = 'Match Competitor at Safe Margin';
    recommendedPrice = competitorPrice;
  }

  const marginPreserved = Math.max(0, recommendedPrice - (product.landedCost + feeItem.logisticsFee + feeItem.closingFee));

  // Platform switch handler
  const handlePlatformSwitch = (p: PlatformId) => {
    setSelectedPlatform(p);
    const comp = product.competitors[p];
    setCompetitorPrice(comp.currentPrice);
    setCompetitorInStock(comp.inStock);
    setAiExplanation('');
  };

  // Generate Plain-Language Explanation via Server Route (Gemini or Deterministic)
  const handleGenerateExplanation = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/decision-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product.title,
          platform: selectedPlatform.toUpperCase(),
          competitorPrice,
          competitorName: product.competitors[selectedPlatform].competitorName,
          floorPrice,
          recommendedPrice,
          decisionAction: action,
          demandScore,
          competitorInStock,
          diffFromFloor,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiExplanation(data.explanation || '');
        setExplanationSource(data.source || 'gemini-3.8-flash');
      } else {
        // Deterministic fallback if server request didn't return 200
        const compName = product.competitors[selectedPlatform].competitorName;
        const fallbackText = action === 'HOLD_AT_FLOOR'
          ? `${compName} dropped to ₹${competitorPrice} (below floor ₹${floorPrice}); holding at ₹${floorPrice} on ${selectedPlatform.toUpperCase()} to preserve profit margin.`
          : action === 'COMPETITOR_OOS_BOOST'
          ? `${compName} is out of stock; capturing demand by bumping price to ₹${recommendedPrice}.`
          : action === 'DEMAND_SURGE_BOOST'
          ? `High festive demand (${demandScore}/100) allows raising price to ₹${recommendedPrice} safely above floor.`
          : action === 'UNDERCUT'
          ? `Matching ${compName} with a ₹1 undercut to ₹${recommendedPrice} on ${selectedPlatform.toUpperCase()} safely above floor.`
          : `Competitor is priced safely at ₹${competitorPrice}; matching price at ₹${recommendedPrice} to secure buybox.`;
        setAiExplanation(fallbackText);
        setExplanationSource('deterministic_rules');
      }
    } catch (err) {
      console.warn('Explanation generation using local deterministic fallback:', err);
      const compName = product.competitors[selectedPlatform].competitorName;
      const fallbackText = action === 'HOLD_AT_FLOOR'
        ? `${compName} dropped to ₹${competitorPrice} (below floor ₹${floorPrice}); holding at ₹${floorPrice} on ${selectedPlatform.toUpperCase()} to preserve profit margin.`
        : action === 'COMPETITOR_OOS_BOOST'
        ? `${compName} is out of stock; capturing demand by bumping price to ₹${recommendedPrice}.`
        : action === 'DEMAND_SURGE_BOOST'
        ? `High festive demand (${demandScore}/100) allows raising price to ₹${recommendedPrice} safely above floor.`
        : action === 'UNDERCUT'
        ? `Matching ${compName} with a ₹1 undercut to ₹${recommendedPrice} on ${selectedPlatform.toUpperCase()} safely above floor.`
        : `Competitor is priced safely at ₹${competitorPrice}; matching price at ₹${recommendedPrice} to secure buybox.`;
      setAiExplanation(fallbackText);
      setExplanationSource('deterministic_rules');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Auto-generate on first mount or state change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      handleGenerateExplanation();
    }, 400);
    return () => clearTimeout(timer);
  }, [selectedPlatform, competitorPrice, competitorInStock, demandScore]);

  const copyExplanation = () => {
    if (aiExplanation) {
      navigator.clipboard.writeText(aiExplanation);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Blueprint Guidance Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            DECISION ENGINE
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Pricing Decisions</span>
        </div>
        <h2 className="text-4xl md:text-[40px] font-extrabold font-brand text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
          Pricing Decision Engine
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl mt-1 leading-relaxed">
          Price calculations follow strict rules. AI translates the math into a plain-English recommendation you can trust.
        </p>

        {/* 3 Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>1. Strict Floor Invariant</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              If competitor price &lt; floor price, Bocasa NEVER matches. It holds at floor and flags the competitor to protect seller solvency.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-sky-600 dark:text-sky-400 text-xs font-semibold mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>2. Demand Score Nudge</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Combines Google Trends, festival calendars, and competitor stockouts to nudge prices up within the safe band above floor.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-1">
              <MessageSquare className="w-4 h-4" />
              <span>3. Plain-Language Translation</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Gemini 3.8 Flash turns the mathematical delta into one clear sentence. Non-technical sellers know exactly why a price changed.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Decision Simulator Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulator Sliders & Inputs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Simulation Inputs & Scenario Tester</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                Rule Engine
              </span>
            </div>

            {/* Marketplace Selector */}
            <div className="space-y-1.5 mb-5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Marketplace:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['amazon', 'flipkart', 'meesho'] as PlatformId[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePlatformSwitch(p)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition ${
                      selectedPlatform === p
                        ? 'bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/50 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Competitor Price Slider */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Simulate Competitor Price:
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Input:</span>
                  <input
                    type="number"
                    value={competitorPrice}
                    onChange={(e) => setCompetitorPrice(Number(e.target.value))}
                    className="w-20 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-slate-100 font-mono text-right focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <input
                type="range"
                min={Math.floor(floorPrice * 0.7)}
                max={Math.ceil(floorPrice * 1.5)}
                value={competitorPrice}
                onChange={(e) => setCompetitorPrice(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                <span>Below Floor (Loss Zone)</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">Your Floor: ₹{floorPrice}</span>
                <span>Above Floor (Profit Zone)</span>
              </div>
            </div>

            {/* Competitor In-Stock Toggle */}
            <div className="mt-4 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Competitor Stock Status</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Does the competitor have live inventory right now?
                </div>
              </div>
              <button
                onClick={() => setCompetitorInStock(!competitorInStock)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition shadow-xs ${
                  competitorInStock
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 animate-pulse'
                }`}
              >
                {competitorInStock ? 'In Stock (Active Buybox)' : 'OUT OF STOCK (Opportunity!)'}
              </button>
            </div>

            {/* Demand Score Slider */}
            <div className="mt-4 space-y-2 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Demand Score Index</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Trend + Festival Calendar + Seasonality
                  </div>
                </div>
                <span className="font-mono text-sm font-bold text-sky-600 dark:text-sky-400">{demandScore}/100</span>
              </div>

              <input
                type="range"
                min="10"
                max="100"
                value={demandScore}
                onChange={(e) => setDemandScore(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Mathematical Decision + AI Plain Language Explanation */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Deterministic Engine Output</span>
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${
                action === 'HOLD_AT_FLOOR'
                  ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                  : action === 'COMPETITOR_OOS_BOOST'
                  ? 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                  : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              }`}>
                {action}
              </span>
            </div>

            {/* Price Recommendation Banner */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Bocasa Recommended Price:</span>
                  <div className="text-3xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                    ₹{recommendedPrice}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Current Listing Price:</span>
                  <div className="text-xl font-mono text-slate-400 dark:text-slate-500 line-through mt-1">
                    ₹{product.currentSellingPrices[selectedPlatform]}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  Floor Protection Status:
                </span>
                <span className={`font-mono font-bold ${diffFromFloor >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {diffFromFloor >= 0 ? `+₹${diffFromFloor} Above Floor (Safe)` : `-₹${Math.abs(diffFromFloor)} Below Floor (Breach Prevented)`}
                </span>
              </div>
            </div>

            {/* The AI Plain-Language Explanation Block (Crucial Section 6 Requirement) */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-200">
                    Seller Trust Explanation (1 Sentence)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium">
                    {explanationSource === 'gemini-3.8-flash'
                      ? 'Gemini 3.8 Flash'
                      : explanationSource === 'gemini-3.1-flash-lite'
                      ? 'Gemini 3.1 Flash Lite'
                      : explanationSource === 'deterministic_rules'
                      ? 'Deterministic Rules'
                      : explanationSource || 'Gemini 3.8 Flash'}
                  </span>
                  <button
                    onClick={handleGenerateExplanation}
                    disabled={isGeneratingAi}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                    title="Regenerate explanation"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="bg-indigo-50/60 dark:bg-gradient-to-r dark:from-indigo-950/40 dark:to-slate-950/80 border border-indigo-200 dark:border-indigo-500/30 rounded-xl p-4 relative">
                {isGeneratingAi ? (
                  <div className="flex items-center space-x-2 text-xs text-indigo-600 dark:text-indigo-300">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-500 dark:text-indigo-400" />
                    <span>Synthesizing trusted plain-language seller reasoning...</span>
                  </div>
                ) : (
                  <p className="text-xs font-medium text-indigo-950 dark:text-indigo-200 leading-relaxed">
                    "{aiExplanation || `${product.competitors[selectedPlatform].competitorName} dropped to ₹${competitorPrice}; holding price at ₹${floorPrice} on ${selectedPlatform.toUpperCase()} to preserve ₹${product.minMargin} minimum profit.`}"
                  </p>
                )}

                <div className="mt-3 pt-2 border-t border-indigo-200/60 dark:border-indigo-900/40 flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400">
                  <span>Non-technical explanation for Indian SMB seller</span>
                  <button
                    onClick={copyExplanation}
                    className="flex items-center space-x-1 hover:text-indigo-800 dark:hover:text-indigo-200 transition font-medium"
                  >
                    {hasCopied ? <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{hasCopied ? 'Copied' : 'Copy Explanation'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Why This Matters Callout */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
              💡 <strong>Why this solves the competitor criticism:</strong> Competing repricers act as black boxes that drop prices into negative profit or confuse sellers with complex logs. Bocasa's deterministic math eliminates risk, while Gemini provides instant, human-understandable justification.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
