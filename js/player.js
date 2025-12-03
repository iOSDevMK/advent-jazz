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

// Background music controller: handles track rotation, indicator updates, and seeking
export async function initBgPlayer({
  bgMusic,
  musicToggle,
  musicPrev,
  musicNext,
  musicShuffle,
  trackIndicator,
  updateMusicBadge,
  setBgTrack,
  getBgTrackPosition,
  isBgMusicEnabled,
  setBgMusicEnabled,
  applyBgMusicState,
  updateMusicToggleLabel,
  loadAvailableTracks
}) {
  if (!bgMusic) return;
  let lastTrackProgressPct = 0;
  let bgTrackIndex = 0;
  let autoAdvanced = false;
  let isShuffle = true;

  if (typeof loadAvailableTracks === 'function') {
    await loadAvailableTracks();
  }

  // Choose a random track on load so each refresh starts fresh
  const initialTotal = getBgTrackPosition().total;
  if (initialTotal > 0) {
    bgTrackIndex = Math.floor(Math.random() * initialTotal);
  }

  const renderTrackIndicator = (progressPct = null) => {
    if (!trackIndicator) return;
    const labelEl = trackIndicator.querySelector('.track-label');
    const fillEl = trackIndicator.querySelector('.track-bar-fill');
    const { total } = getBgTrackPosition();
    if (!total) {
      if (labelEl) labelEl.textContent = '';
      if (fillEl) fillEl.style.width = '0%';
      trackIndicator.setAttribute('aria-label', 'No background tracks loaded');
      return;
    }
    const displayCurrent = Math.max(1, (bgTrackIndex % total) + 1);
    if (labelEl) labelEl.textContent = `Track ${displayCurrent}`;
    if (fillEl) {
      const pct = progressPct == null ? 0 : Math.min(100, Math.max(0, progressPct));
      fillEl.style.width = `${pct}%`;
    }
    trackIndicator.setAttribute('aria-label', `Track ${displayCurrent} of ${total}`);
  };

  const setBgTrackIndex = (idx) => {
    const { total } = getBgTrackPosition();
    if (!total) return;
    bgTrackIndex = (idx + total) % total;
    setBgTrack(bgMusic, bgTrackIndex);
    lastTrackProgressPct = 0;
    renderTrackIndicator(0);
  };

  const nextIndex = () => {
    const { total } = getBgTrackPosition();
    if (!total) return bgTrackIndex;
    if (!isShuffle) return (bgTrackIndex + 1) % total;
    if (total === 1) return bgTrackIndex;
    let candidate = bgTrackIndex;
    while (candidate === bgTrackIndex) {
      candidate = Math.floor(Math.random() * total);
    }
    return candidate;
  };

  const updateShuffleState = () => {
    if (!musicShuffle) return;
    musicShuffle.setAttribute('aria-pressed', String(isShuffle));
    musicShuffle.classList.toggle('active', isShuffle);
  };

  const trackBar = trackIndicator ? trackIndicator.querySelector('.track-bar') : null;
  if (trackBar) {
    trackBar.addEventListener('click', (e) => {
      const rect = trackBar.getBoundingClientRect();
      const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      if (isFinite(bgMusic.duration) && bgMusic.duration > 0) {
        bgMusic.currentTime = pct * bgMusic.duration;
        lastTrackProgressPct = pct * 100;
        renderTrackIndicator(lastTrackProgressPct);
      }
    });
  }

  if (musicToggle) {
    musicToggle.addEventListener('click', () => {
      if (!bgMusic) return;
      if (isBgMusicEnabled()) {
        setBgMusicEnabled(false);
        bgMusic.pause();
      } else {
        setBgMusicEnabled(true);
        bgMusic.play().catch(() => {});
      }
      updateMusicToggleLabel(musicToggle, bgMusic);
      updateMusicBadge();
    });
  }

  if (musicPrev) {
    musicPrev.addEventListener('click', () => {
      setBgTrackIndex(bgTrackIndex - 1);
      updateMusicToggleLabel(musicToggle, bgMusic);
      renderTrackIndicator(lastTrackProgressPct);
      updateMusicBadge();
    });
  }

  const handleNext = () => {
    const { total } = getBgTrackPosition();
    if (!total) return;
    setBgTrackIndex(nextIndex());
    updateMusicToggleLabel(musicToggle, bgMusic);
    renderTrackIndicator(lastTrackProgressPct);
    applyBgMusicState(bgMusic, false);
    bgMusic.play().catch(() => {});
    updateMusicBadge();
  };

  const triggerNext = () => {
    if (musicNext) {
      musicNext.click();
    } else {
      handleNext();
    }
  };

  if (musicNext) {
    musicNext.addEventListener('click', handleNext);
  }

  if (musicShuffle) {
    musicShuffle.addEventListener('click', () => {
      isShuffle = !isShuffle;
      updateShuffleState();
    });
    updateShuffleState();
  }

  // initial setup
  setBgTrackIndex(bgTrackIndex);
  renderTrackIndicator(0);
  applyBgMusicState(bgMusic, false);
  const initialPlay = bgMusic.play();
  if (initialPlay && typeof initialPlay.then === 'function') {
    initialPlay
      .then(() => { updateMusicToggleLabel(musicToggle, bgMusic); updateMusicBadge(); })
      .catch(() => {
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

  bgMusic.addEventListener('timeupdate', () => {
    const dur = bgMusic.duration;
    const cur = bgMusic.currentTime;
    const pct = dur && isFinite(dur) && dur > 0 ? (cur / dur) * 100 : 0;
    lastTrackProgressPct = pct;
    renderTrackIndicator(pct);
    if (!autoAdvanced && dur && isFinite(dur) && dur > 0 && cur >= dur * 0.985) {
      autoAdvanced = true;
      triggerNext();
      setTimeout(() => { autoAdvanced = false; }, 300);
    }
  });

  bgMusic.addEventListener('ended', triggerNext);
  bgMusic.addEventListener('error', triggerNext);

  bgMusic.addEventListener('play', () => { updateMusicToggleLabel(musicToggle, bgMusic); updateMusicBadge(); });
  bgMusic.addEventListener('pause', () => { updateMusicToggleLabel(musicToggle, bgMusic); updateMusicBadge(); });
  bgMusic.addEventListener('ended', () => { updateMusicToggleLabel(musicToggle, bgMusic); updateMusicBadge(); });
  bgMusic.addEventListener('error', () => { updateMusicToggleLabel(musicToggle, bgMusic); updateMusicBadge(); });

  renderTrackIndicator(lastTrackProgressPct);
  updateMusicBadge();
}
