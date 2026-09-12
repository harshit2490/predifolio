import { FiDownload } from 'react-icons/fi';
import { getTodayZonalDate } from '../utils/dateUtils';
import { getPredictionsFromStock } from '../utils/predictionUtils';

function ExportButton({ stocks }) {
  const handleExport = () => {
    if (!stocks || stocks.length === 0) return;

    const headers = [
      'Stock Name',
      'Buy Date',
      'Buy Price (₹)',
      'Buy Stocks (Qty)',
      'Invested Amount (₹)',
      'Sell Predictions (₹)',
      'Primary Target P/L (%)',
      'Primary Target P/L Amount (₹)',
      'Notes',
    ];

    const rows = stocks.map((s) => {
      const buyPrice = Number(s.buy_price) || 0;
      const invested = Number(s.invested_amount) || 0;
      const qty =
        s.buy_stocks != null
          ? Number(s.buy_stocks)
          : buyPrice > 0
            ? Math.round(invested / buyPrice)
            : 0;

      // Extract all prediction prices and quantities
      const predsList = getPredictionsFromStock(s, qty);
      let preds = [];
      let primaryTarget = null;
      let primaryTargetStocks = qty;

      if (predsList.length > 0) {
        preds = predsList.map((p) => {
          const pPrice = Number(p.price);
          const pStocks =
            p.stocks != null && Number(p.stocks) > 0 ? ` (${p.stocks} stocks)` : '';
          return `₹${pPrice}${pStocks}`;
        });

        const first = predsList[0];
        primaryTarget = Number(first.price);
        if (first.stocks != null && Number(first.stocks) > 0) {
          primaryTargetStocks = Number(first.stocks);
        }
      }

      let plPercent = '';
      let plAmount = '';

      if (primaryTarget != null && primaryTarget > 0 && buyPrice > 0) {
        const pct = ((primaryTarget - buyPrice) / buyPrice) * 100;
        const amt = (primaryTarget - buyPrice) * primaryTargetStocks;
        plPercent = (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%';
        plAmount = (amt >= 0 ? '+' : '') + amt.toFixed(2);
      }

      return [
        s.stock_name,
        s.buy_date,
        buyPrice,
        qty,
        invested,
        preds.length > 0 ? preds.join('; ') : '',
        plPercent,
        plAmount,
        s.notes || '',
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((r) =>
        r
          .map((cell) => {
            const str = String(cell);
            return str.includes(',') || str.includes('"') || str.includes('\n')
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stock-portfolio-${getTodayZonalDate()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button className="export-btn" onClick={handleExport} title="Export to CSV">
      <FiDownload />
      <span>Export</span>
    </button>
  );
}

export default ExportButton;
