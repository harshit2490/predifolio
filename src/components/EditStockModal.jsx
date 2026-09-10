import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import StockSearch from './StockSearch';
import { getTodayZonalDate } from '../utils/dateUtils';
import '../styles/modal.css';

function EditStockModal({ stock, onClose, onUpdate }) {
  // Derive initial stock quantity from invested_amount / buy_price
  const initialBuyStocks =
    stock.buy_stocks != null
      ? stock.buy_stocks
      : stock.buy_price > 0 && stock.invested_amount
        ? Math.round(Number(stock.invested_amount) / Number(stock.buy_price))
        : '';

  const [formData, setFormData] = useState({
    stock_name: stock.stock_name || '',
    buy_date: stock.buy_date || getTodayZonalDate(),
    buy_price: stock.buy_price || '',
    buy_stocks: initialBuyStocks,
    notes: stock.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const buyPriceNum = Number(formData.buy_price);
  const buyStocksNum = Number(formData.buy_stocks);

  // Calculate invested amount based on buy_price * buy_stocks
  const calculatedInvestedAmount =
    buyPriceNum > 0 && buyStocksNum > 0
      ? Number((buyPriceNum * buyStocksNum).toFixed(2))
      : 0;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.stock_name.trim()) {
      toast.error('Please enter a stock name');
      return;
    }
    if (!formData.buy_price || buyPriceNum <= 0) {
      toast.error('Please enter a valid buy price');
      return;
    }
    if (!formData.buy_stocks || buyStocksNum <= 0) {
      toast.error('Please enter valid number of buy stocks');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('stocks')
        .update({
          stock_name: formData.stock_name.trim(),
          buy_date: formData.buy_date,
          buy_price: buyPriceNum,
          invested_amount: calculatedInvestedAmount,
          notes: formData.notes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', stock.id)
        .select()
        .single();

      if (error) throw error;

      toast.success(`${formData.stock_name} updated!`);
      onUpdate(data);
      onClose();
    } catch (err) {
      toast.error('Failed to update: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Edit Stock</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-stock-name">
              Stock Name
            </label>
            <StockSearch
              id="edit-stock-name"
              value={formData.stock_name}
              onChange={(val) => handleChange('stock_name', val)}
              placeholder="Search stock name..."
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-buy-date">
              Buy Date
            </label>
            <input
              id="edit-buy-date"
              className="form-input"
              type="date"
              value={formData.buy_date}
              onChange={(e) => handleChange('buy_date', e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-buy-price">
                Buy Price (₹)
              </label>
              <input
                id="edit-buy-price"
                className="form-input"
                type="number"
                step="0.01"
                min="0"
                value={formData.buy_price}
                onChange={(e) => handleChange('buy_price', e.target.value)}
                placeholder="e.g. 150.50"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-buy-stocks">
                Buy Stocks (Qty)
              </label>
              <input
                id="edit-buy-stocks"
                className="form-input"
                type="number"
                step="any"
                min="0"
                value={formData.buy_stocks}
                onChange={(e) => handleChange('buy_stocks', e.target.value)}
                placeholder="e.g. 100"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-invested-amount">
              Invested Amount (₹) <span className="label-badge">Calculated</span>
            </label>
          </div>

          {calculatedInvestedAmount >= 0 && (
            <div className="form-calculated">
              <span className="form-calculated-label">
                {buyStocksNum.toLocaleString('en-IN')} stocks @ ₹{buyPriceNum.toFixed(2)}
              </span>
              <span className="form-calculated-value">
                ₹{calculatedInvestedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="edit-notes">
              Notes (optional)
            </label>
            <textarea
              id="edit-notes"
              className="form-input"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="e.g., long-term hold, bought on dip"
              rows={2}
            />
          </div>

          <button type="submit" className="modal-submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditStockModal;
