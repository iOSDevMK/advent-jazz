// Jazz facts and audio management
import { FACT_AUDIO_MAX, jazzFacts } from './constants.js';
import { setFactAudioPlaying, applyBgMusicState } from './music.js';

let factAudioReady = false;

export { jazzFacts };

export function prepareFactAudio(factAudio, factAudioBtn, idx) {
  if (!factAudio || !factAudioBtn) {
    factAudioReady = false;
    return;
  }
  if (idx > FACT_AUDIO_MAX) {
    factAudioReady = false;
    factAudioBtn.disabled = true;
    factAudioBtn.textContent = 'No audio available';
    return;
  }
  const src = `assets/audio/jazzfacts/audio_jazzfact_${idx}.mp3`;
  if (factAudio.dataset.src !== src) {
    factAudio.dataset.src = src;
    factAudio.src = src;
    factAudio.load();
  }
  factAudio.currentTime = 0;
  factAudioReady = true;
  factAudioBtn.disabled = false;
  factAudioBtn.textContent = 'Play fact audio';
  factAudioBtn.classList.remove('pause');
  factAudioBtn.classList.add('play');
}

export function playFactAudio(factAudio, factAudioBtn) {
  if (!factAudio) return;
  if (!factAudioReady) {
    factAudio.load();
    factAudioReady = true;
  }
  factAudio.currentTime = 0;
  factAudio.play().catch(() => {
    if (factAudioBtn) {
      factAudioBtn.textContent = 'Audio unavailable';
      factAudioBtn.disabled = false;
    }
  });
}

export function toggleFactAudio(factAudio, factAudioBtn) {
  if (!factAudio) return;
  if (!factAudioReady) {
    playFactAudio(factAudio, factAudioBtn);
    return;
  }
  if (factAudio.paused) {
    factAudio.play().catch(() => {
      if (factAudioBtn) {
        factAudioBtn.textContent = 'Audio unavailable';
        factAudioBtn.disabled = false;
        factAudioBtn.classList.remove('play', 'pause');
      }
    });
  } else {
    factAudio.pause();
  }
}

export function stopFactAudio(factAudio) {
  if (!factAudio) return;
  factAudio.pause();
  factAudio.currentTime = 0;
}

export function setupFactAudioEventListeners(factAudio, factAudioBtn, audioEl, bgMusic) {
  if (!factAudio) return;

  factAudio.addEventListener('play', () => {
    setFactAudioPlaying(true);
    if (factAudioBtn) {
      factAudioBtn.textContent = 'Pause fact audio';
      factAudioBtn.classList.remove('play');
      factAudioBtn.classList.add('pause');
    }
    applyBgMusicState(bgMusic, !audioEl.paused && !audioEl.ended);
  });

  factAudio.addEventListener('error', () => {
    if (factAudioBtn) {
      factAudioBtn.textContent = 'Audio unavailable';
      factAudioBtn.disabled = false;
      factAudioBtn.classList.remove('play', 'pause');
    }
    setFactAudioPlaying(false);
    applyBgMusicState(bgMusic, !audioEl.paused && !audioEl.ended);
  });

  factAudio.addEventListener('ended', () => {
    setFactAudioPlaying(false);
    applyBgMusicState(bgMusic, !audioEl.paused && !audioEl.ended);
    if (factAudioBtn) {
      factAudioBtn.textContent = 'Play fact audio';
      factAudioBtn.classList.remove('pause');
      factAudioBtn.classList.add('play');
    }
  });

  factAudio.addEventListener('pause', () => {
    if (factAudio.ended) return;
    setFactAudioPlaying(false);
    applyBgMusicState(bgMusic, !audioEl.paused && !audioEl.ended);
    if (factAudioBtn) {
      factAudioBtn.textContent = 'Play fact audio';
      factAudioBtn.classList.remove('pause');
      factAudioBtn.classList.add('play');
    }
  });
}
