import { FiDownload } from 'react-icons/fi';
import { getTodayZonalDate } from '../utils/dateUtils';

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

      // Extract all prediction prices
      let preds = [];
      if (Array.isArray(s.sell_predictions) && s.sell_predictions.length > 0) {
        preds = s.sell_predictions.map((p) =>
          typeof p === 'object' && p !== null ? Number(p.price) : Number(p)
        );
      } else if (s.sell_prediction_price && Number(s.sell_prediction_price) > 0) {
        preds = [Number(s.sell_prediction_price)];
      }

      let plPercent = '';
      let plAmount = '';

      if (preds.length > 0 && buyPrice > 0) {
        const primaryTarget = preds[0];
        const pct = ((primaryTarget - buyPrice) / buyPrice) * 100;
        const amt = (primaryTarget - buyPrice) * qty;
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
