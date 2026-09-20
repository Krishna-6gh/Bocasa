import React, { useState } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Search, 
  PackageX, 
  Activity, 
  Sparkles, 
  Layers, 
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { ProductSKU, FestivalEvent } from '../types';
import { INDIA_FESTIVAL_CALENDAR } from '../data/festivalCalendar';

interface DemandIntelligenceViewProps {
  product: ProductSKU;
}

export const DemandIntelligenceView: React.FC<DemandIntelligenceViewProps> = ({ product }) => {
  const [googleTrendsScore, setGoogleTrendsScore] = useState<number>(78);
  const [activeFestivalId, setActiveFestivalId] = useState<string>('amazon-gif');
  const [isCompetitorOos, setIsCompetitorOos] = useState<boolean>(!product.competitors.meesho.inStock);

  const selectedFestival = INDIA_FESTIVAL_CALENDAR.find((f) => f.id === activeFestivalId) || INDIA_FESTIVAL_CALENDAR[0];

  // Composite Demand Score Calculation
  // 40% Festival Multiplier + 35% Google Trends + 25% Competitor Stockout bonus
  const festivalFactor = (selectedFestival.demandMultiplier - 1) * 150; // scales to approx 0-75
  const trendsFactor = googleTrendsScore * 0.45;
  const stockoutBonus = isCompetitorOos ? 25 : 0;
  
  const compositeScore = Math.min(100, Math.round(festivalFactor + trendsFactor + stockoutBonus));

  return (
    <div className="space-y-6">
      {/* Blueprint Guidance Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            DEMAND
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Market Signals</span>
        </div>
        <h2 className="text-4xl md:text-[40px] font-extrabold font-brand text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
          Demand Signals
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl mt-1 leading-relaxed">
          Demand intelligence based on Google Trends, seasonality, Indian festival spikes, and competitor stockouts.
        </p>

        {/* Live Composite Gauge */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Composite Demand Index for {product.sku}:</div>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-bold font-mono text-purple-600 dark:text-purple-400">{compositeScore}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">/ 100 (Strong Demand Pressure)</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono text-slate-600 dark:text-slate-400">
            <div>
              <span className="text-slate-400 dark:text-slate-500">Event Boost: </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{Math.round(festivalFactor)}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500">Trends: </span>
              <span className="text-sky-600 dark:text-sky-400 font-bold">+{Math.round(trendsFactor)}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500">OOS Bonus: </span>
              <span className={isCompetitorOos ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-400 dark:text-slate-500'}>
                {isCompetitorOos ? '+25' : '+0'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Four Core Signal Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Signal 1 & 2: Festival Calendar & Competitor Stockout */}
        <div className="lg:col-span-6 space-y-6">
          {/* India Festival Calendar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>India-Specific Festival & Mega-Sale Calendar</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Known Spikes
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Hardcoded retail sale events move Indian consumer demand more drastically than organic search trends.
            </p>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {INDIA_FESTIVAL_CALENDAR.map((event) => {
                const isSelected = activeFestivalId === event.id;
                return (
                  <div
                    key={event.id}
                    onClick={() => setActiveFestivalId(event.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-200">{event.name}</div>
                      <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {event.demandMultiplier}x Multiplier
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                      <span>{event.startDate} to {event.endDate}</span>
                      <span className="capitalize">{event.platforms.join(', ')}</span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-1">{event.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Competitor Stockout Signal (Inherited Free from Collector) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <PackageX className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Competitor Stock-Out Signal</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Free from Layer 1
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              If the cheapest competitor on Amazon, Flipkart, or Meesho goes out of stock, Bocasa instantly detects it via Layer 1 without extra data costs.
            </p>

            <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Meesho Competitor ({product.competitors.meesho.competitorName})
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Currently Out of Stock on Meesho catalog
                </div>
              </div>

              <button
                onClick={() => setIsCompetitorOos(!isCompetitorOos)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  isCompetitorOos
                    ? 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {isCompetitorOos ? 'OOS Trigger Active (+25 Demand)' : 'Competitor In Stock'}
              </button>
            </div>
          </div>
        </div>

        {/* Signal 3 & 4: Google Trends & Seasonality Decomposition */}
        <div className="lg:col-span-6 space-y-6">
          {/* Google Trends Index */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Google Trends Search Interest (0–100)</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                Public Signal
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Indexes relative search volume across India. Spot consumer buying waves 2–3 weeks before peak purchase days.
            </p>

            {/* Trends Slider Simulation */}
            <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Simulate Search Interest (India):</span>
                <span className="font-mono text-sm font-bold text-sky-600 dark:text-sky-400">{googleTrendsScore} / 100</span>
              </div>

              <input
                type="range"
                min="10"
                max="100"
                value={googleTrendsScore}
                onChange={(e) => setGoogleTrendsScore(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />

              {/* Mock Interest Trend Bar Visual */}
              <div className="pt-2">
                <div className="text-[11px] text-slate-500 mb-1">90-Day Trajectory:</div>
                <div className="h-10 flex items-end space-x-1">
                  {[24, 30, 28, 35, 42, 48, 55, 62, 70, googleTrendsScore].map((val, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-sky-500/30 hover:bg-sky-500 transition-all rounded-t"
                      style={{ height: `${val}%` }}
                      title={`Week ${idx + 1}: Index ${val}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Time-Series Seasonality Decomposition */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Retail Seasonality Decomposition</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Classical Retail Math
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Standard time-series breakdown of historical sales into Trend, Seasonal cyclicality, and Residual noise:
            </p>

            <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Observed Demand Y(t) =</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Trend T(t) × Seasonal S(t) × Residual I(t)</span>
              </div>
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                By modeling 1–2 years of historical Indian sales data, seasonal surges repeat reliably during Q3/Q4 festive windows.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
