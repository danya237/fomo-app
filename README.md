# 🎬 MovieSwipe

Swipe your way to great movies! Tinder-style movie discovery app built with React Native & Expo.

## ✨ Features

- 🎥 **Swipe Movies**: Tinder-style swipe interface to discover movies
- ❤️ **Like System**: Save your favorite movies
- 🎬 **Watch Trailers**: View trailers directly from YouTube
- 🌍 **Multi-language**: Ukrainian, English, Norwegian
- 🌓 **Dark/Light Theme**: Switch between themes
- 📊 **Smart Algorithm**: Get recommendations based on your likes
- 👥 **Friends** (Coming Soon): Share movies with friends

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Expo CLI
- iOS Simulator (macOS) or Android Emulator

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Get TMDb API Key**:
   - Go to https://www.themoviedb.org/settings/api
   - Create an account and get your API key
   - Open `src/services/tmdb.ts`
   - Replace `YOUR_TMDB_API_KEY_HERE` with your actual API key

3. **Start the app**:
   ```bash
   npx expo start
   ```

4. **Run on device**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## 📱 App Structure

```
MovieSwipe/
├── src/
│   ├── components/       # Reusable components
│   │   └── MovieCard.tsx
│   ├── contexts/         # React contexts (Theme)
│   │   └── ThemeContext.tsx
│   ├── locales/          # Translations
│   │   ├── en.ts
│   │   ├── uk.ts
│   │   ├── no.ts
│   │   └── i18n.ts
│   ├── navigation/       # Navigation setup
│   │   └── MainNavigator.tsx
│   ├── screens/          # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── LikedScreen.tsx
│   │   ├── FriendsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/         # API & Storage services
│   │   ├── tmdb.ts
│   │   └── storage.ts
│   ├── types/            # TypeScript types
│   │   ├── movie.ts
│   │   └── navigation.ts
│   └── utils/            # Utility functions
└── App.tsx               # Main app component
```

## 🛠 Technologies

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **React Navigation** - Navigation
- **TMDb API** - Movie data
- **AsyncStorage** - Local storage
- **i18next** - Internationalization
- **Reanimated** - Animations

## 📝 TODO

- [ ] Add TMDb API key
- [ ] Implement Firebase for backend
- [ ] Add user authentication
- [ ] Implement friends system
- [ ] Add movie recommendations algorithm
- [ ] Add "Watch Now" links to streaming platforms
- [ ] Add movie search functionality
- [ ] Add filter by genre
- [ ] Add movie reviews
- [ ] Push notifications

## 🌍 Target Markets

- 🇺🇦 Ukraine
- 🇳🇴 Norway  
- 🇺🇸 United States

## 📄 License

MIT License - feel free to use this project for learning or personal use.

## 🤝 Contributing

This is a learning project, but contributions are welcome!

---

Made with ❤️ for movie lovers
