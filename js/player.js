// Audio player controls
let isScrubbing = false;

export function formatTime(value, fallback = '--:--') {
  if (!isFinite(value) || value < 0) return fallback;
  const total = Math.max(0, Math.round(value));
  const m = Math.floor(total / 60);
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export function setPlayButtonState(playPauseBtn, state) {
  playPauseBtn.classList.remove('play-state', 'pause-state', 'replay-state');
  playPauseBtn.classList.add(`${state}-state`);
  const labelMap = { play: 'Play', pause: 'Pause' };
  playPauseBtn.setAttribute('aria-label', labelMap[state] || 'Play');
}

export function updateProgress(audioEl, progressFill, progressHandle, timeElapsed, timeRemaining) {
  const dur = audioEl.duration;
  const cur = audioEl.currentTime;
  timeElapsed.textContent = formatTime(cur, '0:00');
  if (isFinite(dur) && dur > 0) {
    const pct = Math.min(100, Math.max(0, (cur / dur) * 100));
    progressFill.style.width = `${pct}%`;
    progressHandle.style.left = `${pct}%`;
    timeRemaining.textContent = formatTime(dur - cur, '--:--');
  } else {
    progressFill.style.width = '0%';
    progressHandle.style.left = '0%';
    timeRemaining.textContent = '--:--';
  }
}

export function scrubTo(audioEl, progressTrack, clientX) {
  const rect = progressTrack.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  if (isFinite(audioEl.duration) && audioEl.duration > 0) {
    audioEl.currentTime = ratio * audioEl.duration;
  }
}

export function startScrub(audioEl, progressTrack, e) {
  e.preventDefault();
  isScrubbing = true;
  
  const onScrubMove = (moveEvent) => {
    if (!isScrubbing) return;
    scrubTo(audioEl, progressTrack, moveEvent.clientX);
  };
  
  const endScrub = (endEvent) => {
    if (!isScrubbing) return;
    scrubTo(audioEl, progressTrack, endEvent.clientX);
    isScrubbing = false;
    document.removeEventListener('pointermove', onScrubMove);
    document.removeEventListener('pointerup', endScrub);
    document.removeEventListener('pointercancel', endScrub);
  };
  
  document.addEventListener('pointermove', onScrubMove);
  document.addEventListener('pointerup', endScrub);
  document.addEventListener('pointercancel', endScrub);
  scrubTo(audioEl, progressTrack, e.clientX);
}
