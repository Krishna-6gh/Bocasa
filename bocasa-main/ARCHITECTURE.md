# BOCASA Architecture & Data Flow

This document outlines the technical architecture, component structure, and state management flow of the BOCASA application.

## High-Level Architecture

BOCASA is built as a Single Page Application (SPA) using **React**, **TypeScript**, and **Vite**. It relies heavily on a top-down state management approach where the root component acts as the central source of truth.

### Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS Variables (for semantic theming and glassmorphism effects)
- **Icons**: `lucide-react`
- **Charts**: `recharts` (for price history visualizations)

## State Management & Data Flow

State is primarily managed in the `App.tsx` component to allow sharing data across different views (Dashboard, Settings, Repricing Logs).

### Central State (`App.tsx`)
1.  **`products` (Product Catalog)**: The core array of `ProductSKU` objects. It holds all data for a seller's SKUs, including landed costs, current prices, and competitor data.
2.  **`feeMatrix` (Platform Fees)**: Configuration array defining commission rates, logistics fees, closing fees, and GST slabs for different categories across Amazon, Flipkart, and Meesho.
3.  **`autoSettings` (Guardrails)**: Configuration object for the automated repricing engine, dictating run frequency and safety margins.
4.  **`currentUser`**: Stores session information (e.g., name, role) for UI personalization (like the "Welcome back" header).

### Flow of Data
- **Top-Down Propagation**: `App.tsx` passes the state (e.g., `products`, `feeMatrix`) down to child views (e.g., `SellerDashboardView.tsx`) via props.
- **Bottom-Up Actions**: When a user interacts with the UI (e.g., clicks "Add Product" or "Update Margin"), the child component invokes a callback function passed down from `App.tsx` (e.g., `handleAddProduct`). `App.tsx` then updates the central state, which triggers a re-render of the application with the new data.

## Core Domain Logic (Floor Price Calculation)

The most critical calculation in the app is the **Floor Price**, ensuring sellers never operate at a loss.

This calculation happens locally in the view components (like `SellerDashboardView`) or in utility functions, utilizing the `feeMatrix`.

**Algorithm Flow:**
1.  **Input**: Landed Cost (manufacturing/procurement) + Minimum Margin.
2.  **Lookup**: Retrieve marketplace-specific fees from `feeMatrix` based on the product's category.
3.  **Calculation**:
    - Add Fixed Fees: Logistics, Closing, Pick & Pack.
    - Calculate Variable Fees: Commission % applied to the final price.
    - Calculate Taxes: GST applied to all marketplace fees.
4.  **Output**: The absolute minimum selling price required to break even while achieving the requested Minimum Margin.

## Component Tree Structure

```text
src/
├── App.tsx                    # Root Component & State Container
├── main.tsx                   # Entry Point
├── index.css                  # Global Styles & Theme Variables
├── types.ts                   # Global TypeScript Interfaces
├── data/
│   ├── defaultProducts.ts     # Initial demo catalog
│   └── defaultFeeMatrix.ts    # Base marketplace fee structures
├── components/
│   ├── OrchestrateHeader.tsx  # Top navigation & user profile
│   ├── LoginPage.tsx          # Authentication view
│   ├── SellerDashboardView.tsx# Main Workspace (KPIs, Product List)
│   │   ├── MetricCards        # Summary statistics (Revenue, Breaches)
│   │   ├── ProductRow         # Individual SKU data & actions
│   │   └── AddProductModal    # UI for manual SKU entry
│   ├── ... (Other views like FeeMatrixSettings, RepriceLogs)
```

## Styling & Theming System

The UI relies on a robust design system defined in `index.css` using CSS custom properties (`:root`).
- **Semantic Colors**: Variables like `--ink-900`, `--slate-500`, `--danger`, and `--emerald-500` abstract the hex codes, allowing for a cohesive look and easy Dark Mode implementation.
- **Glassmorphism**: Extensive use of `backdrop-blur`, semi-transparent backgrounds (`rgba(..., 0.05)`), and fine borders (`border-white/10`) to achieve a premium, modern SaaS aesthetic.
- **Typography**: Employs `Inter` and `Space Grotesk` fonts with heavy weights (`font-black`, `font-extrabold`) for strong information hierarchy and readability.

## Future Extensibility
- **Backend Integration**: The current state is local. To make it production-ready, `App.tsx` state handlers would be replaced with API calls (e.g., using `fetch` or `axios` with React Query) to a Node.js/Python backend.
- **Real-time Sync**: WebSockets could be introduced to push live competitor price updates directly to the `products` state.
