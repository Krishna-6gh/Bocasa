import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Lazy Gemini client helper
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "MarginGuard Repricer Engine",
      timestamp: new Date().toISOString(),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Layer 6: Decision Explanation API
  app.post("/api/decision-explain", async (req, res) => {
    const {
      productName = "Product",
      platform = "Amazon",
      competitorPrice,
      competitorName = "Competitor",
      floorPrice,
      recommendedPrice,
      decisionAction, // 'HOLD_AT_FLOOR' | 'MATCH' | 'UNDERCUT' | 'DEMAND_SURGE_BOOST' | 'COMPETITOR_OOS_BOOST'
      demandScore = 50,
      competitorInStock = true,
      diffFromFloor = 0,
    } = req.body;

    // Rich contextual deterministic explanation helper
    const buildDeterministicExplanation = () => {
      if (decisionAction === "HOLD_AT_FLOOR") {
        return `${competitorName} dropped to ₹${competitorPrice} (₹${Math.abs(diffFromFloor)} below your ${platform} floor of ₹${floorPrice}); holding price at ₹${floorPrice} to protect profit margin.`;
      } else if (decisionAction === "COMPETITOR_OOS_BOOST") {
        return `${competitorName} is out of stock; capturing excess demand by bumping price to ₹${recommendedPrice} without losing buybox momentum.`;
      } else if (decisionAction === "DEMAND_SURGE_BOOST") {
        return `High festive demand index (${demandScore}/100) allows bumping price to ₹${recommendedPrice}, preserving ₹${Math.abs(diffFromFloor)} extra profit above floor.`;
      } else if (decisionAction === "UNDERCUT") {
        return `Matching ${competitorName}'s price with a ₹1 undercut to ₹${recommendedPrice} on ${platform} while remaining ₹${diffFromFloor} safely above your floor.`;
      } else {
        return `Competitor is priced safely at ₹${competitorPrice}; matching price at ₹${recommendedPrice} to secure buybox priority.`;
      }
    };

    try {
      const client = getGeminiClient();

      if (client) {
        const prompt = `
System: You are the Decision Explanation Engine for MarginGuard, an Indian e-commerce repricer. Your job is to output exactly ONE clear sentence (max 28 words) explaining the deterministic pricing decision to a non-technical seller so they trust the algorithm.
Context:
- Product: ${productName}
- Platform: ${platform}
- Competitor: ${competitorName}
- Competitor Price: ₹${competitorPrice} (In-Stock: ${competitorInStock ? "Yes" : "Out of Stock"})
- Seller Floor Price: ₹${floorPrice} (Absolute bottom limit)
- Recommended Price: ₹${recommendedPrice}
- Action: ${decisionAction}
- Demand Score: ${demandScore}/100
- Floor Diff: ₹${Math.abs(diffFromFloor)} ${diffFromFloor < 0 ? "below floor" : "above floor"}

Rules:
- Exactly 1 sentence.
- Maximum 28 words.
- Specific to numbers (e.g. ₹${floorPrice}, ₹${competitorPrice}).
- Explain the reason: e.g. holding because competitor dropped below floor, or matching, or raising because competitor is out of stock.
`;

        // Try primary model (gemini-3.8-flash) first; if 503/high-demand or transient, fallback to gemini-3.1-flash-lite
        const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];
        for (const model of candidateModels) {
          try {
            const response = await client.models.generateContent({
              model,
              contents: prompt,
            });

            const explanation = response.text?.trim() || "";
            if (explanation) {
              return res.json({
                explanation,
                source: model,
              });
            }
          } catch (modelErr: any) {
            // Gracefully handle model capacity/503 spikes or rate limits without throwing fatal exceptions
            const errStatus = modelErr?.status || modelErr?.error?.status || modelErr?.statusText || "transient";
            console.warn(`[MarginGuard AI] Model ${model} unavailable (${errStatus}). Trying fallback.`);
          }
        }
      }

      // Safe fallback to deterministic rule engine when Gemini is busy or unconfigured
      return res.json({
        explanation: buildDeterministicExplanation(),
        source: "deterministic_rules",
      });
    } catch (err: any) {
      console.warn("[MarginGuard] Graceful fallback to deterministic explanation:", err?.message || err);
      return res.json({
        explanation: buildDeterministicExplanation(),
        source: "deterministic_rules",
      });
    }
  });

  // Layer 1: Simulated Scraping Actor Endpoint (EcomData Pro API contract)
  app.post("/api/collector/scrape", (req, res) => {
    const { url, platform } = req.body;
    // Simulates structured JSON returned by Scraping-as-a-service actor
    const mockCompetitor = {
      sourceUrl: url || "https://amazon.in/dp/B09XTEST",
      marketplace: platform || "Amazon",
      scrapedAt: new Date().toISOString(),
      responseTimeMs: 342,
      proxyCountry: "IN",
      data: {
        price: Math.floor(750 + Math.random() * 400),
        mrp: 1499,
        currency: "INR",
        inStock: Math.random() > 0.15,
        sellerName: "RetailDirect Tech India",
        sellerRating: 4.3,
        buyboxWinner: true,
        fulfillmentType: platform === "Amazon" ? "FBA" : platform === "Flipkart" ? "F-Assured" : "Standard",
        deliveryDays: 2,
      },
      actorTelemetry: {
        actorId: "ecomdata/multi-marketplace-pricing:v2.4",
        residentialProxyUsed: true,
        antiCaptchaSolved: false,
        domSelectorStrategy: "json_ld_primary_with_fallback",
      },
    };

    res.json(mockCompetitor);
  });

  // MarginGuard AI Repricing & Marketplace Copilot Chatbot Endpoint
  app.post("/api/chat", async (req, res) => {
    const { messages = [], currentProduct, activePlatform = "amazon" } = req.body;

    const userMessage = messages[messages.length - 1]?.content || "";
    const lowerQuery = userMessage.toLowerCase();

    // Context summary helper
    const productContextText = currentProduct
      ? `Active Product Context:
- SKU: ${currentProduct.sku} (${currentProduct.title})
- Category: ${currentProduct.category}
- Landed Cost: ₹${currentProduct.landedCost}
- Minimum Desired Margin: ₹${currentProduct.minMargin}
- Target Margin: ₹${currentProduct.targetMargin}
- Selling Prices: Amazon ₹${currentProduct.currentSellingPrices?.amazon || 'N/A'}, Flipkart ₹${currentProduct.currentSellingPrices?.flipkart || 'N/A'}, Meesho ₹${currentProduct.currentSellingPrices?.meesho || 'N/A'}
- Lowest Safe Floor: ₹${currentProduct.lowestPrice || 364}`
      : "Active Product Context: Cotton Printed Kurti (Landed Cost: ₹260, Target Floor: ₹364)";

    // Rich deterministic response engine for guaranteed instant responses
    const generateDeterministicChatResponse = () => {
      if (lowerQuery.includes("undercut") || lowerQuery.includes("sneha") || lowerQuery.includes("race to the bottom")) {
        return `### 🛡️ Defending Against Predatory Undercutters

When a competitor (like **Sneha Fashion** on Meesho at ₹379) drops their selling price below your break-even cost floor:

1. **Never Race into Negative Margins**: A naive repricer that auto-matches ₹379 would lose **₹19 to ₹35 per unit** after accounting for logistics and return allowances.
2. **Hold at Break-Even Floor**: MarginGuard strictly clamps your price at the calculated floor (e.g. ₹364) to ensure you never fulfill un-profitable orders.
3. **Exploit Competitor Inventory Exhaustion**: Predatory undercutters operating below cost typically have small batches (20–50 units). Once their inventory liquidates, you immediately regain the Buy Box at profitable prices (₹449–₹519).
4. **Leverage Non-Price Buy Box Factors**: High seller ratings (4.3+), fast dispatch (same-day dispatch / EasyShip Prime), and lower return rates give you Buy Box share even when priced ₹15–₹25 higher.`;
      }

      if (lowerQuery.includes("floor") || lowerQuery.includes("formula") || lowerQuery.includes("calculate") || lowerQuery.includes("break-even")) {
        return `### 📐 MarginGuard Break-Even Floor Formula

To guarantee you never lose money after all marketplace deductions and GST, we calculate the floor using this reverse-gross margin equation:

$$\\text{Selling Floor} = \\frac{\\text{Landed Cost} + \\text{Shipping} + \\text{Closing Fee} + \\text{Pick/Pack} + \\text{Min Margin}}{1 - (\\text{Referral Fee \\%} \\times 1.18)}$$

#### Practical Example (Cotton Kurti on Flipkart):
- **Landed Cost**: ₹260.00
- **Logistics (National 500g)**: ₹52.00
- **Flipkart Closing Fee**: ₹25.00
- **Minimum Safe Margin Buffer**: ₹90.00
- **Referral Commission**: 8.5% (+18% GST = 10.03% effective)
- **Calculated Floor**: **₹474.60** (Retail Floor: ₹475)

Any price below ₹475 will actively eat into your working capital!`;
      }

      if (lowerQuery.includes("fee") || lowerQuery.includes("commission") || lowerQuery.includes("meesho vs") || lowerQuery.includes("compare")) {
        return `### ⚖️ Marketplace Fee Comparison: Amazon vs Flipkart vs Meesho

| Marketplace | Referral Fee | Closing Fee | Shipping / Logistics | 18% GST Impact |
| :--- | :--- | :--- | :--- | :--- |
| **Amazon IN** | 5% – 15% by category | ₹5 to ₹55 tiered | ₹38 to ₹75 (EasyShip / FBA) | 18% applied on all service fees |
| **Flipkart** | 6% – 16% by category | ₹7 to ₹40 tiered | ₹44 to ₹68 (F-Assured / Smart) | 18% applied on all service fees |
| **Meesho** | **0% Commission** | **₹0 Closing Fee** | Low-cost 3PL courier rates | Zero marketplace fee overhead |

💡 **Pro-Seller Tip**: Because Meesho charges 0% commission, your break-even floor on Meesho is often **₹60 to ₹120 lower** than on Amazon or Flipkart for the exact same SKU!`;
      }

      if (lowerQuery.includes("festive") || lowerQuery.includes("surge") || lowerQuery.includes("diwali") || lowerQuery.includes("big billion")) {
        return `### 🎆 Festive Demand & Surge Repricing Strategy

During mega-events like **Flipkart Big Billion Days** or **Amazon Great Indian Festival**:

- **Demand Index Multiplier (1.25x – 1.45x)**: Buyer purchase intent surges 3x–5x. When competitors suffer stockouts or dispatch delays, MarginGuard activates an automatic **₹25 to ₹75 surge boost**.
- **Protect Stock for Peak Days**: Don't dump your inventory on Day 1 at discounted prices. Stagger stock allocations.
- **Competitor Out-of-Stock Rule**: The moment your top rival runs out of inventory, immediately ratchet up your price to maximize gross margin while search velocity is at its peak.`;
      }

      return `### 🤖 MarginGuard Repricing Copilot

I am monitoring your marketplace SKU pricing across **Amazon**, **Flipkart**, and **Meesho**. 

Here is what I can assist you with:
- **Floor Verification**: Instant calculation of your true break-even floor including 18% GST on marketplace fees.
- **Predatory Undercutting Defense**: Why holding at floor beats suicidal price matching against flaky competitors.
- **Channel Arbitrage**: Pricing identically or strategically across Amazon (FBA) vs Meesho (0% commission).
- **Repricing Rule Configuration**: Setting velocity limits, maximum daily delta caps (e.g. 10%), and minimum profit guardrails.

Feel free to ask a specific question or ask: *"Calculate break-even for a product with landed cost of ₹300 on Amazon"*!`;
    };

    try {
      const client = getGeminiClient();

      if (client) {
        const systemInstruction = `
You are MarginGuard AI Copilot — an expert AI assistant specialized in Indian e-commerce seller profitability, dynamic repricing, fee calculation, and Buy Box optimization for Amazon India (amazon.in), Flipkart, and Meesho.

Seller & Catalog Context:
${productContextText}

Your Core Knowledge:
1. Marketplace fee structures: Referral fees, closing fees, weight handling/logistics fees (EasyShip, FBA, F-Assured), pick & pack fees, customer return/RTO costs, and mandatory 18% GST on all marketplace service charges.
2. Break-even cost floor mathematics: Selling Floor = (Landed Cost + Shipping + Closing + PickPack + Min Margin) / (1 - ReferralFee% * 1.18).
3. Tactical repricing rules: Never follow undercutters below your break-even floor; capture surges when competitors run out of stock; use 0% commission on Meesho to achieve higher net margins; apply daily max price change guardrails (e.g. 10%) to avoid marketplace algorithmic suppression.
4. Active catalog knowledge: Cotton Printed Kurti (APPAR-KURTI-COTTON-01), AuraPods Pro ANC (ELEC-TWS-AURAPOD-01), Pickleball Paddles Set (SPRT-PICKLE-SET-04).

Formatting:
- Always use Indian Rupee symbol (₹).
- Use clear markdown headers, bold highlights, bullet points, and brief tables where useful.
- Keep tone professional, authoritative, actionable, and focused on protecting seller profit margins.
`;

        // Map conversational messages for generateContent
        const formattedContents = messages.map((m: any) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        }));

        // Ensure there's at least the last user prompt if formatted contents is empty
        const contents = formattedContents.length > 0 
          ? formattedContents 
          : [{ role: "user", parts: [{ text: userMessage }] }];

        const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];
        for (const model of candidateModels) {
          try {
            const response = await client.models.generateContent({
              model,
              contents,
              config: {
                systemInstruction,
              },
            });

            const replyText = response.text?.trim();
            if (replyText) {
              return res.json({
                reply: replyText,
                source: model,
                timestamp: new Date().toISOString(),
              });
            }
          } catch (modelErr: any) {
            console.warn(`[MarginGuard Chat] Model ${model} failed, trying next.`, modelErr?.message || modelErr);
          }
        }
      }

      // Safe deterministic fallback
      return res.json({
        reply: generateDeterministicChatResponse(),
        source: "deterministic_copilot_engine",
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.warn("[MarginGuard Chat] Error, falling back to deterministic response:", err?.message || err);
      return res.json({
        reply: generateDeterministicChatResponse(),
        source: "deterministic_copilot_engine",
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MarginGuard Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
