import { useState, useRef, useEffect } from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';
import StockCard from './StockCard';
import ExportButton from './ExportButton';
import { getPrimaryPredictionPrice } from '../utils/predictionUtils';
import toast from 'react-hot-toast';
import '../styles/dashboard.css';

function StockList({ stocks, onEdit, onDelete, onUpdate, onReorder, onOpenAdd }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('custom');
  const [draggedStockId, setDraggedStockId] = useState(null);
  const [dragOverStockId, setDragOverStockId] = useState(null);
  const [pressingStockId, setPressingStockId] = useState(null);
  const [unlockedStockId, setUnlockedStockId] = useState(null);

  const pressTimerRef = useRef(null);
  const pressPosRef = useRef({ x: 0, y: 0 });
  const autoLockTimerRef = useRef(null);
  const unlockedStockIdRef = useRef(null);
  const handleActiveStockIdRef = useRef(null);

  const setUnlocked = (stockId) => {
    unlockedStockIdRef.current = stockId;
    setUnlockedStockId(stockId);
  };

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
      if (autoLockTimerRef.current) clearTimeout(autoLockTimerRef.current);
    };
  }, []);

  // Filter stocks
  const filtered = stocks.filter((s) =>
    s.stock_name.toLowerCase().includes(search.toLowerCase())
  );

  // Sort stocks
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'custom':
        return 0; // preserve current custom order
      case 'date-desc':
        return new Date(b.buy_date) - new Date(a.buy_date);
      case 'date-asc':
        return new Date(a.buy_date) - new Date(b.buy_date);
      case 'amount-desc':
        return Number(b.invested_amount) - Number(a.invested_amount);
      case 'amount-asc':
        return Number(a.invested_amount) - Number(b.invested_amount);
      case 'profit-desc': {
        const predPriceA = getPrimaryPredictionPrice(a);
        const predPriceB = getPrimaryPredictionPrice(b);
        const profitA =
          predPriceA && a.buy_price
            ? ((predPriceA - a.buy_price) / a.buy_price) * 100
            : -Infinity;
        const profitB =
          predPriceB && b.buy_price
            ? ((predPriceB - b.buy_price) / b.buy_price) * 100
            : -Infinity;
        return profitB - profitA;
      }
      case 'name-asc':
        return a.stock_name.localeCompare(b.stock_name);
      default:
        return 0;
    }
  });

  // Handle direct click on drag handle icon
  const handleDragHandleClick = (stockId) => {
    if (unlockedStockId === stockId) {
      handleActiveStockIdRef.current = null;
      setUnlocked(null);
      toast('Card locked', { id: `lock-${stockId}`, duration: 1500 });
      return;
    }

    handleActiveStockIdRef.current = stockId;
    setUnlocked(stockId);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(40);
      } catch {
        // Ignore
      }
    }

    toast('Drag handle active! Move card anywhere.', {
      icon: '✋',
      id: `unlock-${stockId}`,
      duration: 3000,
    });

    if (autoLockTimerRef.current) clearTimeout(autoLockTimerRef.current);
    autoLockTimerRef.current = setTimeout(() => {
      handleActiveStockIdRef.current = null;
      setUnlocked(null);
    }, 12000);
  };

  // Pointerdown handler on card
  const handleCardPointerDown = (e, stockId) => {
    // If clicking on the drag handle: INSTANT UNLOCK & READY TO DRAG!
    if (e.target.closest('.stock-drag-handle')) {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
        pressTimerRef.current = null;
      }
      setPressingStockId(null);
      handleActiveStockIdRef.current = stockId;
      setUnlocked(stockId);

      if (autoLockTimerRef.current) clearTimeout(autoLockTimerRef.current);
      autoLockTimerRef.current = setTimeout(() => {
        handleActiveStockIdRef.current = null;
        setUnlocked(null);
      }, 12000);
      return;
    }

    // Ignore clicks on inputs, textareas, buttons, links, or action controls
    if (
      e.target.closest(
        'input, textarea, button, select, a, .stock-action-btn, .prediction-item-action-btn'
      )
    ) {
      return;
    }

    // Only respond to left click (button === 0)
    if (e.button !== undefined && e.button !== 0) {
      return;
    }

    // Reset previous press timer if any
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }

    pressPosRef.current = { x: e.clientX, y: e.clientY };
    setPressingStockId(stockId);

    // 2.5 seconds (2500ms) long-press timer
    pressTimerRef.current = setTimeout(() => {
      handleActiveStockIdRef.current = stockId;
      setUnlocked(stockId);
      setPressingStockId(null);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(50);
        } catch {
          // Ignore
        }
      }
      toast('Card unlocked! Drag anywhere to reposition.', {
        icon: '✋',
        id: `unlock-${stockId}`,
        duration: 3000,
      });

      // Auto-relock after 10 seconds of inactivity if not dragged
      if (autoLockTimerRef.current) clearTimeout(autoLockTimerRef.current);
      autoLockTimerRef.current = setTimeout(() => {
        handleActiveStockIdRef.current = null;
        setUnlocked(null);
      }, 10000);
    }, 2500);
  };

  const handleCardPointerMove = (e) => {
    if (!pressingStockId) return;
    const dx = Math.abs(e.clientX - pressPosRef.current.x);
    const dy = Math.abs(e.clientY - pressPosRef.current.y);
    // If pointer moves more than 8px before 2.5s, cancel long press
    if (dx > 8 || dy > 8) {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
        pressTimerRef.current = null;
      }
      setPressingStockId(null);
    }
  };

  const handleCardPointerUpOrLeave = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    setPressingStockId(null);
  };

  // Drag and Drop handlers
  const handleDragStart = (e, stockId) => {
    if (
      e.target.closest(
        'input, textarea, button, select, a, .stock-action-btn, .prediction-item-action-btn'
      )
    ) {
      e.preventDefault();
      return;
    }

    const isHandle = Boolean(
      e.target.closest('.stock-drag-handle') ||
      handleActiveStockIdRef.current === stockId
    );
    const isUnlocked =
      unlockedStockId === stockId ||
      unlockedStockIdRef.current === stockId ||
      handleActiveStockIdRef.current === stockId;

    // RULE:
    // 1. Drag handle click/drag: works immediately
    // 2. Whole card: works ONLY if user held for 2.5 seconds (unlocked) OR activated via handle
    // 3. Not on double click or quick drag on card body
    if (!isHandle && !isUnlocked) {
      e.preventDefault();
      return;
    }

    // Cancel any active timers
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    setPressingStockId(null);

    setDraggedStockId(stockId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', stockId);
  };

  const handleDragOver = (e, stockId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStockId !== stockId) {
      setDragOverStockId(stockId);
    }
  };

  const handleDragLeave = (e, stockId) => {
    if (dragOverStockId === stockId) {
      setDragOverStockId(null);
    }
  };

  const handleDrop = (e, targetStockId) => {
    e.preventDefault();
    if (!draggedStockId || draggedStockId === targetStockId) {
      setDraggedStockId(null);
      setDragOverStockId(null);
      setUnlockedStockId(null);
      setPressingStockId(null);
      return;
    }

    // Determine reordering base list: use sorted if not default custom, but preserve all stocks
    let baseList = sortBy === 'custom' ? [...stocks] : [...sorted];
    if (baseList.length < stocks.length) {
      const baseIds = new Set(baseList.map((s) => s.id));
      const remaining = stocks.filter((s) => !baseIds.has(s.id));
      baseList = [...baseList, ...remaining];
    }

    const sourceIdx = baseList.findIndex((s) => s.id === draggedStockId);
    const targetIdx = baseList.findIndex((s) => s.id === targetStockId);

    if (sourceIdx !== -1 && targetIdx !== -1) {
      const [movedItem] = baseList.splice(sourceIdx, 1);
      baseList.splice(targetIdx, 0, movedItem);

      if (onReorder) {
        onReorder(baseList);
      }
      setSortBy('custom');
      toast.success('Card repositioned');
    }

    setDraggedStockId(null);
    setDragOverStockId(null);
    handleActiveStockIdRef.current = null;
    setUnlocked(null);
    setPressingStockId(null);
    if (autoLockTimerRef.current) clearTimeout(autoLockTimerRef.current);
  };

  const handleDragEnd = () => {
    setDraggedStockId(null);
    setDragOverStockId(null);
    handleActiveStockIdRef.current = null;
    setUnlocked(null);
    setPressingStockId(null);
    if (autoLockTimerRef.current) clearTimeout(autoLockTimerRef.current);
  };

  return (
    <>
      <div className="controls-bar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            className="search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stocks..."
          />
        </div>

        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="custom">Custom Order (Drag to Move)</option>
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Highest Invested</option>
          <option value="amount-asc">Lowest Invested</option>
          <option value="profit-desc">Highest Profit %</option>
          <option value="name-asc">Name (A-Z)</option>
        </select>

        <ExportButton stocks={stocks} />

        <button className="add-stock-btn" onClick={onOpenAdd}>
          <FiPlus />
          <span className="btn-label">Add Stock</span>
        </button>
      </div>

      <div className="stock-grid">
        {sorted.length > 0 ? (
          sorted.map((stock, index) => (
            <div
              key={stock.id}
              className={`stock-grid-item ${
                draggedStockId === stock.id ? 'is-dragging' : ''
              } ${dragOverStockId === stock.id ? 'is-drag-over' : ''} ${
                unlockedStockId === stock.id ? 'is-unlocked-drag' : ''
              } ${pressingStockId === stock.id ? 'is-pressing' : ''}`}
              draggable
              onPointerDown={(e) => handleCardPointerDown(e, stock.id)}
              onPointerMove={handleCardPointerMove}
              onPointerUp={handleCardPointerUpOrLeave}
              onPointerLeave={handleCardPointerUpOrLeave}
              onPointerCancel={handleCardPointerUpOrLeave}
              onDragStart={(e) => handleDragStart(e, stock.id)}
              onDragOver={(e) => handleDragOver(e, stock.id)}
              onDragLeave={(e) => handleDragLeave(e, stock.id)}
              onDrop={(e) => handleDrop(e, stock.id)}
              onDragEnd={handleDragEnd}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* 2.5s Long Press Progress Indicator */}
              {pressingStockId === stock.id && (
                <div className="long-press-indicator-bar">
                  <div className="long-press-progress"></div>
                  <span className="long-press-text">⏳ Hold 2.5s to unlock drag...</span>
                </div>
              )}

              {/* Unlocked Badge */}
              {unlockedStockId === stock.id && (
                <div className="card-unlocked-badge">
                  <span>✋ Card Unlocked — Drag to Move</span>
                  <button
                    type="button"
                    className="card-unlocked-dismiss"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActiveStockIdRef.current = null;
                      setUnlocked(null);
                    }}
                    title="Lock card"
                  >
                    ✕
                  </button>
                </div>
              )}

              <StockCard
                stock={stock}
                onEdit={onEdit}
                onDelete={onDelete}
                onUpdate={onUpdate}
                onDragHandleClick={handleDragHandleClick}
              />
            </div>
          ))
        ) : stocks.length > 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3 className="empty-title">No stocks found</h3>
            <p className="empty-text">
              No stocks match "{search}". Try a different search.
            </p>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📈</div>
            <h3 className="empty-title">No stocks yet</h3>
            <p className="empty-text">
              Start tracking your investments by adding your first stock.
            </p>
            <button className="empty-btn" onClick={onOpenAdd}>
              <FiPlus /> Add Your First Stock
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default StockList;
