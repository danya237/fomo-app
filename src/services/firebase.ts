import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * FOMO v2.0 Firebase Configuration
 *
 * ⚠️ IMPORTANT: Replace with your actual Firebase credentials
 * Get it from: https://console.firebase.google.com/
 *
 * Steps:
 * 1. Create a new Firebase project
 * 2. Go to Project Settings
 * 3. Copy your config values
 * 4. Update .env.local with EXPO_PUBLIC_FIREBASE_* vars
 */
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDemoKeyPlaceholder123456789',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'fomo-demo.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'fomo-demo',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'fomo-demo.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef123456',
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || 'https://fomo-demo.firebaseio.com',
};

console.log('🔥 Firebase Initializing with project:', firebaseConfig.projectId);

// Initialize Firebase App
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Authentication with persistence
const auth: Auth = getAuth(app);

// Initialize Firestore
const db: Firestore = getFirestore(app);

// Initialize Realtime Database
const realtimeDb: Database = getDatabase(app);

// Initialize Cloud Storage
const storage: FirebaseStorage = getStorage(app);

// Initialize Cloud Functions
const functions: Functions = getFunctions(app);

export { app, auth, db, realtimeDb, storage, functions };
