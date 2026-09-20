import React, { useState } from 'react';
import { 
  Bot, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw, 
  Layers, 
  Activity, 
  ShieldCheck, 
  TrendingUp, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  Sliders,
  DollarSign
} from 'lucide-react';
import { ProductSKU, FeeMatrixItem, PlatformId } from '../types';
import { calculatePlatformFloor } from '../data/defaultFeeMatrix';

interface TracesHandoffViewProps {
  product: ProductSKU;
  feeMatrix: FeeMatrixItem[];
  geminiActive: boolean;
  onNavigateTab: (tab: any) => void;
}

export const TracesHandoffView: React.FC<TracesHandoffViewProps> = ({
  product,
  feeMatrix,
  geminiActive,
  onNavigateTab,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>('amazon');
  const [isComparingFailed, setIsComparingFailed] = useState(false);

  const competitor = product.competitors[selectedPlatform];
  const feeItem = feeMatrix.find((f) => f.platform === selectedPlatform && f.category === product.category) || feeMatrix[0];
  const floorCalc = calculatePlatformFloor(product.landedCost, product.minMargin, feeItem);
  const floorPrice = floorCalc.floorPrice;
  const currentPrice = product.currentSellingPrices[selectedPlatform];

  // Context fields matching the table in screenshot
  const contextFields = [
    {
      field: 'landed_procurement_cost',
      sentByRouter: `₹${product.landedCost}`,
      expectedByBilling: 'required',
      status: 'Match',
      isHighlight: false,
    },
    {
      field: 'seller_guaranteed_min_margin',
      sentByRouter: `₹${product.minMargin}`,
      expectedByBilling: 'required',
      status: 'Match',
      isHighlight: false,
    },
    {
      field: 'marketplace_commission_rate',
      sentByRouter: `${feeItem.commissionPct}%`,
      expectedByBilling: 'required',
      status: 'Match',
      isHighlight: false,
    },
    {
      field: 'logistics_and_closing_fees',
      sentByRouter: `₹${feeItem.logisticsFee + feeItem.closingFee}`,
      expectedByBilling: 'required',
      status: 'Match',
      isHighlight: true, // highlighted green row
    },
    {
      field: 'calculated_floor_threshold',
      sentByRouter: `₹${floorPrice}`,
      expectedByBilling: 'optional',
      status: 'Match',
      isHighlight: false,
    },
    {
      field: 'competitor_telemetry_vector',
      sentByRouter: `₹${competitor?.currentPrice || 'N/A'} (${competitor?.inStock ? 'In-Stock' : 'OOS'})`,
      expectedByBilling: '— not used',
      status: 'Unused',
      isHighlight: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Title Bar matching screenshot */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium mb-1.5">
            <span className="hover:text-slate-600 cursor-pointer" onClick={() => onNavigateTab('decision')}>Traces</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="font-mono text-slate-500">tr_84926</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-700 font-semibold">Handoff</span>
          </div>

          <div className="flex items-center space-x-3">
            <h1 className="text-4xl md:text-[40px] font-extrabold font-brand text-slate-900 tracking-tight leading-tight">
              Router Agent → Billing Agent
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
              Context complete
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-1">
            Handoff inspector · Bocasa Pipeline · trace tr_84926 · 09:41:12.204 · the same edge that verified pricing in tr_84921
          </p>
        </div>

        {/* Action Buttons matching screenshot */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => onNavigateTab('decision')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-xs transition flex items-center space-x-2"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Back to trace</span>
          </button>

          <button
            onClick={() => setIsComparingFailed(!isComparingFailed)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs shadow-blue-500/25 transition flex items-center space-x-2"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Compare with failed run</span>
          </button>
        </div>
      </div>

      {/* Visual Handoff Flow Diagram matching screenshot */}
      <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
          HANDOFF PATH
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Router Agent Node */}
          <div className="flex items-center space-x-3 bg-white dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs max-w-xs w-full">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100">Router Agent</div>
              <div className="text-[11px] text-slate-400">sends context · scope : admin</div>
            </div>
          </div>

          {/* Connected Stream Vector Pill */}
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="w-full relative flex items-center">
              <div className="w-full h-[2px] bg-purple-400/80 dark:bg-purple-500/80" />
              <div className="absolute left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 px-4 py-1.5 rounded-full shadow-xs flex items-center space-x-4 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">9.1 KB</span>
                  <span className="text-slate-400 ml-1">context</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">188 ms</span>
                  <span className="text-slate-400 ml-1">latency</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">1,904</span>
                  <span className="text-slate-400 ml-1">tokens</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">5 of 5</span>
                  <span className="text-slate-400 ml-1">fields</span>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Agent Node */}
          <div className="flex items-center space-x-3 bg-white dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs max-w-xs w-full">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-800">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100">Billing Agent</div>
              <div className="text-[11px] text-slate-400">accepted request · scope : admin</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Context Comparison Table & Recent Runs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 transition-colors">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Context comparison
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                5 of 5 required fields present
              </span>
            </div>

            {/* Context Fields Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] font-mono uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-3 font-semibold">CONTEXT FIELD</th>
                    <th className="pb-3 font-semibold">SENT BY ROUTER</th>
                    <th className="pb-3 font-semibold">EXPECTED BY BILLING</th>
                    <th className="pb-3 font-semibold text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
                  {contextFields.map((row) => (
                    <tr
                      key={row.field}
                      className={
                        row.isHighlight
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 text-slate-800 dark:text-slate-200 font-medium'
                          : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }
                    >
                      <td className="py-3 px-2 font-semibold text-slate-800 dark:text-slate-200">
                        {row.field}
                      </td>
                      <td className="py-3 px-2 text-slate-600 dark:text-slate-400">
                        {row.status === 'Match' ? '✓ ' : ''}{row.sentByRouter}
                      </td>
                      <td className="py-3 px-2 text-slate-500 dark:text-slate-400">
                        {row.expectedByBilling === 'required' ? '✓ ' : ''}{row.expectedByBilling}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {row.status === 'Match' ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Match</span>
                        ) : (
                          <span className="text-slate-400">Unused</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Green Notification Callout matching screenshot */}
            <div className="p-3 bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>authorization_scope</strong> was forwarded — the exact field missing in tr_84921. Same contract, healthy run.
              </span>
            </div>

            {/* Context Payload Size Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono uppercase text-slate-400 text-[10px] font-semibold">CONTEXT PAYLOAD SIZE</span>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">9.1 KB · 1.0x workflow baseline</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div className="bg-amber-400 h-full w-[25%]" />
                <div className="bg-slate-200 dark:bg-slate-700 h-full w-[75%]" />
              </div>
              <p className="text-[11px] text-slate-400">
                No bloat. conversation_history is passed by reference on this run.
              </p>
            </div>

            {/* Recent Runs on this handoff matching screenshot */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                RECENT RUNS ON THIS HANDOFF · LAST 24 HOURS
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">tr_84926</span>
                    <span className="inline-flex items-center text-[10px] text-blue-600 dark:text-blue-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1"></span>
                      Completed
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 text-slate-500 dark:text-slate-400">
                    <span>9.1 KB</span>
                    <span>188 ms</span>
                    <span>09:41</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">tr_84919</span>
                    <span className="inline-flex items-center text-[10px] text-purple-600 dark:text-purple-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1"></span>
                      Completed
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 text-slate-500 dark:text-slate-400">
                    <span>8.8 KB</span>
                    <span>176 ms</span>
                    <span>09:39</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">tr_84911</span>
                    <span className="inline-flex items-center text-[10px] text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>
                      Completed
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 text-slate-500 dark:text-slate-400">
                    <span>8.8 KB</span>
                    <span>362 ms</span>
                    <span>09:31</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Edge Health & Analysis matching screenshot */}
        <div className="space-y-6">
          {/* Edge Health Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
              EDGE HEALTH · 24H
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] text-slate-400">Runs on this edge</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">1,842</div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400">Success rate</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">82.2%</div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400">Avg latency</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">190 ms</div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400">Context complete</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">1,714</div>
              </div>
            </div>
          </div>

          {/* IQ Analysis Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs border border-purple-100 dark:border-purple-800">
                IQ
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Analysis</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This run is the control case: Router forwarded the full caller scope and Billing accepted in 188 ms with no retry. The 17.8% of runs that fail on this edge differ in exactly one field.
            </p>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Nothing to fix on this run</span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                FIX-117 is watching this edge in Monitor mode. Promote to Warn after 48 h with 0 false positives.
              </p>
            </div>
          </div>

          {/* Same Edge Elsewhere Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
              SAME EDGE ELSEWHERE
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition border border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Router → Billing · Staging</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">98.1% complete · 412 runs</div>
              </div>

              <div className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition border border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Router → Billing · Development</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">100% complete · 38 runs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Compare with Failed Run Modal */}
      {isComparingFailed && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Handoff Differential: tr_84926 (Healthy) vs tr_84921 (Failed)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Detailed payload contract comparison across edges.
                </p>
              </div>
              <button
                onClick={() => setIsComparingFailed(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/80">
                  <div className="font-bold text-emerald-800 dark:text-emerald-300 text-xs mb-1">
                    tr_84926 (Current Control Run)
                  </div>
                  <div className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                    <div>• authorization_scope: "admin" [PASSED]</div>
                    <div>• landed_procurement_cost: ₹{product.landedCost}</div>
                    <div>• min_margin_guarantee: ₹{product.minMargin}</div>
                    <div>• latency: 188 ms (Accepted)</div>
                  </div>
                </div>

                <div className="p-3 bg-rose-50/70 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800/80">
                  <div className="font-bold text-rose-800 dark:text-rose-300 text-xs mb-1">
                    tr_84921 (Failed Preceding Run)
                  </div>
                  <div className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                    <div className="font-semibold text-rose-600 dark:text-rose-400">
                      • authorization_scope: null [MISSING FIELD]
                    </div>
                    <div>• landed_procurement_cost: ₹{product.landedCost}</div>
                    <div>• min_margin_guarantee: ₹{product.minMargin}</div>
                    <div className="text-rose-600 dark:text-rose-400">• rejected: HTTP 403 Forbidden</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                <strong>Diagnosis:</strong> Pipeline FIX-117 automatically injected the missing authentication credential context into downstream repricing dispatchers. No human intervention needed.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsComparingFailed(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
