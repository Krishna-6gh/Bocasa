# BOCASA - Pricing Intelligence & Margin Protection Platform

BOCASA is an AI-powered, autonomous repricing and margin protection platform designed for high-stakes online sellers operating across multiple marketplaces like Amazon, Flipkart, and Meesho.

It helps sellers monitor competitor prices, calculate true landed costs and profit floors (accounting for all platform fees, logistics, and taxes), and dynamically recommends or automates pricing decisions to protect margins.

## Key Features

- **Multi-Channel Sync**: Unified view of your product catalog across Amazon, Flipkart, and Meesho.
- **Margin Protection & Floor Pricing**: Calculates the exact minimum price (floor price) you can sell at without making a loss, taking into account category commissions, logistics fees, pick & pack fees, closing fees, and GST.
- **Competitor Intelligence**: Tracks competitor prices and stock status, classifying competitor behavior (e.g., undercutter, aggressive).
- **AI-Powered Repricing**: Recommends strategic pricing actions (Hold at Floor, Match, Undercut) based on competitor behavior and demand signals.
- **Auto-Repricing Guardrails**: Configurable settings to enable automated repricing within safe daily limits and absolute minimum profit margins.
- **Premium SaaS Dashboard**: A highly polished, "investor-ready" interface built for clarity, control, and strategic decision-making.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
1. Clone the repository or navigate to the project directory:
   ```bash
   cd bocasa-main
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application
To run the local development server:
```bash
npm run dev
```
The application will start, typically on `http://localhost:5173`.

## How to Use the Dashboard (Flow of Working)

### 1. The Overview (KPIs)
Upon logging in, you'll see the top-level metric cards:
- **Active SKUs**: The number of products currently being tracked.
- **Protected Revenue**: The total revenue operating safely above your set margin floors.
- **Floor Breaches**: Urgent alerts for SKUs that are currently priced below your safe profit floor.
- **Competitor Out-Of-Stock (OOS)**: Opportunities where competitors have stocked out, allowing you to safely raise prices and maximize profit.

### 2. Managing Your Catalog
The **Product Intelligence** section lists your active SKUs.
- **Add Product**: Use the "+ Add Product" button to manually track a new SKU. You will enter the SKU name, Category, Landed Cost, and Minimum desired profit.
- **View Insights**: Each row displays:
  - **Marketplaces**: Which platforms the product is live on.
  - **Floor Price**: The system-calculated minimum safe price.
  - **Current Price**: Your active price on the marketplace.
  - **Competitor Price**: The lowest competitor's price.
  - **Margin Health**: Visual indicators (Emerald for healthy, Rose for danger) showing your margin status.

### 3. Setting Up Auto-Repricing
Navigate to the **Auto-Pricing** settings (if active) to set global rules:
- **Frequency**: How often the system checks competitor prices.
- **Guardrails**: Set absolute minimum profits and maximum daily price change percentages to ensure the AI never reprices you into a loss.

### 4. Taking Action
For each product, BOCASA provides an AI recommendation:
- **Hold at Floor**: If the competitor price drops below your safe floor, the system will advise you to hold your price to avoid losing money.
- **Match/Undercut**: If there is healthy margin space, the system may suggest matching or slightly undercutting to win the Buy Box.

## Built With
- React (Vite)
- TypeScript
- Tailwind CSS (with custom semantic CSS variables for themeing)
- Lucide React (Icons)
