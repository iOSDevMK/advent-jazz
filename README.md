Jazz Riddle Advent Calendar

Simple static prototype of an advent calendar with 24 doors. Clicking a door opens a modal with a zoomed frame (about 400x400), plays an audio file, then shows a reveal button to show the singer's face.

Files:
- `index.html`
- `styles.css`
- `script.js`
- `assets/` (put images and audio here)

Usage:
Open `index.html` in a browser. This repo includes test content for days 1–4 so you can validate the flow locally.

Test files included (quick start) are now in subfolders:
- `assets/images/day-1-back.svg`, `assets/images/day-1-front.svg`, `assets/audio/audio-day-1.mp3`
- `assets/images/day-2-back.svg`, `assets/images/day-2-front.svg`, `assets/audio/audio-day-2.mp3`
- `assets/images/day-3-back.svg`, `assets/images/day-3-front.svg`, `assets/audio/audio-day-3.mp3`
- `assets/images/day-4-back.svg`, `assets/audio/audio-day-4.mp3` (front uses fallback `assets/images/singer-front.png`)

- Filename patterns (JPG/PNG preferred):
- `assets/images/day-<n>-back.jpg` or `.png` — preferred back image (fallback to `.svg` if missing)
- `assets/images/day-<n>-front.jpg` or `.png` — preferred front/reveal image (fallback to `.svg`)
- `assets/audio/audio-day-<n>.mp3` — audio to play when the day is opened

`assets/images/singer-front.png` is included as a fallback reveal image for days that don't have a `day-<n>-front`.
If you want to use a single decorative door image for all closed doors, place `door.png` in `assets/` — the number will be rendered as a small plaque on top of the door.
You can also provide per-door closed images named `door-1.png` ... `door-24.png` in `assets/`. If a `door-<n>.png` exists it will be used for that specific door; otherwise the shared `door.png` will be used.
