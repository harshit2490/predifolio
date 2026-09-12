import { FiDollarSign, FiBriefcase, FiTrendingUp } from 'react-icons/fi';
import { getPredictionsFromStock } from '../utils/predictionUtils';
import '../styles/dashboard.css';

function SummaryBar({ stocks }) {
  const totalInvested = stocks.reduce(
    (sum, s) => sum + Number(s.invested_amount || 0),
    0
  );

  // Calculate portfolio value based on sell prediction prices (primary target)
  let totalPortfolioValue = 0;
  let hasPredictions = false;

  stocks.forEach((s) => {
    const buyPrice = Number(s.buy_price) || 0;
    const invested = Number(s.invested_amount) || 0;
    const qty =
      s.buy_stocks != null
        ? Number(s.buy_stocks)
        : buyPrice > 0
          ? invested / buyPrice
          : 0;

    let targetPrice = null;
    let targetStocks = qty;
    const preds = getPredictionsFromStock(s, qty);

    if (preds.length > 0) {
      const first = preds[0];
      targetPrice = Number(first.price);
      if (first.stocks != null && Number(first.stocks) > 0) {
        targetStocks = Number(first.stocks);
      }
    }

    if (targetPrice && targetPrice > 0 && qty > 0) {
      hasPredictions = true;
      const targetShares = Math.min(qty, targetStocks);
      const remainingShares = Math.max(0, qty - targetStocks);
      totalPortfolioValue += targetPrice * targetShares + remainingShares * buyPrice;
    } else {
      totalPortfolioValue += invested;
    }
  });

  const overallPL = totalPortfolioValue - totalInvested;
  const overallPLPercent =
    totalInvested > 0 ? (overallPL / totalInvested) * 100 : 0;
  const isProfit = overallPL >= 0;

  const formatCurrency = (val) => {
    const abs = Math.abs(val);
    if (abs >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (abs >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="summary-bar">
      <div className="summary-card">
        <div className="summary-label">
          <FiDollarSign className="icon" />
          Total Invested
        </div>
        <div className="summary-value">{formatCurrency(totalInvested)}</div>
        <div className="summary-sub">{stocks.length} stock{stocks.length !== 1 ? 's' : ''}</div>
      </div>

      <div className="summary-card">
        <div className="summary-label">
          <FiBriefcase className="icon" />
          Portfolio Value
        </div>
        <div className="summary-value">
          {hasPredictions ? formatCurrency(totalPortfolioValue) : '—'}
        </div>
        <div className="summary-sub">
          {hasPredictions ? 'Based on predictions' : 'Set sell prices to see'}
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-label">
          <FiTrendingUp className="icon" />
          Overall P/L
        </div>
        <div
          className={`summary-value ${
            hasPredictions ? (isProfit ? 'profit' : 'loss') : ''
          }`}
        >
          {hasPredictions
            ? `${isProfit ? '+' : ''}${formatCurrency(overallPL)}`
            : '—'}
        </div>
        <div className="summary-sub">
          {hasPredictions
            ? `${isProfit ? '+' : ''}${overallPLPercent.toFixed(2)}%`
            : 'No predictions yet'}
        </div>
      </div>
    </div>
  );
}

export default SummaryBar;
