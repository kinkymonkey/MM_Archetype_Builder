# Midnight Majestic Archetype Builder v1

Standalone click-to-build prompt dashboard for Midnight Majestic. It does not live in MajesticHQ Dashboard. It does not generate images or video. It writes a prompt you copy into an image or video model.

## Open it

In Terminal:

```
cd "/Users/justinhenryteh/MajesticHQ/Projects/Prompt Maker"
node serve.js
```

Then in a browser go to [http://127.0.0.1:8765/](http://127.0.0.1:8765/).

Do not double-click `index.html`. The dropdown lists load from `catalogs.json`, and a file:// page cannot read that file. On your computer, saved presets live in Neon. On the live site, each visitor’s presets stay in their own browser. `node serve.js` reads `DATABASE_URL` from this folder’s `.env.local` or from `MajesticHQ-Dashboard/.env.local`.

## Use it

1. Type the idea first as a full sentence. That is the beat the model reads first. Do not use comma-separated tags.
2. Pick **Image** or **Video**.
3. Pick **Character**, **Scene**, **Prop**, or **Location**. The lower menus change.
4. Set camera, lens, lighting, colour temperature, colour grade, size, and the kind-specific fields. Characters also have **Hair length** and **Hairstyle**. Character and prop shots have a **Background** menu. **Split for nodes** (right column) copies four boxes for a node graph; leave it off for one prompt.
5. Copy the assembled prompt. Paste into your image or video model.

Image prompts stay under 600 words. The counter turns red if you go over.

Close-up character stills also offer a second **hair-forward** copy, same shot, hair swept to the front.

Video: set the same duration and aspect ratio in the video tool. The prompt names the look; the platform still needs those numbers.

The live site has a Midnight Majestic donate row ($5 / $10 / $20) through PayMongo.

## Files

Everything for this site lives in this folder. Do not mix it with MajesticHQ Dashboard.

- `index.html` — the page
- `styles.css` — colors and layout
- `app.js` — dropdowns, kind presets, save/load
- `serve.js` — local site + `/api/presets`
- `api/donate.js` — PayMongo checkout on the live site
- `lib/preset-api.js` — Neon table `archetype_presets`
- `stitch.js` — how the prompt is assembled
- `catalogs.json` — every menu list, including hairstyles
- `DESIGN.md` — look reference
- `notes/` — working notes, not part of the site
- `vercel.json` — host settings

## Edit the menus later

Lists live in `catalogs.json`. Clause assembly lives in `stitch.js`.
