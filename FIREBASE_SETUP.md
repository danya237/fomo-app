# 🔥 FOMO v2.0 - Firebase Setup Guide

**Problem:** `Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)`

**Solution:** Create real Firebase project and add credentials.

---

## 📋 **STEP 1: Create Firebase Project**

1. Go to https://console.firebase.google.com/
2. Click **"Add project"**
3. Enter project name: `fomo-app` (or any name)
4. Accept terms
5. **Skip Google Analytics** (optional)
6. Click **"Create project"**
7. Wait 1-2 minutes for creation

---

## 🔐 **STEP 2: Get Firebase Credentials**

1. In Firebase Console, click your project
2. Go to **⚙️ Project Settings** (gear icon)
3. Find **"Your apps"** section
4. Click **"</> Web"** (register web app)
5. Enter app nickname: `FOMO Web`
6. Click **"Register app"**
7. Copy the config object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",              // COPY THIS
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

8. **Copy each value** and save somewhere

---

## 📝 **STEP 3: Create .env.local File**

In project root (`/Users/daraa042/прога апкавже/MovieSwipe/`), create `.env.local`:

```bash
# Firebase Config
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...YOUR_API_KEY_FROM_STEP_2
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef...
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Optional: YouTube API (for real video search)
EXPO_PUBLIC_YOUTUBE_API_KEY=AIzaSy...
```

**Important:** 
- Replace all `your-project` with your actual Firebase project ID
- Copy all values exactly from Firebase Console
- DO NOT commit `.env.local` to git (it's in .gitignore)

---

## ✅ **STEP 4: Enable Firebase Services**

### 4a: Enable Authentication

1. In Firebase Console, go to **Build → Authentication**
2. Click **"Get Started"**
3. Click **"Email/Password"**
4. Toggle **"Enable"** → switch to ON
5. Click **"Save"**

### 4b: Create Firestore Database

1. Go to **Build → Firestore Database**
2. Click **"Create database"**
3. Choose region: **us-central1** (or closest to you)
4. Select **"Start in test mode"** (for now)
5. Click **"Create"**
6. Wait for creation (~1 minute)

### 4c: Enable Cloud Storage

1. Go to **Build → Storage**
2. Click **"Get Started"**
3. Accept rules (test mode)
4. Click **"Create"**

---

## 🔗 **STEP 5: Update Environment Variables**

After copying `.env.local`, restart Expo:

```bash
# Kill old server
lsof -ti:8081 | xargs kill -9

# Start new server with fresh env
cd "/Users/daraa042/прога апкавже/MovieSwipe"
npx expo start --web --offline
```

---

## 🧪 **STEP 6: Test Firebase Connection**

### Option A: Test via Web (localhost:8081)

1. Open http://localhost:8081
2. **Sign up:** test@example.com / Test123456 / John Doe
3. **Expected:** 
   - ✅ Account created
   - ✅ Auto-redirect to VideoFeed
   - ✅ No Firebase errors

### Option B: Check Browser Console

1. Open http://localhost:8081
2. Press `F12` → Console tab
3. Look for:
   - ✅ `🔥 Firebase Initializing with project: your-project`
   - ✅ No `auth/api-key-not-valid` errors

### Option C: Check Firebase Console

1. Go to Firebase Console
2. Go to **Build → Firestore Database**
3. Look for new collections:
   - `users` (should have 1 document after signup)
   - Check the document contains your test email

---

## 🚨 **TROUBLESHOOTING**

### Error: `auth/api-key-not-valid`
- ❌ API key is wrong or empty
- ✅ Solution: Copy exact value from Firebase Console Step 2
- ✅ Restart Expo: `npm start`

### Error: `Failed to initialize Cloud Firestore`
- ❌ Firestore not enabled
- ✅ Solution: Complete Step 4b (Create Firestore Database)

### Error: `CORS policy: No 'Access-Control-Allow-Origin'`
- ❌ Firebase project not configured for web
- ✅ Solution: Register web app in Step 2

### Error: `Cannot find module 'firebase'`
- ❌ Firebase package not installed
- ✅ Solution: `npm install firebase` (already done)

### Env vars not loading
- ❌ `.env.local` not in project root
- ✅ Solution: Create file at exact path: `/Users/daraa042/прога апкавже/MovieSwipe/.env.local`
- ✅ Restart Expo after creating file

---

## 📊 **Firebase Limits (Free Tier)**

| Limit | Free | After |
|-------|------|-------|
| Firestore reads | 50K/day | $0.06/100K |
| Firestore writes | 20K/day | $0.18/100K |
| Storage | 5GB | $0.18/GB |
| Auth users | Unlimited | - |
| Cloud Functions | 2M calls/month | $0.40/million |

**For demo:** Completely free ✅

---

## 🎯 **Next Steps After Setup**

1. ✅ Test signup/login
2. ✅ Test like functionality
3. ✅ Check Firestore Console for data
4. ✅ Modify sample clips if needed
5. ✅ Ready for YouTube API integration

---

## 💾 **Security Rules (Firestore)**

After setup is working, update security rules for production:

**Current (test mode):** Anyone can read/write  
**Production:** In Firebase Console → Firestore → Rules tab

Replace with:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Check if user is authenticated
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    match /clips/{clipId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

Then click **"Publish"**

---

## 🆘 **Need Help?**

**Firebase Docs:** https://firebase.google.com/docs/setup/web  
**Console:** https://console.firebase.google.com/  
**Issues:** Check browser console (F12) for error messages  

---

**Status: Ready to connect! 🚀**

Once `.env.local` is set up correctly, app should work perfectly. ✨
