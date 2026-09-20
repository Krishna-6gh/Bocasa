import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  Terminal, 
  Copy, 
  Check, 
  Layers, 
  Server, 
  CreditCard, 
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { POSTGRES_SCHEMA_DDL, BULLMQ_QUEUE_ARCHITECTURE } from '../data/schemaDdl';

export const TechStackRoadmapView: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'postgres' | 'bullmq'>('postgres');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const phases = [
    {
      phase: 'Phase 1',
      title: 'Manual URL Paste + Real Cost/Floor Engine',
      status: 'SHIPPED IN BLUEPRINT',
      headline: 'This alone beats PriceHound + a messy seller spreadsheet',
      deliverables: [
        'Editable fee tables for Amazon, Flipkart, and Meesho across product categories',
        'Deterministic floor calculator solving for Net Payout = Landed Cost + Min Margin',
        'Manual competitor URL submission with single-product margin validation',
        'Clear UI showing why Meesho\'s low/zero commission gives a vastly lower floor price',
      ],
      impact: 'Immediate seller value with zero scraper fragility or API approval wait times.',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    },
    {
      phase: 'Phase 2',
      title: 'Automated Scraping via Actor API + Scheduled Alerts',
      status: 'READY FOR DISPATCH',
      headline: 'Outsource scraper maintenance; tier the polling cadence',
      deliverables: [
        'EcomData Pro Apify Actor integration with Indian residential proxy rotation',
        'Tiered polling cadence in Redis + BullMQ (Fast SKUs: 1–2h, Standard: 1–2x/day)',
        'WhatsApp Business API (Gupshup / Twilio) alerts on competitor price drops',
        'Daily morning summary email with competitor stockout alerts',
      ],
      impact: 'Eliminates manual price checking without getting IP-banned or facing broken CSS class deploys.',
      badgeColor: 'bg-sky-950 text-sky-300 border-sky-800',
    },
    {
      phase: 'Phase 3',
      title: 'Amazon SP-API + Flipkart Listing Sync',
      status: 'SPECIFIED IN CODE',
      headline: 'The two marketplaces with real self-serve developer APIs',
      deliverables: [
        'Amazon Selling Partner API (SP-API) Listings Items v2021-08-01 integration',
        'Flipkart Seller API v3 listing updates tied to Flipkart Serial Numbers (FSN)',
        'Isolated BullMQ queues with 30s exponential backoff so Flipkart downtime never halts Amazon',
        'AES-GCM-256 encrypted refresh-token storage in PostgreSQL',
      ],
      impact: 'Hands-off automatic repricing execution without seller manual entry.',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    },
    {
      phase: 'Phase 4',
      title: 'Demand Layer (Google Trends + India Festival Calendar)',
      status: 'SPECIFIED IN CODE',
      headline: 'Signals that actually exist in retail today',
      deliverables: [
        'Google Trends 0–100 search volume tracker for category seasonal curves',
        'Hardcoded Indian festival mega-sale calendar (BBD, Great Indian Festival, Diwali)',
        'Competitor stockout opportunistic price nudge within safe margin band',
        'Time-series seasonality decomposition (Trend × Seasonality × Residual)',
      ],
      impact: 'Seller captures higher margin during demand surges instead of mindless race-to-the-bottom pricing.',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
    },
    {
      phase: 'Phase 5',
      title: 'Meesho/Channel Sync, LLM Reasoning & Multi-Seller Scale',
      status: 'FULL-STACK READY',
      headline: 'Channel aggregators + Gemini 3.8 Flash plain-language trust',
      deliverables: [
        'Meesho catalog sync via Fynd Konnect / Browntape channel connectors',
        'Server-side Gemini 3.8 Flash LLM explanation generator (1-sentence seller trust)',
        'Razorpay billing subscriptions for Indian SMB merchant billing (₹1,999/mo to ₹4,999/mo)',
        'Multi-tenant database schema with tenant isolation and audit logs',
      ],
      impact: 'Enterprise-grade, multi-channel automated pricing system with full Indian compliance.',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
    },
  ];

  const handleCopy = () => {
    const code = activeCodeTab === 'postgres' ? POSTGRES_SCHEMA_DDL : BULLMQ_QUEUE_ARCHITECTURE;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            SECTIONS 7 & 8 ARCHITECTURE
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Tech Stack & Phased Build Roadmap</span>
        </div>
        <h2 className="text-4xl md:text-[40px] font-extrabold font-brand text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
          System Architecture & Roadmap
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl mt-1 leading-relaxed">
          Built on technologies that actually work today: <strong>Node.js/Express</strong>, <strong>PostgreSQL</strong> (relational fits fee tables, listings, and time-series ticks), <strong>Redis + BullMQ</strong> (tiered cadences and isolated retries), <strong>React</strong> frontend, and <strong>Razorpay</strong> for Indian SMB merchant billing.
        </p>

        {/* Tech Stack Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase">Backend</div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Node.js (Express)</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase">Database</div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">PostgreSQL</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase">Queues</div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Redis + BullMQ</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase">AI Explainer</div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Gemini 3.8 Flash</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase">Frontend</div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">React / Next.js</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center">
            <div className="text-slate-400 text-[10px] uppercase">Billing</div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Razorpay India</div>
          </div>
        </div>
      </div>

      {/* 5-Phase Roadmap */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Section 8: Pragmatic Build Order (What to Actually Ship First)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ship incrementally to de-risk scraper breakages and marketplace developer registration delays.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {phases.map((p, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700">
                    {p.phase}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{p.title}</h4>
                </div>
                <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border self-start sm:self-auto ${p.badgeColor}`}>
                  {p.status}
                </span>
              </div>

              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-3">
                "{p.headline}"
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <div>
                  <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider font-semibold">
                    Core Deliverables:
                  </span>
                  <ul className="mt-1.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {p.deliverables.map((d, dIdx) => (
                      <li key={dIdx} className="flex items-start space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider font-semibold">
                      Business & Technical Impact:
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">{p.impact}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Production PostgreSQL Schema & BullMQ Queue Spec */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-sky-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Shared Database DDL & Queue Architecture
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Production-ready relational schema across sellers, credentials, products, fee matrices, and decisions.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-slate-100 dark:bg-slate-950 rounded-xl p-1 border border-slate-200 dark:border-slate-800 flex space-x-1">
              <button
                onClick={() => setActiveCodeTab('postgres')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                  activeCodeTab === 'postgres' ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-bold shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                PostgreSQL Schema DDL
              </button>
              <button
                onClick={() => setActiveCodeTab('bullmq')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                  activeCodeTab === 'bullmq' ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 font-bold shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                BullMQ Queue Setup
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition flex items-center space-x-1.5"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-slate-300 max-h-[420px] overflow-y-auto">
          <pre className={activeCodeTab === 'postgres' ? 'text-sky-300' : 'text-amber-300'}>
            {activeCodeTab === 'postgres' ? POSTGRES_SCHEMA_DDL : BULLMQ_QUEUE_ARCHITECTURE}
          </pre>
        </div>
      </div>
    </div>
  );
};
