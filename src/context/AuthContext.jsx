import { createContext, useContext, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('stock_auth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('stock_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = async (username, password) => {
    const cleanUser = username?.trim();
    if (!cleanUser || !password) {
      return { success: false, error: 'Username and password are required' };
    }

    try {
      // Query app_users table in Supabase
      const { data, error } = await supabase
        .from('app_users')
        .select('id, username, role')
        .eq('username', cleanUser)
        .eq('password', password)
        .maybeSingle();

      if (error) {
        // Fallback check if user hasn't run the SQL query in Supabase yet
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          if (cleanUser === 'admin' && password === 'Harshit2490@') {
            setIsAuthenticated(true);
            sessionStorage.setItem('stock_auth', 'true');
            sessionStorage.setItem('stock_user', JSON.stringify({ username: 'admin', role: 'admin' }));
            return { success: true };
          }
          return {
            success: false,
            error: 'Table "app_users" not found in Supabase. Please run the SQL schema.'
          };
        }
        return { success: false, error: error.message || 'Login failed' };
      }

      if (data) {
        setIsAuthenticated(true);
        setCurrentUser(data);
        sessionStorage.setItem('stock_auth', 'true');
        sessionStorage.setItem('stock_user', JSON.stringify(data));
        return { success: true, user: data };
      }

      return { success: false, error: 'Invalid username or password' };
    } catch (err) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    sessionStorage.removeItem('stock_auth');
    sessionStorage.removeItem('stock_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
