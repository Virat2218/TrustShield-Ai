import { createContext, useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { loginUser, registerUser, getProfile } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('trustshield_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('trustshield_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      if (token) {
        try {
          const profile = await getProfile();
          setUser(profile);
          localStorage.setItem('trustshield_user', JSON.stringify(profile));
        } catch (err) {
          // Only clear session if token is explicitly rejected (401/403)
          // Do not log out on temporary network disconnection or server restart
          if (err?.response?.status === 401 || err?.response?.status === 403) {
            logout();
          }
        }
      }
      setLoading(false);
    }
    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    const data = await loginUser({ email, password });
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('trustshield_token', data.access_token);
    localStorage.setItem('trustshield_user', JSON.stringify(data.user));
    return data.user;
  };

  const register = async (email, password, fullName) => {
    const data = await registerUser({ email, password, full_name: fullName });
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('trustshield_token', data.access_token);
    localStorage.setItem('trustshield_user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('trustshield_token');
    localStorage.removeItem('trustshield_user');
  };

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem('trustshield_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.is_admin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

