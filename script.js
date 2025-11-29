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
let currentDay = null;
let currentBackSrc = '';
let currentFrontSrc = '';
let currentSignatureSrc = '';
let isRevealed = false;
let isScrubbing = false;
let currentArtist = '';

function updateSignatureVisibility(){
  // Show signature when artist name exists and front is revealed
  const showSignature = currentArtist && isRevealed;
  const signatureText = document.getElementById('signatureText');
  if(showSignature){
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

// Add artist metadata here to surface the singer name on the back image
const dayMeta = {
  1: { artist: 'Ella Fitzgerald' },
  2: { artist: 'Louis Armstrong' },
  3: { artist: 'Billie Holiday' },
  4: { artist: 'Sarah Vaughan' },
  // Continue through day 24 as your assets are added
};

// create 24 doors
for(let i=1;i<=24;i++){
  const d = document.createElement('button');
  d.className = 'door';
  d.innerHTML = `<span class="door-number">${i}</span>`;
  d.dataset.day = i;
  d.style.setProperty('--door-index', i);
  d.addEventListener('click', onDoorClick);
  // use the shared door background from CSS (assets/door.png)
  grid.appendChild(d);
}

function onDoorClick(e){
  const day = e.currentTarget.dataset.day;
  openModal(day);
}

function formatTime(value, fallback = '--:--'){
  if(!isFinite(value) || value < 0) return fallback;
  const total = Math.max(0, Math.round(value));
  const m = Math.floor(total / 60);
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function setPlayButtonState(state){
  playPauseBtn.classList.remove('play-state','pause-state','replay-state');
  playPauseBtn.classList.add(`${state}-state`);
  const labelMap = { play: 'Play', pause: 'Pause' };
  playPauseBtn.setAttribute('aria-label', labelMap[state] || 'Play');
}

function updateProgress(){
  const dur = audioEl.duration;
  const cur = audioEl.currentTime;
  timeElapsed.textContent = formatTime(cur, '0:00');
  if(isFinite(dur) && dur > 0){
    const pct = Math.min(100, Math.max(0, (cur / dur) * 100));
    progressFill.style.width = `${pct}%`;
    progressHandle.style.left = `${pct}%`;
    timeRemaining.textContent = formatTime(dur - cur, '--:--');
  }else{
    progressFill.style.width = '0%';
    progressHandle.style.left = '0%';
    timeRemaining.textContent = '--:--';
  }
}

function scrubTo(clientX){
  const rect = progressTrack.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  if(isFinite(audioEl.duration) && audioEl.duration > 0){
    audioEl.currentTime = ratio * audioEl.duration;
    updateProgress();
  }
}

function startScrub(e){
  e.preventDefault();
  isScrubbing = true;
  document.addEventListener('pointermove', onScrubMove);
  document.addEventListener('pointerup', endScrub);
  document.addEventListener('pointercancel', endScrub);
  scrubTo(e.clientX);
}

function onScrubMove(e){
  if(!isScrubbing) return;
  scrubTo(e.clientX);
}

function endScrub(e){
  if(!isScrubbing) return;
  scrubTo(e.clientX);
  isScrubbing = false;
  document.removeEventListener('pointermove', onScrubMove);
  document.removeEventListener('pointerup', endScrub);
  document.removeEventListener('pointercancel', endScrub);
}

function openModal(day){
  currentDay = Number(day);
  isRevealed = false;
  skipRevealBtn.classList.remove('revealed');
  skipRevealBtn.setAttribute('aria-label','Reveal singer');
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
  modal.setAttribute('aria-hidden','false');
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
    zoomFrame.querySelectorAll('img').forEach(i => i.style.opacity = '1');
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
  const signatureText = document.getElementById('signatureText');
  if(signatureText) signatureText.textContent = '';
  setPlayButtonState('play');
  progressFill.style.width = '0%';
  progressHandle.style.left = '0%';
  timeElapsed.textContent = '0:00';
  timeRemaining.textContent = '--:--';
  skipRevealBtn.classList.remove('ready');
  riddleText.innerHTML = `<span class="day-number">Day ${day}</span>  —  tap Play to start the audio.`;
  const meta = dayMeta[Number(day)];
  currentArtist = meta && meta.artist ? meta.artist : '';
  if(currentArtist){ artistLabel.textContent = currentArtist; }
  artistOverlay.classList.add('hidden');

  // set day back image inline; prefer JPG then PNG then SVG
  const dayImg = document.getElementById('dayImg');
  const backJpg = `assets/images/day-${day}-back.jpg`;
  const backPng = `assets/images/day-${day}-back.png`;
  const backSvg = `assets/images/day-${day}-back.svg`;
  currentBackSrc = backSvg;
  (async ()=>{
    try{
      let r = await fetch(backJpg, { method: 'HEAD' });
      if(r.ok){ dayImg.src = backJpg; currentBackSrc = backJpg; return; }
      r = await fetch(backPng, { method: 'HEAD' });
      if(r.ok){ dayImg.src = backPng; currentBackSrc = backPng; return; }
      dayImg.src = backSvg;
      currentBackSrc = backSvg;
    }catch(e){ dayImg.src = backSvg; currentBackSrc = backSvg; }
  })();
  dayImg.alt = `Day ${day}`;

  audioEl.oncanplay = () => { updateProgress(); };

  audioEl.onended = () => {
    setPlayButtonState('play');
    skipRevealBtn.classList.add('ready');
    updateProgress();
  };
}

function doReveal(day){
  const dayImg = document.getElementById('dayImg');
  const frontJpg = `assets/images/day-${day}-front.jpg`;
  const frontPng = `assets/images/day-${day}-front.png`;
  const frontSvg = `assets/images/day-${day}-front.svg`;
  return (async ()=>{
    try{
      let r = await fetch(frontJpg, { method: 'HEAD' });
      if(r.ok){ currentFrontSrc = frontJpg; }
      else{
        r = await fetch(frontPng, { method: 'HEAD' });
        if(r.ok){ currentFrontSrc = frontPng; }
        else{
          r = await fetch(frontSvg, { method: 'HEAD' });
          if(r.ok){ currentFrontSrc = frontSvg; }
          else{ currentFrontSrc = 'assets/images/singer-front.png'; }
        }
      }
    }catch(e){ currentFrontSrc = 'assets/images/singer-front.png'; }
    finally{
      // spin animation: rotate Y 90deg (hide), swap image, rotate back
      dayImg.style.transform = 'rotateY(90deg) scaleX(0.05)';
      setTimeout(() => {
        dayImg.src = currentFrontSrc;
        dayImg.style.transform = 'rotateY(0deg) scaleX(1)';
      }, 400);
      
      dayImg.style.opacity = '1';
      revealBtn.classList.add('hidden');
      if(isRevealed && currentArtist){
        artistOverlay.classList.remove('hidden');
        artistLabel.textContent = currentArtist;
      }else{
        artistOverlay.classList.add('hidden');
      }
      updateSignatureVisibility();
    }
    return currentFrontSrc;
  })();
}

function closeModal(){
  audioEl.pause();
  audioEl.currentTime = 0;
  // Restore background music volume
  const bgMusic = document.getElementById('bgMusic');
  if(bgMusic) bgMusic.volume = 0.08;
  document.querySelectorAll('.door.active').forEach(d => d.classList.remove('active'));
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden','true');
}

backdrop.addEventListener('click', closeModal);
closeBtn.addEventListener('click', closeModal);
playPauseBtn.addEventListener('click', () => {
  if(audioEl.paused){
    if(audioEl.ended){
      audioEl.currentTime = 0;
    }
    audioEl.play().then(()=>{ setPlayButtonState('pause'); }).catch(()=>{});
  }else{
    audioEl.pause();
    setPlayButtonState('play');
  }
});
audioEl.addEventListener('timeupdate', updateProgress);
audioEl.addEventListener('loadedmetadata', updateProgress);
audioEl.addEventListener('play', () => { 
  setPlayButtonState('pause');
  // Duck background music when day audio plays
  const bgMusic = document.getElementById('bgMusic');
  if(bgMusic) bgMusic.volume = 0.02;
});
audioEl.addEventListener('pause', () => {
  if(audioEl.currentTime >= audioEl.duration && isFinite(audioEl.duration)){
    setPlayButtonState('play');
  }else{
    setPlayButtonState('play');
  }
  // Restore background music volume
  const bgMusic = document.getElementById('bgMusic');
  if(bgMusic) bgMusic.volume = 0.08;
});
audioEl.addEventListener('ended', () => {
  // Restore background music volume when audio finishes
  const bgMusic = document.getElementById('bgMusic');
  if(bgMusic) bgMusic.volume = 0.08;
});
skipRevealBtn.addEventListener('click', () => {
  if(currentDay !== null){
    audioEl.pause();
    const dayImg = document.getElementById('dayImg');
    if(!isRevealed){
      isRevealed = true;
      doReveal(currentDay).then(()=>{
        skipRevealBtn.classList.add('revealed');
        skipRevealBtn.setAttribute('aria-label','Hide singer');
        artistOverlay.classList.add('hidden');
        updateSignatureVisibility();
      });
    }else{
      // spin back to back image
      dayImg.style.transform = 'rotateY(-90deg) scaleX(0.05)';
      setTimeout(() => {
        dayImg.src = currentBackSrc || dayImg.src;
        dayImg.style.transform = 'rotateY(0deg) scaleX(1)';
      }, 400);
      isRevealed = false;
      skipRevealBtn.classList.remove('revealed');
      skipRevealBtn.setAttribute('aria-label','Reveal singer');
      updateSignatureVisibility();
      artistOverlay.classList.add('hidden');
    }
    skipRevealBtn.classList.add('ready');
    setPlayButtonState('play');
  }
});
progressTrack.addEventListener('pointerdown', startScrub);
progressHandle.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  startScrub(e);
});

// Background music
const bgMusic = document.getElementById('bgMusic');
if(bgMusic){
  bgMusic.volume = 0.08;
  // Try to auto-play immediately
  bgMusic.play().catch(() => {
    // If blocked by browser, play on any user interaction
    const playBg = () => {
      bgMusic.play().catch(()=>{});
      document.removeEventListener('click', playBg);
      document.removeEventListener('keydown', playBg);
    };
    document.addEventListener('click', playBg);
    document.addEventListener('keydown', playBg);
  });
}
