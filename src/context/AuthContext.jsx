import { createContext, useContext, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return (
      localStorage.getItem('stock_auth') === 'true' ||
      sessionStorage.getItem('stock_auth') === 'true'
    );
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved =
        localStorage.getItem('stock_user') ||
        sessionStorage.getItem('stock_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = async (identifier, password) => {
    const cleanInput = identifier?.trim();
    if (!cleanInput || !password) {
      return { success: false, error: 'Username/Email and password are required' };
    }

    try {
      // Query app_users table in Supabase - support login by username or email
      const isEmail = cleanInput.includes('@');
      let query = supabase.from('app_users').select('id, name, username, email, role');
      if (isEmail) {
        query = query.ilike('email', cleanInput);
      } else {
        query = query.ilike('username', cleanInput);
      }

      const { data, error } = await query.eq('password', password).maybeSingle();

      if (error) {
        // Fallback check if user hasn't run the SQL query in Supabase yet
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          if (cleanInput.toLowerCase() === 'admin' && password === 'Harshit2490@') {
            const adminData = {
              id: 'admin-default',
              name: 'Harshit',
              username: 'admin',
              email: 'admin@stockcalci.com',
              role: 'admin',
            };
            setIsAuthenticated(true);
            setCurrentUser(adminData);
            localStorage.setItem('stock_auth', 'true');
            localStorage.setItem('stock_user', JSON.stringify(adminData));
            return { success: true, user: adminData };
          }
          return {
            success: false,
            error: 'Table "app_users" not found in Supabase. Please run the SQL schema.',
          };
        }
        return { success: false, error: error.message || 'Login failed' };
      }

      if (data) {
        setIsAuthenticated(true);
        setCurrentUser(data);
        localStorage.setItem('stock_auth', 'true');
        localStorage.setItem('stock_user', JSON.stringify(data));
        sessionStorage.removeItem('stock_auth');
        sessionStorage.removeItem('stock_user');
        return { success: true, user: data };
      }

      return { success: false, error: 'Invalid username or password' };
    } catch (err) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  };

  const signup = async ({ name, username, email, password }) => {
    const cleanName = name?.trim();
    const cleanUser = username?.trim().toLowerCase();
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanName) return { success: false, error: 'Full name is required' };
    if (!cleanUser || cleanUser.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUser)) {
      return {
        success: false,
        error: 'Username can only contain letters, numbers, and underscores',
      };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    try {
      // Check if username is already taken
      const { data: existingUser } = await supabase
        .from('app_users')
        .select('username')
        .ilike('username', cleanUser)
        .maybeSingle();

      if (existingUser) {
        return { success: false, error: `Username "@${cleanUser}" is already taken` };
      }

      // Check if email is already registered
      const { data: existingEmail } = await supabase
        .from('app_users')
        .select('email')
        .ilike('email', cleanEmail)
        .maybeSingle();

      if (existingEmail) {
        return { success: false, error: `Email "${cleanEmail}" is already registered` };
      }

      // Insert new user
      const { data, error } = await supabase
        .from('app_users')
        .insert([
          {
            name: cleanName,
            username: cleanUser,
            email: cleanEmail,
            password: password,
            role: 'user',
          },
        ])
        .select('id, name, username, email, role')
        .single();

      if (error) {
        return { success: false, error: error.message || 'Failed to create account' };
      }

      setIsAuthenticated(true);
      setCurrentUser(data);
      localStorage.setItem('stock_auth', 'true');
      localStorage.setItem('stock_user', JSON.stringify(data));
      sessionStorage.removeItem('stock_auth');
      sessionStorage.removeItem('stock_user');

      return { success: true, user: data };
    } catch (err) {
      return { success: false, error: err.message || 'Network error during signup' };
    }
  };

  const updateProfile = async ({ name, email, currentPassword, newPassword }) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    const cleanName = name?.trim();
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanName) return { success: false, error: 'Full name cannot be empty' };
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    try {
      // If changing password, verify current password first
      if (newPassword) {
        if (!currentPassword) {
          return {
            success: false,
            error: 'Current password is required to set a new password',
          };
        }
        if (newPassword.length < 6) {
          return { success: false, error: 'New password must be at least 6 characters' };
        }

        const { data: verifyUser } = await supabase
          .from('app_users')
          .select('id')
          .eq('id', currentUser.id)
          .eq('password', currentPassword)
          .maybeSingle();

        if (!verifyUser) {
          return { success: false, error: 'Current password is incorrect' };
        }
      }

      // Check if new email is taken by another account
      if (cleanEmail !== currentUser.email?.toLowerCase()) {
        const { data: existingEmail } = await supabase
          .from('app_users')
          .select('id')
          .ilike('email', cleanEmail)
          .neq('id', currentUser.id)
          .maybeSingle();

        if (existingEmail) {
          return { success: false, error: 'This email is already in use by another account' };
        }
      }

      const updates = {
        name: cleanName,
        email: cleanEmail,
        updated_at: new Date().toISOString(),
      };
      if (newPassword) {
        updates.password = newPassword;
      }

      const { data, error } = await supabase
        .from('app_users')
        .update(updates)
        .eq('id', currentUser.id)
        .select('id, name, username, email, role')
        .single();

      if (error) {
        return { success: false, error: error.message || 'Failed to update profile' };
      }

      setCurrentUser(data);
      localStorage.setItem('stock_user', JSON.stringify(data));
      return { success: true, user: data };
    } catch (err) {
      return { success: false, error: err.message || 'Error updating profile' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('stock_auth');
    localStorage.removeItem('stock_user');
    sessionStorage.removeItem('stock_auth');
    sessionStorage.removeItem('stock_user');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        signup,
        updateProfile,
        logout,
      }}
    >
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
