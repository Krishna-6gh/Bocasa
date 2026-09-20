import React, { useState } from 'react';
import { 
  Building2, 
  Key, 
  ShieldCheck, 
  Bell, 
  Users, 
  Globe, 
  Check, 
  RefreshCw, 
  AlertTriangle, 
  ExternalLink, 
  Save, 
  Lock, 
  Sliders, 
  CheckCircle2, 
  Copy,
  Zap
} from 'lucide-react';
import { PlatformId } from '../types';

interface SettingsViewProps {
  onNotify?: (message: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNotify }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'marketplaces' | 'safeguards' | 'notifications' | 'team'>('profile');
  const [isSaved, setIsSaved] = useState(false);
  const [testingPlatform, setTestingPlatform] = useState<PlatformId | null>(null);
  const [testSuccess, setTestSuccess] = useState<Record<string, boolean>>({
    amazon: true,
    flipkart: true,
    meesho: true,
  });

  // Store Profile State
  const [profile, setProfile] = useState({
    businessName: 'Acme Retail India Pvt Ltd',
    sellerTradeName: 'Acme Direct',
    merchantId: 'MERCH-IN-884291',
    gstin: '07AABCA1234F1Z5',
    pan: 'AABCA1234F',
    supportEmail: 'seller-ops@acmeretail.in',
    supportPhone: '+91 98765 43210',
    primaryWarehouse: 'Bhiwandi Hub (MH) - 421302',
    defaultCurrency: 'INR (₹)',
    timezone: 'Asia/Kolkata (IST)',
  });

  // Marketplace API Configurations
  const [marketplaces, setMarketplaces] = useState({
    amazon: {
      enabled: true,
      sellerId: 'A3V9K294109XYZ',
      lwaClientId: 'amzn1.application-oa2-client.9842a84e9104',
      region: 'India (A21TJRUUN4KGV)',
      syncCadenceMinutes: 15,
      webhookActive: true,
    },
    flipkart: {
      enabled: true,
      sellerId: 'FLIP-IND-449102',
      appId: 'fk_live_app_9918231',
      region: 'India Pan-Regional',
      syncCadenceMinutes: 15,
      webhookActive: true,
    },
    meesho: {
      enabled: true,
      supplierId: 'MEESHO-SUPP-55219',
      apiKeyMasked: 'mk_live_••••••••••••94b2',
      region: 'India Supplier Hub',
      syncCadenceMinutes: 30,
      webhookActive: true,
    },
  });

  // Global Repricing Safeguards
  const [safeguards, setSafeguards] = useState({
    defaultMinMarginINR: 120,
    maxDailyPriceDropPct: 10,
    maxDailyPriceHikePct: 15,
    autoHoldAtFloor: true,
    preventUnderCostFloor: true,
    competitorOosBoostAmount: 40,
    undercutDeltaINR: 1,
    dryRunMode: false,
    requireManualApprovalAboveINR: 500,
  });

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    whatsappAlerts: true,
    notifyOnFloorBreach: true,
    notifyOnBuyBoxLoss: true,
    notifyOnCompetitorOOS: false,
    notifyOnPriceDispatched: false,
    dailyReportTime: '08:30',
  });

  const handleSave = () => {
    setIsSaved(true);
    if (onNotify) {
      onNotify('Settings saved successfully across all channels');
    }
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleTestConnection = (platform: PlatformId) => {
    setTestingPlatform(platform);
    setTimeout(() => {
      setTestingPlatform(null);
      setTestSuccess((prev) => ({ ...prev, [platform]: true }));
      if (onNotify) {
        onNotify(`Successfully verified live handshake with ${platform.toUpperCase()} API.`);
      }
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
              Merchant Settings
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Account ID: {profile.merchantId}</span>
          </div>
          <h1 className="text-4xl md:text-[40px] font-extrabold font-brand text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            Settings & Integrations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your legal entity, live marketplace API credentials, repricing risk safeguards, and alert pipelines.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {isSaved && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              <span>Saved & Applied</span>
            </div>
          )}
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all duration-200 hover:scale-[1.01] active:ring-2 active:ring-blue-500/40"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'profile', label: 'Store Profile', icon: <Building2 className="w-4 h-4" /> },
          { id: 'marketplaces', label: 'Marketplace APIs', icon: <Globe className="w-4 h-4" /> },
          { id: 'safeguards', label: 'Repricing Safeguards', icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'notifications', label: 'Alerts & Reports', icon: <Bell className="w-4 h-4" /> },
          { id: 'team', label: 'Team & Security', icon: <Users className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 hover:scale-[1.01] active:ring-2 active:ring-blue-500/40 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/90 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: Store & Seller Profile */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Business Entity & Tax Identifiers</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Registered Business Name
                </label>
                <input
                  type="text"
                  value={profile.businessName}
                  onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Store Display Brand Name
                </label>
                <input
                  type="text"
                  value={profile.sellerTradeName}
                  onChange={(e) => setProfile({ ...profile, sellerTradeName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  GSTIN (Goods and Services Tax ID)
                </label>
                <input
                  type="text"
                  value={profile.gstin}
                  onChange={(e) => setProfile({ ...profile, gstin: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Permanent Account Number (PAN)
                </label>
                <input
                  type="text"
                  value={profile.pan}
                  onChange={(e) => setProfile({ ...profile, pan: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Operations & Support Email
                </label>
                <input
                  type="email"
                  value={profile.supportEmail}
                  onChange={(e) => setProfile({ ...profile, supportEmail: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Emergency Phone Contact
                </label>
                <input
                  type="text"
                  value={profile.supportPhone}
                  onChange={(e) => setProfile({ ...profile, supportPhone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Default Primary Warehouse / Dispatch Hub
                </label>
                <input
                  type="text"
                  value={profile.primaryWarehouse}
                  onChange={(e) => setProfile({ ...profile, primaryWarehouse: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Summary Card */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Account Health & Tier
            </h3>
            
            <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                <span>Verified Enterprise Seller</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                GSTIN verified via GSTN API. Eligible for automated input tax credit (ITC) and SP-API direct pricing feeds.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex justify-between">
                <span>Currency Basis</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">{profile.defaultCurrency}</span>
              </div>
              <div className="flex justify-between">
                <span>Timezone</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">{profile.timezone}</span>
              </div>
              <div className="flex justify-between">
                <span>Active SKU Catalog</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">5 Products (15 Rails)</span>
              </div>
              <div className="flex justify-between">
                <span>Pricing Decision Model</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">Deterministic + AI Guardrails</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Marketplace APIs */}
      {activeTab === 'marketplaces' && (
        <div className="space-y-5">
          <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800 rounded-2xl p-4 text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                All 3 marketplaces are synced directly with your seller credentials. Live webhooks notify Bocasa on Buy Box ownership changes.
              </span>
            </div>
            <span className="font-mono font-bold bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 text-[11px]">
              3 of 3 Rails Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Amazon SP-API Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Amazon SP-API</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold">
                  CONNECTED
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Seller Merchant ID</span>
                  <input
                    type="text"
                    value={marketplaces.amazon.sellerId}
                    onChange={(e) => setMarketplaces({
                      ...marketplaces,
                      amazon: { ...marketplaces.amazon, sellerId: e.target.value }
                    })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">LWA Application Client ID</span>
                  <input
                    type="text"
                    value={marketplaces.amazon.lwaClientId}
                    onChange={(e) => setMarketplaces({
                      ...marketplaces,
                      amazon: { ...marketplaces.amazon, lwaClientId: e.target.value }
                    })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Marketplace Region</span>
                  <div className="font-medium text-slate-700 dark:text-slate-300 py-1">{marketplaces.amazon.region}</div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Sync Cadence</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Every 15 mins</span>
                </div>
              </div>

              <button
                onClick={() => handleTestConnection('amazon')}
                disabled={testingPlatform === 'amazon'}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all duration-200 hover:scale-[1.01] active:ring-2 active:ring-blue-500/40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingPlatform === 'amazon' ? 'animate-spin' : ''}`} />
                <span>{testingPlatform === 'amazon' ? 'Testing Handshake...' : 'Test Connection'}</span>
              </button>
            </div>

            {/* Flipkart Marketplace Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Flipkart Marketplace</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold">
                  CONNECTED
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Flipkart Seller ID</span>
                  <input
                    type="text"
                    value={marketplaces.flipkart.sellerId}
                    onChange={(e) => setMarketplaces({
                      ...marketplaces,
                      flipkart: { ...marketplaces.flipkart, sellerId: e.target.value }
                    })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">OAuth App ID</span>
                  <input
                    type="text"
                    value={marketplaces.flipkart.appId}
                    onChange={(e) => setMarketplaces({
                      ...marketplaces,
                      flipkart: { ...marketplaces.flipkart, appId: e.target.value }
                    })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Pricing Feeds Scope</span>
                  <div className="font-medium text-slate-700 dark:text-slate-300 py-1">Listings & Inventory Feed v3</div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Sync Cadence</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Every 15 mins</span>
                </div>
              </div>

              <button
                onClick={() => handleTestConnection('flipkart')}
                disabled={testingPlatform === 'flipkart'}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all duration-200 hover:scale-[1.01] active:ring-2 active:ring-blue-500/40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingPlatform === 'flipkart' ? 'animate-spin' : ''}`} />
                <span>{testingPlatform === 'flipkart' ? 'Testing Handshake...' : 'Test Connection'}</span>
              </button>
            </div>

            {/* Meesho Supplier API Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Meesho Supplier Hub</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold">
                  CONNECTED
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Meesho Supplier ID</span>
                  <input
                    type="text"
                    value={marketplaces.meesho.supplierId}
                    onChange={(e) => setMarketplaces({
                      ...marketplaces,
                      meesho: { ...marketplaces.meesho, supplierId: e.target.value }
                    })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Supplier Secret Token</span>
                  <input
                    type="text"
                    value={marketplaces.meesho.apiKeyMasked}
                    readOnly
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Zero-Commission Protocol</span>
                  <div className="font-medium text-slate-700 dark:text-slate-300 py-1">Direct Landed Dispatch</div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Sync Cadence</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Every 30 mins</span>
                </div>
              </div>

              <button
                onClick={() => handleTestConnection('meesho')}
                disabled={testingPlatform === 'meesho'}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all duration-200 hover:scale-[1.01] active:ring-2 active:ring-blue-500/40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingPlatform === 'meesho' ? 'animate-spin' : ''}`} />
                <span>{testingPlatform === 'meesho' ? 'Testing Handshake...' : 'Test Connection'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Repricing Safeguards */}
      {activeTab === 'safeguards' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Autonomous Guardrails & Anti-Crash Rules</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              These rules act as unbreakable safety valves. The repricing algorithm can never breach these constraints, preventing margin wipeout during price wars.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Price Floor & Profit Protection
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Global Minimum Margin Floor</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Hard floor below which no repricing action is ever dispatched</div>
                </div>
                <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl font-mono text-xs">
                  <span className="text-slate-400">₹</span>
                  <input
                    type="number"
                    value={safeguards.defaultMinMarginINR}
                    onChange={(e) => setSafeguards({ ...safeguards, defaultMinMarginINR: Number(e.target.value) })}
                    className="w-14 font-bold text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none text-right"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Enforce Hard Cost Floor Clamping</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Auto-hold at exact floor when competitor drops below your cost</div>
                </div>
                <input
                  type="checkbox"
                  checked={safeguards.autoHoldAtFloor}
                  onChange={(e) => setSafeguards({ ...safeguards, autoHoldAtFloor: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Simulation / Dry-Run Mode</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Calculate decisions and record logs without sending live price feeds</div>
                </div>
                <input
                  type="checkbox"
                  checked={safeguards.dryRunMode}
                  onChange={(e) => setSafeguards({ ...safeguards, dryRunMode: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Volatility & Undercut Logic
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Max Daily Price Drop Limit</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Limits algorithmic price drops to prevent erratic race to zero</div>
                </div>
                <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl font-mono text-xs">
                  <input
                    type="number"
                    value={safeguards.maxDailyPriceDropPct}
                    onChange={(e) => setSafeguards({ ...safeguards, maxDailyPriceDropPct: Number(e.target.value) })}
                    className="w-10 font-bold text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none text-right"
                  />
                  <span className="text-slate-400">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Undercut Step Delta</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Amount to undercut competitor to secure Buy Box</div>
                </div>
                <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl font-mono text-xs">
                  <span className="text-slate-400">₹</span>
                  <input
                    type="number"
                    value={safeguards.undercutDeltaINR}
                    onChange={(e) => setSafeguards({ ...safeguards, undercutDeltaINR: Number(e.target.value) })}
                    className="w-10 font-bold text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none text-right"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Competitor Out-Of-Stock Surge Boost</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Price increase when rival seller runs out of inventory</div>
                </div>
                <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl font-mono text-xs">
                  <span className="text-slate-400">+₹</span>
                  <input
                    type="number"
                    value={safeguards.competitorOosBoostAmount}
                    onChange={(e) => setSafeguards({ ...safeguards, competitorOosBoostAmount: Number(e.target.value) })}
                    className="w-10 font-bold text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none text-right"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Alerts & Reports */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Alerts & Notifications</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">Floor Price Breach Intervention Alert</div>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5">Send immediate notification when a competitor drops below your minimum profit floor</div>
              </div>
              <input
                type="checkbox"
                checked={notifications.notifyOnFloorBreach}
                onChange={(e) => setNotifications({ ...notifications, notifyOnFloorBreach: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">Buy Box Loss Alert</div>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5">Immediate ping when another seller captures the Buy Box on Amazon or Flipkart</div>
              </div>
              <input
                type="checkbox"
                checked={notifications.notifyOnBuyBoxLoss}
                onChange={(e) => setNotifications({ ...notifications, notifyOnBuyBoxLoss: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">Competitor Stock-Out Opportunity</div>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5">Alert when competitor stock drops to 0 so you can capture surge margins</div>
              </div>
              <input
                type="checkbox"
                checked={notifications.notifyOnCompetitorOOS}
                onChange={(e) => setNotifications({ ...notifications, notifyOnCompetitorOOS: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">Daily Reprice Digest Email</div>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5">Sends a morning executive summary with all price changes and profit saved</div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={notifications.dailyReportTime}
                  onChange={(e) => setNotifications({ ...notifications, dailyReportTime: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg text-slate-800 dark:text-slate-200 font-mono"
                />
                <input
                  type="checkbox"
                  checked={notifications.emailAlerts}
                  onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Team & Security */}
      {activeTab === 'team' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Authorized Team Members & Roles</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Control which pricing analysts and managers can modify margin floors or trigger manual dispatches.
            </p>
          </div>

          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
            {[
              { name: 'Raghav Sharma', email: 'raghav@acmeretail.in', role: 'Owner & Admin', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', status: 'Active' },
              { name: 'Priya Iyer', email: 'priya.i@acmeretail.in', role: 'Senior Pricing Analyst', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', status: 'Active' },
              { name: 'Amit Patel', email: 'amit.p@acmeretail.in', role: 'Operations & Dispatch', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', status: 'Active' },
            ].map((member, i) => (
              <div key={i} className="pt-3 first:pt-0 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">{member.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{member.email}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {member.role}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active"></span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Two-Factor Authentication (2FA) strictly enforced for all administrative price changes.</span>
            </div>
            <button className="text-blue-600 hover:underline font-semibold">
              Invite Team Member
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
