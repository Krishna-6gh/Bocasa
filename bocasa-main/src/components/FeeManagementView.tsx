import React, { useState } from 'react';
import { 
  Sliders, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Calculator, 
  Info,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  ChevronDown,
  Check
} from 'lucide-react';
import { FeeMatrixItem, PlatformId, ProductCategory } from '../types';
import { INITIAL_FEE_MATRIX, calculatePlatformFloor } from '../data/defaultFeeMatrix';

interface FeeManagementViewProps {
  feeMatrix: FeeMatrixItem[];
  onUpdateFeeMatrix: (updatedMatrix: FeeMatrixItem[]) => void;
  onResetFeeMatrix: () => void;
}

export const FeeManagementView: React.FC<FeeManagementViewProps> = ({
  feeMatrix,
  onUpdateFeeMatrix,
  onResetFeeMatrix,
}) => {
  const [activePlatformFilter, setActivePlatformFilter] = useState<PlatformId | 'all'>('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<ProductCategory | 'all'>('all');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [localFeeMatrix, setLocalFeeMatrix] = useState<FeeMatrixItem[]>(feeMatrix);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Test simulation product cost state for live impact check
  const [simCost, setSimCost] = useState<number>(450);
  const [simMinMargin, setSimMinMargin] = useState<number>(150);

  const handleFieldChange = (id: string, field: keyof FeeMatrixItem, val: any) => {
    setLocalFeeMatrix((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            [field]: typeof val === 'number' ? Math.max(0, val) : val,
            lastUpdated: new Date().toISOString().split('T')[0],
          };
        }
        return item;
      })
    );
    setHasUnsavedChanges(true);
    setSaveSuccessNotice(false);
  };

  const handleSaveAll = () => {
    onUpdateFeeMatrix(localFeeMatrix);
    setHasUnsavedChanges(false);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3500);
  };

  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to reset all platform fees to standard Indian marketplace benchmarks?')) {
      setLocalFeeMatrix(INITIAL_FEE_MATRIX);
      onResetFeeMatrix();
      setHasUnsavedChanges(false);
    }
  };

  const filteredMatrix = localFeeMatrix.filter((item) => {
    const platformMatch = activePlatformFilter === 'all' || item.platform === activePlatformFilter;
    const categoryMatch = activeCategoryFilter === 'all' || item.category === activeCategoryFilter;
    return platformMatch && categoryMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium mb-1">
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Configuration</span>
            <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Fee Matrix</span>
          </div>

          <div className="flex items-center space-x-3">
            <h1 className="text-4xl md:text-[40px] font-extrabold font-brand text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              Fee Matrix
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              GST 18%
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure commissions, shipping fees, and closing fees per marketplace.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleResetToDefaults}
            className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-xs transition-all duration-200 hover:scale-[1.01] active:ring-2 active:ring-blue-500/40 flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSaveAll}
            disabled={!hasUnsavedChanges}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-all duration-200 hover:scale-[1.01] active:ring-2 active:ring-blue-500/40 ${
              hasUnsavedChanges
                ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-blue-500/25'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Fee Changes</span>
          </button>
        </div>
      </div>

      {saveSuccessNotice && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Marketplace fee matrix successfully saved and synchronized with all SKU floor calculations!</span>
        </div>
      )}

      {/* Interactive Floor Test Bench matching clean card style */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-800">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Interactive Floor Test Bench</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Live preview of how fee tweaks alter floor price on a sample item:</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="text-slate-500 dark:text-slate-400">Sample Landed:</span>
              <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 transition-all duration-200 hover:scale-[1.01]">
                <span className="text-slate-400 mr-1">₹</span>
                <input
                  type="number"
                  value={simCost}
                  onChange={(e) => setSimCost(Number(e.target.value))}
                  className="w-16 bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:outline-none transition-all duration-200 hover:scale-[1.01] focus:ring-2 focus:ring-blue-500/40 rounded"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-500 dark:text-slate-400">Min Margin:</span>
              <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 transition-all duration-200 hover:scale-[1.01]">
                <span className="text-slate-400 mr-1">₹</span>
                <input
                  type="number"
                  value={simMinMargin}
                  onChange={(e) => setSimMinMargin(Number(e.target.value))}
                  className="w-16 bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:outline-none transition-all duration-200 hover:scale-[1.01] focus:ring-2 focus:ring-blue-500/40 rounded"
                />
              </div>
            </div>

            <div className="flex items-center space-4 pl-3 border-l border-slate-200 dark:border-slate-700">
              {(['amazon', 'flipkart', 'meesho'] as PlatformId[]).map((p) => {
                const sampleFee = localFeeMatrix.find((f) => f.platform === p && f.category === 'electronics') || localFeeMatrix[0];
                const floor = calculatePlatformFloor(simCost, simMinMargin, sampleFee).floorPrice;
                return (
                  <div key={p} className="flex flex-col text-center px-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">{p}</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">₹{floor}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-colors">
        {/* Filter controls */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Platform:</span>
            <div className="flex p-0.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              {(['all', 'amazon', 'flipkart', 'meesho'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePlatformFilter(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all duration-200 hover:scale-[1.01] active:ring-2 active:ring-blue-500/40 ${
                    activePlatformFilter === p
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Category:</span>
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="flex items-center space-x-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 hover:scale-[1.01] active:ring-2 active:ring-blue-500/40 cursor-pointer"
              >
                <span>
                  {activeCategoryFilter === 'all'
                    ? 'All Categories'
                    : activeCategoryFilter === 'electronics'
                    ? 'Electronics'
                    : activeCategoryFilter === 'apparel'
                    ? 'Apparel'
                    : activeCategoryFilter === 'home_kitchen'
                    ? 'Home & Kitchen'
                    : 'Beauty & Personal Care'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {isCategoryDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-1.5 z-50 animate-fadeIn">
                {[
                  { id: 'all', label: 'All Categories' },
                  { id: 'electronics', label: 'Electronics' },
                  { id: 'apparel', label: 'Apparel' },
                  { id: 'home_kitchen', label: 'Home & Kitchen' },
                  { id: 'beauty', label: 'Beauty & Personal Care' },
                ].map((cat) => {
                  const isSelected = activeCategoryFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setActiveCategoryFilter(cat.id as any);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-950/60 text-slate-400 dark:text-slate-500 uppercase font-mono text-[10px] border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Platform & Category</th>
                <th className="px-3 py-3 font-semibold">Commission %</th>
                <th className="px-3 py-3 font-semibold">Shipping / Freight (₹)</th>
                <th className="px-3 py-3 font-semibold">Closing Fee (₹)</th>
                <th className="px-3 py-3 font-semibold">Pick & Pack (₹)</th>
                <th className="px-3 py-3 font-semibold">GST Slab</th>
                <th className="px-3 py-3 font-semibold">Sample Floor</th>
                <th className="px-4 py-3 font-semibold">Policy Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMatrix.map((item) => {
                const sampleFloor = calculatePlatformFloor(simCost, simMinMargin, item).floorPrice;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3.5">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {item.platform}
                      </span>
                      <div className="font-bold text-slate-900 dark:text-slate-100 mt-1">
                        {item.categoryDisplayName}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        Key: {item.id}
                      </div>
                    </td>

                    <td className="px-3 py-3.5">
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="50"
                          value={item.commissionPct}
                          onChange={(e) =>
                            handleFieldChange(item.id, 'commissionPct', parseFloat(e.target.value) || 0)
                          }
                          className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none transition-all duration-200 hover:scale-[1.01] focus:ring-2 focus:ring-blue-500/40"
                        />
                        <span className="font-mono text-slate-500">%</span>
                      </div>
                    </td>

                    <td className="px-3 py-3.5">
                      <div className="flex items-center space-x-1">
                        <span className="font-mono text-slate-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={item.logisticsFee}
                          onChange={(e) =>
                            handleFieldChange(item.id, 'logisticsFee', parseInt(e.target.value, 10) || 0)
                          }
                          className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none transition-all duration-200 hover:scale-[1.01] focus:ring-2 focus:ring-blue-500/40"
                        />
                      </div>
                    </td>

                    <td className="px-3 py-3.5">
                      <div className="flex items-center space-x-1">
                        <span className="font-mono text-slate-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={item.closingFee}
                          onChange={(e) =>
                            handleFieldChange(item.id, 'closingFee', parseInt(e.target.value, 10) || 0)
                          }
                          className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none transition-all duration-200 hover:scale-[1.01] focus:ring-2 focus:ring-blue-500/40"
                        />
                      </div>
                    </td>

                    <td className="px-3 py-3.5">
                      <div className="flex items-center space-x-1">
                        <span className="font-mono text-slate-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={item.pickPackFee}
                          onChange={(e) =>
                            handleFieldChange(item.id, 'pickPackFee', parseInt(e.target.value, 10) || 0)
                          }
                          className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none transition-all duration-200 hover:scale-[1.01] focus:ring-2 focus:ring-blue-500/40"
                        />
                      </div>
                    </td>

                    <td className="px-3 py-3.5">
                      <select
                        value={item.gstRate}
                        onChange={(e) =>
                          handleFieldChange(item.id, 'gstRate', parseInt(e.target.value, 10) || 18)
                        }
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-200 font-mono font-semibold focus:outline-none transition-all duration-200 hover:scale-[1.01] focus:ring-2 focus:ring-blue-500/40"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </td>

                    <td className="px-3 py-3.5 font-mono">
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        ₹{sampleFloor}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="text-xs text-slate-600 dark:text-slate-400 max-w-xs">
                        {item.notes}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                        Updated: {item.lastUpdated}
                      </div>
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
