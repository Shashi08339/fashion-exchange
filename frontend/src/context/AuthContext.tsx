// frontend/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:8000/api');
axios.defaults.withCredentials = true;

interface AuthContextType {
  isAuthenticated: boolean;
  userProfile: any | null;
  bootstrapAuthSession: (credentials: any) => Promise<void>;
  terminateAuthSession: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSessionProfile = async () => {
    try {
      const res = await axios.get('/profile/me');
      setUserProfile(res.data.data);
      setIsAuthenticated(true);
    } catch {
      // Clean up local auth state silently if session verification fails
      setUserProfile(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionProfile();
  }, []);

  const bootstrapAuthSession = async (credentials: any) => {
    await axios.post('/auth/login', credentials);
    await fetchSessionProfile();
  };

  const terminateAuthSession = async () => {
    await axios.post('/auth/logout');
    setUserProfile(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userProfile, bootstrapAuthSession, terminateAuthSession, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be called within an AuthProvider scope.');
  return ctx;
};