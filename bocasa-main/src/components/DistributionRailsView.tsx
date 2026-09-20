import React, { useState } from 'react';
import { 
  Send, 
  Key, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  ArrowRight, 
  Layers, 
  ExternalLink,
  Lock
} from 'lucide-react';
import { ProductSKU, PlatformId } from '../types';

interface DistributionRailsViewProps {
  product: ProductSKU;
}

export const DistributionRailsView: React.FC<DistributionRailsViewProps> = ({ product }) => {
  const [activePlatformTab, setActivePlatformTab] = useState<PlatformId>('amazon');
  const [isSimulatingPush, setIsSimulatingPush] = useState<boolean>(false);
  const [pushStatus, setPushStatus] = useState<Record<PlatformId, 'IDLE' | 'SENDING' | 'SUCCESS' | 'ERROR'>>({
    amazon: 'IDLE',
    flipkart: 'IDLE',
    meesho: 'IDLE',
  });
  const [simulateFlipkartOutage, setSimulateFlipkartOutage] = useState<boolean>(false);

  const handleTriggerDispatch = () => {
    setIsSimulatingPush(true);
    setPushStatus({ amazon: 'SENDING', flipkart: 'SENDING', meesho: 'SENDING' });

    setTimeout(() => {
      setPushStatus({
        amazon: 'SUCCESS',
        flipkart: simulateFlipkartOutage ? 'ERROR' : 'SUCCESS',
        meesho: 'SUCCESS',
      });
      setIsSimulatingPush(false);
    }, 1200);
  };

  const getAmazonPayload = () => ({
    endpoint: `PATCH https://sellingpartnerapi-eu.amazon.com/listings/2021-08-01/items/${product.asin}?marketplaceIds=A21TJRUUN4KGV`,
    headers: {
      'x-amz-access-token': 'Atzr|IwEBIBF...[AES-256 Encrypted in DB]',
      'Content-Type': 'application/json',
      'User-Agent': 'Bocasa-Distribution/2.0 (Language=NodeJS)',
    },
    body: {
      productType: 'HEADPHONES',
      patches: [
        {
          op: 'replace',
          path: '/attributes/purchasable_offer',
          value: [
            {
              marketplace_id: 'A21TJRUUN4KGV',
              currency: 'INR',
              our_price: [
                {
                  schedule: [
                    {
                      value_with_tax: product.currentSellingPrices.amazon,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  });

  const getFlipkartPayload = () => ({
    endpoint: `PUT https://api.flipkart.net/sellers/v3/listings/${product.fsn}`,
    headers: {
      'Authorization': 'Bearer fk_sec_tok_8819...[Auto-Refreshed]',
      'Content-Type': 'application/json',
    },
    body: {
      listing_id: product.fsn,
      product_id: product.fsn,
      attribute_values: {
        listing_status: 'ACTIVE',
        mrp: product.mrp,
        selling_price: product.currentSellingPrices.flipkart,
      },
      locations: [
        {
          id: 'WH_BLR_01',
          inventory: 85,
        },
      ],
    },
  });

  const getMeeshoPayload = () => ({
    endpoint: 'POST https://api.fynd.com/service/platform/inventory/v1.0/company/7712/meesho/sync-price',
    headers: {
      'Authorization': 'Bearer fynd_meesho_bridge_tok_991',
      'Content-Type': 'application/json',
    },
    body: {
      channel: 'MEESHO',
      vendor_sku: product.sku,
      channel_pid: product.meeshoPid,
      price: {
        currency: 'INR',
        marked: product.mrp,
        effective: product.currentSellingPrices.meesho,
      },
      stock_in_hand: 120,
      timestamp: new Date().toISOString(),
    },
  });

  const activePayload = 
    activePlatformTab === 'amazon' 
      ? getAmazonPayload() 
      : activePlatformTab === 'flipkart' 
      ? getFlipkartPayload() 
      : getMeeshoPayload();

  return (
    <div className="space-y-6">
      {/* Blueprint Guidance Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            DISTRIBUTION
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Marketplace Integrations</span>
        </div>
        <h2 className="text-4xl md:text-[40px] font-extrabold font-brand text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
          Marketplace Distribution
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl mt-1 leading-relaxed">
          Push price updates to Amazon SP-API, Flipkart Seller API, and Meesho via channel integrations.
        </p>

        {/* 3 Real Platform Rails Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
              <span>Amazon SP-API</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Official OAuth
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
              Uses Login-with-Amazon OAuth. Calls Listings Items API (2021-08-01) with JSON-Patch payloads. Reports/Finances APIs handle fee settlement auditing.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-sky-600 dark:text-sky-400 mb-1">
              <span>Flipkart Seller API</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                Approval Gated
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
              Official developer API tied to Flipkart Serial Numbers (FSN). Handles real-time price & stock updates without catalog re-submission.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
              <span>Meesho (Fynd Konnect)</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Channel Bridge
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
              Meesho lacks open self-serve APIs; Bocasa bridges through Fynd Konnect / Unicommerce connectors holding existing Meesho credentials.
            </p>
          </div>
        </div>
      </div>

      {/* Live Push Simulator & Graceful Degradation Testing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Rails Status & Push Controller */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
              Distribution Rail Status & Dispatch Controller
            </h3>

            {/* Platform Status Cards */}
            <div className="space-y-3">
              {/* Amazon Rail */}
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Amazon SP-API</div>
                    <div className="text-[10px] text-slate-400 font-mono">ASIN: {product.asin}</div>
                  </div>
                </div>
                <span className={`text-xs font-mono font-medium ${
                  pushStatus.amazon === 'SUCCESS' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                }`}>
                  {pushStatus.amazon === 'SENDING' ? 'Dispatching...' : pushStatus.amazon === 'SUCCESS' ? 'Synced (200 OK)' : 'Online'}
                </span>
              </div>

              {/* Flipkart Rail */}
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${simulateFlipkartOutage ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Flipkart Seller API</div>
                    <div className="text-[10px] text-slate-400 font-mono">FSN: {product.fsn}</div>
                  </div>
                </div>
                <span className={`text-xs font-mono font-medium ${
                  pushStatus.flipkart === 'ERROR' ? 'text-rose-600 dark:text-rose-400' : pushStatus.flipkart === 'SUCCESS' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                }`}>
                  {pushStatus.flipkart === 'SENDING' ? 'Dispatching...' : pushStatus.flipkart === 'ERROR' ? 'HTTP 503 (Outage Handled)' : pushStatus.flipkart === 'SUCCESS' ? 'Synced (200 OK)' : 'Online'}
                </span>
              </div>

              {/* Meesho Rail */}
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500"></div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Meesho (Fynd Bridge)</div>
                    <div className="text-[10px] text-slate-400 font-mono">PID: {product.meeshoPid}</div>
                  </div>
                </div>
                <span className={`text-xs font-mono font-medium ${
                  pushStatus.meesho === 'SUCCESS' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                }`}>
                  {pushStatus.meesho === 'SENDING' ? 'Dispatching...' : pushStatus.meesho === 'SUCCESS' ? 'Synced (200 OK)' : 'Online'}
                </span>
              </div>
            </div>

            {/* Failure Isolation Toggle (Section 4 requirement) */}
            <div className="mt-5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Test Graceful Failure:</span>
                <button
                  onClick={() => setSimulateFlipkartOutage(!simulateFlipkartOutage)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition ${
                    simulateFlipkartOutage
                      ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {simulateFlipkartOutage ? 'Simulating Flipkart 503' : 'Flipkart Normal'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                If a platform goes down, its BullMQ queue retries with exponential backoff—<strong>it never blocks or rolls back Amazon or Meesho syncs</strong>.
              </p>
            </div>

            {/* Push Trigger Button */}
            <button
              onClick={handleTriggerDispatch}
              disabled={isSimulatingPush}
              className="mt-5 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-2 shadow-xs disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${isSimulatingPush ? 'animate-bounce' : ''}`} />
              <span>{isSimulatingPush ? 'Dispatching Across All Rails...' : 'Dispatch Reprice to All Marketplaces'}</span>
            </button>
          </div>

          {/* Encrypted Token Model Spec */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-2 shadow-xs transition-colors">
            <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 text-xs font-bold">
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Encrypted Auth Token Model</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Seller tokens and refresh tokens are encrypted at rest with AES-GCM-256 in PostgreSQL via AWS KMS / pgcrypto. Background BullMQ workers automatically renew short-lived access tokens before dispatch.
            </p>
          </div>
        </div>

        {/* Right Column: Actual API Payload Inspector */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Live Marketplace API Wireframe</span>
              </h3>
              
              <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {(['amazon', 'flipkart', 'meesho'] as PlatformId[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setActivePlatformTab(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                      activePlatformTab === p
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Endpoint */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-slate-300 break-all mb-3">
              <span className="text-emerald-400 font-bold">DISPATCH: </span>
              {activePayload.endpoint}
            </div>

            {/* Headers & Body */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-slate-300 max-h-[380px] overflow-y-auto">
              <div className="text-slate-500 mb-2">// Request Headers & Body:</div>
              <pre className="text-emerald-400">
                {JSON.stringify(
                  {
                    headers: activePayload.headers,
                    payload: activePayload.body,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
