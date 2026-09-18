'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseFirestore } from '@/lib/firebase/config';
import { getHumanAuthErrorMessage } from '@/lib/firebase/errors';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync user profile document in Firestore
  const syncUserProfile = useCallback(async (firebaseUser: User) => {
    const db = getFirebaseFirestore();
    if (!db) return;

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userRef);

      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        createdAt: snap.exists() ? snap.data()?.createdAt : new Date().toISOString(),
      };

      if (!snap.exists()) {
        await setDoc(userRef, {
          ...userProfile,
          updatedAt: new Date().toISOString(),
        });
      }

      setProfile(userProfile);
    } catch (err) {
      console.warn('[AuthProvider] Firestore sync error:', err);
    }
  }, []);

  // Listen to Firebase Auth state change
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncUserProfile]);

  const clearError = () => setError(null);

  const registerWithEmail = async (email: string, pass: string, name?: string) => {
    setError(null);
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase Auth belum terkonfigurasi pada environment ini.');
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (name && cred.user) {
        await updateProfile(cred.user, { displayName: name });
      }
      await syncUserProfile(cred.user);
    } catch (err: any) {
      const humanMsg = getHumanAuthErrorMessage(err.code || '');
      setError(humanMsg);
      throw new Error(humanMsg);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setError(null);
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase Auth belum terkonfigurasi pada environment ini.');
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      await syncUserProfile(cred.user);
    } catch (err: any) {
      const humanMsg = getHumanAuthErrorMessage(err.code || '');
      setError(humanMsg);
      throw new Error(humanMsg);
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase Auth belum terkonfigurasi pada environment ini.');
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      await syncUserProfile(cred.user);
    } catch (err: any) {
      const humanMsg = getHumanAuthErrorMessage(err.code || '');
      setError(humanMsg);
      throw new Error(humanMsg);
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase Auth belum terkonfigurasi.');
    }

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      const humanMsg = getHumanAuthErrorMessage(err.code || '');
      setError(humanMsg);
      throw new Error(humanMsg);
    }
  };

  const logout = async () => {
    setError(null);
    const auth = getFirebaseAuth();
    if (!auth) {
      setUser(null);
      setProfile(null);
      return;
    }

    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (err: any) {
      const humanMsg = getHumanAuthErrorMessage(err.code || '');
      setError(humanMsg);
      throw new Error(humanMsg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isLoading: loading,
        error,
        registerWithEmail,
        loginWithEmail,
        loginWithGoogle,
        resetPassword,
        logout,
        clearError,
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
