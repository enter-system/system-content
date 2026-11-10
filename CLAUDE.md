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
5. **Write the plan** at `plans/<date>.json` (shape at the top of `tools/render.cjs`). Faceless slideshow pattern:
   - Slide 1: a relatable hook (`cover`).
   - Slides 2–5: real, useful points (`point`, numbered).
   - Last slide: a soft `cta` mentioning The System and "Coming soon."
   - Keep slide text under ~12 words.
   - Scripture: quote the **KJV** only and give the reference. No Apocrypha. Keep claims honest, with no invented stats, testimonials or user numbers. Math like 1.01^365 = 37.8 is fine.
   - Video scenes (`tools/scenes/sceneN.mp4`): 0 system notice, 1 stats bars, 2 daily quests, 3 streak + "kicked up a notch", 4 level up, 5 end card (coming soon). Always end with 5.
6. **Render:** `node tools/render.cjs plans/<date>.json` writes `posts/<date>/`. Look at 2–3 of the rendered slides to make sure nothing overflows or overlaps, and fix the plan if it does.
7. **Commit and push.** Public links are `https://raw.githubusercontent.com/enter-system/system-content/main/posts/<date>/<file>`.
8. **Schedule on Metricool** (`createScheduledPost`, blogId `7986494`), TikTok only, `autoPublish: true`.
   - Times (ET): 8:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00. Alternate slideshows and videos, and put the strongest hook at 10:00 or 18:00.
   - `tiktokData`: `title` (required, ≤ 90 chars), `privacyOption` PUBLIC_TO_EVERYONE, `commercialContentOwnBrand` true, `autoAddMusic` true for slideshows and false for videos (videos have their own audio), `isAigc` false.
   - Captions: lead with a search phrase ("self improvement app", "habit tracker", "Christian", "discipline", "level up your life"). Write 1–3 short sentences, then a question or "save this", then 5–7 hashtags (always #selfimprovement and #selfimprovementapp).
9. **Log:** append each post to `bank/posted.json`, add the date to each used hook's `used` list, commit and push.
10. **Tell Nahum,** in a short message: the 7 posts with times and hooks, yesterday's best performer, and anything that failed.

If Metricool or GitHub fails, retry once. If it still fails, stop and report exactly what failed. Never post the same media twice on the same day.

## When Nahum sends photos in a chat

Save them into `photos/inbox/` (resize so the long side is ≤ 2000px, JPEG quality 88, sensible names), then commit and push. The next run uses them first. If he asks for them "in the next post," make that post right away and schedule it at the next open slot instead of waiting for the nightly run.

## Brand

Dark navy (#070b14) with a cyan glow (#5ee7ff) and gold accents (#f5c451). Rajdhani display font (in `tools/fonts`). Game "system notice" language: [ QUEST ], LEVEL UP, +XP, STREAK. TikTok account brand in Metricool: "_enter.system_".
