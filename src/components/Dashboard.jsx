import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Header from './Header';
import SummaryBar from './SummaryBar';
import StockList from './StockList';
import AddStockModal from './AddStockModal';
import EditStockModal from './EditStockModal';
import toast from 'react-hot-toast';
import '../styles/dashboard.css';

function Dashboard() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);

  // Fetch stocks on mount
  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const fetched = data || [];

      // Apply saved custom order if exists
      try {
        const savedOrder = localStorage.getItem('stock_card_order');
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
    } catch (err) {
      toast.error('Failed to load stocks: ' + (err.message || 'Unknown error'));
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
      localStorage.setItem('stock_card_order', JSON.stringify(orderIds));
    } catch {
      // Ignore
    }
  };

  return (
    <>
      <Header />

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
