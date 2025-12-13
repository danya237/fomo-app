# 🚀 FOMO v2.0 - QUICK START (5 MIN)

## ⚡ TL;DR - Get Running in 5 Minutes

### 1️⃣ Clone & Install
```bash
cd "/Users/daraa042/прога апкавже/MovieSwipe"
npm install  # Already done
```

### 2️⃣ Create Firebase Project (2 min)
- Go to https://console.firebase.google.com/
- Click **"Add project"** → name it `fomo-app`
- Skip Google Analytics
- Click **"Create"** (wait 1-2 min)

### 3️⃣ Get Credentials (1 min)
- Go to **⚙️ Project Settings**
- Click **"</> Web"** → **"Register app"**
- Copy the entire `firebaseConfig` object

### 4️⃣ Create `.env.local` (1 min)
Create file: `/Users/daraa042/прога апкавже/MovieSwipe/.env.local`

Paste:
```
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

Replace all `your-project` values from Firebase Console.

### 5️⃣ Enable Firebase Services (1 min)
In Firebase Console:
- **Build → Authentication** → Enable Email/Password
- **Build → Firestore Database** → Create (us-central1)
- **Build → Storage** → Create

### 6️⃣ Start Server
```bash
npx expo start --web --offline
```

Open: http://localhost:8081

### 7️⃣ Test
1. Sign up: `test@example.com` / `Test123456`
2. Should see video feed
3. Try liking a video
4. Done! ✨

---

## 📚 Full Documentation

- **FIREBASE_SETUP.md** - Detailed setup with troubleshooting
- **PROJECT_SUMMARY.md** - Complete technical overview  
- **SPRINT_3_VIDEO_FEED.md** - VideoFeed feature guide
- **FOMO_V2_ARCHITECTURE.md** - Full architecture diagram
- **README.md** - Project overview (coming soon)

---

## 🎯 What's Included

✅ **Backend:**
- Firebase Auth (email/password)
- Firestore (users, clips, watch parties)
- Cloud Storage (avatars)
- Security rules

✅ **Frontend:**
- VideoFeed (TikTok-style)
- Like/unlike functionality
- User profiles
- 6 language support
- Dark/light theme

✅ **Services:**
- YouTube API service (ready)
- TMDb API (movie data)
- Firestore CRUD operations

---

## 🔧 Common Commands

```bash
# Start dev server
npx expo start --web --offline

# Check git history
git log --oneline

# See current branch
git status

# Restart after .env changes
npm start

# Kill port 8081 (if stuck)
lsof -ti:8081 | xargs kill -9
```

---

## ❌ If Something Goes Wrong

**Error: `auth/api-key-not-valid`**
- Double-check API key in `.env.local`
- Restart: `npm start`

**Error: `Firestore not initialized`**
- Create Firestore database in Firebase Console
- Restart server

**Env not loading**
- Ensure `.env.local` in project root
- Restart server

---

## ✅ Success Indicators

When it works:
- ✅ Login page appears
- ✅ Signup creates user in Firebase
- ✅ VideoFeed shows 5 sample videos
- ✅ Like button works instantly
- ✅ No red errors in console

---

## 🎬 Ready?

1. **Setup Firebase** (5 min)
2. **Run server** (`npm start`)
3. **Open browser** (http://localhost:8081)
4. **Sign up** (test@example.com / Test123456)
5. **Enjoy!** 🎉

**Questions?** Check FIREBASE_SETUP.md for detailed guide.

---

**You've got this! 🚀**
