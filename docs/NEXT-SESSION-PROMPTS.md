# Prompts for the session that can run node (verify → push)

Branch `release/three-lessons`. Code for each stage was written in a session
where `node`/`curl`/browser were blocked, so **nothing below has been run yet**.
Paste one prompt per stage, in order. Each must end with: what failed, what was
fixed, test output, and a commit — no push until the last stage passes.

## Stage 1 — speech + offline (commit "Speech: installed voices only…")

> Branch release/three-lessons. Run `node tools/build.mjs --check` and
> `node --test "tests/**/*.test.mjs"`; fix failures in the code, not by
> weakening tests. Then in headless Chrome (fresh profile, dist/ served at
> /kids-ai-test/): (1) main page, age 5–7, lesson → "Read to me": with no local
> voice the text "No voice on this device…" appears and nothing is spoken;
> second tap stops; leaving the lesson/game stops speech. (2) Offline
> (DevTools offline) after visiting ru.html: ru.html opens from cache; an
> unopened lessons/ru/8-10-3.html shows the Russian "not saved offline" page on
> that same URL with a link to ru.html; an already opened lesson opens.
> Report exact results; commit fixes.

## Stage 2 — series registry, engine, lesson A "sorter" (commit "Workshop series…")

> Branch release/three-lessons. Run `node tools/gen-series.mjs` (writes
> workshop/ru|en/ and the WORKSHOP block of sitemap.xml), then
> `node tools/gen-series.mjs --check`, `node tools/gen-lessons.mjs --check`,
> `node tools/build.mjs --check`, `node --test "tests/**/*.test.mjs"`.
> Fix failures in code/content, not by weakening tests. Then headless Chrome
> (fresh profile, dist/ at /kids-ai-test/), for workshop/ru/sorter.html and
> workshop/en/sorter.html, each with ?age=5-7, 8-10, 11-13, 14-plus: walk every
> step; guess → sorter says "square" (wrong); add only a repeat card → rule
> stays "background" with the explanation; add a pattern-breaking card → rule
> "shape", check cards all ✓; new example: wrong pick → explanation + retry,
> right pick → done; final links keep ?age=. Also: keyboard only (Tab/Enter,
> visible focus, focus moves to the step heading), 360px width, 200% zoom, no
> JS (goal, explanation, adult block, print task, sources visible), print
> preview (task + answers, no app), console free of errors. Screenshot and look
> at 5–7 and 14+. Report exact results; commit fixes. Generated files are
> committed together with the generator.

## Stage 3 — lessons B "check" and C "share" (commit "Workshop lessons B and C…")

> Branch release/three-lessons. `node tools/gen-series.mjs`, then the same
> checks as stage 2. In headless Chrome walk workshop/{ru,en}/check.html and
> share.html at all four ?age= values: B — "Teaching example" note visible;
> wrong sentence → explanation + retry; "cannot be decided" is accepted with
> its explanation; 11–13/14+ show two sources and the "many websites" question.
> C — tapping pieces toggles aria-pressed (keyboard: Enter/Space); "Check" with
> a wrong selection lists ✓/✗ for EVERY piece with its reason and does not
> finish; a right selection finishes and (Ella) shows the safe request; 5–7
> big buttons; nothing typed by the user anywhere. Screen reader text: the
> feedback is in a role=status region. Report exact results; commit fixes.

## Stage 4 — route "age → Start" (commit "Route after the age…")

> Branch release/three-lessons. `node tools/gen-entry.mjs` (pages get the
> route screen), `node tools/gen-series.mjs`, then all checks. In headless
> Chrome on ru.html, index.html and de.html: For kids → age 8–10 → route
> screen with "Age: 8–10", ONE Start card (ru/en → workshop sorter with
> ?age=8-10; de → lessons/de/8-10-1.html), other activities, "Lessons with a
> quiz, a card and games" opens the old mode picker and the quiz/card/games
> still work; "Change age" → age screen; browser Back from route → age? →
> home without loops; parents path unchanged (parents' corner). Keyboard:
> focus lands on the route heading. Report exact results; commit fixes.
