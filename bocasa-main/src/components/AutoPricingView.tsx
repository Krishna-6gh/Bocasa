import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  ShieldAlert, 
  ShieldCheck, 
  Sliders, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  Send, 
  ChevronRight,
  Sparkles,
  Download,
  FileSpreadsheet,
  Check,
  ChevronDown,
  FileText
} from 'lucide-react';
import { 
  ProductSKU, 
  FeeMatrixItem, 
  AutoRepricingSettings, 
  RepriceLogItem, 
  PlatformId 
} from '../types';
import { downloadRepricingCSVReport } from '../utils/csvExport';

interface AutoPricingViewProps {
  products: ProductSKU[];
  feeMatrix: FeeMatrixItem[];
  settings: AutoRepricingSettings;
  logs: RepriceLogItem[];
  onUpdateSettings: (newSettings: AutoRepricingSettings) => void;
  onTriggerRepriceRun: (customSettings?: AutoRepricingSettings) => void;
  onApplyPriceUpdateToCatalog: (productId: string, platform: PlatformId, newPrice: number) => void;
}

export const AutoPricingView: React.FC<AutoPricingViewProps> = ({
  products,
  feeMatrix,
  settings,
  logs,
  onUpdateSettings,
  onTriggerRepriceRun,
  onApplyPriceUpdateToCatalog,
}) => {
  const [isRunningSim, setIsRunningSim] = useState(false);
  const [activeLogFilter, setActiveLogFilter] = useState<'ALL' | 'SUCCESS' | 'GUARDRAIL_BLOCKED'>('ALL');
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<{ message: string; fileName: string; count: number } | null>(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleToggleEnable = () => {
    onUpdateSettings({
      ...settings,
      enabled: !settings.enabled,
    });
  };

  const handleTogglePlatform = (platform: 'amazon' | 'flipkart' | 'meesho') => {
    onUpdateSettings({
      ...settings,
      platformsEnabled: {
        ...settings.platformsEnabled,
        [platform]: !settings.platformsEnabled[platform],
      },
    });
  };

  const handleRunNow = () => {
    setIsRunningSim(true);
    onTriggerRepriceRun();
    setTimeout(() => {
      setIsRunningSim(false);
    }, 800);
  };

  const filteredLogs = logs.filter((log) => {
    if (activeLogFilter === 'ALL') return true;
    return log.status === activeLogFilter;
  });

  const handleDownloadReport = (exportAll = false) => {
    setIsExporting(true);
    setShowExportDropdown(false);
    const targetDataset = exportAll ? logs : filteredLogs;
    const filterLabel = exportAll
      ? 'All Logs (Complete Audit History)'
      : (activeLogFilter === 'ALL'
          ? 'All Current Logs'
          : activeLogFilter === 'SUCCESS'
          ? 'Applied / Passed Reprice Events Only'
          : 'Guardrail Blocked / Safety Held Events Only');

    try {
      const result = downloadRepricingCSVReport(targetDataset, {
        filterLabel,
      });

      if (result.success) {
        setDownloadSuccessToast({
          message: `Report downloaded successfully! ${result.rowCount} adjustments compiled into structured CSV for internal accounting.`,
          fileName: result.fileName,
          count: result.rowCount,
        });
        setTimeout(() => {
          setDownloadSuccessToast(null);
        }, 6000);
      }
    } catch (e) {
      console.error('Failed to export CSV report:', e);
    } finally {
      setTimeout(() => setIsExporting(false), 400);
    }
  };

  const successfulUpdatesCount = logs.filter((l) => l.status === 'SUCCESS').length;
  const guardrailBlocksCount = logs.filter((l) => l.status === 'GUARDRAIL_BLOCKED').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium mb-1">
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Automation</span>
            <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Repricing & Safety</span>
          </div>

          <div className="flex items-center space-x-3">
            <h1 className="text-4xl md:text-[40px] font-extrabold font-brand text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              Auto Repricing
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Adjusts prices on Amazon & Flipkart with daily caps and profit floors.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          <button
            id="top-download-repricing-report-btn"
            onClick={() => handleDownloadReport(false)}
            disabled={isExporting || logs.length === 0}
            className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-semibold border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50"
            title="Download structured CSV report of latest automated pricing adjustments for internal accounting"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Download Report</span>
            <span className="sm:hidden">Report</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-100">
              CSV
            </span>
          </button>

          <button
            onClick={handleRunNow}
            disabled={isRunningSim}
            className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-xs transition flex items-center space-x-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isRunningSim ? 'animate-spin' : ''}`} />
            <span>{isRunningSim ? 'Executing Batch...' : 'Run Cycle Now'}</span>
          </button>

          <button
            onClick={handleToggleEnable}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-2 shadow-xs ${
              settings.enabled
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {settings.enabled ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Automation: ACTIVE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Automation: PAUSED</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Safety Guardrails Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Max Daily Price Change % */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center">
              <ShieldAlert className="w-4 h-4 text-amber-500 mr-1.5" />
              Max Daily Delta %
            </span>
            <span className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400">
              ±{settings.maxDailyPriceChangePct}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Caps maximum 24h price swings to prevent de-indexing or flash undercuts.
          </p>
          <div className="mt-4">
            <input
              type="range"
              min="3"
              max="30"
              step="1"
              value={settings.maxDailyPriceChangePct}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  maxDailyPriceChangePct: Number(e.target.value),
                })
              }
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1.5">
              <span>3% (Conservative)</span>
              <span>15%</span>
              <span>30% (Aggressive)</span>
            </div>
          </div>
        </div>

        {/* Minimum Profit Margin Safety Net */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-1.5" />
              Min Net Profit Floor
            </span>
            <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
              ₹{settings.minProfitMarginINR}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Hard floor guarantee. Algorithm rejects any reprice breaching this net gain.
          </p>
          <div className="mt-4 flex items-center space-x-2">
            <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 font-mono">
              <span className="text-slate-400 mr-1">₹</span>
              <input
                type="number"
                min="50"
                max="1000"
                step="10"
                value={settings.minProfitMarginINR}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    minProfitMarginINR: Math.max(0, Number(e.target.value)),
                  })
                }
                className="w-20 bg-transparent text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none"
              />
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">Floor baseline</span>
          </div>
        </div>

        {/* Platform Channels */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center">
              <Send className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-1.5" />
              Active Target Rails
            </span>
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">APIs</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Select marketplaces eligible for autonomous batch feed pushes.
          </p>
          <div className="mt-4 flex items-center space-x-2">
            {(['amazon', 'flipkart', 'meesho'] as const).map((plat) => {
              const isEnabled = settings.platformsEnabled[plat];
              return (
                <button
                  key={plat}
                  onClick={() => handleTogglePlatform(plat)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition flex items-center space-x-1.5 ${
                    isEnabled
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isEnabled ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  ></span>
                  <span>{plat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs transition-colors">
          <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-semibold">TOTAL AUTOMATED UPDATES</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">{settings.totalRepriceCount}</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Dispatched across all channels</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs transition-colors">
          <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-semibold">SUCCESSFUL REPRICES</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{successfulUpdatesCount}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Passed all safety guardrails</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs transition-colors">
          <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-semibold">GUARDRAIL INTERVENTIONS</div>
          <div className="text-2xl font-bold font-mono text-amber-500 dark:text-amber-400 mt-1">{guardrailBlocksCount}</div>
          <div className="text-[11px] text-amber-500 dark:text-amber-400 font-medium mt-0.5">Blocked margin breaches</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs transition-colors">
          <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-semibold">SCHEDULED INTERVAL</div>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">Every {settings.frequencyMinutes}m</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Last run: {settings.lastRunTimestamp ? 'Just now' : 'Idle'}
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800 text-blue-600 dark:text-blue-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Automated Repricing Audit Trail & Dispatch Log
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {filteredLogs.length} events
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Full chronological ledger of algorithmic price adjustments, competitor triggers, and floor guardrail blocks.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 flex-wrap">
            {/* Filter buttons */}
            <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              {(['ALL', 'SUCCESS', 'GUARDRAIL_BLOCKED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveLogFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    activeLogFilter === filter
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {filter === 'ALL' ? 'All Dispatches' : filter === 'SUCCESS' ? 'Passed' : 'Blocked'}
                </button>
              ))}
            </div>

            {/* DOWNLOAD REPORT BUTTON WITH ACCOUNTING OPTIONS */}
            <div className="relative inline-flex items-center shadow-xs rounded-xl">
              <button
                id="download-repricing-report-btn"
                onClick={() => handleDownloadReport(false)}
                disabled={isExporting || logs.length === 0}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-l-xl text-xs font-semibold shadow-xs hover:shadow transition flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download structured CSV of automated pricing adjustments for seller internal accounting & tax reconciliation"
              >
                <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
                <span>Download Report</span>
                <span className="text-[10px] font-mono bg-emerald-700/80 px-1.5 py-0.5 rounded text-emerald-100">
                  CSV
                </span>
              </button>

              <button
                id="download-report-options-toggle"
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="px-2 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-r-xl border-l border-emerald-500/50 transition flex items-center justify-center"
                title="Export Options & Filter Selection"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showExportDropdown && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2.5 z-30 space-y-1.5 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between px-2 pt-1 pb-1 text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                    <span>ACCOUNTING EXPORT SCOPE</span>
                    <span>RFC 4180</span>
                  </div>

                  <button
                    onClick={() => handleDownloadReport(false)}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold">Current View ({filteredLogs.length} rows)</div>
                        <div className="text-[10px] text-slate-400">
                          {activeLogFilter === 'ALL' ? 'All recorded dispatches' : activeLogFilter === 'SUCCESS' ? 'Passed updates only' : 'Guardrail blocked events'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition">
                      CSV
                    </span>
                  </button>

                  <button
                    onClick={() => handleDownloadReport(true)}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="p-1 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold">Complete Audit Ledger ({logs.length} rows)</div>
                        <div className="text-[10px] text-slate-400">Export every event across all filters</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition">
                      CSV
                    </span>
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-2 px-2 pb-1 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Included Accounting Fields:</span> SKU, marketplace, before/after INR pricing, deltas, break-even cost floors, margin buffers, competitor benchmarks & guardrail audit classifications.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Download Success Banner */}
        {downloadSuccessToast && (
          <div className="mx-4 my-3 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center space-x-2.5">
              <div className="p-1 rounded-full bg-emerald-600 text-white shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold">Accounting Report Generated: </span>
                <span className="font-mono text-[11px] text-emerald-800 dark:text-emerald-300 underline font-medium">
                  {downloadSuccessToast.fileName}
                </span>
                <span className="ml-1.5 text-slate-600 dark:text-slate-400">
                  ({downloadSuccessToast.count} pricing adjustments exported with UTF-8 BOM encoding)
                </span>
              </div>
            </div>
            <button
              onClick={() => setDownloadSuccessToast(null)}
              className="text-xs text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-200 font-semibold px-2 py-1 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition ml-3"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-950/60 text-slate-400 dark:text-slate-500 uppercase font-mono text-[10px] border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-3 py-3 font-semibold">SKU & Platform</th>
                <th className="px-3 py-3 font-semibold">Old Price</th>
                <th className="px-3 py-3 font-semibold">New Price</th>
                <th className="px-3 py-3 font-semibold">Delta %</th>
                <th className="px-3 py-3 font-semibold">Floor Price</th>
                <th className="px-3 py-3 font-semibold">Competitor</th>
                <th className="px-3 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold">Decision Reason & Guardrail Safety Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
              {filteredLogs.map((log) => {
                const isSuccess = log.status === 'SUCCESS';
                const isBlocked = log.status === 'GUARDRAIL_BLOCKED';

                return (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition font-sans">
                    <td className="px-4 py-3 text-slate-400 dark:text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="px-3 py-3">
                      <div className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                        {log.productSku}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 max-w-[180px]">
                        {log.productTitle}
                      </div>
                      <span className="inline-block mt-0.5 uppercase text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {log.platform}
                      </span>
                    </td>

                    <td className="px-3 py-3 font-mono text-slate-700 dark:text-slate-300">
                      ₹{log.oldPrice}
                    </td>

                    <td className="px-3 py-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                      ₹{log.newPrice}
                    </td>

                    <td className="px-3 py-3 font-mono">
                      <span
                        className={`inline-flex items-center text-xs font-semibold ${
                          log.changePct < 0 ? 'text-amber-600 dark:text-amber-400' : log.changePct > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {log.changePct > 0 ? '+' : ''}
                        {log.changePct}%
                      </span>
                    </td>

                    <td className="px-3 py-3 font-mono text-slate-500 dark:text-slate-400">
                      ₹{log.floorPrice}
                    </td>

                    <td className="px-3 py-3 font-mono text-slate-500 dark:text-slate-400">
                      ₹{log.competitorPrice}
                    </td>

                    <td className="px-3 py-3 text-center">
                      {isSuccess && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                          Applied
                        </span>
                      )}
                      {isBlocked && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <ShieldAlert className="w-3 h-3 mr-1 text-amber-500" />
                          Safety Block
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-xs">
                      <div className="text-slate-700 dark:text-slate-300 line-clamp-2 max-w-sm">
                        {log.explanation}
                      </div>
                      {log.guardrailNote && (
                        <div className="mt-1 text-[10px] text-amber-600 dark:text-amber-400 font-mono flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1 shrink-0" />
                          {log.guardrailNote}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
