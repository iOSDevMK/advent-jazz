// Main application orchestrator
import { DEV_OPEN, CALENDAR_MONTH } from './js/constants.js';
import { 
  initBgTracks, 
  applyBgMusicState, 
  updateMusicToggleLabel, 
  toggleBgMusic, 
  skipBgTrack, 
  pickNextBgTrack, 
  setBgTrack,
  getBgTrackPosition,
  isBgMusicEnabled 
} from './js/music.js';
import { 
  setupFactAudioEventListeners, 
  toggleFactAudio 
} from './js/facts.js';
import { 
  updateDoorLocks, 
  createDoors,
  ensureSnowLayer,
  toggleSnowfall 
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
  toggleReveal,
  revealFront,
  showBackForQuiz
} from './js/modal.js';
import { openRiddleDialog } from './js/riddles.js';

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
const snowToggle = document.getElementById('snowToggle');
const bgMusic = document.getElementById('bgMusic');
const factAudio = document.getElementById('factAudio');
const signatureText = document.getElementById('signatureText');
const trackIndicator = document.getElementById('trackIndicator');
const musicBadge = document.getElementById('musicBadge');

// Initialize background music tracks
initBgTracks();

// Reveal eligibility: enable eye button after 50% playback
function updateRevealEligibility() {
  if (!skipRevealBtn || !audioEl) return;
  const dur = audioEl.duration;
  const cur = audioEl.currentTime;
  const ready = isFinite(dur) && dur > 0 && cur >= dur * 0.5;
  skipRevealBtn.classList.toggle('ready', ready);
  const label = ready ? (skipRevealBtn.classList.contains('revealed') ? 'Hide singer' : 'Reveal singer') : 'Reveal locked until 50%';
  skipRevealBtn.setAttribute('aria-label', label);
}

function renderTrackIndicator(indicatorEl) {
  if (!indicatorEl) return;
  const { current, total } = getBgTrackPosition();
  if (!total) {
    indicatorEl.textContent = '';
    indicatorEl.setAttribute('aria-label', 'No background tracks loaded');
    return;
  }
  const displayCurrent = Math.max(1, current || 1);
  indicatorEl.textContent = `Track ${displayCurrent}`;
  indicatorEl.setAttribute('aria-label', `Track ${displayCurrent} of ${total}`);
}

function updateMusicBadge() {
  if (!musicBadge) return;
  const playing = bgMusic && isBgMusicEnabled() && !bgMusic.paused && !bgMusic.ended;
  const modalOpen = modal && !modal.classList.contains('hidden');
  const lockOpen = lockDialog && !lockDialog.classList.contains('hidden');
  const shouldShow = playing && !modalOpen && !lockOpen;
  if (shouldShow) {
    musicBadge.classList.remove('hidden');
    positionBadgeOverToday(true);
  } else {
    musicBadge.classList.add('hidden');
  }
}

function getTodayDoorElement() {
  const now = new Date();
  if (now.getMonth() !== CALENDAR_MONTH) return null;
  const day = now.getDate();
  return document.querySelector(`.door[data-day="${day}"]`);
}

function positionBadgeOverToday(force = false) {
  if (!musicBadge || (!force && musicBadge.classList.contains('hidden'))) return;
  const door = getTodayDoorElement();
  if (!door) {
    musicBadge.style.left = '50%';
    musicBadge.style.top = '16px';
    return;
  }
  const rect = door.getBoundingClientRect();
  const badgeSize = musicBadge.offsetWidth || 70;
  const left = rect.left + (rect.width / 2);
  const top = rect.top + (rect.height * 0.2) - (badgeSize * 0.1);
  musicBadge.style.left = `${left}px`;
  musicBadge.style.top = `${top}px`;
}

// Door click handler
function onDoorClick(e) {
  if (!DEV_OPEN && e.currentTarget.classList.contains('locked')) {
    showLockDialog(lockDialog, lockLead, lockHistory, factAudio, factAudioBtn, e.currentTarget.dataset.day);
    updateMusicBadge();
    return;
  }
  const day = e.currentTarget.dataset.day;
  // Stop snowfall when opening modal
  toggleSnowfall(false);
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
  updateMusicBadge();
}

// Create calendar doors
createDoors(grid, onDoorClick);
updateDoorLocks();
setInterval(updateDoorLocks, 1000);
// Snowfall toggle with persisted state
ensureSnowLayer();
const snowPref = localStorage.getItem('snow-enabled');
let snowEnabled = snowPref === null ? true : snowPref === 'true';
toggleSnowfall(snowEnabled);
if(snowToggle){ snowToggle.setAttribute('aria-pressed', String(!!snowEnabled)); }

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
    updateMusicBadge();
  });
}

if (musicPrev) {
  musicPrev.addEventListener('click', () => {
    skipBgTrack(bgMusic, -1);
    updateMusicToggleLabel(musicToggle, bgMusic);
    renderTrackIndicator(trackIndicator);
    updateMusicBadge();
  });
}

if (musicNext) {
  musicNext.addEventListener('click', () => {
    skipBgTrack(bgMusic, 1);
    updateMusicToggleLabel(musicToggle, bgMusic);
    renderTrackIndicator(trackIndicator);
    updateMusicBadge();
  });
}

// Snow toggle
if(snowToggle){
  snowToggle.addEventListener('click', () => {
    snowEnabled = !snowEnabled;
    localStorage.setItem('snow-enabled', String(snowEnabled));
    snowToggle.setAttribute('aria-pressed', String(!!snowEnabled));
    // Only show snow when modal is closed
    const isModalHidden = modal.classList.contains('hidden');
    toggleSnowfall(snowEnabled && isModalHidden);
  });
}

// Modal controls
backdrop.addEventListener('click', () => { closeModal(modal, audioEl, bgMusic); toggleSnowfall(true); updateMusicBadge(); });
closeBtn.addEventListener('click', () => { closeModal(modal, audioEl, bgMusic); toggleSnowfall(true); updateMusicBadge(); });

playPauseBtn.addEventListener('click', () => {
  if (audioEl.paused) {
    setPlayButtonState(playPauseBtn, 'pause');
    if (audioEl.ended) {
      audioEl.currentTime = 0;
    }
    audioEl.play().catch(() => {
      setPlayButtonState(playPauseBtn, 'play');
    });
  } else {
    audioEl.pause();
    setPlayButtonState(playPauseBtn, 'play');
  }
  updateRevealEligibility();
  updateMusicBadge();
});

audioEl.addEventListener('timeupdate', () => { 
  updateProgress(audioEl, progressFill, progressHandle, timeElapsed, timeRemaining);
  updateRevealEligibility();
  updateMusicBadge();
});
audioEl.addEventListener('loadedmetadata', () => { 
  updateProgress(audioEl, progressFill, progressHandle, timeElapsed, timeRemaining);
  updateRevealEligibility();
});
audioEl.addEventListener('play', () => { 
  setPlayButtonState(playPauseBtn, 'pause');
  applyBgMusicState(bgMusic, true);
  updateRevealEligibility();
});
audioEl.addEventListener('pause', () => {
  setPlayButtonState(playPauseBtn, 'play');
  applyBgMusicState(bgMusic, false);
  updateRevealEligibility();
});
audioEl.addEventListener('ended', () => {
  applyBgMusicState(bgMusic, false);
  // At end, allow reveal if not yet allowed
  updateRevealEligibility();
  updateMusicBadge();
  // Auto-show quiz when audio finishes
  const day = audioEl.dataset.currentDay;
  if(day && !skipRevealBtn.classList.contains('revealed')){
    // Ensure back image is shown while taking the quiz
    showBackForQuiz(skipRevealBtn, artistOverlay, signatureOverlay, signatureText);
    openRiddleDialog(day);
  }
});

// Listen for quiz answer and trigger reveal
document.addEventListener('quiz-answered', (e) => {
  const { correct } = e.detail;
  window.lastQuizCorrect = correct;
  // Always reveal front side (no toggle-back) after answering quiz
  revealFront(
    skipRevealBtn,
    playPauseBtn,
    artistOverlay,
    signatureOverlay,
    signatureText,
    audioEl
  );
  updateRevealEligibility();
  updateMusicBadge();
});

skipRevealBtn.addEventListener('click', () => {
  // Show feedback if not ready yet
  if (!skipRevealBtn.classList.contains('ready')) {
    showToast('Listen to at least 50% before revealing!');
    return;
  }
  
  // Always open quiz to allow repeat attempts; show back image alongside quiz
  const day = audioEl.dataset.currentDay;
  if(day){
    showBackForQuiz(skipRevealBtn, artistOverlay, signatureOverlay, signatureText);
    openRiddleDialog(day);
  }
});

// Simple toast notification helper
function showToast(message) {
  let toast = document.querySelector('.toast-banner');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-banner';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.remove('fade-out');
  setTimeout(() => {
    toast.classList.add('fade-out');
  }, 2200);
}

progressTrack.addEventListener('pointerdown', (e) => startScrub(audioEl, progressTrack, e));
progressHandle.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  startScrub(audioEl, progressTrack, e);
});

window.addEventListener('resize', () => {
  positionBadgeOverToday();
});
window.addEventListener('scroll', () => {
  positionBadgeOverToday();
});

const badgeVisibilityObserver = new MutationObserver(() => updateMusicBadge());
if (modal) {
  badgeVisibilityObserver.observe(modal, { attributes: true, attributeFilter: ['class'] });
}
if (lockDialog) {
  badgeVisibilityObserver.observe(lockDialog, { attributes: true, attributeFilter: ['class'] });
}

// Background music setup
if (bgMusic) {
  setBgTrack(bgMusic, pickNextBgTrack(true));
  renderTrackIndicator(trackIndicator);
  applyBgMusicState(bgMusic, false);
  const initialPlay = bgMusic.play();
  if (initialPlay && typeof initialPlay.then === 'function') {
    initialPlay
      .then(() => { updateMusicToggleLabel(musicToggle, bgMusic); updateMusicBadge(); })
      .catch(() => {
        // If blocked by browser, play on any user interaction
        const playBg = () => {
          applyBgMusicState(bgMusic, false);
          bgMusic.play().catch(() => {});
          updateMusicToggleLabel(musicToggle, bgMusic);
          updateMusicBadge();
          document.removeEventListener('click', playBg);
          document.removeEventListener('keydown', playBg);
        };
        document.addEventListener('click', playBg);
        document.addEventListener('keydown', playBg);
      });
  }
  bgMusic.addEventListener('ended', () => {
    setBgTrack(bgMusic, pickNextBgTrack(true));
    renderTrackIndicator(trackIndicator);
    applyBgMusicState(bgMusic, false);
    bgMusic.play().catch(() => {});
    updateMusicBadge();
  });
  bgMusic.addEventListener('error', () => {
    setBgTrack(bgMusic, pickNextBgTrack(true));
    renderTrackIndicator(trackIndicator);
    applyBgMusicState(bgMusic, false);
    bgMusic.play().catch(() => {});
    updateMusicBadge();
  });
  bgMusic.addEventListener('play', () => { updateMusicToggleLabel(musicToggle, bgMusic); updateMusicBadge(); });
  bgMusic.addEventListener('pause', () => { updateMusicToggleLabel(musicToggle, bgMusic); updateMusicBadge(); });
  bgMusic.addEventListener('ended', () => { updateMusicToggleLabel(musicToggle, bgMusic); updateMusicBadge(); });
  bgMusic.addEventListener('error', () => { updateMusicToggleLabel(musicToggle, bgMusic); updateMusicBadge(); });
}

updateMusicToggleLabel(musicToggle, bgMusic);
renderTrackIndicator(trackIndicator);
updateMusicBadge();
