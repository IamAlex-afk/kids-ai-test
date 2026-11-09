# R3 — обход кода (программист + хакер), 2026-11-09

Объём: js/game-worlds.js, js/game-effects.js (патч #41), js/*.js (вставка HTML, хранилище, адрес),
.github/workflows/regen.yml, CSP главной.

| Что проверено | Как | Итог |
|---|---|---|
| game-worlds.js, game-effects.js: innerHTML, eval, fetch, внешние URL, localStorage | grep | ничего нет ✅ |
| innerHTML в core/companion/snake/platformer | grep `innerHTML = \`…${}\`` | подставляются только наши данные (data/*.js, ui-строки), ввода пользователя нет ✅ |
| Ввод из адреса | grep location/URLSearchParams | один: `?age=` в js/workshop.js — белый список SLUG. Найдено: `?age=__proto__` / `constructor` проходили проверку `SLUG[x] \|\| …` → **исправлено** на hasOwnProperty (вреда не было: значение уходит только в data-атрибут) |
| Хранилище | storage.js | readJSON в try/catch + clean(); по умолчанию память вкладки ✅ |
| CSP | index.html | `default-src 'self'`, connect-src 'self', form-action 'none'. `script-src 'unsafe-inline'` — нужен для встроенных скриптов; убрать = отдельная задача (хэши), не ослаблять ✅ |
| regen.yml | чтение | права contents: write только у job; ветка через env (нет инъекции в shell); main отклоняется; actions по SHA ✅. Особенность: коммит GITHUB_TOKEN не запускает CI → после regen закрыть/открыть PR |
| Слабые телефоны | grep | devicePixelRatio ≤ 2, prefers-reduced-motion, пауза при скрытой вкладке ✅ |

Вывод: уязвимостей нет; одно упрочнение (workshop ?age).
