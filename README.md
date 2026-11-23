# Sisi's Garden

A pixel garden where projects are plants and skills are flower beds. Water them when you work on them, visit friends' gardens, and meet live.

Live: https://sisiliu10.github.io/sisis-garden/

## How it is put together

- `index.html` is what the site serves. It is built, do not edit it by hand.
- `src/` is the source: `page.html` (markup), `style.css`, `game/*.js` (the game, glued together in the order of `game/order.json`), `bridge.js` (login, saving and live sync via Supabase).
- `python3 build.py` builds `index.html` and `version.txt`. No dependencies.
- `config.js`: Supabase project URL and public key.
- `functions/agents/`: the Supabase Edge Function for quiz questions and topic ideas.

## Tests

- `python3 test/serve.py` serves the built game against a fake Supabase on http://127.0.0.1:8766/
- `python3 test/blind/run.py` plays through the game like a player (desktop and phone). These tests were written from a feature list without looking at the code.
- `test/snap/`: screenshots of many scenes with a frozen clock, to check that a refactor changes nothing visible.

## Sounds

Door sound: doorOpen_1 from Kenney's RPG Audio pack (CC0, kenney.nl). All other sounds and the music are generated in the browser.
