# 🎬 FOMO v2.0 — TikTok × IMDb × Watch Party

**Концепт:** Вертикальний відеофід з популярними моментами фільмів, як TikTok. Друзі можуть дивитися одночасно й переписуватися в реал-тайме.

**Статус:** v1.0 saved (Git: c648880). Starting v2.0 architecture.

---

## 🏗️ СИСТЕМА АРХІТЕКТУРИ

### 1️⃣ **API STACK**

```
┌─────────────────────────────────────────────────────────┐
│ FRONTEND (React Native + Expo)                          │
│  - HomeScreen (VideoFeed)                               │
│  - WatchPartyRoom (split video + chat)                  │
│  - AuthFlow (Login/Signup)                              │
│  - FriendsSystem                                        │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ BACKEND SERVICES                                        │
├─ Firebase Firestore (main DB)                           │
├─ Firebase Realtime DB (live sync)                       │
├─ Firebase Auth (email + Google OAuth)                   │
├─ Firebase Storage (avatars, thumbnails)                │
├─ Cloud Functions (async YouTube sync)                  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ EXTERNAL APIs                                           │
├─ TMDb API (movie metadata)                              │
├─ YouTube Data API v3 (shorts search)                    │
└─ Google OAuth 2.0 (authentication)                      │
└─────────────────────────────────────────────────────────┘
```

---

### 2️⃣ **FIREBASE СТРУКТУРА**

#### **Firestore Collections:**

```typescript
// users/
users/{uid}
├─ name: string
├─ email: string
├─ avatar: string (Storage URL)
├─ bio: string
├─ createdAt: Timestamp
├─ likedClipIds: string[] (array of clip IDs)
├─ watchedClipIds: { clipId: {watchedAt, duration} }
├─ friends: string[] (array of friend UIDs)
├─ blockedUsers: string[]
└─ settings: {language, theme, notifications}

// clips/
clips/{clipId}
├─ movieId: number (TMDb ID)
├─ title: string (movie title)
├─ description: string (clip description)
├─ videoUrl: string (YouTube embed URL)
├─ videoId: string (YouTube video ID)
├─ thumbnailUrl: string
├─ duration: number (seconds)
├─ source: enum (youtube|tiktok|custom)
├─ likes: number
├─ views: number
├─ createdAt: Timestamp
└─ genre: string[] (from TMDb)

// watchParties/
watchParties/{roomId}
├─ creatorId: string (UID)
├─ title: string
├─ description: string
├─ members: string[] (array of UIDs)
├─ currentClipId: string (playing now)
├─ playbackTime: number (seconds)
├─ isPlaying: boolean
├─ playlist: string[] (clip IDs to play)
├─ createdAt: Timestamp
├─ updatedAt: Timestamp
└─ isPublic: boolean

// messages/ (in watch party rooms)
messages/{messageId}
├─ roomId: string (reference)
├─ userId: string (UID)
├─ text: string
├─ timestamp: Timestamp
├─ reactions: {emoji: [uid1, uid2]} (emoji reactions)
├─ isDeleted: boolean
└─ editedAt: Timestamp (if edited)

// friendRequests/
friendRequests/{requestId}
├─ fromId: string
├─ toId: string
├─ status: enum (pending|accepted|declined)
├─ createdAt: Timestamp
└─ respondedAt: Timestamp
```

---

### 3️⃣ **YOUTUBE API INTEGRATION**

#### **Quota Strategy:**
- **YouTube API free tier:** 10,000 credits/day
- **Per query cost:** ~100 credits
- **Caching:** Results cached in Firestore for 7 days
- **Rate limit:** 1 search per 5 seconds (frontend), batch jobs (backend)

#### **Cloud Function (YouTube Sync Job):**

```typescript
// Cloud Function: sync popular movie shorts daily
export const syncPopularMovieShorts = functions
  .pubsub
  .schedule('0 2 * * *') // Run daily at 2 AM
  .timeZone('UTC')
  .onRun(async (context) => {
    // 1. Get top 100 movies from TMDb
    const topMovies = await tmdb.getTopMovies(100);
    
    // 2. For each movie, search YouTube shorts
    for (const movie of topMovies) {
      const shorts = await youtube.searchShorts(
        `${movie.title} scene highlights`,
        1 // Get top 1 short per movie
      );
      
      if (shorts.length > 0) {
        // 3. Store in Firestore
        await firestore.collection('clips').add({
          movieId: movie.id,
          title: movie.title,
          videoId: shorts[0].id,
          videoUrl: shorts[0].embeddableUrl,
          source: 'youtube',
          createdAt: FieldValue.serverTimestamp(),
        });
      }
    }
    
    return { processed: topMovies.length };
  });
```

---

### 4️⃣ **AUTHENTICATION FLOW**

```
User visits app
    ↓
[LoginScreen]
├─ Email/Password login
├─ Signup button → [SignupScreen]
│  ├─ Email, Password, Name
│  ├─ Avatar upload
│  └─ Create user in Firebase Auth + Firestore
└─ Google OAuth button
   └─ Opens Google sign-in → Firebase Auth

After login:
    ↓
[HomeScreen - VideoFeed]
    ↓
Tab navigation: Home | Liked | Friends | Watch Party | Settings
```

#### **Implementation (React Native):**

```typescript
// src/screens/LoginScreen.tsx
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider } from 'firebase/auth';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = getAuth();
  
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Navigate to HomeScreen
      navigation.reset({ routes: [{ name: 'Home' }] });
    } catch (error) {
      Alert.alert('Login failed', error.message);
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      // Use expo-google-app-auth or @react-native-google-signin/google-signin
      const idToken = await getGoogleIdToken(); // From native SDK
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
      navigation.reset({ routes: [{ name: 'Home' }] });
    } catch (error) {
      Alert.alert('Google sign-in failed', error.message);
    }
  };
  
  return (
    <ScrollView style={{backgroundColor: colors.background}}>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Login with Google" onPress={handleGoogleSignIn} />
    </ScrollView>
  );
};
```

---

### 5️⃣ **VIDEO FEED UI (HOME SCREEN v2)**

```
┌─────────────────────────────┐
│ ☰  FOMO  🔔                 │ ← Status bar
├─────────────────────────────┤
│                             │
│   [Full-screen video]       │
│   [YouTube embed]           │
│   [900×1600px]              │
│                             │
│   Suits S01E01              │
│   "Mike gets hired" (0:45)   │
│                             │
│ ❤️ 234    💬 12    ➕       │ ← Overlay UI
│                             │
│      ⬆️ Swipe up next       │
│                             │
├─────────────────────────────┤
│ [Home] [Liked] [Friends]... │ ← Tab nav
└─────────────────────────────┘
```

#### **Component Structure:**

```typescript
// src/components/VideoMomentCard.tsx
interface VideoMomentCardProps {
  clip: Clip;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

export const VideoMomentCard: React.FC<VideoMomentCardProps> = ({
  clip,
  onLike,
  onComment,
  onShare,
}) => {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  return (
    <View style={styles.container}>
      {/* YouTube embed */}
      <YouTube
        videoId={clip.videoId}
        height={screenHeight * 0.9}
        width={screenWidth}
        play={true}
        onReady={() => console.log('Video ready')}
        onChangeState={(state) => console.log('Player state:', state)}
      />
      
      {/* Overlay UI */}
      <View style={styles.overlay}>
        {/* Bottom info */}
        <View style={styles.movieInfo}>
          <Text style={styles.title}>{clip.title}</Text>
          <Text style={styles.description}>{clip.description}</Text>
        </View>
        
        {/* Right-side action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => { setLiked(!liked); onLike(); }}>
            <View style={[styles.actionBtn, liked && styles.actionBtnActive]}>
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={32} color="white" />
              <Text style={styles.actionLabel}>{clip.likes + (liked ? 1 : 0)}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setShowComments(!showComments)}>
            <View style={styles.actionBtn}>
              <Ionicons name="chatbubble-outline" size={32} color="white" />
              <Text style={styles.actionLabel}>{clip.comments}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onShare}>
            <View style={styles.actionBtn}>
              <Ionicons name="share-social-outline" size={32} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Comments modal */}
      {showComments && <CommentsModal clip={clip} onClose={() => setShowComments(false)} />}
    </View>
  );
};

// src/screens/HomeScreen.tsx (v2 - VideoFeed)
export const HomeScreenV2 = () => {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = useAuth().currentUser?.uid;
  
  useEffect(() => {
    loadClips();
  }, []);
  
  const loadClips = async () => {
    try {
      const q = query(collection(db, 'clips'), limit(50), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const clipsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClips(clipsData);
    } catch (error) {
      console.error('Error loading clips:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLike = async (clipId: string) => {
    try {
      const userDocRef = doc(db, 'users', currentUserId);
      await updateDoc(userDocRef, {
        likedClipIds: arrayUnion(clipId),
      });
      
      const clipDocRef = doc(db, 'clips', clipId);
      await updateDoc(clipDocRef, {
        likes: increment(1),
      });
    } catch (error) {
      console.error('Error liking clip:', error);
    }
  };
  
  if (loading) return <ActivityIndicator />;
  
  return (
    <FlatList
      data={clips}
      renderItem={({ item }) => (
        <VideoMomentCard
          clip={item}
          onLike={() => handleLike(item.id)}
          onComment={() => navigation.navigate('Comments', { clipId: item.id })}
          onShare={() => Share.share({ url: item.videoUrl })}
        />
      )}
      keyExtractor={(item) => item.id}
      pagingEnabled // Full-screen scroll
      scrollEventThrottle={16}
    />
  );
};
```

---

### 6️⃣ **WATCH PARTY ROOM**

```
┌─────────────────────────────────────────┐
│ ← Suits Watch Party  👥 3 members       │
├──────────────────────┬──────────────────┤
│                      │ 💬 Comments      │
│  [Video Player 65%]  ├──────────────────┤
│  Playback: 0:45/10:00│ John: Cool part! │
│  [▶️ SYNC] [⏸] [⏭]   │ Mary: Right?     │
│                      │ [Type message...]│
│                      │                  │
├──────────────────────┴──────────────────┤
│ Members: John, Mary, You                │
│ [Leave room]  [Invite friend]           │
└─────────────────────────────────────────┘
```

#### **Implementation:**

```typescript
// src/components/WatchPartyRoom.tsx
export const WatchPartyRoom: React.FC<{roomId: string}> = ({roomId}) => {
  const [room, setRoom] = useState<WatchParty | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [playbackTime, setPlaybackTime] = useState(0);
  const currentUserId = useAuth().currentUser?.uid;
  const isCreator = room?.creatorId === currentUserId;
  
  // Subscribe to room updates (real-time)
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'watchParties', roomId), (doc) => {
      if (doc.exists()) {
        setRoom({ id: doc.id, ...doc.data() } as WatchParty);
      }
    });
    return unsubscribe;
  }, [roomId]);
  
  // Subscribe to messages (real-time)
  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      where('roomId', '==', roomId),
      orderBy('timestamp', 'asc'),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return unsubscribe;
  }, [roomId]);
  
  // Handle playback sync (only creator can control)
  const handlePlaybackChange = async (time: number) => {
    if (!isCreator) return;
    
    const roomRef = doc(db, 'watchParties', roomId);
    await updateDoc(roomRef, {
      playbackTime: time,
      updatedAt: serverTimestamp(),
    });
  };
  
  // Send message
  const sendMessage = async () => {
    if (!messageText.trim()) return;
    
    try {
      await addDoc(collection(db, 'messages'), {
        roomId,
        userId: currentUserId,
        text: messageText,
        timestamp: serverTimestamp(),
      });
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  if (!room) return <ActivityIndicator />;
  
  return (
    <View style={styles.container}>
      {/* Left: Video player */}
      <View style={styles.videoSection}>
        <YouTube
          videoId={room.currentClipId}
          height={screenHeight * 0.65}
          width={screenWidth * 0.6}
          play={room.isPlaying}
          onChangeState={(state) => {
            if (isCreator && state === 0) handlePlaybackChange(0); // Video ended
          }}
        />
        <View style={styles.playbackControls}>
          <Text>{Math.floor(room.playbackTime)}s / {room.currentClipId}</Text>
          {isCreator && (
            <>
              <TouchableOpacity onPress={() => updateDoc(doc(db, 'watchParties', roomId), { isPlaying: !room.isPlaying })}>
                <Ionicons name={room.isPlaying ? 'pause' : 'play'} size={32} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleNextClip()}>
                <Ionicons name="skip-forward" size={32} />
              </TouchableOpacity>
            </>
          )}
          {!isCreator && <Text style={{fontSize: 12, color: '#999'}}>Creator controls playback</Text>}
        </View>
      </View>
      
      {/* Right: Chat */}
      <View style={styles.chatSection}>
        <Text style={styles.chatTitle}>💬 Chat</Text>
        <FlatList
          data={messages}
          renderItem={({item}) => (
            <View style={styles.messageItem}>
              <Text style={styles.messageUser}>{item.userName}</Text>
              <Text style={styles.messageText}>{item.text}</Text>
              <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
            </View>
          )}
          keyExtractor={item => item.id}
          ref={chatRef}
          onContentSizeChange={() => chatRef.current?.scrollToEnd()}
        />
        <View style={styles.messageInput}>
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Say something..."
            style={styles.input}
          />
          <TouchableOpacity onPress={sendMessage}>
            <Ionicons name="send" size={24} color="#667eea" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
```

---

### 7️⃣ **DEPLOYMENT & INFRASTRUCTURE**

#### **Phase 1: Development**
```bash
# Firebase local emulator
firebase emulators:start --only firestore,auth,functions,database

# Expo dev server
npx expo start

# Test with: http://localhost:8081 (web) or Expo Go (mobile)
```

#### **Phase 2: Staging**
```bash
# Firebase project (non-prod)
firebase use fomo-staging

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

#### **Phase 3: Production**
```bash
# Create release build
eas build --platform ios --auto-submit
eas build --platform android --auto-submit

# Deploy to App Store & Play Store
# Deploy web to Firebase Production
firebase use fomo-prod
firebase deploy
```

---

## 📊 **TIMELINE ESTIMATE**

| Phase | Tasks | Duration |
|-------|-------|----------|
| **1. Setup** | Firebase, APIs, Auth | 3-5 days |
| **2. Core Video Feed** | VideoMomentCard, FlatList, YouTube integration | 4-6 days |
| **3. Watch Party** | Room creation, real-time sync, chat | 5-7 days |
| **4. Friends** | Friend requests, suggestions, profiles | 3-4 days |
| **5. Testing & Polish** | E2E tests, bug fixes, performance optimization | 3-4 days |
| **6. Deployment** | EAS builds, App Store submissions | 2-3 days |
| **TOTAL** | | **4-6 weeks** |

---

## 💰 **COSTS**

| Service | Free Tier | Estimated Cost |
|---------|-----------|-----------------|
| **Firebase** | 50K Firestore reads/day | $0-10/month |
| **YouTube API** | 10K credits/day | $0 (free tier) |
| **Expo EAS** | 30 builds/month | $0-20/month |
| **Cloud Functions** | 2M invocations/month | $0-5/month |
| **Storage** (avatars, thumbnails) | 5GB/month | $0-5/month |
| **Hosting** (web) | Firebase free tier | $0 |
| **TOTAL** | | **$0-40/month** |

---

## 🔐 **SECURITY CHECKLIST**

- [ ] Firebase security rules (Firestore, Realtime DB)
- [ ] API key restrictions (YouTube, TMDb)
- [ ] User data encryption (sensitive fields)
- [ ] Rate limiting (Firebase Functions)
- [ ] CORS configuration
- [ ] Input validation (client + server)
- [ ] OAuth 2.0 best practices
- [ ] Regular security audits

---

## ✅ **SUCCESS CRITERIA**

- ✅ 100+ movie clips in database
- ✅ Sub-2s video load time
- ✅ Real-time chat with <500ms latency
- ✅ 4+ watch party rooms simultaneously
- ✅ 95%+ test coverage
- ✅ <3MB app bundle size (mobile)
- ✅ 60 FPS animations (web + mobile)

---

**ГОТОВО ДО СТАРТУ! 🚀**

Рекомендація: почни з **Phase 1 (Firebase Setup + Auth)**, потім переходь на **Phase 2 (Video Feed)**.

Які перші кроки?
