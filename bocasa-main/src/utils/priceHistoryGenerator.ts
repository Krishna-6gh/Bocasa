import { ProductSKU, HistoricalPricePoint, CompetitorTracked } from '../types';

export function getCompetitorsForProduct(product: ProductSKU): CompetitorTracked[] {
  if (product.competitorsList && product.competitorsList.length > 0) {
    return product.competitorsList;
  }

  // If Cotton Printed Kurti
  if (product.id === 'sku-kurti-02' || product.title.toLowerCase().includes('kurti')) {
    return [
      {
        name: 'Sneha Fashion',
        behaviour: 'undercutter',
        price: 379,
        stockStatus: 'in_stock',
        platform: 'meesho',
        color: '#f59e0b',
        url: 'https://www.meesho.com/search?q=cotton+printed+kurti',
      },
      {
        name: 'Jaipur Kurti House',
        behaviour: 'flaky',
        price: 409,
        stockStatus: 'in_stock',
        platform: 'meesho',
        color: '#8b5cf6',
        url: 'https://www.meesho.com/search?q=jaipur+kurti+cotton',
      },
      {
        name: 'TrendyWear',
        behaviour: 'festival',
        price: 469,
        stockStatus: 'in_stock',
        platform: 'meesho',
        color: '#0ea5e9',
        url: 'https://www.meesho.com/search?q=trendywear+anarkali+kurti',
      },
    ];
  }

  // Pickleball paddle set
  if (product.id === 'sku-pickle-01' || product.category === 'sports') {
    return [
      {
        name: 'RetailNet Tech Store',
        behaviour: 'undercutter',
        price: 1285,
        stockStatus: 'in_stock',
        platform: 'flipkart',
        color: '#f59e0b',
        url: 'https://www.flipkart.com/search?q=pickleball+paddle+set',
      },
      {
        name: 'Xtrieve USAPA Pro',
        behaviour: 'stable',
        price: 2469,
        stockStatus: 'in_stock',
        platform: 'amazon',
        color: '#8b5cf6',
        url: 'https://www.amazon.in/s?k=pickleball+paddle+set+with+bag',
      },
      {
        name: 'SportsPlanet Direct',
        behaviour: 'festival',
        price: 1899,
        stockStatus: 'in_stock',
        platform: 'flipkart',
        color: '#0ea5e9',
        url: 'https://www.flipkart.com/search?q=carbon+pickleball+paddle',
      },
    ];
  }

  // Audio / Electronics
  if (product.category === 'electronics') {
    return [
      {
        name: 'Boat / Truke Direct',
        behaviour: 'undercutter',
        price: 820,
        stockStatus: 'in_stock',
        platform: 'flipkart',
        color: '#f59e0b',
        url: 'https://www.flipkart.com/search?q=true+wireless+earbuds',
      },
      {
        name: 'Noise Official Mall',
        behaviour: 'flaky',
        price: 849,
        stockStatus: 'in_stock',
        platform: 'amazon',
        color: '#8b5cf6',
        url: 'https://www.amazon.in/s?k=noise+wireless+earbuds',
      },
      {
        name: 'Shree Balaji Traders',
        behaviour: 'aggressive',
        price: 710,
        stockStatus: 'out_of_stock',
        platform: 'meesho',
        color: '#0ea5e9',
        url: 'https://www.meesho.com/search?q=wireless+earbuds',
      },
    ];
  }

  // Default fallback
  const comp1 = product.competitors.flipkart || product.competitors.amazon;
  const comp2 = product.competitors.amazon || product.competitors.meesho;
  const comp3 = product.competitors.meesho || product.competitors.amazon;

  return [
    {
      name: comp1?.competitorName || 'Top Rival Direct',
      behaviour: 'undercutter',
      price: comp1?.currentPrice || Math.round(product.currentSellingPrices.amazon * 0.9),
      stockStatus: comp1?.inStock ? 'in_stock' : 'out_of_stock',
      platform: comp1?.platform || 'flipkart',
      color: '#f59e0b',
      url: comp1?.url || `https://www.flipkart.com/search?q=${encodeURIComponent(product.title.split('|')[0].trim())}`,
    },
    {
      name: comp2?.competitorName || 'Secondary Authorized Seller',
      behaviour: 'flaky',
      price: comp2?.currentPrice || Math.round(product.currentSellingPrices.amazon * 0.95),
      stockStatus: comp2?.inStock ? 'in_stock' : 'out_of_stock',
      platform: comp2?.platform || 'amazon',
      color: '#8b5cf6',
      url: comp2?.url || `https://www.amazon.in/s?k=${encodeURIComponent(product.title.split('|')[0].trim())}`,
    },
    {
      name: comp3?.competitorName || 'Marketplace Express Hub',
      behaviour: 'festival',
      price: comp3?.currentPrice || Math.round(product.currentSellingPrices.amazon * 1.05),
      stockStatus: comp3?.inStock ? 'in_stock' : 'out_of_stock',
      platform: comp3?.platform || 'meesho',
      color: '#0ea5e9',
      url: comp3?.url || `https://www.meesho.com/search?q=${encodeURIComponent(product.title.split('|')[0].trim())}`,
    },
  ];
}

/**
 * Generates 30 days of daily historical points, with realistic variations and undercutting events.
 */
export function generate30DayPriceHistory(
  product: ProductSKU,
  floorPrice: number,
  platform: 'meesho' | 'flipkart' | 'amazon' = 'meesho'
): HistoricalPricePoint[] {
  // If product is Cotton Kurti and platform is meesho, replicate the exact curve from the reference screenshot
  const isKurti = product.id === 'sku-kurti-02' || product.title.toLowerCase().includes('kurti');

  const history: HistoricalPricePoint[] = [];
  const totalDays = 30;
  
  // Base numbers
  let baseYourPrice = isKurti ? 400 : (product.currentSellingPrices[platform] || 2399);
  const trueFloor = isKurti ? 418 : Math.max(floorPrice, Math.round(baseYourPrice * 0.72));
  
  // Starting prices for competitors
  let comp1Start = isKurti ? 432 : Math.round(baseYourPrice * 1.02);
  const comp2Start = isKurti ? 405 : Math.round(baseYourPrice * 0.95);
  const comp3Start = isKurti ? 469 : Math.round(baseYourPrice * 1.08);

  const comp1Final = isKurti ? 379 : (product.competitors[platform]?.currentPrice || Math.round(baseYourPrice * 0.65));
  const comp2Final = isKurti ? 409 : Math.round(baseYourPrice * 0.92);
  const comp3Final = isKurti ? 469 : Math.round(baseYourPrice * 1.05);

  // Today is Day 30
  // Drop event happens around day 26 (4 days ago)
  const dropDayIndex = 25;

  for (let i = 0; i < totalDays; i++) {
    const daysAgo = totalDays - 1 - i;
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - daysAgo);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const dateLabel = `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]}`;

    let comp1Price = comp1Start;
    let comp2Price = comp2Start;
    let comp3Price = comp3Start;
    let yourPrice = baseYourPrice;
    let naivePrice = baseYourPrice;

    if (i < dropDayIndex) {
      // Steady phase before aggressive undercut
      const subtleWiggle = (i % 3 === 0 ? 2 : (i % 3 === 1 ? -1 : 0));
      comp1Price = comp1Start + subtleWiggle;
      comp2Price = comp2Start + (i > 15 ? 4 : 0);
      comp3Price = comp3Start;
      yourPrice = baseYourPrice;
      naivePrice = baseYourPrice;
    } else {
      // Undercutting drop happens!
      // Competitor 1 crashes down
      const progress = (i - dropDayIndex) / (totalDays - dropDayIndex);
      comp1Price = Math.round(comp1Start - (comp1Start - comp1Final) * Math.min(1, progress * 1.5));
      comp2Price = comp2Final;
      comp3Price = comp3Final;

      // Naive auto-match repricer blindly drops below floor following comp1!
      naivePrice = comp1Price;

      // MarginGuard holds the line at protected price, never dropping below safe profitability!
      yourPrice = baseYourPrice;
    }

    history.push({
      date: dateLabel,
      fullDate: dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      yourPrice,
      naivePrice,
      floorPrice: trueFloor,
      competitor1Price: comp1Price,
      competitor2Price: comp2Price,
      competitor3Price: comp3Price,
    });
  }

  return history;
}

/**
 * Generates the 2.25-day zoomed (6-hour ticks) view shown in the user's screenshot
 */
export function generateZoomedTickHistory(
  product: ProductSKU,
  floorPrice: number,
  platform: 'meesho' | 'flipkart' | 'amazon' = 'meesho'
): HistoricalPricePoint[] {
  const isKurti = product.id === 'sku-kurti-02' || product.title.toLowerCase().includes('kurti');
  
  if (isKurti) {
    // Exact curve matching the reference screenshot:
    // 26 Sept (00:00, 06:00, 12:00, 18:00)
    // 27 Sept (00:00, 06:00, 12:00, 18:00) - drop occurs
    // 28 Sept (00:00, 06:00)
    return [
      {
        date: '26 Sept 00:00',
        timestamp: '26 Sept',
        yourPrice: 400,
        naivePrice: 400,
        floorPrice: 418,
        competitor1Price: 432,
        competitor2Price: 406,
        competitor3Price: 468,
      },
      {
        date: '26 Sept 06:00',
        timestamp: '26 Sept',
        yourPrice: 400,
        naivePrice: 400,
        floorPrice: 418,
        competitor1Price: 430,
        competitor2Price: 404,
        competitor3Price: 463,
      },
      {
        date: '26 Sept 12:00',
        timestamp: '26 Sept',
        yourPrice: 400,
        naivePrice: 400,
        floorPrice: 418,
        competitor1Price: 428,
        competitor2Price: 402,
        competitor3Price: 461,
      },
      {
        date: '26 Sept 18:00',
        timestamp: '26 Sept',
        yourPrice: 400,
        naivePrice: 400,
        floorPrice: 418,
        competitor1Price: 428,
        competitor2Price: 402,
        competitor3Price: 461,
      },
      {
        date: '27 Sept 00:00',
        timestamp: '27 Sept',
        yourPrice: 400,
        naivePrice: 400,
        floorPrice: 418,
        competitor1Price: 428,
        competitor2Price: 408,
        competitor3Price: 461,
      },
      {
        date: '27 Sept 06:00',
        timestamp: '27 Sept',
        yourPrice: 400,
        naivePrice: 400,
        floorPrice: 418,
        competitor1Price: 428,
        competitor2Price: 409,
        competitor3Price: 461,
      },
      {
        date: '27 Sept 12:00',
        timestamp: '27 Sept',
        yourPrice: 400,
        naivePrice: 395,
        floorPrice: 418,
        competitor1Price: 395,
        competitor2Price: 409,
        competitor3Price: 461,
      },
      {
        date: '27 Sept 18:00',
        timestamp: '27 Sept',
        yourPrice: 400,
        naivePrice: 379,
        floorPrice: 418,
        competitor1Price: 379,
        competitor2Price: 409,
        competitor3Price: 461,
      },
      {
        date: '28 Sept 00:00',
        timestamp: '28 Sept',
        yourPrice: 400,
        naivePrice: 379,
        floorPrice: 418,
        competitor1Price: 379,
        competitor2Price: 409,
        competitor3Price: 461,
      },
      {
        date: '28 Sept 06:00',
        timestamp: '28 Sept',
        yourPrice: 400,
        naivePrice: 379,
        floorPrice: 418,
        competitor1Price: 379,
        competitor2Price: 409,
        competitor3Price: 461,
      },
    ];
  }

  // Scaled version for other products
  const basePrice = product.currentSellingPrices[platform] || 2399;
  const compPrice = product.competitors[platform]?.currentPrice || Math.round(basePrice * 0.7);
  const floor = Math.max(floorPrice, Math.round(basePrice * 0.75));

  return [
    {
      date: '26 Sept 00:00',
      timestamp: '26 Sept',
      yourPrice: basePrice,
      naivePrice: basePrice,
      floorPrice: floor,
      competitor1Price: Math.round(basePrice * 1.02),
      competitor2Price: Math.round(basePrice * 0.95),
      competitor3Price: Math.round(basePrice * 1.08),
    },
    {
      date: '26 Sept 12:00',
      timestamp: '26 Sept',
      yourPrice: basePrice,
      naivePrice: basePrice,
      floorPrice: floor,
      competitor1Price: Math.round(basePrice * 1.0),
      competitor2Price: Math.round(basePrice * 0.94),
      competitor3Price: Math.round(basePrice * 1.07),
    },
    {
      date: '27 Sept 00:00',
      timestamp: '27 Sept',
      yourPrice: basePrice,
      naivePrice: basePrice,
      floorPrice: floor,
      competitor1Price: Math.round(basePrice * 0.98),
      competitor2Price: Math.round(basePrice * 0.96),
      competitor3Price: Math.round(basePrice * 1.07),
    },
    {
      date: '27 Sept 12:00',
      timestamp: '27 Sept',
      yourPrice: basePrice,
      naivePrice: Math.round((basePrice + compPrice) / 2),
      floorPrice: floor,
      competitor1Price: Math.round((basePrice + compPrice) / 2),
      competitor2Price: Math.round(basePrice * 0.96),
      competitor3Price: Math.round(basePrice * 1.07),
    },
    {
      date: '27 Sept 18:00',
      timestamp: '27 Sept',
      yourPrice: basePrice,
      naivePrice: compPrice,
      floorPrice: floor,
      competitor1Price: compPrice,
      competitor2Price: Math.round(basePrice * 0.96),
      competitor3Price: Math.round(basePrice * 1.07),
    },
    {
      date: '28 Sept 06:00',
      timestamp: '28 Sept',
      yourPrice: basePrice,
      naivePrice: compPrice,
      floorPrice: floor,
      competitor1Price: compPrice,
      competitor2Price: Math.round(basePrice * 0.96),
      competitor3Price: Math.round(basePrice * 1.07),
    },
  ];
}
