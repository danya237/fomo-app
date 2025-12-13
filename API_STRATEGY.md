# 🎬 FOMO v2.0 - API Strategy & Architecture

## 🎯 Основна ідея (Ваша)

**Користувач вводить:** "The Matrix"

**СИСТЕМА РОБИТЬ:**
1. TikTok API: Шукає #TheMatrix + #MovieMoment
2. Якщо знайшло → Показуємо TOP clips
3. Якщо не знайшло → Переходим до YouTube
4. Якщо YouTube розочарував → Переходим до TMDb
5. Якщо все це - фігня → Користувач вручну пошукує

**Паралельно завантажуємо:**
- Netflix: Доступна?
- Disney+: Доступна?
- YouTube: Трейлер
- TMDb: Постер, рейтинг, опис

---

## 🔄 Architecture (Резервні копії)

```
USER INPUT: "The Matrix"
    ↓
┌─────────────────────────────────────┐
│ 1️⃣ TikTok API (PRIMARY)             │
│   - Шукай #TheMatrix + #MovieClip   │
│   - Результат: 5-10 популярних      │
│   - Якість: ⭐⭐⭐⭐⭐ (оригіналь)     │
└─────────────────────────────────────┘
    ↓ (Якщо порожньо)
┌─────────────────────────────────────┐
│ 2️⃣ YouTube API (SECONDARY)          │
│   - Шукай "The Matrix best scenes"  │
│   - Результат: 3-5 найкращих        │
│   - Якість: ⭐⭐⭐⭐ (редактовано)     │
└─────────────────────────────────────┘
    ↓ (Якщо і те порожньо)
┌─────────────────────────────────────┐
│ 3️⃣ TMDb + Manual (FALLBACK)         │
│   - Покажи постер, опис, рейтинг    │
│   - Дай юзеру пошукати вручну       │
│   - Якість: ⭐⭐⭐ (інформація)       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🔀 ПАРАЛЕЛЬНО (Всі сразу):          │
│ - Netflix: Доступна? ✅/❌          │
│ - Disney+: Доступна? ✅/❌          │
│ - Prime: Доступна? ✅/❌            │
│ - YouTube Trailer:線 URL           │
│ - IMDb рейтинг: 8.7/10             │
└─────────────────────────────────────┘
```

---

## 📋 План Реалізації

### КРОК 1: Універсальна "Content Finder" Service

```typescript
// src/services/contentFinder.ts

interface ContentResult {
  source: 'tiktok' | 'youtube' | 'tmdb' | 'manual';
  clipId: string;
  title: string;
  url: string;
  platform: string;
  quality: 'high' | 'medium' | 'low';
  views: number;
  duration: number;
}

class ContentFinderService {
  // Основний метод - всі API разом
  async findBestContent(movieTitle: string) {
    // Запускає все паралельно
    const results = await Promise.all([
      this.searchTikTok(movieTitle),    // PRIMARY
      this.searchYouTube(movieTitle),   // SECONDARY
      this.getMovieInfo(movieTitle),    // INFO
      this.getStreamingPlatforms(movieTitle), // PLATFORMS
    ]);
    
    return {
      clips: [
        ...results[0],  // TikTok clips (топ пріоритет)
        ...results[1],  // YouTube clips (якщо нема TikTok)
      ],
      info: results[2],           // TMDb info
      platforms: results[3],      // Netflix, Disney, etc
    };
  }
}
```

---

### КРОК 2: TikTok Service (NEW)

```typescript
// src/services/tiktok.ts

class TikTokService {
  async searchClips(movieTitle: string) {
    // Ищет:
    // 1. #[MovieTitle]Moment
    // 2. #[MovieTitle]Scene
    // 3. #[MovieTitle]Clip
    // Сортирует по views
    // Фильтрует на 15-120 сек
  }
  
  async getTrendingMovieClips() {
    // Gets top movie clips trending today
  }
}
```

---

### КРОК 3: YouTube Adapter (EXISTING - modify)

```typescript
// src/services/youtube.ts (modify)

// Переименовуємо:
// searchShorts() → searchBestScenes()
// Добавляємо: searchTrailer()

class YouTubeService {
  async searchBestScenes(movieTitle: string) {
    // Fallback якщо TikTok порожньо
  }
}
```

---

### КРОК 4: Unified Feed

```typescript
// VideoFeedScreen.tsx

const loadNextClip = async () => {
  // Попробуй TikTok
  let clip = await contentFinder.findBestContent('The Matrix');
  
  if (clip.clips.length === 0) {
    // Fallback на YouTube
    clip = await youtubeService.searchBestScenes('The Matrix');
  }
  
  if (!clip) {
    // Last resort - покажи інформацію
    showMovieInfo('The Matrix');
  }
};
```

---

## ✅ Як це вирішує ваші проблеми

| Проблема | Рішення |
|----------|---------|
| "Не знайшло нічого" | Fallback chain: TikTok → YouTube → TMDb |
| "API конфлікти" | Всі запити паралельні, не блокують один одного |
| "Низька якість контенту" | Сортуємо по views, duration, quality score |
| "Як зв'язати все" | ContentFinderService - єдина точка входу |
| "Що якщо TikTok недоступна" | YouTube автоматично підхопить |

---

## 🛠️ Залежності які потрібні

```bash
npm install tikwm  # TikTok
# YouTube - вже є (youtube.ts)
# TMDb - вже є (TMDB_API_KEY)
# Firebase - вже є
# Streaming - вже є (streamingService.ts)
```

---

## 📊 Структура даних

```typescript
interface MovieContent {
  // Вхідні дані
  movieTitle: string;
  movieId: number; // TMDb ID
  
  // Вихідні - TikTok/YouTube clips
  clips: {
    id: string;
    source: 'tiktok' | 'youtube';
    url: string;
    views: number;
    quality: 'high' | 'medium';
  }[];
  
  // Метаінформація
  movieInfo: {
    title: string;
    poster: string;
    rating: number;
    description: string;
  };
  
  // Де дивитися
  streaming: {
    netflix: boolean;
    disney: boolean;
    prime: boolean;
    hbo: boolean;
  };
  
  // Трейлер
  trailer: {
    url: string;
    source: 'youtube';
  };
}
```

---

## 🚀 Порядок реалізації

1. **Створити ContentFinderService** (об'єднує все)
2. **Додати TikTokService** (через tikwm)
3. **Адаптувати YouTubeService** (fallback)
4. **Оновити VideoFeedScreen** (використовувати ContentFinder)
5. **Тестити fallbacks** (що коли щось падає)

---

## ❓ Питання для вас

1. **Це план розумний?** Правильно я зрозумів вашу ідею?
2. **Почнемо з TikTok інтеграції?** Вона буде основна.
3. **Або спочатку ContentFinderService?** (безопаснішо)

Дайте сигнал! 👍

---

**Статус:** Архітектура готова до реалізації
**Дата:** 13 грудня 2025
