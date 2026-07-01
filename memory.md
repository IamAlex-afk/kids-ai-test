# Kids AI Test — Project Memory

## Location
C:\Users\79643\Desktop\kids-ai-test\

## Files done
- css/main.css ✅ (700 lines, all sections, age themes)

## Files to build
- js/core.js     ← next
- js/card.js     ← card generator + SHA-256 + QR
- data/en.js     ← all EN content (4 age groups, all sections)
- data/ru.js     ← RU adapted
- data/pt.js, es.js, de.js, fr.js, hi.js, id.js, tr.js
- index.html     ← EN main
- ru.html, pt.html, es.html... (shells)
- robots.txt, sitemap.xml

## Architecture
- Pure vanilla JS, no frameworks
- Logic (core.js) fully separated from content (data/xx.js)
- Content loaded as window.LANG_DATA from data file
- Age theme via body[data-age="tiny|child|teen|adult"]

## 4 Age Groups
- tiny  (3-5):  🧸 pink theme,   6 questions, 3 lessons, big emoji buttons
- child (6-9):  🎮 yellow theme,  8 questions, 4 lessons, standard buttons
- teen  (10-13):📱 cyan theme,   10 questions, 5 lessons, 5-point scale
- adult (14+):  🧠 purple theme, 15 questions, 6 lessons, 5-point scale

## Section Flow (Duolingo style)
boot → age-picker → lessons+mini-tests → game → final-quiz → result → card → protocols → parent

## Card Number System
- Number = Math.floor((Date.now() - PROJECT_START_MS) / 1000)
- PROJECT_START_MS = 1751328000000 (2025-07-01 00:00:00 UTC)
- Format: 9-digit zero-padded (#000000047)
- Random AI name from names pool
- Hash = SHA-256(number + timestamp + lang + age + score + SALT)
- SALT = "KAT-2025-MIND-OS-OPEN" (public, in open source)
- Language encoded in hash → ru.html card ≠ en card

## 9 Languages (real child search queries per country)
- EN: "is chatgpt alive", "can ai feel pain"
- RU: "алиса живая", "нейросеть чувствует"  
- PT: "ChatGPT tem sentimentos", "robô pode sofrer"
- ES: "¿ChatGPT tiene sentimientos?", "¿la IA miente?"
- DE: "Hat ChatGPT Gefühle?", "Kann KI lügen?"
- FR: "ChatGPT a-t-il des émotions?", "l'IA peut-elle mentir?"
- HI: "क्या AI में दिल होता है", "ChatGPT sach bolta hai"
- ID: "apakah ChatGPT punya perasaan", "AI bisa bohong"
- TR: "ChatGPT'nin duyguları var mı", "yapay zeka yalan söyler mi"

## Viral mechanic
- Card number = time since launch → earlier = more prestigious
- "You are #000047 — in the first 0.0004% of participants"
- Share card → friend wants lower number → comes to site
- LocalStorage prevents re-generation (same card on return)

## Content sources (verified)
- Vaswani et al. 2017 "Attention Is All You Need" arxiv.org/abs/1706.03762
- InstructGPT OpenAI 2022: arxiv.org/abs/2203.02155
- Constitutional AI Anthropic 2022: arxiv.org/abs/2212.08073
- Stanford AI Index 2024: aiindex.stanford.edu
- UNESCO AI Competency 2022: unesdoc.unesco.org/ark:/48223/pf0000380969
- Common Sense Media: commonsensemedia.org/research

## Key principles
- No registration, no data collection, no ads
- Verified facts only, with source links
- Open source (GPL v3)
- "Support project" donations only
- Card value grows with participant count
- Founders cards (#000001-#000010) pre-generated before launch
