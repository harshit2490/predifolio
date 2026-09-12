import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi';
import { formatDateDisplay } from '../utils/dateUtils';
import '../styles/modal.css';

function DeleteStockModal({ stock, onConfirm, onClose, deleting }) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !deleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, deleting]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !deleting) {
      onClose();
    }
  };

  const buyPrice = Number(stock.buy_price) || 0;
  const invested = Number(stock.invested_amount) || 0;
  const qty =
    stock.buy_stocks != null
      ? Number(stock.buy_stocks)
      : buyPrice > 0
        ? Math.round(invested / buyPrice)
        : 0;

  return createPortal(
    <div
      className="modal-overlay delete-alert-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-alert-title"
    >
      <div className="modal-content delete-alert-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close delete-alert-close"
          onClick={onClose}
          disabled={deleting}
          aria-label="Close"
        >
          <FiX />
        </button>

        <div className="delete-alert-header">
          <div className="delete-alert-icon-ring">
            <div className="delete-alert-icon-inner">
              <FiAlertTriangle className="delete-alert-icon" />
            </div>
          </div>
          <h2 id="delete-alert-title" className="delete-alert-title">
            Delete Stock?
          </h2>
          <p className="delete-alert-subtitle">
            Are you sure you want to remove <strong>{stock.stock_name}</strong> from your portfolio? This action cannot be undone.
          </p>
        </div>

        <div className="delete-alert-card">
          <div className="delete-card-row">
            <span className="delete-card-label">Stock</span>
            <span className="delete-card-value bold">{stock.stock_name}</span>
          </div>
          <div className="delete-card-row">
            <span className="delete-card-label">Buy Date</span>
            <span className="delete-card-value">{formatDateDisplay(stock.buy_date)}</span>
          </div>
          <div className="delete-card-row">
            <span className="delete-card-label">Qty / Buy Price</span>
            <span className="delete-card-value">
              {qty > 0 ? `${qty} shares` : '-'} @ ₹{buyPrice.toFixed(2)}
            </span>
          </div>
          <div className="delete-card-row delete-card-row-total">
            <span className="delete-card-label">Total Invested</span>
            <span className="delete-card-value total-val">
              ₹{invested.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="delete-alert-actions">
          <button
            type="button"
            className="delete-btn-cancel"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="delete-btn-confirm"
            onClick={onConfirm}
            disabled={deleting}
          >
            <FiTrash2 className="btn-icon" />
            {deleting ? 'Deleting...' : 'Delete Stock'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default DeleteStockModal;
