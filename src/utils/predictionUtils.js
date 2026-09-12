/**
 * Safely extracts predictions from a stock record.
 * Checks in order:
 * 1. stock.sell_predictions (JSONB column if available in Supabase)
 * 2. stock.tags (pred_json:... fallback tag persisted in Supabase)
 * 3. localStorage cache (stock_predictions_<id>)
 * 4. stock.sell_prediction_price (legacy column)
 */
export function getPredictionsFromStock(stock, defaultQty = 0) {
  if (!stock) return [];

  // 1. Direct sell_predictions column from DB
  if (Array.isArray(stock.sell_predictions) && stock.sell_predictions.length > 0) {
    return stock.sell_predictions.map((p, idx) =>
      typeof p === 'object' && p !== null
        ? {
            ...p,
            stocks: p.stocks != null && Number(p.stocks) > 0 ? Number(p.stocks) : defaultQty,
          }
        : { id: `pred-${idx}-${Date.now()}`, price: Number(p), stocks: defaultQty }
    );
  }

  // 2. Supabase tags column fallback (persisted in DB as pred_json:[...])
  if (Array.isArray(stock.tags) && stock.tags.length > 0) {
    const tagPred = stock.tags.find(
      (t) => typeof t === 'string' && t.startsWith('pred_json:')
    );
    if (tagPred) {
      try {
        const parsed = JSON.parse(tagPred.slice(10));
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p, idx) =>
            typeof p === 'object' && p !== null
              ? {
                  ...p,
                  stocks: p.stocks != null && Number(p.stocks) > 0 ? Number(p.stocks) : defaultQty,
                }
              : { id: `pred-${idx}-${Date.now()}`, price: Number(p), stocks: defaultQty }
          );
        }
      } catch {
        // Ignore parse error
      }
    }
  }

  // 3. Check localStorage cache
  try {
    if (stock.id) {
      const cached = localStorage.getItem(`stock_predictions_${stock.id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p, idx) =>
            typeof p === 'object' && p !== null
              ? {
                  ...p,
                  stocks: p.stocks != null && Number(p.stocks) > 0 ? Number(p.stocks) : defaultQty,
                }
              : { id: `pred-${idx}-${Date.now()}`, price: Number(p), stocks: defaultQty }
          );
        }
      }
    }
  } catch {
    // Ignore parse error
  }

  // 4. Legacy single prediction price column
  if (stock.sell_prediction_price && Number(stock.sell_prediction_price) > 0) {
    return [
      {
        id: `pred-init-${stock.id}`,
        price: Number(stock.sell_prediction_price),
        stocks: defaultQty,
      },
    ];
  }

  return [];
}

/**
 * Gets primary prediction price from stock record
 */
export function getPrimaryPredictionPrice(stock) {
  const preds = getPredictionsFromStock(stock);
  if (preds.length > 0) {
    return Number(preds[0].price);
  }
  return stock?.sell_prediction_price ? Number(stock.sell_prediction_price) : null;
}
