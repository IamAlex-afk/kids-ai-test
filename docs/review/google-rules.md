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

## Дальше (Q1b)
helpful/people-first content · spam policies (scaled content abuse) · guidance on AI-generated content ·
FAQ/structured data · page experience. Источник — только developers.google.com.
