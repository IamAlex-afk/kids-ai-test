# Kids AI Test — project status

Updated: 2026-10-26 · branch `fix/current-site-honesty-privacy` (PR #1) · base `f32e618` (origin/main at start)

The learning2 handoff archive was **not available** in this environment. Nothing from it
was used; all work below is on the current GitHub code.

## Done in this branch

| Area | Change |
|---|---|
| Ages | 5–7 (with an adult) / 8–10 / 11–13 / 14+ in all 10 pages: titles, meta, JSON-LD (`suggestedMinAge` 5, course instances), top bar, age cards, flow step, parents' FAQ headings (`Under 5 · for parents`, `5–10`, `11–13`), `data/*.js` labels, `parents-faq.js`, manifest, README, llms.txt, ai.txt, og.svg. Age numbers inside FAQ answers about toddlers (e.g. "a 3–5 year old") are content, not mode labels, and were kept. |
| Honesty | Removed "Trusted by parents worldwide", "Cannot be faked", "unforgeable", "verified card", "Pokemon card… unforgeable", "beat 90% of adults" (share text), "better than most people/adults" (result titles and descriptions) in every language. The card is described as a keepsake: the public SHA-256 proves neither identity, uniqueness nor completion. "Unique card" → "personal card". |
| Network | Card no longer calls worldtimeapi.org (device clock); `connect-src 'self'` in all CSPs. Removed QR/share links to a non-existent `verify.html` (404). |
| Storage | New `js/storage.js` + `js/storage-ui.js` (💾 panel, 10 languages). Tab memory by default (sessionStorage → in-memory fallback); device saving only after an explicit switch; switch-off and delete remove only this project's keys; consent re-read on every write + `storage` event (revocation in another tab); quota/partial-write rollback; corrupted values ignored; saves from older versions are not read or overwritten until "keep" or "delete". All modules (core, snake, platformer, racing, companion, leaderboard) go through it. Stored strings are stripped of `<` `>` and prototype keys; saved core state is type-checked before rendering. |
| Service worker | Deletes only `kids-ai-test-*` and the six known legacy `kat-2026-*` caches; a failed/partial install is discarded so the previous complete cache stays; pages network-first, assets stale-while-revalidate, both only from its own cache and only inside the project scope. |
| Publishing | `tools/build.mjs` builds `dist/` from an explicit allowlist (pages, assets, icons, LICENSE, SECURITY.md, Google verification file, `.well-known/security.txt`…), rewrites the SW cache name (content hash) and full precache list, writes `version.json`, `--check` fails on broken local links. Single workflow `.github/workflows/pages.yml`: PRs build + test only (read-only, no secrets); main deploys `dist/` only; all actions pinned to full SHAs; `persist-credentials: false`. |
| Security docs | SECURITY.md: private reporting via GitHub Security Advisories, no secrets/children's data in reports, no guaranteed response time, no absolute claims; notes that meta CSP cannot set `frame-ancestors`. security.txt: RFC 9116 fields, scoped to the project subpath. |
| Projects | Mind-OS removed from author/provider metadata, footer © and humans.txt (authorship = Aleksei Sergeevich Bitkin, as in LICENSE). |
| Translations | English fallbacks in the static mode picker of 7 pages (de, es, fr, hi, id, pt, tr) replaced with existing translations from `MODE_STR`. Share button text localized for all 10 languages (was 5). |
| Back button | One history entry per opened lesson/game/quiz; browser Back closes it (games via their own exit button), never re-pushes (no loops); in-app ✕ removes the entry. Not yet browser-tested. |
| Code scanning | `.github/workflows/codeql.yml` (JS, pinned SHA, `security-events: write` only in that job) and `.github/dependabot.yml` (monthly updates of pinned actions). No `npm audit fix --force`: the site has no npm dependencies. |
| Tests | `tests/storage.test.mjs`, `tests/sw.test.mjs`, `tests/static.test.mjs` (`node --test "tests/**/*.test.mjs"`, no dependencies). |

## Визуальная спецификация: этапы

Полная спецификация: `docs/VISUAL-SPEC.md`. Это реализация **по спецификации**, а не
восстановленный learning2 (архива нет). Проект целиком не завершён.

### Этап 1 — выполнен: главная → «Для детей / Для родителей» → возраст → существующие занятия

| Что | Как |
|---|---|
| Шапка (§3) | Знак из 4 квадратиков, «kids ai test», подпись бренда; глобус с названием языка (на узком экране код), меню с названиями языков на самих языках; кнопка 💾 в шапке. Закрытое меню не принимает фокус, Escape закрывает его и возвращает фокус. |
| Первый экран (§4) | Две колонки / одна на телефоне; надзаголовок, заголовок с выделенным словом, описание, иллюстрация с подписью, индикатор пути 1–2–3, вопрос, две карточки-кнопки (цвета из ТЗ), 4 факта, ссылка «О проекте и авторе» (на подвал: автор, GitHub, лицензия). Возраст заранее не выбран. |
| Второй экран (§5) | Возврат к выбору, заголовок ребёнку/родителю, 4 карточки возраста (цвета из ТЗ), 2×2 → 1 колонка ≤480px, пояснение «не оценка способностей». Для родителей — «Ребёнку ещё нет 5 лет?» → раздел для родителей с блоком «До 5 лет». Возраст не вводится, дата рождения не спрашивается. |
| Переход (§6, частично) | Дети → существующий выбор «Уроки и тест / Игры»; родители → раскрытый раздел для родителей с FAQ по возрасту. Полоса «← Изменить возраст · Возраст: 8–10 · На главную» (скрыта во время урока/игры). Бренд в шапке = на главную. |
| История | Выбор аудитории добавляет одну запись, выбор возраста её заменяет: Back из урока → занятия → главная, без петель. Обновление страницы без прогресса → главная (уроки больше не стартуют сами); с прогрессом → продолжение. |
| Убрано | Заставка «ACCESS GRANTED» (2,6 с перед первым экраном), старые hero / «Как это работает» / выбор возраста, быстрые кнопки возраста в шапке, мёртвый CSS этих блоков. |
| Иллюстрация | `assets/workshop/hero.webp` (1200×800) и `hero-small.webp` (660×440) — из прежней версии владельца, проверены как настоящие WebP (см. `assets/CREDITS.md`). Статичная картинка, без WebGL. |
| Тема | `css/workshop.css`: палитра ТЗ, светлые токены на время экранов входа (`body.wk-home`), системный шрифт (без Google Fonts), фокус 3px #4b43b0. `css/entry.css`: экраны входа. Контраст текста ≥ 5,1:1 на всех фонах карточек. |
| Генератор | Разметка шапки и входа во всех 10 страницах — `tools/gen-entry.mjs` + тексты `tools/entry-i18n.mjs` (10 языков); поведение — `js/entry.js`. Тест падает, если страница разошлась с генератором. |
| Переводы | Адаптированы, не дословно (DE: «Sie» родителям / «du» ребёнку; TR — естественный порядок слов; FR — неразрывные пробелы). «Осознанный ИИ» передан как «осознанно пользоваться ИИ», чтобы не читалось как «ИИ с сознанием». Носителями не вычитаны. |
| Поиск | Статические ответы (RU «Дети спрашивают», раздел для родителей) видны на главной под экраном выбора, а не спрятаны до выбора роли. |

Проверено в headless Chrome (свежий профиль, сборка `dist/` по пути `/kids-ai-test/`), 84 проверки, 0 ошибок:
ширины 360/390/768/1440 без горизонтальной прокрутки на всех трёх экранах; все 10 языков на 360 и 1440
(главная и экран возраста, иллюстрация загружается); путь детей и родителей, «Изменить возраст»,
«Ещё нет 5», «На главную», бренд из открытого урока, Back в браузере, обновление страницы; клавиатура
(Tab → «Перейти к содержанию» → карточка, Enter), меню языка, фокус после переходов; ошибок в консоли нет.
Скриншоты главной, возраста и занятий на телефоне и компьютере просмотрены.

### Этап 2 — выполнен: у каждого урока свой адрес (страницы уроков, §7–8 для них)

| Что | Как |
|---|---|
| Адреса | `lessons/<язык>/` — каталог всех уроков по возрастам; `lessons/<язык>/<возраст>-<n>.html` (возраст `5-7`, `8-10`, `11-13`, `14-plus`). 29 уроков × 10 языков = 290 страниц + 10 каталогов. Это те же уроки, что на главной (`data/*.js`), а не новые. |
| Генератор | `tools/gen-lessons.mjs` (+ тексты `tools/lesson-i18n.mjs`, 10 языков; шапка — та же функция, что в `tools/gen-entry.mjs`). Файлы в `lessons/` руками не правятся; тест падает, если они разошлись с генератором или с `data/*.js`. |
| Экран урока (§8, для страниц уроков) | «Урок N из M» и полоса прогресса → заголовок → объяснение → пример → «Проверь себя» → разбор. Ошибка — спокойное объяснение и «Попробовать ещё раз»; после ответа страница никуда не переходит сама. «Предыдущий / Следующий урок», «Закончить урок» (→ каталог, раздел этого возраста). Без JavaScript ответ и разбор открываются в блоке «Показать ответ и разбор». Состояние ответа — словами и знаком ✓/✗, не только цветом. |
| Звук | «Послушать / Остановить голос» — только по нажатию и только голосом, установленным на устройстве (`localService`); онлайн-голоса браузера не используются. Если голоса нет — надпись «попросите взрослого прочитать». |
| Возрастное оформление (§7, для страниц уроков) | 5–7: кремовый фон, охристый акцент #755023, пометка «взрослый читает вместе», крупный текст и кнопки ответа (≥72px); 8–10 лавандовый #4b48ab; 11–13 голубой #244b90; 14+ зелёно-бирюзовый #185d50, текст чуть сдержаннее. Порядок управления одинаковый. |
| Источники | Показывается источник урока из `data/*.js` (есть в en, ru, vi). В de/es/fr/hi/id/pt/tr у уроков источников нет — на странице честно написано «Источник для этой языковой версии пока не указан», чужие источники не подставлены. |
| Приватность | Страницы уроков не подключают `storage.js`/`core.js`, ничего не сохраняют и не отправляют (проверяется тестом). CSP та же, что у главных страниц. |
| Поиск | У каждой страницы свой canonical, `hreflang` на тот же урок в 10 языках + x-default, обычные ссылки (каталог ↔ урок ↔ соседние уроки, хлебные крошки + BreadcrumbList). Главная каждого языка ссылается на свой каталог («Все уроки по возрастам»). sitemap: +300 адресов (блок пишет генератор), `lastmod` — константа `LESSONS_LASTMOD` (2026-10-26), ставится вручную. |
| Офлайн | Страницы уроков не загружаются заранее (290 страниц); service worker сохраняет открытые. `lesson.css`/`lesson.js` — в офлайн-наборе. Неоткрытый урок без сети → главная из кэша. |
| Урок на главной (старый экран) | Убраны автоозвучка для 5–7 (урок, проверка, викторина) и автопереход после ответа (1,6–5 с): теперь разбор остаётся на экране до кнопки «Понял! Дальше →». В 5–7 после ответа блокируются и большие кнопки (раньше можно было ответить дважды). |

Проверено в headless Chrome (свежий профиль, `dist/` по пути `/kids-ai-test/`), 70 проверок, 0 ошибок:
урок на 360/390/768/1440 без горизонтальной прокрутки; неверный ответ → объяснение и «Попробовать ещё раз» (фокус на ней),
сброс, верный ответ → разбор, адрес не меняется; «Следующий / Предыдущий / Закончить урок»; последний урок без «Следующего»;
5–7 — пометка для взрослого и крупные кнопки; каталог на 360/768/1440; все 10 языков — каталог (29 ссылок), урок,
меню языка ведёт на тот же урок; клавиатура (первый Tab → «Перейти к содержанию», Enter/Escape в меню языка);
на главной: ссылка на каталог, 5–7 без голоса без нажатия, после ответа ждёт «Дальше»; ошибок в консоли нет.
Прежний сценарий входа (84 проверки) повторён — 0 ошибок. Скриншоты урока, ответа, 5–7, каталога, hi/vi/de просмотрены;
найдено и исправлено: текст кнопки «Следующий урок» сливался с фоном.

Не сделано на этом этапе: шаг «новый пример для самостоятельного применения» и «цель урока» (§8) — в `data/*.js`
таких полей нет, придумывать их не стал; светлая тема и §8 для урока **внутри** главной (там по-прежнему тёмное
оформление); озвучка в играх после раунда для 5–10 остаётся автоматической (игры — этап §9); в 5–7 на главной
кружки 🟢/🔴 стоят по позиции, а не по правильности — может путать, нужно решение при переделке экрана.

### Не сделано по спецификации (следующие этапы)

- §3: статус готовности языков в меню (введение / текстовые занятия / полный курс) — нужен реестр уроков; настройки звука в шапке.
- §6: личный маршрут — одно рекомендуемое занятие, разделы «занятия / лаборатория / игры / помощь / родителям». Сейчас после возраста открывается прежний выбор «Уроки и тест / Игры» в прежнем тёмном оформлении.
- §7: возрастное оформление и светлая тема — сделаны для страниц уроков; нет для уроков внутри главной, игр и раздела родителей.
- §8: на страницах уроков сделан (кроме «цели» и «нового примера» — нет данных). Внутри главной: убраны только автопереход и автоозвучка, оформление прежнее.
- §9: каталог игр с обложками (`robot-cover.webp`, `snake-cover.webp` есть в прежней версии, не подключены), сценарий робота «предскажи → запусти → исправь».
- §10: родительский раздел как спокойная колонка с оглавлением и печатью.
- §12: увеличение текста до 200% и печать экранов входа не проверялись. Существующий плавающий помощник на 1440px частично перекрывает край карточки «Для родителей».

## Проверки качества для поиска (2026-10-26)

Это проверки качества для нашего проекта, а не «правила Google»; рост позиций они не гарантируют.

**Обнаружено и исправлено**
- Новый вход прятал статические ответы и раздел для родителей до выбора роли → теперь они видны на главной.
- `sitemap.xml`: `lastmod` 2026-08-20, хотя все 10 страниц существенно изменены 2026-10-25 → 2026-10-25 (дата UTC; ставится вручную, сборка её не трогает).
- Новые проверки в существующем наборе: `tests/static.test.mjs` — в sitemap только 10 языковых страниц, canonical = URL из sitemap, нет noindex, lastmod не в будущем, у 404 есть noindex; `tests/live.test.mjs` (тот же `node --test`, без `LIVE_URL` пропускается) — после деплоя: 200 и язык каждой страницы, canonical, нет noindex / X-Robots-Tag, несуществующий адрес = 404, ресурсы грузятся, отдаётся именно этот коммит. В workflow — отдельное задание `verify` после `deploy`.

**Уже работало**
- Адреса — настоящие файлы (`index.html`, `ru.html`…), открываются напрямую и после обновления; History API адрес не меняет (только состояние), hash-маршрутов нет.
- GitHub Pages отдаёт настоящий 404 (проверено на живом сайте до публикации); `404.html` с noindex и не в sitemap.
- На все языковые страницы ведут обычные `<a href>` из меню языка; `build --check` ловит битые локальные ссылки.

**Решено этапом 2 (2026-10-26)**
- У уроков появились свои адреса: 290 страниц уроков + 10 каталогов, ссылки из главных страниц, sitemap, canonical/hreflang; `build --check` теперь проверяет ссылки во всех папках (относительно страницы), тесты — что каждая страница из sitemap существует, canonical на себя, без noindex; проверка живого сайта после деплоя открывает каталоги и уроки всех языков и проверяет 404 для несуществующего урока.

## Checked

- Code reading and repository-wide searches (no remaining banned claims, no direct storage access outside `storage.js`, no third-party `fetch`, age labels).
- GitHub: commits, Actions runs (`gh run list`), Pages config (`build_type: workflow`, no CNAME) — read-only.

- `node tools/build.mjs --check` and `node --test "tests/**/*.test.mjs"` on Node 24: build OK, links OK (all folders), 28 pass, 5 live checks skipped locally (they run after deploy).

## NOT yet checked

- In-depth browser run of lessons and games, print, offline, SW update from the old version, Lighthouse, live CSP headers. (Entry screens: see the visual-spec section above.)
- `og.png` still shows "Ages 3 – 17" (raster; needs re-rendering from `og.svg`).

## Published

Stage 1 published with PR #1 (`351134d`). Stage 2 (lesson pages): see the latest Pages run.

## Architecture

See `docs/ARCHITECTURE-DECISIONS.md`: shared github.io origin (storage not
isolated from sibling projects; separate origin recommended — owner decision),
measured build size (≈2.86 MB total, ≈0.86 MB first load; plan to lazy-load games
and per-language parents' FAQ), no WebMCP, search policy.

## Open questions for the owner

1. Footer link to `human-os-patch-33-protocols` and the 14+ book recommendation (Amazon/Litres) link to other projects/products — keep, or remove from the kids' site?
2. Enable **Private vulnerability reporting** in repo Settings → Code security (needs admin; SECURITY.md already points there).
3. Search Console: submit `sitemap.xml` (only the owner can; the subpath robots.txt is not read by Google).
4. Separate origin for the kids' site: own GitHub organisation (`<name>.github.io`, free) or a subdomain of an owned domain? Nothing is migrated until decided.

## Remaining work (next steps, in order)

1. Visual spec: personal route (§6) and the light lesson screen inside the main page (§7–8) — see above.
2. Lesson goals and "new example to try alone" (§8) — content per lesson × 10 languages; sources for lessons in de/es/fr/hi/id/pt/tr.
3. "Every question has a verified source" / "verified against primary sources" lines in pages and footer → per-claim source registry (claim → source → what it supports) before rewording.
4. Lesson registry (ID, skill, age, language status, source, review date) to drive navigation/sitemap.
5. Age adaptation of tasks (not just labels): 5–7 read-aloud flow with an adult.
6. "Check the plan" robot lesson (one full loop, four age modes).
7. Separate domain assessment (shared github.io origin ⇒ storage is not isolated from other sites).
