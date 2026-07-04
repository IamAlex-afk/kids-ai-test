# Kids AI Test — Task List (продолжить с этого места)

## Текущая сессия — что делаем сейчас

### ШАГ 1: Убрать дуэль, оставить только змейку [В ПРОЦЕССЕ]

Изменения в core.js:
- [ ] Заменить `btn-go-game` handler — вместо показа picker сразу вызывать `startGame()`
- [ ] Удалить всю функцию `updateGamePicker()` (строки ~692-728)
- [ ] Удалить `const picker = ...` и `if (picker) picker.style.display = 'none'` из `startGame()`
- [ ] Удалить вызов `renderDuelCta(container.parentElement)` (строка ~1089)
- [ ] Удалить константу `DUEL_CTA_STR` и функцию `renderDuelCta()` (строки ~1092-1128)

Изменения в HTML (все 10 файлов: index.html + 9 языков):
- [ ] Удалить блок `<div id="game-picker">` (двухколоночный выбор игр)
- [ ] Оставить только `<div class="game-wrap" id="game-content"></div>`

Удалить папку:
- [ ] `duel/` (10 HTML файлов)

### ШАГ 2: Поток Змейка → Квиз [УЖЕ РАБОТАЕТ]
Логика: змейка учит термины → `onAllDone()` → `onGameDone()` → кнопка "Start Quiz" → `startQuiz()`
Оставить как есть, ничего не менять.

### ШАГ 3: Задеплоить на GitHub Pages
Команда: `/kpush "Remove duel, snake direct launch"`

---

## Следующие задачи (после деплоя)

### SEO — обновить мета-теги во всех HTML файлах
Для каждого языка свои low-competition запросы:
- EN: "what is ai for kids", "how does ai work simple"
- RU: "что такое ии для детей", "как работает нейросеть просто"
- DE: "was ist KI für Kinder"
- ES: "qué es la IA para niños"
- FR: "c'est quoi l'IA pour les enfants"
- и т.д.

### Родительский раздел — доработки
- Проверить что `js/parents-faq.js` работает на всех языках
- Секция с источниками / ссылками

### Квиз — проверить вопросы
Вопросы должны проверять именно те темы, которые изучал в змейке.
Смотреть в `data/ru.js` и `data/en.js` → ключ `quiz`.

---

## Архитектура проекта (не менять)

```
kids-ai-test/
├── index.html        — английская версия
├── ru.html / de.html / es.html / fr.html / hi.html / id.html / pt.html / tr.html / vi.html
├── js/
│   ├── core.js       — вся логика
│   ├── card.js       — карточка + SHA-256
│   ├── names.js      — имена персонажей
│   ├── snake.js      — игра змейка (KAT_Snake)
│   └── parents-faq.js — FAQ для родителей (PARENTS_FAQ)
├── css/main.css
├── data/en.js / ru.js / vi.js
└── duel/             ← УДАЛИТЬ
```

## Ключевые детали
- `js/core.js` строка 13: `PROJECT_START_MS = 1782864000000` (2026-07-01)
- AGE_CFG: tiny(3-7), child(8-12), teen(13-17), adult(18+)
- Деплой: git push → GitHub Pages автоматически
- Репо: github.com/IamAlex-afk/kids-ai-test
