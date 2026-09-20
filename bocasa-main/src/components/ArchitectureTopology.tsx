import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Calculator, 
  Cpu, 
  Send, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  ShieldAlert, 
  ExternalLink,
  Layers,
  Server
} from 'lucide-react';
import { SystemTab } from '../types';

interface ArchitectureTopologyProps {
  onSelectLayer: (tab: SystemTab) => void;
}

interface LayerSpec {
  id: string;
  number: number;
  tab: SystemTab;
  title: string;
  role: string;
  responsibility: string;
  inputs: string[];
  outputs: string[];
  storageTables: string[];
  failureBlastRadius: string;
  techImplementation: string;
  phasedShip: string;
  color: string;
}

const LAYERS: LayerSpec[] = [
  {
    id: 'collector',
    number: 1,
    tab: 'collector',
    title: 'Collector Layer',
    role: 'Competitor Price Watcher',
    responsibility: 'Monitors competitor pricing for seller-specified URLs using Scraping-as-a-Service actor (EcomData Pro) and rotating residential proxies.',
    inputs: ['Seller Target URLs (Amazon, Flipkart, Meesho)', 'Polling Cadence Tier (1-2h vs 1-2x/day)'],
    outputs: ['Structured Price Snapshot JSON', 'In-stock flag', 'Seller Buybox status'],
    storageTables: ['competitor_sources', 'price_snapshots (Time-series)'],
    failureBlastRadius: 'Isolated to price freshness; does NOT block current listings or sales.',
    techImplementation: 'Apify Actor API / Node.js + Redis BullMQ tiered cadence queue + Residential Proxy rotation',
    phasedShip: 'Phase 1 (Manual paste) → Phase 2 (Automated scheduled actor)',
    color: 'border-amber-500/40 bg-amber-500/5 text-amber-400',
  },
  {
    id: 'cost_engine',
    number: 2,
    tab: 'cost_floor',
    title: 'Cost & Floor Engine',
    role: 'True Landed Cost & Floor Per Platform',
    responsibility: 'Computes dynamic floor prices per platform using editable category fee matrices (commission %, shipping/logistics, fixed closing fees, and GST slabs 0-28%).',
    inputs: ['Product Landed Cost', 'Seller Min Margin (INR)', 'Marketplace Fee Matrix (Platform × Category)'],
    outputs: ['Platform-Specific Floor Price (Amazon ≠ Flipkart ≠ Meesho)', 'Net Payout Breakdown'],
    storageTables: ['platform_fee_matrix', 'products'],
    failureBlastRadius: 'Pure data modeling layer; changes only trigger when platform fee schedules update.',
    techImplementation: 'Deterministic PostgreSQL fee table + in-memory mathematical solver with 18% services GST factor',
    phasedShip: 'Phase 1 (Shipped in MVP — beats spreadsheet repricers immediately)',
    color: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400',
  },
  {
    id: 'demand',
    number: 5,
    tab: 'demand',
    title: 'Demand Intelligence',
    role: 'Market Demand & Seasonality Scoring',
    responsibility: 'Scores immediate consumer appetite (0–100) using Google Trends interest, retail seasonality decomposition, competitor stock-out bonuses, and hardcoded Indian festival sale calendars.',
    inputs: ['Google Trends 0-100 index', 'India Festival Calendar (Diwali, BBD, GIF)', 'Competitor In-Stock flag from Collector'],
    outputs: ['Composite Demand Score (0–100)', 'Price Nudge Factor (safe band above floor)'],
    storageTables: ['demand_signals', 'festival_calendar'],
    failureBlastRadius: 'If external trends fail, gracefully falls back to neutral demand score (50/100).',
    techImplementation: 'Time-series decomposition (trend + seasonal + residual) + Festival date math + Google Trends query',
    phasedShip: 'Phase 4 (Ships once baseline price matching is stable)',
    color: 'border-purple-500/40 bg-purple-500/5 text-purple-400',
  },
  {
    id: 'decision_engine',
    number: 3,
    tab: 'decision',
    title: 'Decision Engine',
    role: 'Deterministic Math + AI Plain Explanation',
    responsibility: 'Evaluates (Competitor Price, Platform Floor, Demand Score) to output recommended price, then calls LLM (Gemini 3.8) to generate exactly one plain-language sentence the seller trusts.',
    inputs: ['Competitor Price Snapshot', 'Platform Floor Price', 'Demand Score', 'Current Selling Price'],
    outputs: ['Recommended Target Price', 'Action (HOLD_AT_FLOOR, MATCH, UNDERCUT, BOOST)', '1-Sentence AI Explanation'],
    storageTables: ['repricing_decisions'],
    failureBlastRadius: 'Deterministic math executes 100% offline; LLM failure triggers structured rule text.',
    techImplementation: 'Deterministic rule engine + server-side Gemini 3.8 Flash LLM explanation pipe',
    phasedShip: 'Phase 1 (Rules) → Phase 5 (LLM explanation & multi-seller scale)',
    color: 'border-blue-500/40 bg-blue-500/5 text-blue-400',
  },
  {
    id: 'distribution',
    number: 4,
    tab: 'distribution',
    title: 'Distribution Layer',
    role: 'Multi-Marketplace Sync Rails',
    responsibility: 'Pushes updated prices directly to marketplace APIs (Amazon SP-API Listings Items, Flipkart Seller API with FSN, Meesho via Fynd Konnect/Browntape) using encrypted OAuth credentials.',
    inputs: ['Repricing Decisions from Layer 3', 'Encrypted Marketplace Tokens'],
    outputs: ['Live Listing Price Update', 'Sync Audit Trail & HTTP status code'],
    storageTables: ['marketplace_credentials (AES encrypted)', 'repricing_decisions.dispatched'],
    failureBlastRadius: 'Per-platform failure isolation: if Flipkart API returns 503, Amazon and Meesho sync unaffected.',
    techImplementation: 'BullMQ isolated distribution queues + Amazon SP-API OAuth + Flipkart Seller API + Fynd Konnect webhooks',
    phasedShip: 'Phase 3 (Amazon + Flipkart) → Phase 5 (Meesho / Fynd channel aggregator)',
    color: 'border-rose-500/40 bg-rose-500/5 text-rose-400',
  },
];

export const ArchitectureTopology: React.FC<ArchitectureTopologyProps> = ({ onSelectLayer }) => {
  const [selectedLayerId, setSelectedLayerId] = useState<string>('decision_engine');
  const [isSimulatingCycle, setIsSimulatingCycle] = useState<boolean>(false);
  const [cycleStep, setCycleStep] = useState<number>(0);

  const selectedLayer = LAYERS.find((l) => l.id === selectedLayerId) || LAYERS[0];

  const handleRunSimulation = () => {
    setIsSimulatingCycle(true);
    setCycleStep(1);

    const steps = [
      { step: 1, delay: 600 },
      { step: 2, delay: 1200 },
      { step: 3, delay: 1800 },
      { step: 4, delay: 2400 },
      { step: 5, delay: 3000 },
    ];

    steps.forEach(({ step, delay }) => {
      setTimeout(() => {
        setCycleStep(step);
        if (step === 5) {
          setTimeout(() => {
            setIsSimulatingCycle(false);
            setCycleStep(0);
          }, 800);
        }
      }, delay);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Architecture Context */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                SECTION 1 SPECIFICATION
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Decoupled Microservice Architecture</span>
            </div>
            <h2 className="text-4xl md:text-[40px] font-extrabold font-brand text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              Bocasa AI Agent Topology
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              Bocasa is strictly built as five independent services communicating through a central PostgreSQL product store—never as an unwieldy monolithic app. Each layer possesses isolated failure boundaries and can be engineered and shipped independently.
            </p>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulatingCycle}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSimulatingCycle ? 'animate-spin' : ''}`} />
            <span>{isSimulatingCycle ? `Simulating Layer ${cycleStep}...` : 'Simulate Live Data Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* System Topology Map (5 Nodes + Shared Database Core) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
            System Topology & Interaction Rails
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Click any service block to inspect technical specifications</span>
        </div>

        {/* Five Layers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
          {LAYERS.map((layer) => {
            const isSelected = selectedLayerId === layer.id;
            const isPulsing = isSimulatingCycle && (
              (layer.id === 'collector' && cycleStep === 1) ||
              (layer.id === 'cost_engine' && cycleStep === 2) ||
              (layer.id === 'demand' && cycleStep === 3) ||
              (layer.id === 'decision_engine' && cycleStep === 4) ||
              (layer.id === 'distribution' && cycleStep === 5)
            );

            return (
              <div
                key={layer.id}
                onClick={() => setSelectedLayerId(layer.id)}
                className={`cursor-pointer rounded-xl p-4 border transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-slate-800/90 shadow-md ring-1 ring-emerald-500/30'
                    : 'border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                } ${isPulsing ? 'ring-2 ring-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 scale-[1.02]' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                      Layer {layer.number}
                    </span>
                    {isPulsing && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{layer.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{layer.role}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{layer.phasedShip.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Central PostgreSQL Core Banner */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Central PostgreSQL Store</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-medium">
                  SINGLE SOURCE OF TRUTH
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fee matrices, SKU landed costs, scraping time-series ticks, decision logs, and encrypted token credentials.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectLayer('tech_stack')}
            className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center space-x-1 font-semibold"
          >
            <span>View PostgreSQL DDL</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Selected Layer Technical Deep-Dive Inspector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              Layer {selectedLayer.number} Spec
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{selectedLayer.title} — {selectedLayer.role}</h3>
          </div>
          <button
            onClick={() => onSelectLayer(selectedLayer.tab)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-xs"
          >
            <span>Launch Layer {selectedLayer.number} Interactive Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {/* Responsibility */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider font-semibold">Responsibility</span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
              {selectedLayer.responsibility}
            </p>
          </div>

          {/* Inputs & Outputs */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider font-semibold">Inputs & Outputs</span>
            <div className="bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Inputs: </span>
                <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 text-[11px] mt-0.5 space-y-0.5">
                  {selectedLayer.inputs.map((inp, idx) => (
                    <li key={idx}>{inp}</li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Outputs: </span>
                <ul className="list-disc list-inside text-emerald-600 dark:text-emerald-400 text-[11px] mt-0.5 space-y-0.5 font-medium">
                  {selectedLayer.outputs.map((out, idx) => (
                    <li key={idx}>{out}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Isolation & Tech Stack */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider font-semibold">Failure Isolation & Stack</span>
            <div className="bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Blast Radius: </span>
                <span className="text-slate-700 dark:text-slate-300 text-[11px] block mt-0.5">{selectedLayer.failureBlastRadius}</span>
              </div>
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Implementation: </span>
                <span className="text-slate-700 dark:text-slate-300 text-[11px] block mt-0.5 font-mono">{selectedLayer.techImplementation}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
