import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Header from './Header';
import SummaryBar from './SummaryBar';
import StockList from './StockList';
import AddStockModal from './AddStockModal';
import EditStockModal from './EditStockModal';
import FinancialBackground from './ThreeJS/FinancialBackground';
import { getPredictionsFromStock } from '../utils/predictionUtils';
import toast from 'react-hot-toast';
import '../styles/dashboard.css';

function Dashboard() {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);

  // Fetch stocks when user changes or on mount
  useEffect(() => {
    fetchStocks();
  }, [currentUser?.id]);

  const fetchStocks = async () => {
    if (!currentUser?.id) {
      setStocks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('stocks')
        .select('*')
        .order('created_at', { ascending: false });

      // Admin sees their stocks + unassigned legacy stocks (where user_id IS NULL)
      // Non-admin / newly signed up users strictly see only their own stocks
      if (currentUser.role === 'admin') {
        query = query.or(`user_id.eq.${currentUser.id},user_id.is.null`);
      } else {
        query = query.eq('user_id', currentUser.id);
      }

      const { data, error } = await query;

      if (error) {
        // Graceful handling if user_id column has not been created yet
        if (error.code === '42703' || error.message?.includes('user_id')) {
          console.warn('user_id column not found in stocks table. Please run SQL migration.');
          if (currentUser.role === 'admin') {
            const fallback = await supabase
              .from('stocks')
              .select('*')
              .order('created_at', { ascending: false });
            if (!fallback.error) {
              setStocks(fallback.data || []);
              return;
            }
          }
        }
        throw error;
      }

      const fetched = data || [];

      // Apply saved custom order if exists for this specific user
      try {
        const userOrderKey = `stock_card_order_${currentUser.id}`;
        const savedOrder =
          localStorage.getItem(userOrderKey) ||
          (currentUser.role === 'admin' ? localStorage.getItem('stock_card_order') : null);

        if (savedOrder) {
          const orderIds = JSON.parse(savedOrder);
          if (Array.isArray(orderIds) && orderIds.length > 0) {
            const indexMap = new Map(orderIds.map((id, idx) => [id, idx]));
            fetched.sort((a, b) => {
              const posA = indexMap.has(a.id) ? indexMap.get(a.id) : 99999;
              const posB = indexMap.has(b.id) ? indexMap.get(b.id) : 99999;
              return posA - posB;
            });
          }
        }
      } catch {
        // Ignore JSON error
      }

      setStocks(fetched);

      // Auto-backfill: if sell_predictions column exists in DB, ensure targets from tags/cache are synced into it
      fetched.forEach(async (s) => {
        if (!s.sell_predictions || s.sell_predictions.length === 0) {
          const buyPrice = Number(s.buy_price) || 0;
          const invested = Number(s.invested_amount) || 0;
          const qty =
            s.buy_stocks != null
              ? Number(s.buy_stocks)
              : buyPrice > 0
                ? Math.round(invested / buyPrice)
                : 0;
          const preds = getPredictionsFromStock(s, qty);
          if (preds.length > 0) {
            try {
              await supabase
                .from('stocks')
                .update({ sell_predictions: preds })
                .eq('id', s.id);
            } catch {
              // Ignore if column doesn't exist yet
            }
          }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = (newStock) => {
    setStocks((prev) => [newStock, ...prev]);
  };

  const handleUpdateStock = (updatedStock) => {
    setStocks((prev) =>
      prev.map((s) => (s.id === updatedStock.id ? updatedStock : s))
    );
  };

  const handleDeleteStock = (id) => {
    setStocks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleReorderStocks = (newOrderedStocks) => {
    setStocks(newOrderedStocks);
    try {
      const orderIds = newOrderedStocks.map((s) => s.id);
      const userOrderKey = currentUser?.id ? `stock_card_order_${currentUser.id}` : 'stock_card_order';
      localStorage.setItem(userOrderKey, JSON.stringify(orderIds));
    } catch {
      // Ignore
    }
  };

  return (
    <>
      <Header />
      <FinancialBackground variant="dashboard-threejs-theme" theme={theme} />
      <main className="dashboard">
        {loading ? (
          <div className="empty-state">
            <div className="empty-icon" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>📊</div>
            <h3 className="empty-title">Loading your portfolio...</h3>
          </div>
        ) : (
          <>
            <SummaryBar stocks={stocks} />

            <StockList
              stocks={stocks}
              onEdit={(stock) => setEditingStock(stock)}
              onDelete={handleDeleteStock}
              onUpdate={handleUpdateStock}
              onReorder={handleReorderStocks}
              onOpenAdd={() => setShowAddModal(true)}
            />
          </>
        )}
      </main>

      {showAddModal && (
        <AddStockModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddStock}
        />
      )}

      {editingStock && (
        <EditStockModal
          stock={editingStock}
          onClose={() => setEditingStock(null)}
          onUpdate={handleUpdateStock}
        />
      )}
    </>
  );
}

export default Dashboard;
