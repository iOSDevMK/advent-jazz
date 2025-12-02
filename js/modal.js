// Modal and reveal management
import { dayMeta } from './constants.js';
import { setPlayButtonState, updateProgress } from './player.js';
import { applyBgMusicState } from './music.js';

let currentDay = null;
let currentBackSrc = '';
let currentFrontSrc = '';
let isRevealed = false;
let currentArtist = '';

export function getCurrentDay() {
  return currentDay;
}

export function isCurrentlyRevealed() {
  return isRevealed;
}

export function getCurrentBackSrc() {
  return currentBackSrc;
}

export function updateSignatureVisibility(signatureOverlay, signatureText) {
  // Show signature when artist name exists and front is revealed
  const showSignature = currentArtist && isRevealed;
  if (showSignature) {
    signatureText.textContent = currentArtist;
    signatureOverlay.classList.remove('hidden');
    // Delay animation until after flip animation completes
    setTimeout(() => {
      signatureOverlay.classList.add('visible');
      signatureText.classList.remove('animate');
      // Trigger reflow to restart animation
      void signatureText.offsetWidth;
      signatureText.classList.add('animate');
    }, 800);
    return;
  }
  signatureOverlay.classList.remove('visible');
  signatureText.classList.remove('animate');
  signatureOverlay.classList.add('hidden');
}

export async function doReveal(day, dayImg, artistOverlay, artistLabel, signatureOverlay, signatureText) {
  const frontJpg = `assets/images/day-${day}-front.jpg`;
  const frontPng = `assets/images/day-${day}-front.png`;
  const frontSvg = `assets/images/day-${day}-front.svg`;
  
  try {
    let r = await fetch(frontJpg, { method: 'HEAD' });
    if (r.ok) {
      currentFrontSrc = frontJpg;
    } else {
      r = await fetch(frontPng, { method: 'HEAD' });
      if (r.ok) {
        currentFrontSrc = frontPng;
      } else {
        r = await fetch(frontSvg, { method: 'HEAD' });
        if (r.ok) {
          currentFrontSrc = frontSvg;
        } else {
          currentFrontSrc = 'assets/images/singer-front.png';
        }
      }
    }
  } catch (e) {
    currentFrontSrc = 'assets/images/singer-front.png';
  }
  
  // spin animation: rotate Y 90deg (hide), swap image, rotate back
  dayImg.style.transform = 'rotateY(90deg) scaleX(0.05)';
  setTimeout(() => {
    dayImg.src = currentFrontSrc;
    dayImg.style.transform = 'rotateY(0deg) scaleX(1)';
  }, 400);
  
  dayImg.style.opacity = '1';
  if (isRevealed && currentArtist) {
    artistOverlay.classList.remove('hidden');
    artistLabel.textContent = currentArtist;
  } else {
    artistOverlay.classList.add('hidden');
  }
  updateSignatureVisibility(signatureOverlay, signatureText);
  
  return currentFrontSrc;
}

export function openModal(
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
) {
  currentDay = Number(day);
  isRevealed = false;
  skipRevealBtn.classList.remove('revealed');
  skipRevealBtn.setAttribute('aria-label', 'Reveal singer');
  
  // Store current day on audio element for quiz trigger
  audioEl.dataset.currentDay = day;
  
  // Prepare image BEFORE animation starts
  const dayImg = document.getElementById('dayImg');
  const backJpg = `assets/images/day-${day}-back.jpg`;
  const backPng = `assets/images/day-${day}-back.png`;
  const backSvg = `assets/images/day-${day}-back.svg`;
  currentBackSrc = backSvg;
  
  // Set image to hidden initially
  dayImg.style.opacity = '0';
  dayImg.alt = `Day ${day}`;
  
  // Start loading the image asynchronously
  (async () => {
    try {
      let r = await fetch(backJpg, { method: 'HEAD' });
      if (r.ok) { dayImg.src = backJpg; currentBackSrc = backJpg; return; }
      r = await fetch(backPng, { method: 'HEAD' });
      if (r.ok) { dayImg.src = backPng; currentBackSrc = backPng; return; }
      dayImg.src = backSvg;
      currentBackSrc = backSvg;
    } catch (e) { dayImg.src = backSvg; currentBackSrc = backSvg; }
  })();
  
  // animate a clone of the clicked door into the modal zoom frame
  const door = document.querySelector(`.door[data-day="${day}"]`);
  const rect = door.getBoundingClientRect();
  door.classList.add('active');
  const clone = document.createElement('div');
  clone.className = 'door-clone animate-zoom';
  clone.innerHTML = `<span style="font-size:20px">${day}</span>`;
  document.body.appendChild(clone);
  
  // set initial position
  clone.style.left = rect.left + 'px';
  clone.style.top = rect.top + 'px';
  clone.style.width = rect.width + 'px';
  clone.style.height = rect.height + 'px';
  clone.style.fontSize = '24px';

  // force layout
  clone.getBoundingClientRect();

  // target frame center
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  const targetRect = zoomFrame.getBoundingClientRect();

  // animate to center of zoomFrame
  requestAnimationFrame(() => {
    clone.style.left = (targetRect.left) + 'px';
    clone.style.top = (targetRect.top) + 'px';
    clone.style.width = targetRect.width + 'px';
    clone.style.height = targetRect.height + 'px';
    clone.style.display = 'grid';
    clone.style.placeItems = 'center';
    clone.style.fontSize = '36px';
  });

  // After animation completes, remove clone and show actual images
  clone.addEventListener('transitionend', () => {
    clone.remove();
    // trigger polished enter animation on the zoom frame image
    const ENTER_MODE = 'vertical'; // 'horizontal' or 'vertical'
    zoomFrame.classList.add('entering');
    zoomFrame.classList.toggle('horizontal', ENTER_MODE === 'horizontal');
    zoomFrame.classList.toggle('vertical', ENTER_MODE === 'vertical');
    
    // Fade in image after a brief delay to ensure it's loaded
    setTimeout(() => {
      dayImg.style.opacity = '1';
    }, 50);
    
    // remove the class after the animation ends
    dayImg.addEventListener('animationend', () => {
      zoomFrame.classList.remove('entering');
      zoomFrame.classList.remove('horizontal');
      zoomFrame.classList.remove('vertical');
      // leave the image visible after animation completes
      dayImg.style.opacity = '1';
    }, { once: true });
  }, { once: true });

  // set assets for day (use placeholder pattern)
  audioEl.src = `assets/audio/audio-day-${day}.mp3`;
  audioEl.volume = 1.0;
  audioEl.load();
  audioEl.currentTime = 0;
  revealBtn.classList.add('hidden');
  singerReveal.classList.add('hidden');
  singerReveal.style.opacity = '0';
  signatureOverlay.classList.add('hidden');
  if (signatureText) signatureText.textContent = '';
  setPlayButtonState(playPauseBtn, 'play');
  progressFill.style.width = '0%';
  progressHandle.style.left = '0%';
  timeElapsed.textContent = '0:00';
  timeRemaining.textContent = '--:--';
  // Disable reveal at start; script.js will re-enable after 50% playback
  skipRevealBtn.classList.remove('ready');
  skipRevealBtn.disabled = true;
  skipRevealBtn.setAttribute('aria-label', 'Reveal locked until 50%');
  riddleText.innerHTML = `<span class="day-number">Day ${day}</span>  —  tap Play to start the audio.`;
  const meta = dayMeta[Number(day)];
  currentArtist = meta && meta.artist ? meta.artist : '';
  if (currentArtist) { artistLabel.textContent = currentArtist; }
  artistOverlay.classList.add('hidden');

  audioEl.oncanplay = () => { 
    updateProgress(audioEl, progressFill, progressHandle, timeElapsed, timeRemaining); 
  };

  audioEl.onended = () => {
    setPlayButtonState(playPauseBtn, 'play');
    skipRevealBtn.classList.add('ready');
    updateProgress(audioEl, progressFill, progressHandle, timeElapsed, timeRemaining);
  };
}

export function closeModal(modal, audioEl, bgMusic) {
  audioEl.pause();
  audioEl.currentTime = 0;
  // Restore background music volume
  applyBgMusicState(bgMusic, false);
  document.querySelectorAll('.door.active').forEach(d => d.classList.remove('active'));
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

export function toggleReveal(
  skipRevealBtn,
  playPauseBtn,
  artistOverlay,
  signatureOverlay,
  signatureText,
  audioEl
) {
  if (currentDay === null) return;
  
  audioEl.pause();
  const dayImg = document.getElementById('dayImg');
  
  if (!isRevealed) {
    isRevealed = true;
    doReveal(currentDay, dayImg, artistOverlay, document.getElementById('artistLabel'), signatureOverlay, signatureText).then(() => {
      skipRevealBtn.classList.add('revealed');
      skipRevealBtn.setAttribute('aria-label', 'Hide singer');
      artistOverlay.classList.add('hidden');
      updateSignatureVisibility(signatureOverlay, signatureText);
      
      // Always show correct/incorrect mark based on quiz result
      const zoomFrame = document.getElementById('zoomFrame');
      let mark = zoomFrame.querySelector('.reveal-mark');
      if(!mark){
        mark = document.createElement('div');
        mark.className = 'reveal-mark';
        zoomFrame.appendChild(mark);
      }
      // Determine if correct (if no quiz was taken, assume correct for direct reveal)
      const isCorrect = window.lastQuizCorrect !== false;
      mark.className = 'reveal-mark ' + (isCorrect ? 'success' : 'fail');

      // Play yes/no sound on reveal
      // Play sfx after flip completes (~400ms)
      setTimeout(() => {
        try {
          const sfx = new Audio(isCorrect ? 'assets/effects/yes.mp3' : 'assets/effects/no.mp3');
          sfx.volume = 0.4;
          sfx.play().catch(() => {});
        } catch (_) {}
      }, 450);
    });
  } else {
    // spin back to back image
    dayImg.style.transform = 'rotateY(-90deg) scaleX(0.05)';
    setTimeout(() => {
      dayImg.src = currentBackSrc || dayImg.src;
      dayImg.style.transform = 'rotateY(0deg) scaleX(1)';
    }, 400);
    isRevealed = false;
    skipRevealBtn.classList.remove('revealed');
    skipRevealBtn.setAttribute('aria-label', 'Reveal singer');
    updateSignatureVisibility(signatureOverlay, signatureText);
    artistOverlay.classList.add('hidden');
    // Hide/remove correct/incorrect mark when back image is shown
    const zoomFrame = document.getElementById('zoomFrame');
    const mark = zoomFrame && zoomFrame.querySelector('.reveal-mark');
    if (mark) {
      // Prefer removing to guarantee it doesn't overlay the back side
      mark.remove();
    }
  }
  skipRevealBtn.classList.add('ready');
  setPlayButtonState(playPauseBtn, 'play');
}

// Ensure front-side reveal without toggling back, used when a quiz answer is selected
export function revealFront(
  skipRevealBtn,
  playPauseBtn,
  artistOverlay,
  signatureOverlay,
  signatureText,
  audioEl
) {
  if (currentDay === null) return;
  audioEl.pause();
  const dayImg = document.getElementById('dayImg');
  // Force reveal state
  isRevealed = true;
  doReveal(currentDay, dayImg, artistOverlay, document.getElementById('artistLabel'), signatureOverlay, signatureText).then(() => {
    skipRevealBtn.classList.add('revealed');
    skipRevealBtn.setAttribute('aria-label', 'Hide singer');
    artistOverlay.classList.add('hidden');
    updateSignatureVisibility(signatureOverlay, signatureText);

    const zoomFrame = document.getElementById('zoomFrame');
    let mark = zoomFrame.querySelector('.reveal-mark');
    if(!mark){
      mark = document.createElement('div');
      mark.className = 'reveal-mark';
      zoomFrame.appendChild(mark);
    }
    const isCorrect = window.lastQuizCorrect !== false;
    mark.className = 'reveal-mark ' + (isCorrect ? 'success' : 'fail');
    // Play sfx after flip completes (~400ms)
    setTimeout(() => {
      try {
        const sfx = new Audio(isCorrect ? 'assets/effects/yes.mp3' : 'assets/effects/no.mp3');
        sfx.volume = 0.4;
        sfx.play().catch(() => {});
      } catch (_) {}
    }, 450);
  });
  skipRevealBtn.classList.add('ready');
  setPlayButtonState(playPauseBtn, 'play');
}

// Show the back image when returning to the quiz (hide front, remove marks)
export function showBackForQuiz(
  skipRevealBtn,
  artistOverlay,
  signatureOverlay,
  signatureText
) {
  if (currentDay === null) return;
  if (!isRevealed) return; // already on back
  const dayImg = document.getElementById('dayImg');
  // Flip back animation
  dayImg.style.transform = 'rotateY(-90deg) scaleX(0.05)';
  setTimeout(() => {
    dayImg.src = currentBackSrc || dayImg.src;
    dayImg.style.transform = 'rotateY(0deg) scaleX(1)';
  }, 400);
  isRevealed = false;
  skipRevealBtn.classList.remove('revealed');
  skipRevealBtn.setAttribute('aria-label', 'Reveal singer');
  updateSignatureVisibility(signatureOverlay, signatureText);
  artistOverlay.classList.add('hidden');
  const zoomFrame = document.getElementById('zoomFrame');
  const mark = zoomFrame && zoomFrame.querySelector('.reveal-mark');
  if (mark) mark.remove();
}
