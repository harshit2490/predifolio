import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-card)',
            borderRadius: '12px',
            fontSize: '0.9rem',
            boxShadow: 'var(--shadow-card)',
          },
          success: {
            iconTheme: {
              primary: 'var(--accent)',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--loss)',
              secondary: 'white',
            },
          },
        }}
      />
      {isAuthenticated ? <Dashboard /> : <Login />}
    </>
  );
}

export default App;
