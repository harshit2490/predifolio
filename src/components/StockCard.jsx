import { useState, useEffect } from 'react';
import {
  FiEdit2,
  FiTrash2,
  FiTrendingUp,
  FiTrendingDown,
  FiMessageCircle,
  FiTarget,
  FiPlus,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiMove,
} from 'react-icons/fi';
import { supabase } from '../supabaseClient';
import { formatDateDisplay, isIndianMarketOpen } from '../utils/dateUtils';
import { fetchStockCurrentPrice } from '../utils/stockPriceService';
import toast from 'react-hot-toast';
import DeleteStockModal from './DeleteStockModal';
import '../styles/stockCard.css';

function StockCard({ stock, onEdit, onDelete, onUpdate, onDragHandleClick }) {
  const [newTargetPrice, setNewTargetPrice] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isMarketOpen, setIsMarketOpen] = useState(() => isIndianMarketOpen());

  // Periodically refresh market status
  useEffect(() => {
    const timer = setInterval(() => {
      setIsMarketOpen(isIndianMarketOpen());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Initialize predictions from DB array, localStorage, or existing single prediction
  const [predictions, setPredictions] = useState(() => {
    if (Array.isArray(stock.sell_predictions) && stock.sell_predictions.length > 0) {
      return stock.sell_predictions.map((p, idx) =>
        typeof p === 'object' && p !== null
          ? p
          : { id: `pred-${idx}-${Date.now()}`, price: Number(p) }
      );
    }
    try {
      const cached = localStorage.getItem(`stock_predictions_${stock.id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore parse error
    }
    if (stock.sell_prediction_price && Number(stock.sell_prediction_price) > 0) {
      return [{ id: `pred-init-${stock.id}`, price: Number(stock.sell_prediction_price) }];
    }
    return [];
  });

  // State for live stock price from Screener
  const [livePriceData, setLivePriceData] = useState({
    price: null,
    loading: false,
    error: null,
    priceDate: null,
  });

  const loadLivePrice = async (force = false) => {
    if (!stock.stock_name) return;
    setLivePriceData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetchStockCurrentPrice(stock.stock_name, { force });
      if (res.success && res.price) {
        setLivePriceData({
          price: res.price,
          loading: false,
          error: null,
          priceDate: res.priceDate,
        });
        if (force) toast.success(`Updated: ₹${res.price.toFixed(2)}`);
      } else {
        setLivePriceData((prev) => ({
          ...prev,
          loading: false,
          error: res.error || 'Unavailable',
        }));
        if (force) toast.error('Could not fetch latest price');
      }
    } catch {
      setLivePriceData((prev) => ({
        ...prev,
        loading: false,
        error: 'Network error',
      }));
      if (force) toast.error('Failed to fetch price');
    }
  };

  useEffect(() => {
    loadLivePrice(false);
  }, [stock.stock_name]);

  const buyPrice = Number(stock.buy_price) || 0;
  const investedAmount = Number(stock.invested_amount) || 0;
  const qty =
    stock.buy_stocks != null
      ? Number(stock.buy_stocks)
      : buyPrice > 0
        ? Math.round(investedAmount / buyPrice)
        : 0;

  // Live price calculations
  const livePrice = livePriceData.price;
  const hasLivePrice = livePrice != null && Number(livePrice) > 0;
  const liveDiff = hasLivePrice && buyPrice > 0 ? livePrice - buyPrice : 0;
  const livePct = buyPrice > 0 ? (liveDiff / buyPrice) * 100 : 0;
  const livePl = liveDiff * qty;
  const isLiveProfit = livePl >= 0;

  const formatCurrency = (val) => {
    const abs = Math.abs(val);
    const sign = val >= 0 ? '+' : '-';
    if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
    if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)} L`;
    return `${sign}₹${abs.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  const syncPredictions = async (updatedPredictions) => {
    // 1. Cache in localStorage immediately
    try {
      localStorage.setItem(
        `stock_predictions_${stock.id}`,
        JSON.stringify(updatedPredictions)
      );
    } catch {
      // Ignore
    }

    const primaryPrice =
      updatedPredictions.length > 0 ? Number(updatedPredictions[0].price) : null;

    // 2. Persist to Supabase
    try {
      const { error } = await supabase
        .from('stocks')
        .update({
          sell_predictions: updatedPredictions,
          sell_prediction_price: primaryPrice,
          updated_at: new Date().toISOString(),
        })
        .eq('id', stock.id);

      if (error) {
        // If column 'sell_predictions' does not exist yet, fallback to update sell_prediction_price
        await supabase
          .from('stocks')
          .update({
            sell_prediction_price: primaryPrice,
            updated_at: new Date().toISOString(),
          })
          .eq('id', stock.id);
      }
    } catch {
      // Silently handle network/db error
    }

    // 3. Notify parent dashboard
    if (onUpdate) {
      onUpdate({
        ...stock,
        sell_predictions: updatedPredictions,
        sell_prediction_price: primaryPrice,
      });
    }
  };

  const handleAddPrediction = (e) => {
    e.preventDefault();
    const priceNum = Number(newTargetPrice);
    if (!newTargetPrice || isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid target sell price');
      return;
    }

    // Check duplicate
    if (predictions.some((p) => Number(p.price) === priceNum)) {
      toast.error(`Target ₹${priceNum} is already added`);
      return;
    }

    const newPred = {
      id: `pred-${Date.now()}`,
      price: priceNum,
      created_at: new Date().toISOString(),
    };

    const updated = [...predictions, newPred];
    setPredictions(updated);
    setNewTargetPrice('');
    syncPredictions(updated);
    toast.success(`Target ₹${priceNum} added!`);
  };

  const handleDeletePrediction = (predId) => {
    const updated = predictions.filter((p) => p.id !== predId);
    setPredictions(updated);
    syncPredictions(updated);
    if (editingTargetId === predId) {
      setEditingTargetId(null);
      setEditTargetPrice('');
    }
    toast.success('Prediction deleted');
  };

  // State and handlers for editing individual targets
  const [editingTargetId, setEditingTargetId] = useState(null);
  const [editTargetPrice, setEditTargetPrice] = useState('');

  const handleStartEditTarget = (target) => {
    setEditingTargetId(target.id);
    setEditTargetPrice(target.price.toString());
  };

  const handleCancelEditTarget = () => {
    setEditingTargetId(null);
    setEditTargetPrice('');
  };

  const handleSaveEditTarget = (targetId) => {
    const priceNum = Number(editTargetPrice);
    if (!editTargetPrice || isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid target sell price');
      return;
    }

    // Check duplicate (excluding self)
    if (
      predictions.some(
        (p) => p.id !== targetId && Number(p.price) === priceNum
      )
    ) {
      toast.error(`Target ₹${priceNum} is already in the list`);
      return;
    }

    const updated = predictions.map((p) =>
      p.id === targetId
        ? { ...p, price: priceNum, updated_at: new Date().toISOString() }
        : p
    );
    setPredictions(updated);
    syncPredictions(updated);
    setEditingTargetId(null);
    setEditTargetPrice('');
    toast.success(`Target updated to ₹${priceNum}!`);
  };

  const handleDeleteStock = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('stocks')
        .delete()
        .eq('id', stock.id);

      if (error) throw error;
      try {
        localStorage.removeItem(`stock_predictions_${stock.id}`);
      } catch {
        // Ignore
      }
      toast.success(`${stock.stock_name} removed`);
      setShowDeleteConfirm(false);
      onDelete(stock.id);
    } catch (err) {
      toast.error('Failed to delete stock');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="stock-card">
      {/* Header */}
      <div className="stock-card-header">
        <div className="stock-header-main">
          <div
            className="stock-drag-handle"
            title="Click or drag handle to move card (Instant), or hold card 2.5s"
            aria-label="Drag handle"
            onClick={(e) => {
              e.stopPropagation();
              onDragHandleClick?.(stock.id);
            }}
          >
            <FiMove />
          </div>
          <div>
            <div className="stock-name">
              <FiTrendingUp className="icon" />
              {stock.stock_name}
            </div>
            <div className="stock-date">{formatDateDisplay(stock.buy_date)}</div>
          </div>
        </div>
        <div className="stock-actions">
          <button
            className="stock-action-btn edit-btn"
            onClick={() => onEdit(stock)}
            title="Edit Stock"
          >
            <FiEdit2 />
          </button>
          <button
            className="stock-action-btn delete-btn"
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete Stock"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>

      {/* Full-Width Live Current Value Banner */}
      <div className="stock-live-banner">
        <div
          className={`live-status-pill ${isMarketOpen ? 'status-live' : 'status-closed'}`}
          title={
            isMarketOpen
              ? 'Market is Live. Opening time is 9:15am - 3:30pm'
              : 'Market is Closed. Opening time is 9:15am - 3:30pm'
          }
          role="status"
          aria-label={
            isMarketOpen
              ? 'Market is Live. Opening time is 9:15am - 3:30pm'
              : 'Market is Closed. Opening time is 9:15am - 3:30pm'
          }
        >
          <span className={`live-pulse-dot ${isMarketOpen ? 'status-live' : 'status-closed'}`}></span>
          <span className="live-status-text">{isMarketOpen ? 'LIVE' : 'CLOSED'}</span>
          <span className="live-status-tooltip">
            {isMarketOpen
              ? 'Market is Live. Opening time is 9:15am - 3:30pm'
              : 'Market is Closed. Opening time is 9:15am - 3:30pm'}
          </span>
        </div>
        <div className="live-banner-left">
          <div className="live-price-group">
            <span className="live-price-label">Current Value</span>
            <span className="live-price-amount">
              {livePriceData.loading && !hasLivePrice ? (
                <span className="live-loading-text">Fetching...</span>
              ) : hasLivePrice ? (
                `₹${livePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              ) : (
                <span className="live-na-text">Unavailable</span>
              )}
            </span>
          </div>
        </div>

        <div className="live-banner-right">
          {hasLivePrice && buyPrice > 0 && (
            <div className={`live-change-pill ${isLiveProfit ? 'profit' : 'loss'}`}>
              {isLiveProfit ? <FiTrendingUp /> : <FiTrendingDown />}
              <span className="live-change-pct">
                {isLiveProfit ? '+' : ''}{livePct.toFixed(2)}%
              </span>
              <span className="live-change-amount">
                ({formatCurrency(livePl)})
              </span>
            </div>
          )}

          <button
            type="button"
            className={`live-refresh-btn ${livePriceData.loading ? 'spinning' : ''}`}
            onClick={() => loadLivePrice(true)}
            title="Refresh current price"
            aria-label="Refresh current price"
          >
            <FiRefreshCw />
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="stock-details">
        <div className="stock-detail">
          <span className="stock-detail-label">Buy Price</span>
          <span className="stock-detail-value">₹{buyPrice.toFixed(2)}</span>
        </div>
        <div className="stock-detail">
          <span className="stock-detail-label">Buy Stocks</span>
          <span className="stock-detail-value">
            {qty.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="stock-detail">
          <span className="stock-detail-label">Invested</span>
          <span className="stock-detail-value">
            ₹{investedAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Multiple Sell Predictions Section */}
      <div className="prediction-section">
        <div className="prediction-header">
          <div className="prediction-title">
            <FiTarget className="prediction-title-icon" />
            <span>Sell Predictions</span>
            {predictions.length > 0 && (
              <span className="prediction-count-badge">
                {predictions.length} {predictions.length === 1 ? 'Target' : 'Targets'}
              </span>
            )}
          </div>
        </div>

        {/* Add Prediction Input Form */}
        <form className="prediction-add-bar" onSubmit={handleAddPrediction}>
          <div className="prediction-input-wrapper">
            <span className="prediction-currency-prefix">₹</span>
            <input
              className="prediction-add-input"
              type="number"
              step="0.01"
              min="0"
              value={newTargetPrice}
              onChange={(e) => setNewTargetPrice(e.target.value)}
              placeholder="Target sell price (e.g. 180)"
            />
          </div>
          <button
            type="submit"
            className="prediction-add-btn"
            disabled={!newTargetPrice || Number(newTargetPrice) <= 0}
          >
            <FiPlus />
            <span>Add</span>
          </button>
        </form>

        {/* List of Multiple Predictions */}
        <div className="predictions-list">
          {predictions.length > 0 ? (
            predictions.map((p, idx) => {
              const isEditing = editingTargetId === p.id;
              const targetPrice = Number(p.price);
              const diff = targetPrice - buyPrice;
              const percent = buyPrice > 0 ? (diff / buyPrice) * 100 : 0;
              const plAmount = diff * qty;
              const isProfit = plAmount >= 0;
              const projectedVal = targetPrice * qty;

              return (
                <div
                  key={p.id || idx}
                  className={`prediction-item-card ${isProfit ? 'profit' : 'loss'} ${isEditing ? 'editing' : ''}`}
                >
                  {isEditing ? (
                    <form
                      className="prediction-edit-inline-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveEditTarget(p.id);
                      }}
                    >
                      <div className="prediction-edit-meta">
                        <span className="prediction-target-tag">Edit Target {idx + 1}</span>
                      </div>
                      <div className="prediction-edit-controls">
                        <div className="prediction-edit-input-wrap">
                          <span className="prediction-edit-currency">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editTargetPrice}
                            onChange={(e) => setEditTargetPrice(e.target.value)}
                            className="prediction-edit-input"
                            autoFocus
                            placeholder="New target..."
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') handleCancelEditTarget();
                            }}
                          />
                        </div>
                        <button
                          type="submit"
                          className="prediction-save-btn"
                          title="Save target"
                          disabled={!editTargetPrice || Number(editTargetPrice) <= 0}
                        >
                          <FiCheck />
                        </button>
                        <button
                          type="button"
                          className="prediction-cancel-btn"
                          onClick={handleCancelEditTarget}
                          title="Cancel editing"
                        >
                          <FiX />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="prediction-item-left">
                        <div className="prediction-target-meta">
                          <span className="prediction-target-tag">Target {idx + 1}</span>
                          <span className={`prediction-pill ${isProfit ? 'profit' : 'loss'}`}>
                            {isProfit ? <FiTrendingUp /> : <FiTrendingDown />}
                            {isProfit ? '+' : ''}{percent.toFixed(2)}%
                          </span>
                        </div>
                        <div className="prediction-item-row">
                          <span className="pred-price-highlight">
                            ₹{targetPrice.toFixed(2)}
                          </span>
                          <span className={`pred-pl-highlight ${isProfit ? 'profit' : 'loss'}`}>
                            {formatCurrency(plAmount)}
                          </span>
                        </div>
                        <div className="pred-projected-value">
                          Value: ₹{projectedVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                      </div>

                      <div className="prediction-action-group">
                        <button
                          type="button"
                          className="prediction-item-action-btn edit"
                          onClick={() => handleStartEditTarget(p)}
                          title="Edit target price"
                          aria-label="Edit target"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          type="button"
                          className="prediction-item-action-btn delete"
                          onClick={() => handleDeletePrediction(p.id)}
                          title="Delete this prediction"
                          aria-label="Delete prediction"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <div className="prediction-empty-state">
              <span className="prediction-empty-hint">
                No sell predictions yet. Enter a target price above to calculate projected profit/loss!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {stock.notes && (
        <div className="stock-notes">
          <span className="stock-note-tag">
            <FiMessageCircle />
            {stock.notes}
          </span>
        </div>
      )}

      {/* Delete Confirmation Alert Modal */}
      {showDeleteConfirm && (
        <DeleteStockModal
          stock={stock}
          onConfirm={handleDeleteStock}
          onClose={() => setShowDeleteConfirm(false)}
          deleting={deleting}
        />
      )}
    </div>
  );
}

export default StockCard;
