// Service to fetch live stock price using Screener.in API
// Includes 60s caching per stock to prevent rate-limiting

const priceCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds cache

export const fetchStockCurrentPrice = async (stockName, options = {}) => {
  if (!stockName || !stockName.trim()) {
    return { success: false, price: null, error: 'Invalid stock name' };
  }

  const query = stockName.trim();
  const cacheKey = query.toLowerCase();
  const now = Date.now();

  // Return cached price if within TTL and force is not true
  if (!options.force && priceCache.has(cacheKey)) {
    const cached = priceCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return { ...cached.data, cached: true };
    }
  }

  try {
    // Step 1: Search company ID on Screener if not provided
    let companyId = options.companyId;
    let resolvedName = query;

    if (!companyId) {
      const searchRes = await fetch(
        `/api/screener/company/search/?q=${encodeURIComponent(query)}`
      );

      if (!searchRes.ok) {
        throw new Error(`Search failed with status ${searchRes.status}`);
      }

      const searchResults = await searchRes.json();
      if (!Array.isArray(searchResults) || searchResults.length === 0) {
        throw new Error('Stock not found on Screener');
      }

      // Pick the best match (first result)
      const bestMatch = searchResults[0];
      companyId = bestMatch.id;
      resolvedName = bestMatch.name || query;
    }

    // Step 2: Fetch chart price for the company ID
    const chartRes = await fetch(
      `/api/screener/company/${companyId}/chart/?q=Price&days=1`
    );

    if (!chartRes.ok) {
      throw new Error(`Price fetch failed with status ${chartRes.status}`);
    }

    const chartData = await chartRes.json();

    // Extract price from dataset
    const priceDataset = chartData?.datasets?.find((d) => d.metric === 'Price');
    const values = priceDataset?.values;

    if (!values || !Array.isArray(values) || values.length === 0) {
      throw new Error('No price data available');
    }

    // Latest price entry is the last element: ["YYYY-MM-DD", "price"]
    const latestEntry = values[values.length - 1];
    const rawPrice = latestEntry[1];
    const priceDate = latestEntry[0];
    const price = parseFloat(rawPrice);

    if (isNaN(price) || price <= 0) {
      throw new Error('Invalid price value received');
    }

    const result = {
      success: true,
      price,
      priceDate,
      companyId,
      resolvedName,
      lastUpdated: new Date().toISOString(),
    };

    // Store in cache
    priceCache.set(cacheKey, { timestamp: now, data: result });

    return result;
  } catch (err) {
    const errorResult = {
      success: false,
      price: null,
      error: err.message || 'Failed to fetch live price',
    };
    return errorResult;
  }
};
