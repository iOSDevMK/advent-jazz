// Main application orchestrator
import { DEV_OPEN } from './js/constants.js';
import { 
  initBgTracks, 
  applyBgMusicState, 
  updateMusicToggleLabel, 
  toggleBgMusic, 
  skipBgTrack, 
  pickNextBgTrack, 
  setBgTrack 
} from './js/music.js';
import { 
  setupFactAudioEventListeners, 
  toggleFactAudio 
} from './js/facts.js';
import { 
  updateDoorLocks, 
  createDoors 
} from './js/calendar.js';
import { 
  setPlayButtonState, 
  updateProgress, 
  startScrub 
} from './js/player.js';
import { 
  showLockDialog, 
  setupLockDialogEventListeners 
} from './js/lock-dialog.js';
import { 
  openModal, 
  closeModal, 
  toggleReveal 
} from './js/modal.js';

// DOM elements
const grid = document.getElementById('grid');
const modal = document.getElementById('modal');
const backdrop = document.getElementById('backdrop');
const modalContent = document.getElementById('modalContent');
const zoomFrame = document.getElementById('zoomFrame');
const riddleText = document.getElementById('riddleText');
const audioEl = document.getElementById('audio');
const revealBtn = document.getElementById('revealBtn');
const singerReveal = document.getElementById('singerReveal');
const signatureOverlay = document.getElementById('signatureOverlay');
const closeBtn = document.getElementById('closeBtn');
const artistOverlay = document.getElementById('artistOverlay');
const artistLabel = document.getElementById('artistLabel');
const playPauseBtn = document.getElementById('playPauseBtn');
const skipRevealBtn = document.getElementById('skipRevealBtn');
const progressContainer = document.getElementById('progressContainer');
const progressTrack = document.getElementById('progressTrack');
const progressFill = document.getElementById('progressFill');
const progressHandle = document.getElementById('progressHandle');
const timeElapsed = document.getElementById('timeElapsed');
const timeRemaining = document.getElementById('timeRemaining');
const lockDialog = document.getElementById('lockDialog');
const lockBackdrop = document.getElementById('lockBackdrop');
const lockCloseBtn = document.getElementById('lockCloseBtn');
const lockLead = document.getElementById('lockLead');
const lockHistory = document.getElementById('lockHistory');
const musicToggle = document.getElementById('musicToggle');
const factAudioBtn = document.getElementById('factAudioBtn');
const musicPrev = document.getElementById('musicPrev');
const musicNext = document.getElementById('musicNext');
const bgMusic = document.getElementById('bgMusic');
const factAudio = document.getElementById('factAudio');
const signatureText = document.getElementById('signatureText');

// Initialize background music tracks
initBgTracks();

// Door click handler
function onDoorClick(e) {
  if (!DEV_OPEN && e.currentTarget.classList.contains('locked')) {
    showLockDialog(lockDialog, lockLead, lockHistory, factAudio, factAudioBtn, e.currentTarget.dataset.day);
    return;
  }
  const day = e.currentTarget.dataset.day;
  openModal(
    day,
    modal,
    zoomFrame,
    audioEl,
    riddleText,
    revealBtn,
    singerReveal,
    signatureOverlay,
    signatureText,
    artistOverlay,
    artistLabel,
    skipRevealBtn,
    playPauseBtn,
    progressFill,
    progressHandle,
    timeElapsed,
    timeRemaining
  );
}

// Create calendar doors
createDoors(grid, onDoorClick);
updateDoorLocks();
setInterval(updateDoorLocks, 1000);

// Lock dialog event listeners
setupLockDialogEventListeners(lockDialog, lockBackdrop, lockCloseBtn, factAudio);

// Fact audio button
if (factAudioBtn) {
  factAudioBtn.addEventListener('click', () => toggleFactAudio(factAudio, factAudioBtn));
}

// Fact audio event listeners
setupFactAudioEventListeners(factAudio, factAudioBtn, audioEl, bgMusic);

// Background music controls
if (musicToggle) {
  musicToggle.addEventListener('click', () => {
    toggleBgMusic(bgMusic, audioEl);
    updateMusicToggleLabel(musicToggle, bgMusic);
  });
}

if (musicPrev) {
  musicPrev.addEventListener('click', () => {
    skipBgTrack(bgMusic, -1);
    updateMusicToggleLabel(musicToggle, bgMusic);
  });
}

if (musicNext) {
  musicNext.addEventListener('click', () => {
    skipBgTrack(bgMusic, 1);
    updateMusicToggleLabel(musicToggle, bgMusic);
  });
}

// Modal controls
backdrop.addEventListener('click', () => closeModal(modal, audioEl, bgMusic));
closeBtn.addEventListener('click', () => closeModal(modal, audioEl, bgMusic));

playPauseBtn.addEventListener('click', () => {
  if (audioEl.paused) {
    if (audioEl.ended) {
      audioEl.currentTime = 0;
    }
    audioEl.play().then(() => { setPlayButtonState(playPauseBtn, 'pause'); }).catch(() => {});
  } else {
    audioEl.pause();
    setPlayButtonState(playPauseBtn, 'play');
  }
});

audioEl.addEventListener('timeupdate', () => updateProgress(audioEl, progressFill, progressHandle, timeElapsed, timeRemaining));
audioEl.addEventListener('loadedmetadata', () => updateProgress(audioEl, progressFill, progressHandle, timeElapsed, timeRemaining));
audioEl.addEventListener('play', () => { 
  setPlayButtonState(playPauseBtn, 'pause');
  applyBgMusicState(bgMusic, true);
});
audioEl.addEventListener('pause', () => {
  setPlayButtonState(playPauseBtn, 'play');
  applyBgMusicState(bgMusic, false);
});
audioEl.addEventListener('ended', () => {
  applyBgMusicState(bgMusic, false);
});

skipRevealBtn.addEventListener('click', () => {
  toggleReveal(
    skipRevealBtn,
    playPauseBtn,
    artistOverlay,
    signatureOverlay,
    signatureText,
    audioEl
  );
});

progressTrack.addEventListener('pointerdown', (e) => startScrub(audioEl, progressTrack, e));
progressHandle.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  startScrub(audioEl, progressTrack, e);
});

// Background music setup
if (bgMusic) {
  setBgTrack(bgMusic, pickNextBgTrack(true));
  applyBgMusicState(bgMusic, false);
  bgMusic.play().catch(() => {
    // If blocked by browser, play on any user interaction
    const playBg = () => {
      applyBgMusicState(bgMusic, false);
      bgMusic.play().catch(() => {});
      document.removeEventListener('click', playBg);
      document.removeEventListener('keydown', playBg);
    };
    document.addEventListener('click', playBg);
    document.addEventListener('keydown', playBg);
  });
  bgMusic.addEventListener('ended', () => {
    setBgTrack(bgMusic, pickNextBgTrack(true));
    applyBgMusicState(bgMusic, false);
    bgMusic.play().catch(() => {});
  });
  bgMusic.addEventListener('error', () => {
    setBgTrack(bgMusic, pickNextBgTrack(true));
    applyBgMusicState(bgMusic, false);
    bgMusic.play().catch(() => {});
  });
  bgMusic.addEventListener('play', () => updateMusicToggleLabel(musicToggle, bgMusic));
  bgMusic.addEventListener('pause', () => updateMusicToggleLabel(musicToggle, bgMusic));
  bgMusic.addEventListener('ended', () => updateMusicToggleLabel(musicToggle, bgMusic));
  bgMusic.addEventListener('error', () => updateMusicToggleLabel(musicToggle, bgMusic));
}

updateMusicToggleLabel(musicToggle, bgMusic);
