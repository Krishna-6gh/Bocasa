import React, { useState } from 'react';
import { 
  Calculator, 
  Edit3, 
  Check, 
  RotateCcw, 
  HelpCircle, 
  AlertTriangle, 
  TrendingDown, 
  Layers, 
  Percent, 
  Truck,
  ShieldCheck
} from 'lucide-react';
import { ProductSKU, FeeMatrixItem, PlatformId, GSTSlab } from '../types';
import { calculatePlatformFloor } from '../data/defaultFeeMatrix';

interface CostFloorEngineViewProps {
  product: ProductSKU;
  feeMatrix: FeeMatrixItem[];
  onUpdateFeeMatrix: (updatedMatrix: FeeMatrixItem[]) => void;
  onUpdateProductCosts?: (productId: string, landedCost: number, minMargin: number) => void;
}

export const CostFloorEngineView: React.FC<CostFloorEngineViewProps> = ({
  product,
  feeMatrix,
  onUpdateFeeMatrix,
  onUpdateProductCosts,
}) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempEditValues, setTempEditValues] = useState<Partial<FeeMatrixItem>>({});
  const [localLandedCost, setLocalLandedCost] = useState<number>(product.landedCost);
  const [localMinMargin, setLocalMinMargin] = useState<number>(product.minMargin);

  // Filter fee matrix for the product's active category
  const activeCategoryFees = feeMatrix.filter((f) => f.category === product.category);

  // Compute floors for all 3 platforms
  const amazonFee = feeMatrix.find((f) => f.platform === 'amazon' && f.category === product.category) || activeCategoryFees[0];
  const flipkartFee = feeMatrix.find((f) => f.platform === 'flipkart' && f.category === product.category) || activeCategoryFees[1];
  const meeshoFee = feeMatrix.find((f) => f.platform === 'meesho' && f.category === product.category) || activeCategoryFees[2];

  const amazonCalc = calculatePlatformFloor(localLandedCost, localMinMargin, amazonFee);
  const flipkartCalc = calculatePlatformFloor(localLandedCost, localMinMargin, flipkartFee);
  const meeshoCalc = calculatePlatformFloor(localLandedCost, localMinMargin, meeshoFee);

  const handleStartEdit = (item: FeeMatrixItem) => {
    setEditingItemId(item.id);
    setTempEditValues({
      commissionPct: item.commissionPct,
      logisticsFee: item.logisticsFee,
      closingFee: item.closingFee,
      gstRate: item.gstRate,
    });
  };

  const handleSaveEdit = (id: string) => {
    const updated = feeMatrix.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          ...tempEditValues,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      }
      return item;
    });
    onUpdateFeeMatrix(updated);
    setEditingItemId(null);
    setTempEditValues({});
  };

  const handleApplyCostChanges = () => {
    if (onUpdateProductCosts) {
      onUpdateProductCosts(product.id, localLandedCost, localMinMargin);
    }
  };

  return (
    <div className="space-y-6">
      {/* Blueprint Spec Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            COST & FLOOR
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Floor Calculation</span>
        </div>
        <h2 className="text-4xl md:text-[40px] font-extrabold font-brand text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
          Platform Floor Price Engine
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl mt-1 leading-relaxed">
          Each marketplace charges different commissions, shipping fees, and GST slabs. <strong>The floor price is different per platform for the same product.</strong>
        </p>

        {/* Product Cost Inputs Form */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Active SKU: <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{product.sku}</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{product.title}</div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1 font-medium">Landed Product Cost (₹):</label>
              <input
                type="number"
                value={localLandedCost}
                onChange={(e) => setLocalLandedCost(Number(e.target.value))}
                className="w-24 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1 font-medium">Min Margin Guarantee (₹):</label>
              <input
                type="number"
                value={localMinMargin}
                onChange={(e) => setLocalMinMargin(Number(e.target.value))}
                className="w-24 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleApplyCostChanges}
              className="mt-4 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition shadow-xs"
            >
              Recalculate Floors
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-Side Three Platform Floor Comparisons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
            True Floor Calculation: Same Product, 3 Different Marketplaces
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-medium">
            Net Seller Payout = Landed Cost (₹{localLandedCost}) + Min Profit (₹{localMinMargin})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Amazon Floor Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                Amazon.in
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-slate-800 text-amber-700 dark:text-slate-300 border border-amber-200 dark:border-slate-700 font-medium">
                {amazonFee.commissionPct}% Comm + EasyShip
              </span>
            </div>

            <div className="mt-2">
              <div className="text-xs text-slate-500 dark:text-slate-400">Computed Floor Price</div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight mt-0.5">
                ₹{amazonCalc.floorPrice}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Landed Cost:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">₹{amazonCalc.breakdown.landedCost}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>EasyShip Logistics:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">₹{amazonCalc.breakdown.logisticsFee}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Fixed Closing Fee:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">₹{amazonCalc.breakdown.closingFee}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Amazon Commission ({amazonFee.commissionPct}%):</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">₹{amazonCalc.breakdown.estimatedCommissionAmt}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>18% GST on Marketplace:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">₹{amazonCalc.breakdown.gstOnMarketplaceFees}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>Guaranteed Net Profit:</span>
                <span className="font-mono">₹{amazonCalc.breakdown.minMargin} ({amazonCalc.breakdown.effectiveNetMarginPct}%)</span>
              </div>
            </div>
          </div>

          {/* Flipkart Floor Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-sky-600 dark:text-sky-400 tracking-wider">
                Flipkart
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-slate-300 border border-sky-200 dark:border-slate-700 font-medium">
                {flipkartFee.commissionPct}% Comm + F-Assured
              </span>
            </div>

            <div className="mt-2">
              <div className="text-xs text-slate-500 dark:text-slate-400">Computed Floor Price</div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight mt-0.5">
                ₹{flipkartCalc.floorPrice}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Landed Cost:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">₹{flipkartCalc.breakdown.landedCost}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>F-Assured Logistics:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">₹{flipkartCalc.breakdown.logisticsFee}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Flipkart Closing Fee:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">₹{flipkartCalc.breakdown.closingFee}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Flipkart Comm ({flipkartFee.commissionPct}%):</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">₹{flipkartCalc.breakdown.estimatedCommissionAmt}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>18% GST on Marketplace:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">₹{flipkartCalc.breakdown.gstOnMarketplaceFees}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>Guaranteed Net Profit:</span>
                <span className="font-mono">₹{flipkartCalc.breakdown.minMargin} ({flipkartCalc.breakdown.effectiveNetMarginPct}%)</span>
              </div>
            </div>
          </div>

          {/* Meesho Floor Card (The Low-Commission Advantage!) */}
          <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/40 rounded-2xl p-5 relative overflow-hidden ring-1 ring-emerald-500/20 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Meesho</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                {meeshoFee.commissionPct === 0 ? '0% Commission Model' : `${meeshoFee.commissionPct}% Comm`}
              </span>
            </div>

            <div className="mt-2">
              <div className="text-xs text-slate-500 dark:text-slate-400">Computed Floor Price</div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight mt-0.5">
                ₹{meeshoCalc.floorPrice}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Landed Cost:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">₹{meeshoCalc.breakdown.landedCost}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Meesho 3PL Logistics:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">₹{meeshoCalc.breakdown.logisticsFee}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Closing Fee:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">₹0 (Zero Fee)</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Meesho Comm ({meeshoFee.commissionPct}%):</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">₹{meeshoCalc.breakdown.estimatedCommissionAmt}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>18% GST on Marketplace:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">₹{meeshoCalc.breakdown.gstOnMarketplaceFees}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>Guaranteed Net Profit:</span>
                <span className="font-mono">₹{meeshoCalc.breakdown.minMargin} ({meeshoCalc.breakdown.effectiveNetMarginPct}%)</span>
              </div>
            </div>

            {/* Difference Highlight */}
            <div className="mt-3 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-800 dark:text-emerald-300">
              ⚡ <strong>₹{amazonCalc.floorPrice - meeshoCalc.floorPrice} lower floor</strong> than Amazon! Seller can aggressively capture Bharat buyers while retaining identical ₹{localMinMargin} profit.
            </div>
          </div>
        </div>
      </div>

      {/* Editable Fee Table (Platform x Category) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Editable Marketplace Fee Matrix (Platform × Category)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Marketplaces revise rate cards 2–3 times per year. Update values here without touching code or redeploying.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-400 dark:text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-3 py-2.5">Platform</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Commission %</th>
                <th className="px-3 py-2.5">Logistics (₹)</th>
                <th className="px-3 py-2.5">Closing Fee (₹)</th>
                <th className="px-3 py-2.5">GST Slab</th>
                <th className="px-3 py-2.5">Last Updated</th>
                <th className="px-3 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {feeMatrix.map((item) => {
                const isEditing = editingItemId === item.id;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="px-3 py-2.5 font-medium capitalize text-slate-800 dark:text-slate-200">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        item.platform === 'amazon' ? 'bg-amber-500' : item.platform === 'flipkart' ? 'bg-sky-500' : 'bg-emerald-500'
                      }`}></span>
                      {item.platform}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300 font-medium">{item.categoryDisplayName}</td>
                    
                    {/* Commission % */}
                    <td className="px-3 py-2.5 font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.5"
                          value={tempEditValues.commissionPct ?? item.commissionPct}
                          onChange={(e) => setTempEditValues({ ...tempEditValues, commissionPct: Number(e.target.value) })}
                          className="w-16 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                        />
                      ) : (
                        `${item.commissionPct}%`
                      )}
                    </td>

                    {/* Logistics Fee */}
                    <td className="px-3 py-2.5 font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          value={tempEditValues.logisticsFee ?? item.logisticsFee}
                          onChange={(e) => setTempEditValues({ ...tempEditValues, logisticsFee: Number(e.target.value) })}
                          className="w-16 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                        />
                      ) : (
                        `₹${item.logisticsFee}`
                      )}
                    </td>

                    {/* Closing Fee */}
                    <td className="px-3 py-2.5 font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          value={tempEditValues.closingFee ?? item.closingFee}
                          onChange={(e) => setTempEditValues({ ...tempEditValues, closingFee: Number(e.target.value) })}
                          className="w-16 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                        />
                      ) : (
                        `₹${item.closingFee}`
                      )}
                    </td>

                    {/* GST Slab */}
                    <td className="px-3 py-2.5 font-mono">
                      {isEditing ? (
                        <select
                          value={tempEditValues.gstRate ?? item.gstRate}
                          onChange={(e) => setTempEditValues({ ...tempEditValues, gstRate: Number(e.target.value) as GSTSlab })}
                          className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      ) : (
                        `${item.gstRate}%`
                      )}
                    </td>

                    <td className="px-3 py-2.5 text-slate-400 dark:text-slate-500 font-mono text-[11px]">{item.lastUpdated}</td>

                    <td className="px-3 py-2.5 text-right">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveEdit(item.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-1 shadow-xs"
                        >
                          <Check className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold inline-flex items-center space-x-1 transition"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
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
