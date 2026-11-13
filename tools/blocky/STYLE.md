# Roblox-style ("in this town") videos: style guide

Nahum's references (Nov 13, 2026). The videos themselves stay out of this public repo; these are the notes.

## Reference #1, the main one ("probably the best one"): larpiverse, "in this town!" series (TikTok, ~80 s)
- **Premise hook:** a town with one strange rule, told in first person. "In this town, everybody is out partying… except me."
- **Narrator = one recurring blocky avatar** with a signature outfit (theirs: blue beanie with a gold star and a blue hoodie printed with the show name). Classic simple faces: smile, wink, ^^ grin, open-mouth shock.
- **Look:** a dusk or night suburb with a moon and stars, warm lit windows, string lights, party hats, a backyard pool, a basketball court with a scoreboard. Soft shadows and muted, realistic-ish lighting, not neon.
- **Captions:** one word at a time, white heavy rounded sans with a black outline, just under the middle of the screen. Sound effects as captions ("HUSS!").
- **Editing:** a cut every 0.5–1.5 s, slow camera drifts, low angles on the hero, aerial shots of the town, close-ups on reactions.
- **Arc:** the rule → the narrator is the exception → what he does about it → the twist or payoff.

## Reference #2: goopie.yt bright Roblox story (~140 s)
- Sunny, saturated low-poly world (green grass, snowy mountains, colorful houses, city towers), cute animals.
- Yellow one-word captions with a black outline. Game text floats in the world: "+1", "1 / DAY", "100 FT", a big rep counter.
- **Time jumps** as big yellow titles ("1 WEEK LATER"), and a **golden glow transformation** at the level-up.

## How we do it (tools/blocky)
- `src/Story.jsx` + `src/world.jsx`: sets `street`, `party`, `park` and `room`. Hero avatar = **our own character**: blue beanie with a gold star and a blue hoodie printed "the system / level up daily". Don't copy the "in this town!" hoodie or name.
- 2D System HUDs on top: `stats`, `quest`, `pop`, `counter`, `title` ("30 DAYS LATER"), `levelup`. The coming-soon end card is added automatically.
- Story arc for The System: "In this town everybody is leveling up… except me" → stats all level 1 → he builds a system (3 quests: Bible, body, mind) → "30 DAYS LATER" → counter/LEVEL UP glow → "now everybody wants to know my system" → "coming soon".
- No narration voice can be generated here, so the words carry the story. Nahum can add TikTok's text-to-speech or his own voice over the captions.
- Keep it honest: it's a cartoon story, so no fake user numbers or launch dates.
- Render: `cd tools/blocky && cp ../../sounds/<id>.m4a public/sound.m4a && node render.mjs Story ../../posts/blocky/<id>.mp4 "$(cat ../../plans/blocky/<id>.json)"`. Quick checks: `node still.mjs <plan.json> <outdir> 3 9 15` (half-size frames). A 35 s video takes about 30 min to render in the cloud.
