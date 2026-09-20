import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { AppSidebar } from './components/AppSidebar';
import { OrchestrateHeader } from './components/OrchestrateHeader';
import { TracesHandoffView } from './components/TracesHandoffView';
import { SellerDashboardView } from './components/SellerDashboardView';
import { FeeManagementView } from './components/FeeManagementView';
import { AutoPricingView } from './components/AutoPricingView';
import { ArchitectureTopology } from './components/ArchitectureTopology';
import { CollectorView } from './components/CollectorView';
import { PriceCompareView } from './components/PriceCompareView';
import { CostFloorEngineView } from './components/CostFloorEngineView';
import { DecisionEngineView } from './components/DecisionEngineView';
import { DistributionRailsView } from './components/DistributionRailsView';
import { DemandIntelligenceView } from './components/DemandIntelligenceView';
import { TechStackRoadmapView } from './components/TechStackRoadmapView';
import { SettingsView } from './components/SettingsView';
import { ChatbotView } from './components/ChatbotView';
import { FloatingChatbot } from './components/FloatingChatbot';
import { SAMPLE_PRODUCTS } from './data/sampleProducts';
import { INITIAL_FEE_MATRIX, calculatePlatformFloor } from './data/defaultFeeMatrix';
import { INITIAL_REPRICE_LOGS } from './data/sampleRepriceLogs';
import { 
  ProductSKU, 
  FeeMatrixItem, 
  SystemTab, 
  PlatformId, 
  AutoRepricingSettings, 
  RepriceLogItem 
} from './types';

export default function App() {
  // User Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('bocasa_auth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<{ email: string; storeName?: string; isDemo?: boolean; name?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('bocasa_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.name) parsed.name = 'Arjun';
        return parsed;
      }
      return { email: 'arjun@bocasa.in', storeName: 'Arjun Retail Brands Pvt Ltd', isDemo: true, name: 'Arjun' };
    } catch {
      return { email: 'arjun@bocasa.in', storeName: 'Arjun Retail Brands Pvt Ltd', isDemo: true, name: 'Arjun' };
    }
  });

  // Default to 'seller_dashboard' or 'price_compare'
  const [activeTab, setActiveTab] = useState<SystemTab>('seller_dashboard');
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);
  const [products, setProducts] = useState<ProductSKU[]>(SAMPLE_PRODUCTS);
  const [selectedProductId, setSelectedProductId] = useState<string>(SAMPLE_PRODUCTS[0].id);
  const [feeMatrix, setFeeMatrix] = useState<FeeMatrixItem[]>(INITIAL_FEE_MATRIX);
  const [geminiActive, setGeminiActive] = useState<boolean>(true);

  // Automated Pricing Settings & Logs State
  const [autoSettings, setAutoSettings] = useState<AutoRepricingSettings>({
    enabled: true,
    frequencyMinutes: 60,
    maxDailyPriceChangePct: 10,
    minProfitMarginINR: 120,
    platformsEnabled: {
      amazon: true,
      flipkart: true,
      meesho: false,
    },
    dryRunMode: false,
    lastRunTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    totalRepriceCount: 14,
  });

  const [repriceLogs, setRepriceLogs] = useState<RepriceLogItem[]>(INITIAL_REPRICE_LOGS);

  // Check health on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.geminiConfigured === 'boolean') {
          setGeminiActive(data.geminiConfigured);
        }
      })
      .catch((err) => console.log('Health check note:', err));
  }, []);

  const activeProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Callback to update competitor price from live scraper
  const handleUpdateCompetitorPrice = (platform: PlatformId, newPrice: number, inStock: boolean) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === selectedProductId) {
          return {
            ...p,
            competitors: {
              ...p.competitors,
              [platform]: {
                ...p.competitors[platform],
                currentPrice: newPrice,
                inStock: inStock,
                lastScraped: 'Just now',
              },
            },
          };
        }
        return p;
      })
    );
  };

  // Callback to update minimum margin on a product
  const handleUpdateMinMargin = (productId: string, newMinMargin: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            minMargin: newMinMargin,
          };
        }
        return p;
      })
    );
  };

  // Callback to update landed cost & min margin
  const handleUpdateProductCosts = (productId: string, landedCost: number, minMargin: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            landedCost,
            minMargin,
          };
        }
        return p;
      })
    );
  };

  // Callback to add a new product manually to catalog
  const handleAddProduct = (newProduct: ProductSKU) => {
    setProducts((prev) => [newProduct, ...prev]);
    setSelectedProductId(newProduct.id);
  };

  // Callback to manually update a product's price on a specific platform
  const handleApplyPriceUpdate = (productId: string, platform: PlatformId, newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            currentSellingPrices: {
              ...p.currentSellingPrices,
              [platform]: newPrice,
            },
          };
        }
        return p;
      })
    );
  };

  // Automated Repricing Execution Engine Cycle
  const handleTriggerRepriceRun = () => {
    const newLogs: RepriceLogItem[] = [];
    const timestampStr = `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;

    let updatedProducts = [...products];

    products.forEach((prod) => {
      (['amazon', 'flipkart'] as const).forEach((plat) => {
        if (!autoSettings.platformsEnabled[plat]) return;

        const currentSelling = prod.currentSellingPrices[plat];
        const competitor = prod.competitors[plat];
        if (!competitor) return;

        const feeItem = feeMatrix.find((f) => f.platform === plat && f.category === prod.category) || feeMatrix[0];
        const effectiveMinMargin = Math.max(prod.minMargin, autoSettings.minProfitMarginINR);
        const floorPrice = calculatePlatformFloor(prod.landedCost, effectiveMinMargin, feeItem).floorPrice;

        let proposedPrice = currentSelling;
        let action: any = 'MATCH';
        let explanation = '';
        let status: 'SUCCESS' | 'GUARDRAIL_BLOCKED' = 'SUCCESS';
        let guardrailNote = undefined;

        if (!competitor.inStock) {
          proposedPrice = Math.min(prod.mrp, currentSelling + 40);
          action = 'COMPETITOR_OOS_BOOST';
          explanation = `${competitor.competitorName} is Out of Stock on ${plat}; algorithm bumped price to capture extra margin without losing buybox momentum.`;
        } else if (competitor.currentPrice < floorPrice) {
          proposedPrice = floorPrice;
          action = 'HOLD_AT_FLOOR';
          explanation = `Competitor dropped to ₹${competitor.currentPrice}, which is below your calculated safe floor of ₹${floorPrice}; holding at floor to protect profit.`;
          status = 'GUARDRAIL_BLOCKED';
          guardrailNote = `Intervention: Refused to drop below ₹${floorPrice} floor.`;
        } else {
          proposedPrice = Math.max(floorPrice, competitor.currentPrice - 1);
          action = 'UNDERCUT';
          explanation = `Undercut ${competitor.competitorName} (₹${competitor.currentPrice}) by ₹1 to ₹${proposedPrice} on ${plat}, safely ₹${proposedPrice - floorPrice} above floor.`;
        }

        const priceDelta = Math.abs(proposedPrice - currentSelling);
        const deltaPct = Math.round(((proposedPrice - currentSelling) / currentSelling) * 1000) / 10;
        const maxAllowedDelta = (autoSettings.maxDailyPriceChangePct / 100) * currentSelling;

        if (priceDelta > maxAllowedDelta) {
          const cappedPrice = proposedPrice > currentSelling
            ? Math.round(currentSelling + maxAllowedDelta)
            : Math.round(currentSelling - maxAllowedDelta);
          
          guardrailNote = `Guardrail Clamped: Proposed price change of ${deltaPct}% exceeded daily limit of ±${autoSettings.maxDailyPriceChangePct}%. Clamped to ₹${cappedPrice}.`;
          proposedPrice = cappedPrice;
          status = 'GUARDRAIL_BLOCKED';
        }

        if (proposedPrice !== currentSelling) {
          updatedProducts = updatedProducts.map((p) => {
            if (p.id === prod.id) {
              return {
                ...p,
                currentSellingPrices: {
                  ...p.currentSellingPrices,
                  [plat]: proposedPrice,
                },
              };
            }
            return p;
          });
        }

        newLogs.unshift({
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: timestampStr,
          productId: prod.id,
          productSku: prod.sku,
          productTitle: prod.title,
          platform: plat,
          oldPrice: currentSelling,
          newPrice: proposedPrice,
          changePct: Math.round(((proposedPrice - currentSelling) / currentSelling) * 1000) / 10,
          floorPrice,
          competitorPrice: competitor.currentPrice,
          decisionAction: action,
          explanation,
          status,
          guardrailNote,
        });
      });
    });

    setProducts(updatedProducts);
    setRepriceLogs((prev) => [...newLogs, ...prev].slice(0, 30));
    setAutoSettings((prev) => ({
      ...prev,
      lastRunTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      totalRepriceCount: prev.totalRepriceCount + newLogs.filter((l) => l.status === 'SUCCESS').length,
    }));
  };

  // If not authenticated, render the dedicated BOCASA Login & Store Creation Screen
  if (!isAuthenticated) {
    return (
      <LoginPage
        isDarkTheme={isDarkTheme}
        onLoginSuccess={(userData) => {
          setIsAuthenticated(true);
          if (userData) {
            setCurrentUser(userData);
            localStorage.setItem('bocasa_user', JSON.stringify(userData));
          }
          localStorage.setItem('bocasa_auth', 'true');
          setActiveTab('seller_dashboard');
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen flex ${isDarkTheme ? 'dark bg-slate-950 text-slate-100' : 'bg-[#f8fafc] text-slate-800'}`}>
      {/* Sleek Icon Rail Sidebar matching user's design */}
      <AppSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkTheme={isDarkTheme}
        setIsDarkTheme={setIsDarkTheme}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* OrchestrateIQ Top Header */}
        <OrchestrateHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          products={products}
          selectedProductId={selectedProductId}
          setSelectedProductId={setSelectedProductId}
          geminiActive={geminiActive}
          isDarkTheme={isDarkTheme}
          setIsDarkTheme={setIsDarkTheme}
          currentUser={currentUser}
          onSignOut={() => {
            setIsAuthenticated(false);
            setCurrentUser(null);
            localStorage.removeItem('bocasa_auth');
            localStorage.removeItem('bocasa_user');
          }}
        />

        {/* Content Body Canvas */}
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* New Price Compare & Reprice Decision Hub */}
          {activeTab === 'price_compare' && (
            <PriceCompareView
              product={activeProduct}
              products={products}
              onSelectProduct={(id) => setSelectedProductId(id)}
              feeMatrix={feeMatrix}
              onExecuteReprice={(platform, newPrice) => {
                handleApplyPriceUpdate(activeProduct.id, platform, newPrice);
              }}
              onNavigateTab={(tab) => setActiveTab(tab as SystemTab)}
            />
          )}

          {/* Main Visual Handoff Inspector matching user screenshot */}
          {activeTab === 'traces_handoff' && (
            <TracesHandoffView
              product={activeProduct}
              feeMatrix={feeMatrix}
              geminiActive={geminiActive}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'seller_dashboard' && (
            <SellerDashboardView
              products={products}
              feeMatrix={feeMatrix}
              onUpdateMinMargin={handleUpdateMinMargin}
              onUpdateLandedCost={(id, cost) => handleUpdateProductCosts(id, cost, activeProduct.minMargin)}
              onSelectProduct={(id) => setSelectedProductId(id)}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onAddProduct={handleAddProduct}
            />
          )}

          {activeTab === 'fee_management' && (
            <FeeManagementView
              feeMatrix={feeMatrix}
              onUpdateFeeMatrix={setFeeMatrix}
              onResetFeeMatrix={() => setFeeMatrix(INITIAL_FEE_MATRIX)}
            />
          )}

          {activeTab === 'auto_pricing' && (
            <AutoPricingView
              products={products}
              feeMatrix={feeMatrix}
              settings={autoSettings}
              logs={repriceLogs}
              onUpdateSettings={setAutoSettings}
              onTriggerRepriceRun={handleTriggerRepriceRun}
              onApplyPriceUpdateToCatalog={handleApplyPriceUpdate}
            />
          )}

          {activeTab === 'ai_chat' && (
            <ChatbotView
              products={products}
              selectedProduct={activeProduct}
              onSelectProduct={(id) => setSelectedProductId(id)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'decision' && (
            <DecisionEngineView
              product={activeProduct}
              feeMatrix={feeMatrix}
              geminiActive={geminiActive}
            />
          )}

          {activeTab === 'cost_floor' && (
            <CostFloorEngineView
              product={activeProduct}
              feeMatrix={feeMatrix}
              onUpdateFeeMatrix={setFeeMatrix}
              onUpdateProductCosts={handleUpdateProductCosts}
            />
          )}

          {activeTab === 'collector' && (
            <CollectorView
              product={activeProduct}
              onUpdateCompetitorPrice={handleUpdateCompetitorPrice}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
            />
          )}

          {activeTab === 'distribution' && (
            <DistributionRailsView product={activeProduct} />
          )}

          {activeTab === 'demand' && (
            <DemandIntelligenceView product={activeProduct} />
          )}

          {activeTab === 'architecture' && (
            <ArchitectureTopology onSelectLayer={(tab) => setActiveTab(tab)} />
          )}

          {(activeTab === 'tech_stack' || activeTab === 'roadmap') && (
            <TechStackRoadmapView />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Persistent Global Floating AI Copilot Drawer */}
      <FloatingChatbot
        products={products}
        selectedProduct={activeProduct}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}
