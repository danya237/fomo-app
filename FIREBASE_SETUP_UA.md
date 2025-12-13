# 🔥 Firebase - ПРОСТИЙ ГАЙД ДЛЯ НОВАЧКІВ

**Проблема:** Коли ви запускаєте додаток, видиться помилка:
```
Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

**Рішення:** Потрібно створити свій Firebase проект і скопіювати туди правильні коди.

---

## ✅ КРОК 1: Перейти на Firebase сайт

1. Відкрийте браузер (Chrome, Safari, Firefox - не важливо)
2. Введіть в адресний рядок: **https://console.firebase.google.com/**
3. Натисніть Enter
4. Ви повинні бути увійшли в Google акаунт
   - Якщо ні - натисніть "Sign In" і вберіть свій Google акаунт

---

## ✅ КРОК 2: Створити новий Firebase проект

Коли ви зайшли на Firebase Console, ви побачите сторінку з проектами.

**Шукайте кнопку "Add project" або "Додати проект":**

1. Натисніть на **синю кнопку** із текстом `+ Add project` або `+ Додати проект`
2. Відкриється вікно з полем для введення

**Введіть назву проекту:**
```
Назва: fomo-app
```
(можна будь-яке ім'я, наприклад: my-fomo, movie-app, movie-swipe)

3. Натисніть кнопку **"Continue"** або **"Далі"**

---

## ✅ КРОК 3: Налаштування проекту

Після введення назви з'явиться кілька налаштувань:

### Питання 1: "Enable Google Analytics?"
- **Натисніть: НІ** (виберіть "Not now" або "Ні" внизу)
- Нам це не потрібно зараз

### Питання 2: Вибір регіону
- Залиште за замовчуванням
- Натисніть **"Create project"** або **"Створити проект"**

---

## ⏳ КРОК 4: Чекаємо...

Firebase створює проект. Це займає 1-2 хвилини.

Ви побачите екран з написом:
```
Your new Firebase project is ready!
```

Натисніть **"Continue"** коли буде готово.

---

## 🔐 КРОК 5: ГОЛОВНИЙ КРОК - Копіюємо коди

Тепер ви на головній сторінці Firebase Console вашого проекту.

### ШАГ 5А: Знайдіть "Project Settings" ✅ (ВИ ВУТРИ ЗНАХОДИТЕСЯ!)

Ви вже отримали Project Settings! Ви бачите таку сторону-бар ліворуч:

```
Project settings
├─ General              ← ВИ ТУТЕЙСЬ!
├─ Cloud Messaging
├─ Integrations
├─ Service accounts
├─ Data privacy
├─ Users and permissions
├─ Alerts
```

Це правильно! Залишайтеся на **"General"** вкладці.

---

### ШАГ 5Б: Знайдіть "Your apps"

На ЛІВІЙ СТОРОНІ (де ви бачите список пунктів), ПРОКРУТІТЬ ВНИЗ:

```
Project settings
├─ General
├─ Cloud Messaging
├─ Integrations
├─ Service accounts
├─ Data privacy
├─ Users and permissions
├─ Alerts
└─ Your project
   ├─ Project name: FomoApi
   ├─ Project ID: fomoapi-d43d6
   └─ Your apps              ← ВОТ СЮДИ!
```

**Натисніть на "Your apps"** (може бути потрібно прокрутити ліву сторону-бар вниз)

---

### ШАГ 5В: Додайте Web додаток

В розділі "Your apps" ви побачите:
```
Android  |  iOS  |  Web  |  Unity
```

**Натисніть на `</> Web`** (це іконка з кутами `</>`)

Це зареєструє веб-версію вашого додатка.

---

### ШАГ 5Г: Введіть ім'я додатка

З'явиться поле для введення:

```
App nickname: [ FOMO Web ]
```

**Введіть:** `FOMO Web` або будь-яке ім'я

**Натисніть: "Register app"**

---

### ШАГ 5Д: СКОПІЮЙТЕ КОДИ

Після реєстрації ви побачите **ВЕЛИКИЙ БЛОК КОДУ**:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDfKJHKJK...",
  authDomain: "fomo-app.firebaseapp.com",
  projectId: "fomo-app",
  storageBucket: "fomo-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

**ЗАВДАННЯ: Скопіюйте КОЖНЕ ЗНАЧЕННЯ окремо**

Вам потрібні 6 кодів:

| Код | Приклад | Де знайти |
|-----|---------|-----------|
| `apiKey` | `AIzaSyDf...` | Перший рядок |
| `authDomain` | `fomo-app.firebaseapp.com` | Другий рядок |
| `projectId` | `fomo-app` | Третій рядок |
| `storageBucket` | `fomo-app.appspot.com` | Четвертий рядок |
| `messagingSenderId` | `123456789` | П'ятий рядок |
| `appId` | `1:123456789:web:abc...` | Шостий рядок |

---

## 📝 КРОК 6: Створіть файл .env.local

Тепер потрібно зберегти ці коди в спеціальному файлі.

### Де знайти проект:

1. Відкрийте **Visual Studio Code**
2. Ліворуч побачите папки вашого проекту
3. Шукайте папку з назвою `MovieSwipe` або `прога апкавже`
4. Відкрийте її

### Створіть новий файл:

1. **Натисніть правою кнопкою миші** на названий проекту (ліворуч)
2. Виберіть **"New File"** або **"Новий файл"**
3. Введіть ім'я файлу: `.env.local`
4. **Важливо: Крапка на початку!** Це має бути: `.env.local` (не `env.local`)

---

### Заповніть файл кодами:

В новому файлі введіть:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=ВСТАВТЕ_apiKey_СЮДИ
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=ВСТАВТЕ_authDomain_СЮДИ
EXPO_PUBLIC_FIREBASE_PROJECT_ID=ВСТАВТЕ_projectId_СЮДИ
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=ВСТАВТЕ_storageBucket_СЮДИ
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=ВСТАВТЕ_messagingSenderId_СЮДИ
EXPO_PUBLIC_FIREBASE_APP_ID=ВСТАВТЕ_appId_СЮДИ
```

### Приклад (замініть своїми значеннями):

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyDfKJHKJKhjkhjkhjkhjkhjkhkjhkjhk
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=fomo-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=fomo-app
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=fomo-app.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi
```

**Натисніть Ctrl+S (або Cmd+S на Mac) - ЗБЕРЕГТИ ФАЙЛ**

---

## ✅ КРОК 7: Увімкніть Firebase сервіси

Тепер потрібно увімкнути кілька сервісів в Firebase Console.

### СЕРВІС 1: Authentication (Вхід користувачів)

1. Повертаємось в **Firebase Console** (вкладка браузера)
2. На **лівій сторона-бар** шукаємо: **"Authentication"** або **"Автентифікація"**
3. Натисніть на нього
4. Натисніть **"Get Started"** або **"Розпочати"**
5. З'являться варіанти входу (Google, Facebook, Email, тощо)
6. Натисніть на **"Email/Password"**
7. Включіть перемикач **"Enable"** (поверніть його в позицію ВКЛ)
8. Натисніть **"Save"** або **"Зберегти"**

### СЕРВІС 2: Firestore Database (База даних)

1. На **лівій сторона-бар** шукаємо: **"Firestore Database"** або **"Бази даних"**
2. Натисніть **"Create database"** або **"Створити базу"**
3. Вибір регіону:
   - Виберіть: **us-central1** (США, центр) - це найшвидше
   - Натисніть **"Next"** або **"Далі"**
4. Виберіть режим:
   - Виберіть: **"Start in test mode"** (тестовий режим - тут все можна без обмежень)
   - Натисніть **"Enable"** або **"Включити"**
5. Чекаємо 1-2 хвилини поки база створюється

### СЕРВІС 3: Cloud Storage (Файловое сховище)

1. На **лівій сторона-бар** шукаємо: **"Storage"** або **"Сховище"**
2. Натисніть **"Get Started"** або **"Розпочати"**
3. Прочитайте правила безпеки (можна просто прокрутити вниз)
4. Натисніть **"Create"** або **"Створити"**
5. Виберіть регіон: **us-central1** (те ж саме)

---

## 🧪 КРОК 8: Протестуйте додаток

Тепер додаток повинен працювати!

### Перезапустіть додаток:

1. Відкрийте **Terminal** (Ctrl+` в VS Code або Terminal → New Terminal)
2. Введіть команду:

```bash
cd "/Users/daraa042/прога апкавже/MovieSwipe"
npx expo start --web
```

3. Натисніть Enter
4. Чекаємо... Буде написано:
```
✓ Compiled successfully
ℹ Expo server is running at: http://localhost:8081
```

---

### Тест 1: Перевірка підключення

1. Відкрийте браузер: **http://localhost:8081**
2. Натисніть **F12** (DevTools)
3. Перейдіть на вкладку **"Console"**
4. Шукайте зелений напис:
```
✅ 🔥 Firebase Initializing with project: fomo-app
```

Якщо цей напис є - ВСЕ ДОБРЕ! ✅

---

### Тест 2: Зареєструватися

1. На сторінці додатка натисніть **"Sign up"** або **"Реєстрація"**
2. Введіть:
   - Email: `test@example.com`
   - Password: `Test123456`
   - Name: `John Doe`
3. Натисніть **"Sign Up"**
4. Ви повинні бути автоматично перенесені на головну сторінку з відео

Якщо це сталося - ВІТАЮ! 🎉 Firebase працює!

---

### Тест 3: Перевірте базу даних

1. Повертаємось в **Firebase Console**
2. Шукаємо **"Firestore Database"**
3. Натисніть на нього
4. Ви повинні побачити нову колекцію **"users"**
5. Натисніть на неї
6. Ви повинні побачити документ з вашого облікового запису (test@example.com)

Якщо все це там - ОТЛИЧНО! ✅

---

## 🚨 ЯКЩО ЩОСЬ НЕ ПРАЦЮЄ

### Помилка 1: "auth/api-key-not-valid"
```
Рішення:
1. Перевірте файл .env.local (він має існувати)
2. Перевірте що EXPO_PUBLIC_FIREBASE_API_KEY скопійований правильно
3. Перезапустіть: Ctrl+C в терміналі, потім npx expo start --web
```

### Помилка 2: ".env.local не знаходиться"
```
Рішення:
1. Переконайтеся що файл створений в ПРАВИЛЬНІЙ папці
2. Папка має бути: /Users/daraa042/прога апкавже/MovieSwipe/
3. Файл має бути назвавний: .env.local (з крапкою!)
4. Перезапустіть Expo
```

### Помилка 3: "Firestore not initialized"
```
Рішення:
1. Повертаємось в Firebase Console
2. Перевіримо що Firestore Database створена
3. Перевіримо що вибраний регіон us-central1
4. Перевіримо що вибраний режим "test mode"
```

### Помилка 4: "CORS policy" помилка
```
Рішення:
1. Це означає що Firebase проект невірно налаштований
2. Перевіріть що Web додаток зареєстрований в Firebase Console
3. Повторіть КРОК 5 повністю
```

---

## 📞 ДОПОЛНИТЕЛЬНО

Якщо все ще щось не зрозуміло:

1. **YouTube Firebase Setup:** https://www.youtube.com/watch?v=mZPDMjRjNB4
2. **Firebase Docs (English):** https://firebase.google.com/docs/setup/web
3. **Написати мені:** Опишіть яка помилка видиться

---

## ✅ ЧЕКЛИСТ (Перевірте що всі пункти виконані)

- [ ] 1. Firebase Console відкриваєтся (https://console.firebase.google.com)
- [ ] 2. Проект "fomo-app" створений в Firebase
- [ ] 3. Скопійовані 6 кодів з Firebase Console
- [ ] 4. Файл `.env.local` створений в папці MovieSwipe
- [ ] 5. Усі 6 кодів вставлені в `.env.local`
- [ ] 6. Authentication увімкнена
- [ ] 7. Firestore Database створена
- [ ] 8. Cloud Storage увімкнене
- [ ] 9. Додаток запущений: `npx expo start --web`
- [ ] 10. Додаток відкривається на http://localhost:8081
- [ ] 11. Console показує: "Firebase Initializing with project: fomo-app"
- [ ] 12. Можна зареєструватися
- [ ] 13. Користувач з'являється в Firestore Database

---

## 🎉 ГОТОВО!

Якщо все пункти чеклисту виконані - ваш додаток готовий до роботи! 

Тепер ви можете:
- ✅ Реєструватися і входити
- ✅ Дивитися відео
- ✅ Ставити лайки
- ✅ Приватно зберігати дані

Наступний крок: Інтеграція YouTube Shorts та друзів.

---

**Дата:** 13 грудня 2025  
**Версія:** FOMO v2.0  
**Статус:** 🟢 Готово до запуску

