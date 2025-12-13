import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

/**
 * User profile type stored in Firestore
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  language: string;
  theme: 'light' | 'dark';
  createdAt: number;
  likedClipIds: string[];
  watchedClipIds: {[clipId: string]: {watchedAt: number, duration: number}};
  friends: string[];
  blockedUsers: string[];
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Auth methods
  signup: (email: string, password: string, displayName: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider wraps the app and provides authentication context
 * Use inside NavigationContainer (after Firebase is initialized)
 */
export const AuthProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Listen to auth state changes
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Load user profile from Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnapshot = await getDoc(userDocRef);
          
          if (userSnapshot.exists()) {
            setUserProfile(userSnapshot.data() as UserProfile);
          } else {
            console.warn(`User profile not found for ${user.uid}, creating default...`);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  /**
   * Sign up with email and password
   * Creates user in Firebase Auth + Firestore
   */
  const signup = async (email: string, password: string, displayName: string) => {
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || email,
        displayName,
        language: 'en',
        theme: 'dark',
        createdAt: Date.now(),
        likedClipIds: [],
        watchedClipIds: {},
        friends: [],
        blockedUsers: [],
      };

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, newProfile);
      
      setUserProfile(newProfile);
      console.log('✅ User signed up:', user.uid);
      
      return userCredential;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  /**
   * Sign in with email and password
   */
  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ User logged in:', userCredential.user.uid);
      return userCredential;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  /**
   * Sign out
   */
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      console.log('✅ User logged out');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  /**
   * Update user profile in Firestore
   */
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('No authenticated user');
    
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, updates, { merge: true });
      
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
      console.log('✅ Profile updated');
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    isLoading,
    isAuthenticated: !!currentUser,
    signup,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 * Usage: const { currentUser, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
