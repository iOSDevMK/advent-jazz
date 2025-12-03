// Background music management
import { MAX_BG_TRACKS, BG_VOL_NORMAL, BG_VOL_DAY_DUCK, BG_VOL_FACT_DUCK } from './constants.js';

let bgMusicEnabled = true;
let currentBgTrack = -1;
let bgTracks = [];
let isFactAudioPlaying = false;

export function initBgTracks() {
  bgTracks = [];
  for (let i = 1; i <= MAX_BG_TRACKS; i++) {
    bgTracks.push(`assets/music/song-${i}.mp3`);
  }
}

// Probe available background tracks by HEAD requests; falls back to existing list if none found
export async function loadAvailableBgTracks(max = MAX_BG_TRACKS) {
  const discovered = [];
  for (let i = 1; i <= max; i++) {
    const url = `assets/music/song-${i}.mp3`;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok) {
        discovered.push(url);
      }
    } catch (_) {
      // ignore fetch failures
    }
  }
  if (discovered.length > 0) {
    bgTracks = discovered;
    if (currentBgTrack >= bgTracks.length) {
      currentBgTrack = 0;
    }
  }
  return bgTracks.length;
}

export function setFactAudioPlaying(playing) {
  isFactAudioPlaying = playing;
}

export function applyBgMusicState(bgMusic, isDayPlaying) {
  if (!bgMusic) return;
  if (!bgMusicEnabled) {
    bgMusic.pause();
    return;
  }
  let targetVol = BG_VOL_NORMAL;
  if (isFactAudioPlaying) {
    targetVol = BG_VOL_FACT_DUCK;
  } else if (isDayPlaying) {
    targetVol = BG_VOL_DAY_DUCK;
  }
  bgMusic.volume = targetVol;
  if (bgMusic.paused) {
    bgMusic.play().catch(() => {});
  }
}

export function updateMusicToggleLabel(musicToggle, bgMusic) {
  if (!musicToggle) return;
  const isPlaying = bgMusicEnabled && bgMusic && !bgMusic.paused && !bgMusic.ended;
  const playPause = isPlaying ? '❚❚' : '▶';
  const ppEl = musicToggle.querySelector('.music-playpause');
  if (ppEl) ppEl.textContent = playPause;
  musicToggle.setAttribute('aria-pressed', String(bgMusicEnabled));
}

export function toggleBgMusic(bgMusic, audioEl) {
  if (!bgMusic) return;
  if (bgMusicEnabled) {
    bgMusicEnabled = false;
    bgMusic.pause();
  } else {
    bgMusicEnabled = true;
    bgMusic.play().catch(() => {});
    applyBgMusicState(bgMusic, !audioEl.paused && !audioEl.ended);
  }
  applyBgMusicState(bgMusic, !audioEl.paused && !audioEl.ended);
}

export function skipBgTrack(bgMusic, dir) {
  if (!bgMusic || !bgTracks || bgTracks.length === 0) return;
  const len = bgTracks.length;
  const current = currentBgTrack >= 0 ? currentBgTrack : 0;
  const next = (current + dir + len) % len;
  setBgTrack(bgMusic, next);
  if (bgMusicEnabled) {
    bgMusic.play().catch(() => {});
    applyBgMusicState(bgMusic, false);
  }
}

export function pickNextBgTrack(randomize = true) {
  if (!bgTracks || bgTracks.length === 0) return null;
  if (bgTracks.length === 1) return 0;
  if (!randomize) {
    return (currentBgTrack + 1) % bgTracks.length;
  }
  let next = currentBgTrack;
  while (next === currentBgTrack) {
    next = Math.floor(Math.random() * bgTracks.length);
  }
  return next;
}

export function setBgTrack(bgMusic, index) {
  if (!bgMusic || index == null || index < 0 || index >= bgTracks.length) return;
  const src = bgTracks[index];
  if (bgMusic.dataset.src !== src) {
    bgMusic.dataset.src = src;
    bgMusic.src = src;
    bgMusic.load();
  }
  currentBgTrack = index;
}

export function isBgMusicEnabled() {
  return bgMusicEnabled;
}

export function getBgTrackPosition() {
  const total = bgTracks.length;
  const current = currentBgTrack >= 0 ? currentBgTrack + 1 : (total > 0 ? 1 : 0);
  return { current, total };
}

export function getBgTrackCount() {
  return bgTracks.length;
}
