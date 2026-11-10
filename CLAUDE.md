# The System: content engine

This repo holds the public post files and the tools that make them for **The System**, Nahum's Christian self-improvement app (faith, body, mind, wealth and heart as game stats, plus daily quests, streaks and level-ups). It is coming soon to the App Store; until launch, every post ends with **"Coming soon · Follow to join."** Never promise a launch date.

Everything in this repo is **public**. Only put post files and post-making tools here, never anything private and never app code.

## Nightly run (runs from a scheduled task; Nahum is not watching)

Goal: tomorrow's **7 TikTok posts**, made and scheduled, with no input from Nahum. Nahum said "always automate it," so don't ask, just do it, and tell him what went out.

1. `git pull`. Set the commit identity to `Claude <noreply@anthropic.com>` and end each commit message with the `Co-Authored-By: Claude …` line.
2. **Photos:** any new images in `photos/inbox/` go into the **first posts of the batch**, before anything else, as slide backgrounds (`bg`), montage frames, or hook-card backgrounds. After they've been used, move them to `photos/library/` with descriptive names (e.g. `bible-coffee-03.jpg`). Library photos can be reused, but not within 14 days (check `bank/posted.json`). Never put photos of people's faces on a cover without Nahum having sent them.
3. **Learn from results** before picking hooks. With Metricool (brand id `7986494`, timezone America/New_York), pull TikTok post metrics for the last 7 days (`getAnalyticsAvailableMetrics` with network tiktok, connector posts, then `getAnalyticsDataByMetrics`). Note the top 2 hooks by views and saves in `bank/insights.md` (date, hook id, views, likes, shares, one line on why).
4. **Pick 7 posts:** **4 slideshows** (`type: slides`, 5–7 slides) and **3 videos** (`type: video` with scenes, or `type: montage` when photos exist).
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
   - **The "essay" carousel (Nahum's favorite inspo, 53K likes / 26K saves):** when photos are available, 1 slideshow a day can be `essay` slides: full photo, a `[ QUEST 0N ]` tag, a numbered heading ("01 Clean it up"), 1–2 short paragraphs (≈35–55 words per slide), a gold punch line (`last`) and a rising `xp` bar (20, 40, 60…). Cover is `center:true` with a how-to title; the last slide is a centered CTA ending "Coming soon · Follow to join." This format is the exception to the 12-word limit; its value is saves, so make the advice genuinely useful. Example: `plans/2026-11-12-early.json`.
     - **"Quiet life" variant (inspo: 37K likes / 13K saves):** same `essay` slides with `mono:true` (black-and-white photo) and `small:true` (small centered text, `y` around 40–45). Cover is just the title ("How to build your quiet life", "How to become unbothered"). Each slide is one short tip: a heading plus 1–2 short lines. Works best with calm, dark or foggy photos.
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
9. **Schedule on Metricool** (`createScheduledPost`, blogId `7986494`), TikTok for all 7, plus YouTube Shorts for the 3 videos, `autoPublish: true`.
   - Times (ET): 8:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00. Alternate slideshows and videos, and put the strongest hook at 10:00 or 18:00.
   - `tiktokData`: `title` (required, ≤ 90 chars), `privacyOption` PUBLIC_TO_EVERYONE, `commercialContentOwnBrand` true, `autoAddMusic` true for slideshows and false for videos (videos have their own audio), `isAigc` false.
   - **YouTube Shorts too:** schedule each of the 3 videos a second time to `youtube` at the same time, as a separate post. `youtubeData`: `type` "short", `privacy` "public", `madeForKids` false, `isAiGeneratedContent` false, `category` PEOPLE_BLOGS, 4–6 search `tags`, and a `title` that is the urgent hook in Title Case plus 1–2 hashtags (≤ 100 chars). Description: 2 sentences, "Subscribe to follow the build.", then #shorts plus 2 hashtags. Slideshows stay TikTok-only.
   - Captions: lead with a search phrase ("self improvement app", "habit tracker", "Christian", "discipline", "level up your life"). Write 1–3 short sentences, then a question or "save this", then 5–7 hashtags (always #selfimprovement and #selfimprovementapp).
10. **Log:** append each post to `bank/posted.json`, add the date to each used hook's `used` list, commit and push.
11. **Tell Nahum,** in a short message: the 7 posts with times and hooks, yesterday's best performer, and anything that failed.

If Metricool or GitHub fails, retry once. If it still fails, stop and report exactly what failed. Never post the same media twice on the same day.

## When Nahum sends photos in a chat

Save them into `photos/inbox/` (resize so the long side is ≤ 2000px, JPEG quality 88, sensible names), then commit and push. The next run uses them first. If he asks for them "in the next post," make that post right away and schedule it at the next open slot instead of waiting for the nightly run.

## Brand

Dark navy (#070b14) with a cyan glow (#5ee7ff) and gold accents (#f5c451). Rajdhani display font (in `tools/fonts`). Game "system notice" language: [ QUEST ], LEVEL UP, +XP, STREAK. TikTok account brand in Metricool: "_enter.system_".
