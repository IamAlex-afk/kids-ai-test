# Kids AI Test — Task List

## Статус на 2026-07-05 — ВСЕ ОСНОВНЫЕ ЗАДАЧИ ВЫПОЛНЕНЫ

### ✅ ШАГ 1: Убрать дуэль (ГОТОВО)
- btn-go-game → сразу startGame()
- Удалены: updateGamePicker(), renderDuelCta(), DUEL_CTA_STR
- Удалена папка duel/ (10 файлов)
- В HTML всех 10 файлов убран game-picker div

### ✅ ШАГ 2: Редизайн змейки в стиле ПК (ГОТОВО)
- Голова = монитор (с глазами, сканлайн, смерть)
- Тело = клавиши клавиатуры (KEY_LABELS, 16 вариантов)
- Хвост = кабель (bezier, неоновый, анимированный)
- Full-screen canvas (адаптивный под телефон и ПК)
- Circuit board фон (seeded random traces)
- Web Audio API звуки + вибрация

### ✅ ШАГ 3: Раунды змейки — 55 раундов на все языки (ГОТОВО)
Количество раундов по возрастам:
- tiny: 15 раундов (буквы 2-5 символов)
- child: 16 раундов (буквы 4-7 символов, AI-термины)
- teen: 12 раундов (слова, предложения по словам)
- adult: 12 раундов (фразы, термины)

Файлы обновлены: en.js, ru.js, de.js, es.js, fr.js, hi.js, id.js, pt.js, tr.js, vi.js

### ✅ ШАГ 4: SEO мета-теги (ГОТОВО)
Все 10 HTML файлов обновлены с low-competition запросами:
- EN: "Is ChatGPT Alive? AI for Kids..."
- RU: "Алиса живая? ИИ для детей..."
- DE: "Ist ChatGPT lebendig? KI für Kinder..."
- ES: "¿ChatGPT está vivo? IA para Niños..."
- FR: "ChatGPT est-il vivant? IA pour Enfants..."
- HI: "क्या ChatGPT जिंदा है? बच्चों के लिए AI..."
- ID: "Apakah ChatGPT Hidup? AI untuk Anak..."
- PT: "O ChatGPT está vivo? IA para Crianças..."
- TR: "ChatGPT Canlı mı? Çocuklar İçin YZ..."
- VI: "ChatGPT Có Sống Không? AI Cho Trẻ Em..."

### ✅ ШАГ 5: Parents FAQ — проверено (ГОТОВО)
- parents-faq.js содержит все 10 языков
- showParentInfo() корректно использует PARENTS_FAQ[S.lang] || en

### ✅ ШАГ 6: Quiz alignment — проверено (ГОТОВО)
- Квиз проверяет именно те концепции, что учит змейка
- Tiny: AI не живой, не чувствует → quiz тест же
- Child: галлюцинации, критическое мышление → quiz то же

---

## Следующие возможные улучшения (опционально)

1. **Локализация данных (vi.js в полном объёме)** — vi.js 78KB, больше других, возможно уже расширен
2. **Добавить og:image** — нет уникального изображения для каждого языка
3. **Буква-байк игра** (из обсуждений) — собирать буквы для складывания AI-термина
4. **Analytics без cookies** — можно добавить через privacy-friendly счётчик

---

## Архитектура проекта

```
kids-ai-test/
├── index.html        — английская версия
├── ru.html / de.html / es.html / fr.html / hi.html / id.html / pt.html / tr.html / vi.html
├── js/
│   ├── core.js       — вся логика (AGE_CFG, routing, quiz)
│   ├── card.js       — карточка + SHA-256
│   ├── names.js      — имена персонажей
│   ├── snake.js      — игра змейка (KAT_Snake, ~620 строк)
│   └── parents-faq.js — FAQ для родителей (PARENTS_FAQ, все 10 языков)
├── css/main.css
└── data/             — en.js ru.js de.js es.js fr.js hi.js id.js pt.js tr.js vi.js
```

## Ключевые детали
- PROJECT_START_MS = 1782864000000 (2026-07-01)
- AGE_CFG: tiny(3-7) 15/15 раундов, child(8-12) 16/4 уроков, teen(13-17) 12/5 уроков, adult(18+) 12/6 уроков
- Деплой: /kpush "описание" → git push → GitHub Pages автоматически
- Репо: github.com/IamAlex-afk/kids-ai-test
- Token: хранится локально в .projects-config.json (ТОЛЬКО kids-ai-test)
