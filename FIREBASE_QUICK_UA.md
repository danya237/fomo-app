# 🎯 FIREBASE SETUP - ЕКСПРЕС ВЕРСІЯ (5 ХВИЛИН)

Якщо ви тільки розпочали - вот тут саме необхідне, без "зайвого.

---

## 🔴 ВАМ ПОТРІБНО ЗРОБИТИ ЦІ 4 РЕЧІ

### ✅ РОБ ЛА #1: Перейдіть на Firebase сайт

```
https://console.firebase.google.com/
```

Натисніть **"Add project"** (синя кнопка зверху)

---

### ✅ РОБОТА #2: Введіть деталі проекту

1. **Project name:** Введіть `fomo-app`
2. **Google Analytics:** Натисніть **"NOT NOW"** (нам це не потрібно)
3. Натисніть **"CREATE PROJECT"**
4. Чекаємо 2 хвилини...

---

### ✅ РОБОТА #3: Скопіюйте коди

Коли проект готовий:

1. Натисніть **⚙️ Project Settings** (шестеня вгорі ліворуч)
2. Натисніть вкладку **"Your apps"**
3. Натисніть **"Add app"** → Виберіть **"Web"** (`</> Web`)
4. App nickname: `FOMO Web`
5. Натисніть **"Register app"**

Ви побачите ЗОЛОТИЙ БЛОК з кодами:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",                    ← ЦЕ КОПІЮЙТЕ
  authDomain: "...",                      ← ЦЕ КОПІЮЙТЕ
  projectId: "...",                       ← ЦЕ КОПІЮЙТЕ
  storageBucket: "...",                   ← ЦЕ КОПІЮЙТЕ
  messagingSenderId: "...",               ← ЦЕ КОПІЮЙТЕ
  appId: "..."                            ← ЦЕ КОПІЮЙТЕ
};
```

---

### ✅ РОБОТА #4: Включіть 3 сервіси

#### СЕРВІС А: Authentication
- На лівій стороні кліцніть: **"Authentication"**
- Натисніть **"Get Started"**
- Виберіть **"Email/Password"**
- Натисніть **toggle** (перемикач) → **ON**
- Натисніть **"Save"**

#### СЕРВІС Б: Firestore Database
- На лівій стороні кліцніть: **"Firestore Database"**
- Натисніть **"Create Database"**
- Регіон: **us-central1**
- Режим: **Test Mode**
- Натисніть **"Create"**
- Чекаємо 1 хвилину

#### СЕРВІС В: Cloud Storage
- На лівій стороні кліцніть: **"Storage"**
- Натисніть **"Get Started"**
- Прокрутіть, натисніть **"Create"**
- Регіон: **us-central1**

---

## 💾 ЗБЕРЕГТИ КОДИ В ПРОЕКТ

Тепер створіть файл в VS Code:

### Крок 1: Створіть новий файл

1. Відкрийте папку `MovieSwipe` в VS Code
2. Натисніть **правою кнопкою** на папку (ліворуч)
3. Виберіть **"New File"**
4. Назвіть: `.env.local` (важливо: крапка на початку!)

### Крок 2: Вставте коди

В файлі напишіть (замініть свої коди з Firebase):

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=ВАШИЙ_API_KEY_ТУТTUI
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=ВАШID_ПРОЕКТУ.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=ВАШID_ПРОЕКТУ
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=ВАШID_ПРОЕКТУ.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=ВАШИЙ_SENDER_ID_ТУТUI
EXPO_PUBLIC_FIREBASE_APP_ID=ВАШИЙ_APP_ID_ТУТUI
```

### Крок 3: Збережіть

Натисніть **Cmd+S** (Mac) або **Ctrl+S** (Windows/Linux)

---

## ▶️ ЗАПУСТІТЬ ДОДАТОК

Відкрийте Terminal в VS Code (Ctrl+`):

```bash
cd "/Users/daraa042/прога апкавже/MovieSwipe"
npx expo start --web
```

Натисніть Enter і чекаємо...

Коли буде написано:
```
✓ Compiled successfully
ℹ Expo server is running at: http://localhost:8081
```

**Відкрийте браузер: http://localhost:8081** ✅

---

## 🧪 ТЕСТ

1. На сторінці натисніть **"Sign up"**
2. Введіть:
   - Email: `test@example.com`
   - Password: `Test123456`
   - Name: `John`
3. Натисніть **"Sign Up"**

Якщо ви бачите відео на екрані - **ВСЕ ПРАЦЮЄ!** 🎉

---

## 🆘 ЯКЩО НЕ ПРАЦЮЄ

| Помилка | Рішення |
|---------|---------|
| `auth/api-key-not-valid` | Перевірте що .env.local існує і коди скопійовані вірно |
| `.env.local not found` | Переконайтеся файл має крапку на початку: `.env.local` |
| `Firestore not initialized` | Вернітеся в Firebase Console і переконайтеся що Firestore Database створена |
| `CORS error` | Перезапустіть: Ctrl+C у терміналі, потім `npx expo start --web` |

---

## ✅ ГОТОВО!

Додаток створений, Firebase налаштований, все працює! 🚀

Наступне: YouTube Shorts, друзі, watch party...

