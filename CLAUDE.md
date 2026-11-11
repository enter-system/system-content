# The System: content engine

This repo holds the public post files and the tools that make them for **The System**, Nahum's Christian self-improvement app (faith, body, mind, wealth and heart as game stats, plus daily quests, streaks and level-ups). It is coming soon to the App Store; until launch, every post ends with **"Coming soon · Follow to join."** Never promise a launch date.

Everything in this repo is **public**. Only put post files and post-making tools here, never anything private and never app code.

## Nightly run (runs from a scheduled task; Nahum is not watching)

Goal: tomorrow's **7 TikTok posts**, made and scheduled, with no input from Nahum. Nahum said "always automate it," so don't ask, just do it, and tell him what went out.

1. `git pull`. Set the commit identity to `Claude <noreply@anthropic.com>` and end each commit message with the `Co-Authored-By: Claude …` line.
2. **Photos:** any new images in `photos/inbox/` go into the **first posts of the batch**, before anything else, as slide backgrounds (`bg`), montage frames, or hook-card backgrounds. After they've been used, move them to `photos/library/` with descriptive names (e.g. `bible-coffee-03.jpg`). Library photos can be reused, but not within 14 days (check `bank/posted.json`). Never put photos of people's faces on a cover without Nahum having sent them.
3. **Learn from results** before picking hooks. With Metricool (brand id `7986494`, timezone America/New_York), pull TikTok post metrics for the last 7 days (`getAnalyticsAvailableMetrics` with network tiktok, connector posts, then `getAnalyticsDataByMetrics`). Note the top 2 hooks by views and saves in `bank/insights.md` (date, hook id, views, likes, shares, one line on why).
4. **Pick 7 posts:** **4 slideshows** (`type: slides`, 5–7 slides) and **3 videos** (`type: video` with scenes, `type: explainer`, or `type: montage` when photos exist).
   - **Slideshow mix (Nahum, Nov 11: "your original idea is killing it"):** every day, **3 of the 4 slideshows are the originals**: the dark navy System slides with no photo backgrounds (`cover` with alert banner, `countdown`, numbered `point`s, `math`, `cta`). **Only 1 slideshow a day uses photos** (pick one: `essay` / quiet life / long-list, `whisper` / "I love…" / one-word / essentials, or a photo `yellowcover`). The photo-format rules below all apply to that one daily slot. The 3 videos are unchanged.
   - Pull from `bank/hooks.json`, unused first, mixing pillars (faith, body, mind, wealth, heart, consistency, productivity, identity; at most 2 from the same pillar).
   - Include **one remix of a recent winner**: same hook idea, new angle or new title.
   - About once every 3 days, include one `app` pillar post.
   - Hooks may be added to the bank when a new idea fits better; add them to `hooks.json`.
5. **Make it urgent.** Nahum wants every post to feel action-packed and urgent:
   - **Hooks:** commands and warnings, not soft statements: "STOP…", "Do this before…", "Your ___ is dropping every day you wait", "Read this before you…", "Nobody is coming to save you."
   - **Countdowns:** count the real days left in the year from the post date. Use a `countdown` slide (e.g. `{kind:'countdown', big:'49', title:'DAYS LEFT<br>IN 2026'}`) in at least 1 slideshow a day until Dec 31.
   - **Slideshows:** the cover gets `tone:'alert'` plus a red `banner` ("DON'T SCROLL PAST THIS", "DO THIS TOMORROW MORNING", "CHECK YOURSELF RIGHT NOW"). Mix in alert-toned "what it's costing you" points, then "the fix." End with a push: "Start TODAY." / "Not Monday."
   - **Videos:** use the alert hook card by default with a `kicker` ("WARNING", "ALERT", "SYSTEM ALERT"). Hook text is 3 short lines, max ~10 words. Videos render about 1.2× faster automatically.
   - **Captions:** open with the urgent line plus ⚠️ or ⏳, then a direct command.
   - **Keep it honest:** urgency comes from the viewer's own time and habits, never from fake scarcity, fake numbers, fear about salvation, or shaming.
   - **Exception, the "dream life" whisper format:** when photos are available, 1 slideshow a day can be the calm Pinterest-style kind. It's 3–5 `whisper` slides (full photo, one small lowercase line like "rich.", "God, please.", "the real flex.", "answered prayer.") and then a normal `cta`. The faith/family/peace version of "rich" fits the brand. No urgency styling on those slides; the contrast is the point.
     - **"I love…" variant (inspo: 35K likes):** cover is a whisper slide with just "i love…" (or "my favorite part of discipline…"), then 4–5 POV photos with **no text at all** (`text: ''`): coffee by the laptop, a Bible open, a healthy meal bowl, feet on a treadmill, a clean desk. Then the `cta`. Best with Nahum's own everyday POV photos.
     - **One-word variant (inspo "Minimalism.": 191K likes / 47K saves):** cover is a whisper slide with one capitalized word in sans (`font:'sans'`): "Discipline.", "Peace.", "Order.", "Focus.", "Stillness." Then 3–4 photos of one mood (same color palette, no text), and end on `{kind:'logo'}` (the black THE SYSTEM end card, "COMING SOON") instead of a text CTA. Pick photos that look like they belong to the same set.
     - **"Essentials" variant (inspo "Clean boy essentials"):** cover whisper "Disciplined man essentials" (serif), then one item per photo labeled in serif (`text: 'Bible'`, `'Journal'`, `'Running shoes'`), and end on `logo`. Only use photos of real objects Nahum sent; never invent product claims. **Slip The System in as one item** (inspo "10/10 male purchases" did this with its own product): second-to-last slide uses an app screen from `photos/app/` labeled "The System app" with one honest line under it ("turns your habits into stats. coming soon."). These app screens may be reused any time; the 14-day rule is only for photos.
   - **The "essay" carousel (Nahum's favorite inspo, 53K likes / 26K saves):** when photos are available, 1 slideshow a day can be `essay` slides: full photo, a `[ QUEST 0N ]` tag, a numbered heading ("01 Clean it up"), 1–2 short paragraphs (≈35–55 words per slide), a gold punch line (`last`) and a rising `xp` bar (20, 40, 60…). Cover is `center:true` with a how-to title; the last slide is a centered CTA ending "Coming soon · Follow to join." This format is the exception to the 12-word limit; its value is saves, so make the advice genuinely useful. Example: `plans/2026-11-12-early.json`.
     - **"Quiet life" variant (inspo: 37K likes / 13K saves):** same `essay` slides with `mono:true` (black-and-white photo) and `small:true` (small centered text, `y` around 40–45). Cover is just the title ("How to build your quiet life", "How to become unbothered"). Each slide is one short tip: a heading plus 1–2 short lines. Works best with calm, dark or foggy photos.
     - **Long-list variant (inspo "How to upgrade your life in silence", 16 slides):** `essay` with `center:true`, a numbered heading ("3. Move your body."), `bullets` (3–5 short items) and an `after` line. 10–15 slides, one photo each, and the last slide is "You don't need to change your entire life this week. Pick one habit… Save this to remind you." then the CTA. Only when there are enough photos (library photos that are 14+ days old count).
   - **The countdown list ("How to become the man she brags about…" inspo):** a `yellowcover` (yellow Inter title, small grey "(Bible approved)") then `rank` slides counting down 7→1: white TikTok-style label boxes up top ("4) Intellect" + one practical line) over a glowing app stat card (`ab`, `name`, `role`, `color`, `fill`). End on a `rank` slide "All 7 stats. One system." with `foot` red labels. Use the app's 7 stats: Charisma CHA #a98bff Life of the Party, Ambition AMB #e2b85a CEO, Wealth WLT #4fd6a0 Stability, Intellect INT #4cb8ff Disciplined Mind, Strength STR #ff6a5c Protector, Heart HRT #ff9f6b Leader, Faith FTH #f1e6b8 Soldier (always #1). Never copy the inspo's fake "offer ends at midnight" scarcity. Example: `plans/2026-11-12-seven-stats.json`.
   - **Explainer videos (`type: explainer`, inspo "same person as last year" 15K saves):** minimal animated scenes in `tools/explain.html`: big all-caps captions that slam in word by word over simple art (`compare` LAST YEAR | THIS YEAR with figures or boxes, `big` counting number, `calendar` flipping months, `bars` stat bars filling, `crowd` with one figure glowing cyan, `none` for a caption alone). 9–12 scenes of 1.4–2.4 s, ending on the coming-soon card automatically. Arc: the problem ("same ___") → the cost (365 days, 0 stats) → "here's the scary part" → the turn (start today, stats rise, one figure glows). At least 1 of the 3 daily videos can be an explainer. Use `<i>` for red words and `<b>` for cyan. No swearing. Example: `plans/2026-11-12-same-person.json`.
   - **"Quiet life" mood video (inspo: 183K likes / 28K saves):** `type: montage` with `mood: true`, `word: 'quiet life'` (or "discipline", "peace", "slow mornings", "faith over fear"), `dur: 0.9`, `speed: 1`, `end: false`, and 6–10 dark, calm photos (repeat them to make 12–16 cuts). It renders letterboxed, muted, with the tiny word fixed in the center. No hook card and no end card, so it loops; put "The System · coming soon" in the caption instead. Make this 1 of the 3 daily videos whenever there are enough moody photos.
   - **Seasonal hooks win** (inspo "How to quietly rebuild your life this winter"): tie hooks to the season the viewer is in: "this winter", "your winter arc", "before the January crowd", "before 2027". For these, a `yellowcover` with a photo works as the cover, then long-list `essay` slides with bullets, one area per slide mapped to the app's stats (Strength = body, Intellect = mind, Wealth = money, Heart/Charisma = character, Faith always included).
   - **People in photos:** only use photos where faces aren't identifiable (backs, hands, silhouettes, far away) unless Nahum says the people in them are him or have agreed. Never feature identifiable children. Skip photos where alcohol, drugs or sexual content is the focus.
6. **Write the plan** at `plans/<date>.json` (shape at the top of `tools/render.cjs`). Faceless slideshow pattern:
   - Slide 1: a relatable hook (`cover`).
   - Slides 2–5: real, useful points (`point`, numbered).
   - Last slide: a soft `cta` mentioning The System and "Coming soon."
   - Keep slide text under ~12 words.
   - Scripture: quote the **KJV** only and give the reference. No Apocrypha. Keep claims honest, with no invented stats, testimonials or user numbers. Math like 1.01^365 = 37.8 is fine.
   - Video scenes (`tools/scenes/sceneN.mp4`): 0 system notice, 1 stats bars, 2 daily quests, 3 streak + "kicked up a notch", 4 level up, 5 end card (coming soon). Always end with 5.
7. **Render:** `node tools/render.cjs plans/<date>.json` writes `posts/<date>/`. Look at 2–3 of the rendered slides to make sure nothing overflows or overlaps, and fix the plan if it does.
8. **Commit and push.** Public links are `https://raw.githubusercontent.com/enter-system/system-content/main/posts/<date>/<file>`.
   - **MANUAL MODE until December 1, 2026 (Nahum, Nov 11):** the free Metricool plan ran out of scheduled posts for November. For any post date **before 2026-12-01**, do **not** call `createScheduledPost` at all (no TikTok, YouTube, Stories or drafts). Still do everything else (render, push, log). Instead, deliver tomorrow's pack to Nahum so he can post by hand:
     - One `SendUserFile` per post (`status: 'proactive'`, `display: 'attach'`), in time order: the slide JPGs in order (plus `<id>-story.mp4`) for a slideshow, the mp4 for a video. The caption is "<time> ET · TikTok (+ YouTube Shorts / IG+FB Story) · <hook>".
     - Then one `SendUserMessage` with every post's time, platforms, TikTok title, full caption in a code block (easy to copy), the YouTube title and description for videos, and for slideshows "add a sound in TikTok". Then the 3 drafts the same way, each with its exact sound and "start the sound at the drop".
     - Log these in `bank/posted.json` with `"manual": true`.
     - Use `getScheduledPosts` only to check which slots are already filled (those were scheduled before the limit and still go out), and skip them.
     - **From the run that makes Dec 1 posts on, go back to normal scheduling below** and tell Nahum that auto-posting is back on.
9. **Schedule on Metricool** (`createScheduledPost`, blogId `7986494`), TikTok for all 7, plus YouTube Shorts for the 3 videos, `autoPublish: true`.
   - Times (ET): 8:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00. Alternate slideshows and videos, and put the strongest hook at 10:00 or 18:00.
   - `tiktokData`: `title` (required, ≤ 90 chars), `privacyOption` PUBLIC_TO_EVERYONE, `commercialContentOwnBrand` true, `autoAddMusic` true for slideshows and false for videos (videos have their own audio), `isAigc` false.
   - **YouTube Shorts too:** schedule each of the 3 videos a second time to `youtube` at the same time, as a separate post. `youtubeData`: `type` "short", `privacy` "public", `madeForKids` false, `isAiGeneratedContent` false, `category` PEOPLE_BLOGS, 4–6 search `tags`, and a `title` that is the urgent hook in Title Case plus 1–2 hashtags (≤ 100 chars). Description: 2 sentences, "Subscribe to follow the build.", then #shorts plus 2 hashtags. Slideshows stay TikTok-only.
   - **Stories too (Nahum, Nov 11: "every post on my story"):** every one of the 7 auto posts also goes to the **Instagram and Facebook Stories** at the same time, as one extra Metricool post with providers `instagram` + `facebook`, `instagramData: {type:'STORY'}`, `facebookData: {type:'STORY'}`, **no `text`** (Stories carry no caption), `autoPublish: true`. Media: videos use their own mp4; slideshows use `posts/<date>/<id>-story.mp4`, made after rendering with `python3 tools/story.py plans/<date>.json` (slides joined at 2.5 s each). TikTok Stories can't be posted through Metricool. The drafts don't get Stories. Re-using a post's media in its own Story is the one exception to the no-duplicate-media rule.
   - Captions: lead with a search phrase ("self improvement app", "habit tracker", "Christian", "discipline", "level up your life"). Write 1–3 short sentences, then a question or "save this", then 5–7 hashtags (always #selfimprovement and #selfimprovementapp).
10. **Log:** append each post to `bank/posted.json`, add the date to each used hook's `used` list, commit and push.
11. **Tell Nahum,** in a short message: the 7 posts with times and hooks, yesterday's best performer, and anything that failed.

If Metricool or GitHub fails, retry once. If it still fails, stop and report exactly what failed. Never post the same media twice on the same day.

## When Nahum sends photos in a chat

Save them into `photos/inbox/` (resize so the long side is ≤ 2000px, JPEG quality 88, sensible names), then commit and push. The next run uses them first. If he asks for them "in the next post," make that post right away and schedule it at the next open slot instead of waiting for the nightly run.

## Daily drafts: 3 extra videos for Nahum to finish (6 videos a day total)

Besides the 7 auto posts, make **3 more videos every night as TikTok drafts**. Nahum adds the sound inside TikTok and posts them himself, so the song is TikTok's licensed copy.
- Plan them in `plans/<date>-drafts.json` with ids starting `draft-`. Each gets `silent: true` and a `sound` from the bank: it's cut to that sound's beat but has no audio. Use 3 different sounds, and mix types (one explainer, one montage or mood video, one app-scene video). App screens in `photos/app/` are fine for montages any day.
- Different hooks from the 7 auto posts of the same day.
- Schedule on Metricool for TikTok only at **9:00, 13:00 and 17:00** with **`autoPublish: false`** (Metricool sends Nahum a phone notification to finish it), `autoAddMusic: false`, a full caption and title like a normal post.
- In the nightly message, list each draft with the exact sound to add (the `note` in `sounds/<id>.json`, e.g. "SEM DEMORA (Slowed)") and "start the sound at the drop."

## Video style rule

**No zoom in videos** (Nahum): photos and backgrounds stay still; cuts happen on the beat instead. The templates already do this.

## Sounds (Nahum's standing rule)

Nahum sends TikTok screen recordings of sounds. **Every video is cut to the beat of one of his sounds; slideshows keep TikTok's auto music** (`autoAddMusic: true`).

- **When he sends a sound recording in chat:** `python3 tools/addsound.py <recording> <id> <hype|calm> [--start S --end E] [--note "..."]` (needs `pip install --break-system-packages librosa`). Trim to the part with the drop. Name ids by feel (`hype-drill-01`, `calm-piano-01`). Commit `sounds/<id>.m4a` + `.json`. If he sends several, sort them into hype and calm by ear (bpm and loudness help).
- **Nightly:** give every video `sound: '<id>'`. Pick the sound that fits the post: hype sounds for urgent hook videos, montages and explainers; calm sounds for "quiet life" mood videos and whisper-style videos. Don't use the same sound twice in one day, and rotate so each sound gets used. If `sounds/` is empty, fall back to the built-in track.
- Beat sync is automatic: video = the hook lasts 4 beats and the first scene hits on the drop; montage = each photo lasts `beatsPer` beats (2 default, 1 for fast cuts); explainer = every scene is snapped to whole beats.

## Brand

Dark navy (#070b14) with a cyan glow (#5ee7ff) and gold accents (#f5c451). Rajdhani display font (in `tools/fonts`). Game "system notice" language: [ QUEST ], LEVEL UP, +XP, STREAK. TikTok account brand in Metricool: "_enter.system_".
