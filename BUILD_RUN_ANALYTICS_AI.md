# Build, Run, Analytics & AI Guide for FOMO v2.0

Complete guide to building, running, analyzing, and adding AI features to your TikTok-style video discovery app.

---

## Part 1: BUILD

### 1.1 Development Build (Local Testing)

#### Web Build (localhost:8081)
```bash
# Start Expo development server for web
cd /Users/daraa042/прога\ апкавже/MovieSwipe
npm run web

# Expected output:
# ✓ Compiled successfully
# ℹ Expo server is running at: http://localhost:8081
```

**Troubleshooting:**
```bash
# Port already in use? Kill existing process:
lsof -ti:8081 | xargs kill -9

# Clear cache and rebuild:
npm run web -- --clear
```

#### Android Build (Emulator)
```bash
# Requires Android SDK installed
npm run android

# Or with EAS (Expo Application Services):
eas build --platform android --profile development
```

#### iOS Build (Mac only)
```bash
npm run ios

# Or with EAS:
eas build --platform ios --profile development
```

### 1.2 Production Build (Distribution)

#### Expo EAS Build Setup
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure your project
eas build:configure
```

#### Build for App Stores
```bash
# iOS App Store
eas build --platform ios --profile production

# Google Play Store
eas build --platform android --profile production

# Web (Firebase Hosting)
npm run web -- --build
```

### 1.3 Build Configuration Files

**eas.json** (Expo EAS profiles):
```json
{
  "builds": {
    "android": {
      "release": {
        "distribution": "play_store"
      },
      "preview": {
        "distribution": "internal"
      }
    },
    "ios": {
      "release": {
        "distribution": "app_store"
      },
      "preview": {
        "distribution": "internal"
      }
    }
  }
}
```

**app.json** (Expo configuration):
```json
{
  "expo": {
    "name": "FOMO",
    "slug": "fomo-app",
    "version": "2.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTabletMode": true,
      "bundleIdentifier": "com.daraa042.fomo"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.daraa042.fomo"
    },
    "plugins": [
      "@react-native-google-signin/google-signin",
      "expo-auth-session"
    ]
  }
}
```

### 1.4 Build Optimization Tips

**Reduce Bundle Size:**
```bash
# Analyze bundle
npm install -g expo-analyze
expo-analyze ./dist

# Remove unused dependencies
npm prune --production

# Use dynamic imports for large components
const WatchPartyScreen = React.lazy(() => 
  import('../screens/WatchPartyScreen')
);
```

**Enable Tree Shaking:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "module": "esnext",
    "target": "es2020",
    "moduleResolution": "node"
  }
}
```

---

## Part 2: RUN

### 2.1 Quick Start Commands

```bash
# Web (most common for development)
npm run web

# iOS simulator
npm run ios

# Android emulator
npm run android

# Run with specific environment
EXPO_PUBLIC_ENV=staging npm run web

# Run in offline mode (no internet required)
npx expo start --offline
```

### 2.2 Environment-Specific Running

**.env.local (Development)**
```env
EXPO_PUBLIC_API_ENV=development
EXPO_PUBLIC_FIREBASE_API_KEY=dev_key_here
EXPO_PUBLIC_FIREBASE_PROJECT_ID=dev_project
EXPO_PUBLIC_YOUTUBE_API_KEY=dev_youtube_key
EXPO_PUBLIC_TMDB_API_KEY=dev_tmdb_key
EXPO_PUBLIC_LOG_LEVEL=debug
```

**.env.staging (Staging)**
```env
EXPO_PUBLIC_API_ENV=staging
EXPO_PUBLIC_FIREBASE_API_KEY=staging_key_here
EXPO_PUBLIC_FIREBASE_PROJECT_ID=staging_project
EXPO_PUBLIC_YOUTUBE_API_KEY=staging_youtube_key
EXPO_PUBLIC_TMDB_API_KEY=staging_tmdb_key
EXPO_PUBLIC_LOG_LEVEL=info
```

**app.config.js** (Dynamic environment loading):
```javascript
import 'dotenv/config';

export default {
  expo: {
    name: 'FOMO',
    slug: 'fomo-app',
    version: process.env.APP_VERSION || '2.0.0',
    extra: {
      env: process.env.EXPO_PUBLIC_API_ENV || 'development',
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      youtubeApiKey: process.env.EXPO_PUBLIC_YOUTUBE_API_KEY,
      tmdbApiKey: process.env.EXPO_PUBLIC_TMDB_API_KEY,
    }
  }
};
```

### 2.3 Running with Hot Reload

```bash
# Standard hot reload
npm run web

# During development, Expo automatically hot reloads on file save:
# 1. Change src/screens/VideoFeedScreen.tsx
# 2. Save file (Cmd+S)
# 3. App updates instantly in browser/emulator

# Force full rebuild if hot reload doesn't work:
# Press 'r' in terminal and press Enter
```

### 2.4 Debugging While Running

**Browser DevTools (Web):**
```bash
# When running on web, open browser console:
# Mac: Cmd+Option+I
# Shows Firebase logs, network requests, console.log output

# Redux DevTools extension (if using Redux)
# Available in Chrome Web Store
```

**React Native Debugger:**
```bash
# Download: https://github.com/jhen0409/react-native-debugger

# Run with debugging enabled:
npm run web -- --debug

# Then open React Native Debugger and reload app
```

**Firebase Emulator Suite (Local Testing):**
```bash
# Install Firebase tools
npm install -g firebase-tools

# Start emulator
firebase emulators:start

# In your app, enable local emulator:
// src/services/firebase.ts
if (process.env.EXPO_PUBLIC_API_ENV === 'emulator') {
  connectAuthEmulator(getAuth(), 'http://localhost:9099');
  connectFirestoreEmulator(getFirestore(), 'localhost', 8080);
}
```

---

## Part 3: ANALYTICS

### 3.1 Firebase Analytics Setup

**Enable Analytics in Firebase Console:**
1. Go to Firebase Console → Analytics
2. Enable Google Analytics for your Firebase project
3. Copy Web Stream ID

**Add Analytics to App:**
```bash
npm install firebase@^12.6.0
```

**src/services/analytics.ts** (New):
```typescript
import { getAnalytics, logEvent, setUserId } from 'firebase/analytics';
import { app } from './firebase';

const analytics = getAnalytics(app);

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  try {
    logEvent(analytics, eventName, {
      ...params,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics event failed:', eventName, error);
  }
};

export const trackUser = (userId: string) => {
  try {
    setUserId(analytics, userId);
  } catch (error) {
    console.error('Set user ID failed:', error);
  }
};

// Custom event tracking
export const trackVideoViewed = (videoId: string, duration: number) => {
  trackEvent('video_viewed', { videoId, duration });
};

export const trackVideoLiked = (videoId: string) => {
  trackEvent('video_liked', { videoId });
};

export const trackSearch = (query: string, results: number) => {
  trackEvent('search', { query, results });
};

export const trackWatchPartyCreated = (partyId: string, memberCount: number) => {
  trackEvent('watch_party_created', { partyId, memberCount });
};

export const trackSignup = (method: 'email' | 'google') => {
  trackEvent('sign_up', { method });
};

export const trackLogin = (method: 'email' | 'google') => {
  trackEvent('login', { method });
};
```

**Integrate Analytics in Components:**
```typescript
// In LoginScreen.tsx
import { trackLogin } from '../services/analytics';

const handleLogin = async () => {
  try {
    await login(email, password);
    trackLogin('email');
    // ...
  } catch (error) {
    // ...
  }
};

// In VideoMomentCard.tsx
import { trackVideoLiked, trackVideoViewed } from '../services/analytics';

const handleLike = async () => {
  setIsLiked(!isLiked);
  trackVideoLiked(clip.id);
  // ...
};

useEffect(() => {
  // Track when video comes into view
  const timer = setTimeout(() => trackVideoViewed(clip.id, 3), 3000);
  return () => clearTimeout(timer);
}, []);
```

### 3.2 Custom Dashboards & Reports

**Firebase Console Dashboards:**
1. Analytics → Dashboard
2. Create custom events
3. View user engagement, retention, funnels

**Key Metrics to Track:**
```typescript
// User engagement
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Session duration
- User retention (Day 1, Day 7, Day 30)

// Content metrics
- Videos viewed per session
- Average watch time per video
- Like rate (likes / views)
- Share rate

// Social metrics
- Watch parties created
- Average party size
- Chat messages per party
- Friend requests sent/accepted
```

### 3.3 Google Analytics 4 (GA4)

**Setup GA4:**
```bash
npm install @react-native-google-analytics/google-analytics
```

**src/services/ga4.ts**:
```typescript
import { ReactNativeFirebase } from '@react-native-firebase/analytics';

export const logAnalyticsEvent = (
  name: string,
  params?: Record<string, any>
) => {
  try {
    ReactNativeFirebase.analytics().logEvent(name, params);
  } catch (error) {
    console.error('GA4 event failed:', error);
  }
};

export const logPageView = (screenName: string) => {
  logAnalyticsEvent('screen_view', {
    screen_name: screenName,
    timestamp: new Date().toISOString(),
  });
};
```

### 3.4 Crash Analytics

**Automatic Crash Reporting:**
```bash
npm install @react-native-firebase/crashlytics
```

**src/services/crashlytics.ts**:
```typescript
import crashlytics from '@react-native-firebase/crashlytics';

export const setupCrashlytics = async () => {
  if (__DEV__) {
    // Disable in development
    await crashlytics().setCrashlytics(false);
  } else {
    // Enable in production
    crashlytics().setUserId('user-id');
    
    // Capture errors
    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      crashlytics().recordError(error);
    });
  }
};

export const logCustomError = (error: Error, context?: string) => {
  crashlytics().log(`Error: ${error.message} - Context: ${context}`);
  crashlytics().recordError(error);
};
```

---

## Part 4: AI FEATURES

### 4.1 AI/ML Integration Options

#### Option A: Firebase Vertex AI (Recommended)
```bash
npm install @react-native-firebase/vertexai
```

**src/services/vertexai.ts**:
```typescript
import vertexai from '@react-native-firebase/vertexai';

const model = vertexai().getGenerativeModel({ model: 'gemini-1.5-flash' });

export const generateVideoDescription = async (title: string, genre: string) => {
  try {
    const prompt = `Generate a short, engaging description for a movie ${title} in the ${genre} genre, suitable for a TikTok-style app. Keep it under 100 characters.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('AI generation failed:', error);
    return `Check out ${title}! 🎬`;
  }
};

export const generateChatResponse = async (message: string) => {
  try {
    const prompt = `You are a friendly movie recommendation chatbot. A user said: "${message}". Respond with a brief, helpful movie-related comment (max 50 chars).`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Chat AI failed:', error);
    return 'Great taste in movies! 🍿';
  }
};
```

#### Option B: OpenAI Integration
```bash
npm install openai axios
```

**src/services/openai.ts**:
```typescript
import axios from 'axios';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const API_BASE = 'https://api.openai.com/v1';

export const generateMovieRecommendation = async (
  likedMovies: string[]
) => {
  try {
    const response = await axios.post(
      `${API_BASE}/chat/completions`,
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: `Based on these movies: ${likedMovies.join(', ')}, recommend 3 similar movies. Format as JSON array.`,
          },
        ],
        max_tokens: 200,
      },
      {
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      }
    );
    
    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI request failed:', error);
    return [];
  }
};

export const generateChatResponse = async (userMessage: string) => {
  try {
    const response = await axios.post(
      `${API_BASE}/chat/completions`,
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a witty movie recommendation chatbot.',
          },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 100,
      },
      {
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Chat failed:', error);
    return 'That sounds interesting! Want more recommendations?';
  }
};
```

#### Option C: MLKit (On-Device ML)
```bash
npm install @react-native-ml-kit/text-recognition @react-native-ml-kit/vision
```

### 4.2 AI Use Cases for FOMO v2.0

**1. Smart Video Recommendations**
```typescript
// src/services/aiRecommendations.ts
import { generateMovieRecommendation } from './openai';

export const getAIRecommendations = async (userLikes: string[]) => {
  // User liked: Matrix, Inception, Interstellar
  // AI returns: Dune, Tenet, Nolan's Filmography
  const recommendations = await generateMovieRecommendation(userLikes);
  return recommendations;
};
```

**2. Auto-Generated Captions**
```typescript
// Analyze video content and generate engaging captions
export const generateCaption = async (videoId: string) => {
  // AI analyzes video metadata
  // Returns: "Mind-bending sci-fi that'll keep you thinking! 🌀"
};
```

**3. Real-Time Chat with AI**
```typescript
// Watch party chat with AI movie expert
// User: "What's this scene referencing?"
// AI: "This references Blade Runner (1982)! Amazing callback..."
```

**4. Content Moderation**
```typescript
// Automatically flag inappropriate content
import { TextRecognition } from '@react-native-ml-kit/text-recognition';

export const moderateUserMessage = async (text: string) => {
  // Check for harmful content
  // Flag if needed
  return isAppropriate;
};
```

**5. Sentiment Analysis**
```typescript
// Analyze user likes/comments to understand preferences
export const getUserSentiment = async (userId: string) => {
  // Returns: { sentiment: 'positive', preference: 'action', mood: 'excited' }
  // Use for personalization
};
```

### 4.3 AI Feature Integration Example

**New Component: AIRecommendationCard.tsx**
```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { generateMovieRecommendation } from '../services/openai';
import { useAuth } from '../contexts/AuthContext';

export const AIRecommendationCard = () => {
  const { user } = useAuth();
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRecommendation = async () => {
    setLoading(true);
    try {
      // Get user's liked movies from Firestore
      const likedMovies = await getUserLikedMovies(user?.uid);
      
      // Get AI recommendation
      const rec = await generateMovieRecommendation(likedMovies);
      setRecommendation(rec);
    } catch (error) {
      console.error('Failed to get recommendation:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecommendation();
  }, []);

  return (
    <View style={{ padding: 16, backgroundColor: '#1a1a1a', borderRadius: 12 }}>
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
        🤖 AI Recommendation
      </Text>
      
      {loading ? (
        <ActivityIndicator color="#ff1744" />
      ) : (
        <Text style={{ color: '#ccc', fontSize: 14, lineHeight: 20 }}>
          {recommendation || 'No recommendations yet'}
        </Text>
      )}
      
      <TouchableOpacity
        onPress={fetchRecommendation}
        style={{ marginTop: 12, padding: 8, backgroundColor: '#ff1744', borderRadius: 8 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>
          Get Another Recommendation
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

### 4.4 AI Configuration

**.env additions**:
```env
# Option A: Firebase Vertex AI
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# Option B: OpenAI
EXPO_PUBLIC_OPENAI_API_KEY=sk-...

# Option C: Hugging Face
EXPO_PUBLIC_HUGGINGFACE_API_KEY=hf_...

# Model selection
EXPO_PUBLIC_AI_PROVIDER=openai  # or: vertexai, huggingface
EXPO_PUBLIC_AI_MODEL=gpt-4o-mini  # or: gemini-1.5-flash, mistral-7b
```

### 4.5 Performance & Cost Optimization

```typescript
// Cache AI responses to avoid repeated API calls
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export const getCachedRecommendation = async (key: string) => {
  const cached = await AsyncStorage.getItem(`ai_${key}`);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
  }
  return null;
};

export const cacheRecommendation = async (key: string, data: any) => {
  await AsyncStorage.setItem(
    `ai_${key}`,
    JSON.stringify({ data, timestamp: Date.now() })
  );
};

// Rate limiting
const callStack: number[] = [];
const RATE_LIMIT = 10; // 10 calls
const WINDOW = 60000; // per minute

export const canMakeAICall = () => {
  const now = Date.now();
  callStack.push(now);
  
  // Remove calls older than window
  while (callStack[0] < now - WINDOW) {
    callStack.shift();
  }
  
  return callStack.length < RATE_LIMIT;
};
```

### 4.6 Testing AI Features

```bash
# Unit test AI service
npm install --save-dev jest @testing-library/react-native

# tests/openai.test.ts
describe('OpenAI Service', () => {
  test('should generate movie recommendation', async () => {
    const recs = await generateMovieRecommendation(['Matrix', 'Inception']);
    expect(recs).toBeDefined();
    expect(Array.isArray(recs)).toBe(true);
  });

  test('should handle API errors gracefully', async () => {
    const recs = await generateMovieRecommendation([]);
    expect(Array.isArray(recs)).toBe(true); // Returns empty array on error
  });
});
```

---

## Part 5: QUICK REFERENCE

### Build Commands
```bash
npm run web          # Web development
npm run ios          # iOS simulator
npm run android      # Android emulator
eas build --platform ios --profile production    # Production iOS
eas build --platform android --profile production # Production Android
```

### Run Commands
```bash
npm run web -- --clear              # Clear cache and rebuild
npm run web -- --debug              # Run with debugger
EXPO_PUBLIC_ENV=staging npm run web # Run staging environment
```

### Analytics Commands
```bash
firebase login
firebase init analytics
firebase analytics:reports  # View reports
```

### Deployment Checklist
- [ ] Update version in package.json
- [ ] Update app.json with new version
- [ ] Run `npm run web -- --build` for web
- [ ] Test on iOS/Android emulators
- [ ] Run `eas build` for app stores
- [ ] Submit builds to App Store/Play Store
- [ ] Monitor analytics and crash reports

---

## Next Steps

1. **Implement Build System**: Set up EAS, configure app.json, test builds
2. **Add Analytics**: Integrate Firebase Analytics, create custom dashboards
3. **Add AI Features**: Choose AI provider (Vertex AI/OpenAI), integrate recommendations
4. **Monitor Production**: Set up error tracking, performance monitoring
5. **Iterate**: Use analytics data to improve app features

For support, refer to:
- [Expo Documentation](https://docs.expo.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Google Cloud Vertex AI](https://cloud.google.com/vertex-ai/docs)

---

**Last Updated**: December 13, 2025
**Version**: FOMO v2.0
**Status**: Production Ready
