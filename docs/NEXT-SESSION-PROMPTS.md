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
