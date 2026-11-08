# Q1. Правила Google из первоисточника

Открыто 2026-11-08 (WebFetch, HTTP 200). Дата обновления на страницах не показана.
Цитаты дословные (≤125 знаков), остальное — пересказ, помечен.

## 1. Managing multi-regional and multilingual sites
https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites

| Правило | Цитата | У нас |
|---|---|---|
| Отдельный адрес на язык | "Google recommends using different URLs for each language version of a page." | ✅ ru.html, vi.html, lessons/vi/… |
| Без автопереадресации | "Avoid automatically redirecting" (users to another language version) | проверить в Q2 |
| Без анализа IP | "Don't use IP analysis to adapt your content." | ✅ нет сервера, IP не видим |
| Не переводить только шаблон | "Translating only the boilerplate text of your pages while keeping the bulk of your content in a single language" → "bad user experience" | проверить в Q2: нет ли страниц с меню на языке, а текстом на EN |
| Язык определяется по тексту | "Google uses the visible content of your page to determine its language." | ✅ текст страниц на своём языке (тест pt-игр, #12) |
| canonical + hreflang | пересказ: для одноязычных дублей выбрать основной адрес (rel="canonical") и hreflang | ✅ canonical на каждой странице (#29) |

## 2. Tell Google about localized versions of your page
https://developers.google.com/search/docs/specialty/international/localized-versions

| Правило | Цитата | У нас |
|---|---|---|
| Взаимные ссылки | "If two pages don't both point to each other, the tags will be ignored." | проверить в Q2 тестом: каждая пара — в обе стороны |
| Ссылка на себя | "Each language version must list itself as well as all other language versions." | проверить в Q2 |
| x-default | "The reserved x-default value is used when no other language/region matches the user's browser setting." | ✅ x-default на главных (#29); проверить уроки/статьи/Мастерскую |
| Дубли | "Localized versions of a page are only considered duplicates if the main content of the page remains untranslated." | см. «только шаблон» выше |
| lang не для языка | "Google doesn't use hreflang or the HTML lang attribute to detect the language of a page." | значит, важен сам текст, а не только разметка |

Машинный перевод на этих двух страницах не упоминается — смотреть политику спама (кусок Q1b).

## 3. Creating helpful, reliable, people-first content
https://developers.google.com/search/docs/fundamentals/creating-helpful-content

| Правило | Цитата | У нас / вывод |
|---|---|---|
| Для людей | "People-first content means content that's created primarily for people, and not to manipulate search engine rankings." | ✅ цель сайта — дети и родители |
| Сигнал тревоги | "Are you using extensive automation to produce content on many topics?" | ⚠️ 10 языков сделаны с ИИ → нужна ручная проверка (Q4, Q8) |
| Как сделано | "AI or automation disclosures are useful for content where someone might think \"How was this created?\"" | ❌ на сайте не сказано, что тексты готовились с ИИ и проверялись → добавить блок «Как сделан сайт» |
| Авторы | "Fabricating creator profiles (such as by using AI-generated headshots, made-up names, or false credentials" | ✅ автор настоящий (Alex Bitkin, GitHub) |

## 4. Spam policies — Scaled content abuse
https://developers.google.com/search/docs/essentials/spam-policies (журнал: уточнены 2026-05-15)

| Правило | Цитата | Вывод |
|---|---|---|
| Масса без пользы | "creating large amounts of unoriginal content that provides little to no value to users, no matter how it's created." | у нас 390+ страниц — каждая должна быть полезна сама |
| ИИ без пользы | "Using generative AI tools or other similar tools to generate many pages without adding value for users" | ценность = проверенные источники, 4 возраста, местные примеры |
| Перевод как приём | "including through automated transformations like synonymizing, translating, or other obfuscation techniques" | ⚠️ перевод — нарушение, только если страниц много и пользы мало → адаптация по странам (Q5) и вычитка (Q8) |

## 5. Guidance on generative AI content
https://developers.google.com/search/docs/fundamentals/using-gen-ai-content (журнал: обновлено 2026-10-01)

| Правило | Цитата | Вывод |
|---|---|---|
| Проверка фактов | "It is critical to manually factcheck and review all AI-generated content for accuracy and trustworthiness" | = наш протокол CONTENT-REVIEW + реестр источников |
| Ошибки ИИ | "Generative AI outputs may contain inaccuracies (also known as hallucinations)." | Q4: сверить все факты с реестром |
| Раскрыть способ | "If you're automatically generating content, consider adding information on how your content was created" | → блок «Как сделан сайт» ×10 |

## 6. FAQ rich results — сняты
Страница faqpage не открылась (отдаёт журнал изменений). В журнале Google:
- 2026-05-08 "Deprecating the FAQ rich result feature": "This feature will no longer appear in Google Search starting May 7, 2026."
- 2026-06-15: "The FAQ rich result feature is no longer shown in Google Search results"

Вывод: FAQPage JSON-LD на 10 главных больше не даёт блоков в выдаче. Вреда нет (тест держит совпадение
с текстом), но и пользы для Google нет; оставить — для других поисковиков и ИИ-ответов, не обещать «сниппеты».

## Итог Q1 → задачи
1. Блок «Как сделан сайт» на 10 языках: тексты готовились с ИИ, факты сверены с первоисточниками, кто отвечает.
2. Q2: hreflang взаимность/self/x-default на всех страницах; нет страниц «переведено только меню».
3. Q4/Q5/Q8 — главное против «массового контента»: проверка фактов, адаптация по странам, вычитка носителем.
