import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api/auth'; // your updated getMe()
import Storage from '../utils/storage';

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  org?: string;
  phone?: string;
  kycStatus?: 'not_started' | 'pending' | 'manual_review' | 'verified' | 'failed';
  digitalIdStatus?: 'not_generated' | 'generated';
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  user: null,
  setUser: () => {},
  loading: true,
  refreshUser: async () => {},
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      setLoading(true);
      const currentUser = await getMe(); // fetch current user info using stored token
      if (currentUser) {
        setUser(currentUser);
        await Storage.setItem('user', JSON.stringify(currentUser));
      } else {
        setUser(null);
        await Storage.removeItem('user');
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setUser(null);
      await Storage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const stored = await Storage.getItem('user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
      await refreshUser();
    };
    loadUser();
  }, []);

  return (
    <AppContext.Provider value={{ user, setUser, loading, refreshUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
