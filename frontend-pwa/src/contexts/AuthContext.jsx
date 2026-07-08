import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../services/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // To handle the "skip" functionality, we track an explicit guest mode in local storage
  const [isGuest, setIsGuest] = useState(localStorage.getItem('civora_guest') === 'true');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsGuest(false);
        localStorage.setItem('civora_guest', 'false');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Failed to sign in with Google:", error);
      throw error;
    }
  };

  const loginAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('civora_guest', 'true');
  };

  const logout = async () => {
    await signOut(auth);
    setIsGuest(false);
    localStorage.setItem('civora_guest', 'false');
  };

  const value = {
    user,
    isGuest,
    isAuthenticated: !!user || isGuest,
    loginWithGoogle,
    loginAsGuest,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
