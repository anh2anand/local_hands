// client/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';
import { translations } from '../translations';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState('customer'); // 'customer' | 'worker' | 'admin'
  const [workerProfile, setWorkerProfile] = useState(null);
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en'); // 'en' | 'hi'

  const t = translations[language] || translations.en;

  // Load demo accounts & set default user (Anita Sharma - Customer)
  useEffect(() => {
    loadDemoAccounts();
  }, []);

  const loadDemoAccounts = async () => {
    try {
      const res = await api.getDemoUsers();
      if (res && res.demo_accounts) {
        setDemoAccounts(res.demo_accounts);
        // Default to Anita Sharma (Customer) if no user stored
        const defaultAccount = res.demo_accounts[0];
        if (defaultAccount && !currentUser) {
          await switchPersona(defaultAccount);
        }
      }
    } catch (err) {
      console.error("Failed to load demo accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  const switchPersona = async (account) => {
    setLoading(true);
    try {
      if (account.role === 'admin') {
        const res = await api.adminLogin({ mobile: account.mobile, otp: '1234' });
        if (res.success) {
          setCurrentUser(res.user);
          setCurrentRole('admin');
          setWorkerProfile(null);
        }
      } else {
        const res = await api.verifyOtp(account.mobile, '1234', account.role);
        if (res.success) {
          setCurrentUser(res.user);
          setCurrentRole(account.role);
          if (account.role === 'worker') {
            // Fetch fresh worker profile
            if (account.worker_id) {
              const wRes = await api.getWorker(account.worker_id);
              setWorkerProfile(wRes.worker);
            } else if (res.worker_profile) {
              setWorkerProfile(res.worker_profile);
            }
          } else {
            setWorkerProfile(null);
          }
        }
      }
    } catch (err) {
      console.error("Error switching persona:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshWorkerProfile = async () => {
    if (workerProfile?.id) {
      try {
        const wRes = await api.getWorker(workerProfile.id);
        if (wRes?.worker) setWorkerProfile(wRes.worker);
      } catch (err) {
        console.error("Error refreshing worker profile:", err);
      }
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole('customer');
    setWorkerProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        workerProfile,
        demoAccounts,
        loading,
        language,
        setLanguage,
        t,
        switchPersona,
        refreshWorkerProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
