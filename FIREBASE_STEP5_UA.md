# 🎯 КРОК 5 - ДЕТАЛЬНО (ВИ ТУТЕЙСЬ ЗАРАЗ!)

Ви відкрили Project Settings. Я бачу що у вас є:

```
Project name: FomoApi
Project ID: fomoapi-d43d6
```

Відлично! Тепер робимо так:

---

## 📍 МІСЦЕ 1: Знайти "Your apps" на ЛІВІЙ СТОРОНІ

На ЛІВІЙ СТОРОНІ браузера (де список пунктів) ви маєте бачити:

```
Project settings
├─ General
├─ Cloud Messaging
├─ Integrations
├─ Service accounts
├─ Data privacy
├─ Users and permissions
├─ Alerts
```

**ЯКЩО ЦЬОГО НЕМАЄ:**
Прокрутіть ліву сторону-бар **ВНИЗ** (якби скролити вниз).

**КОЛИ ПОБАЧИТЕ:**
Продовжуємо шукати ще нижче... має бути розділ:

```
Your project
├─ Project name
├─ Project ID
├─ Your apps        ← СЮДИ НАЖИМАЙТЕ!
```

---

## 🖱️ НАТИСНІТЬ НА "Your apps"

На цьому "Your apps" натисніть лівою кнопкою миші.

Після цього ви побачите екран з вкладками:

```
Android  |  iOS  |  Web  |  Unity
        ^                 ^
        |                 |
  натисніть сюди        (не потрібно)
```

---

## 📱 НАТИСНІТЬ "Web"

Натисніть на вкладку **"Web"** (іконка `</> Web`)

Після цього:
- Якщо є додатки - ви побачите список
- Якщо немає - натисніть **"Add app"** або **"Register app"**

---

## ✏️ ВВЕДІТЬ ІМ'Я

З'явиться поле:

```
App nickname: [ введіть сюди ]
```

**Напишіть:** `FOMO Web` (або будь-яке ім'я)

Натисніть **"Register app"** або **"Next"**

---

## 🎁 КОПІЮЙТЕ КОДИ

Ви побачите **КВАДРАТ З КОДАМИ** (золотистого кольору):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "fomoapi-d43d6.firebaseapp.com",
  projectId: "fomoapi-d43d6",
  storageBucket: "fomoapi-d43d6.appspot.com",
  messagingSenderId: "704717665348",
  appId: "1:704717665348:web:..."
};
```

---

## ✅ ЧТО РОБИТИ З ЦИМИ КОДАМИ?

**КОПІЮЙТЕ** кожне значення:

1. `apiKey` - вся строка після лапок (AIzaSy...)
2. `authDomain` - весь текст (fomoapi-d43d6.firebaseapp.com)
3. `projectId` - весь текст (fomoapi-d43d6)
4. `storageBucket` - весь текст (fomoapi-d43d6.appspot.com)
5. `messagingSenderId` - числа (704717665348)
6. `appId` - весь текст (1:704717665348:web:...)

**ВСТАВТЕ В .env.local ФАЙЛ:**

Відкрийте файл `.env.local` в VS Code і напишіть:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=fomoapi-d43d6.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=fomoapi-d43d6
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=fomoapi-d43d6.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=704717665348
EXPO_PUBLIC_FIREBASE_APP_ID=1:704717665348:web:...
```

---

## 🎉 ГОТОВО!

Коди в файлі - ви завершили КРОК 5!

Тепер переходьте до КРОКУ 6 в основному гайді.

