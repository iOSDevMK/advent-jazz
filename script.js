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
const bgMusic = document.getElementById('bgMusic');
const DEBUG_OPEN = new URLSearchParams(location.search).has('debug');
const IS_LOCALHOST = ['localhost','127.0.0.1','::1'].includes(location.hostname);
const DEV_OPEN = IS_LOCALHOST && DEBUG_OPEN;
let currentDay = null;
let currentBackSrc = '';
let currentFrontSrc = '';
let currentSignatureSrc = '';
let isRevealed = false;
let isScrubbing = false;
let currentArtist = '';
let bgMusicEnabled = true;
const jazzFacts = [
  'Jazz took shape in New Orleans around 1900 when African rhythms met European harmony. Congo Square gatherings kept drumming traditions alive. The port city’s brass bands added parade energy. Early improvisers blurred written and oral traditions. That mix seeded the groove we now call Jazz.',
  'Ragtime brought a jaunty offbeat and syncopated sparkle. The blues added tension, release, and direct storytelling. Together they gave early Jazz its snap and soul. Piano rolls spread the style across the country. Dancers and saloons demanded that feel every night.',
  'Cornetist Buddy Bolden became an early folk hero—loud, loose, and fearless. His improvising proved personality could trump the written page. Crowds followed his band through parades and dances. Legends say his sound could be heard for blocks. His spirit set the tone for Jazz’s boldness.',
  'In 1917 the Original Dixieland Jass Band cut one of the first Jazz records. The novelty sound sparked national curiosity. Musicians soon traveled north to Chicago’s clubs and dance halls. There the music gained new audiences and better pay. Records turned local scenes into national waves.',
  'Louis Armstrong made the solo the main event. His warm tone, rhythmic swing, and playful scat turned every chorus into a story. Audiences heard a new, conversational horn voice. He influenced singers as much as instrumentalists. Jazz phrasing still echoes his approach.',
  'Duke Ellington raised big-band Jazz to a composer’s art. At the Cotton Club he painted with tone colors while keeping the swing alive. He wrote parts for specific players’ sounds. Suites and sacred concerts showed Jazz could be concert music. His band became his instrument.',
  'Kansas City nurtured a gritty, riff-driven swing. Count Basie’s rhythm section perfected the light, buoyant pulse dancers loved. Jam sessions stretched solos deep into the night. Head arrangements let bands adapt on the fly. The result was relaxed but unstoppable Jazz momentum.',
  'Bebop erupted in the 1940s as a rebellion. Dizzy Gillespie and Charlie Parker pushed lightning tempos and dense harmonies. Small combos replaced big bands in late-night jam sessions. Lines became angular, and rhythm sections hit harder. Jazz turned inward to reward deep listening.',
  'Thelonious Monk used jagged melodies and carefully placed silences. His tunes sound quirky yet glow with deep blues feeling. Pianists learned that space could swing as hard as notes. His dissonances feel like characters in a story. Modern Jazz harmony owes him its edges.',
  'Cool Jazz slowed the pace and softened the edges. Miles Davis’s “Birth of the Cool” showed how quiet tones can still hit hard. Arrangers layered subtle horn voicings over light drums. West Coast players embraced the airy approach. The mood proved that Jazz could whisper and still command attention.',
  'On the West Coast, arranged, airy lines thrived. Gerry Mulligan and Chet Baker personified that clear, relaxed sound. Counterpoint between horns replaced dense chord hits. Audiences heard Jazz as sleek, sunlit, and modern. The vibe contrasted the East Coast’s grit.',
  'Hard Bop pulled blues and gospel back to center in the 1950s. Art Blakey and Horace Silver balanced earthy grooves with fiery solos. Churchy harmonies met driving ride cymbals. Audiences clapped along to call-and-response riffs. Jazz felt both sophisticated and down-home.',
  'Modal Jazz reduced chord changes to open space for melody. Miles Davis’s “Kind of Blue” became the touchstone of that freedom. Players lingered on modes instead of racing through progressions. Solos breathed more, inviting lyrical phrasing. The approach reshaped how Jazz thinks about harmony.',
  'John Coltrane chased urgency and spirit from “Giant Steps” to “A Love Supreme.” His sheets of sound feel like prayer and storm at once. Each phase showed deeper harmonic exploration. His classic quartet stretched time and intensity. Jazz found a new spiritual voice in his horn.',
  'Free Jazz broke forms and embraced collective improvisation. Ornette Coleman and later Coltrane challenged listeners with radical openness. Melody and rhythm could emerge spontaneously. Musicians reacted in real time without fixed roles. It proved Jazz could question every rule and still communicate.',
  'Latin Jazz fused Afro-Cuban rhythm with Jazz harmony. Bossa nova and samba brought a sway that reshaped club playlists worldwide. Dizzy Gillespie’s collaborations highlighted congas and claves. Brazilian songcraft met New York horn lines. Dancers felt a new kind of Jazz pulse.',
  'Jimmy Smith’s Hammond B3 sound defined Soul Jazz. Churchy chords and blues riffs turned into an endless, joyful party. Guitar and drums locked into greasy shuffles. Clubs filled with the smell of tube amps and groove. Jazz could feel like Sunday service and Saturday night at once.',
  'Fusion in the 1970s mixed rock volume, funk grooves, and electronics. Miles Davis’s “Bitches Brew” and Weather Report electrified improvisation. Synths and pedals expanded tone palettes. Drummers borrowed backbeats from funk. Jazz proved it could plug in without losing its edge.',
  'The ECM label cultivated a spacious, echoing aesthetic. European voices found an airy, chamber-like home for improvisation. Silence and reverb became part of the music. Folk melodies intertwined with modern harmony. Jazz sounded like landscapes and long horizons.',
  'Vocal Jazz stays central to the story. Ella Fitzgerald’s scat, Sarah Vaughan’s velvet, and Billie Holiday’s phrasing show the voice’s many colors. Each singer turned lyrics into personal confession. Standards became living stories night after night. Jazz singing keeps reinventing the songbook.',
  'Swing was a social force as much as music. Big bands fueled Lindy Hop and Jitterbug nights in packed halls. Radio broadcasts spread band battles nationwide. Arrangers crafted shout choruses to lift the floor. Jazz gave dancers a shared heartbeat.',
  'Jazz education moved into universities, from Berklee to North Texas. Ear training, theory, and improvisation became formal coursework. Students learned to transcribe solos and analyze harmony. Ensemble labs simulated bandstand realities. The academy helped preserve and evolve Jazz vocabulary.',
  'European scenes built their own flavors, from Nordic lyricism to French Manouche swing. Django Reinhardt’s guitar defined the latter with dazzling runs. Scandinavian players embraced space and folk melody. Festivals connected scenes across borders. Jazz proved it thrives on local voices.',
  'Today Jazz blends with hip-hop, electronic textures, and global grooves. Sampling, looping, and live improvising coexist without genre fences. Artists tour with laptops and horns side by side. Rhymes and solos trade storytelling duties. Jazz keeps evolving because it welcomes new voices.'
];

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
  3: { artist: 'Nina Simone' },
  4: { artist: 'Melody Gardot' },
  5: { artist: 'Gregory Porter' },
  6: { artist: 'Nat King Cole' },
  7: { artist: 'Billie Holiday' },
  8: { artist: 'Madeleine Peyroux' },
  9: { artist: 'Jamie Cullum' },
  10: { artist: 'Dean Martin' },
  11: { artist: 'Norah Jones' },
  12: { artist: 'Tony Bennett' },
  13: { artist: 'Michael Bublé' },
  14: { artist: 'Dr. John' },
  15: { artist: 'Jazzmeia Horn' },
  16: { artist: 'ZAZ' },
  17: { artist: 'Chet Baker' },
  18: { artist: 'Samara Joy' },
  19: { artist: 'Sarah Vaughan' },
  20: { artist: 'Stacey Kent' },
  21: { artist: 'Harry Connick Jr.' },
  22: { artist: 'Peggy Lee' },
  23: { artist: 'Diana Krall' },
  24: { artist: 'Diane Reeves' },
};

const CALENDAR_MONTH = 11; // December (0-indexed)
const calendarYear = new Date().getFullYear(); // Adjust if you want a specific year

function getUnlockDate(day, nowRef = new Date()){
  // Doors open at local midnight for each December day
  const year = nowRef.getMonth() === CALENDAR_MONTH ? nowRef.getFullYear() : calendarYear;
  return new Date(year, CALENDAR_MONTH, Number(day), 0, 0, 0, 0);
}

function formatCountdownMs(diffMs){
  const totalMin = Math.max(0, Math.floor(diffMs / 60000));
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  return `${hours}h ${mins}m`;
}

function updateDoorLocks(){
  const now = new Date();
  document.querySelectorAll('.door').forEach(door => setDoorLockState(door, now));
}

function setDoorLockState(door, now){
  const day = Number(door.dataset.day);
  const countdownEl = door.querySelector('.countdown-text');
  const unlockDate = getUnlockDate(day, now);
  const isUnlocked = DEV_OPEN || now >= unlockDate;
  door.classList.toggle('locked', !isUnlocked);
  door.setAttribute('aria-disabled', String(!isUnlocked));
  if(!countdownEl) return;
  if(isUnlocked){
    countdownEl.textContent = DEV_OPEN ? 'Dev: open' : 'Open now';
    countdownEl.classList.add('open');
  }else{
    countdownEl.textContent = `Opens in ${formatCountdownMs(unlockDate - now)}`;
    countdownEl.classList.remove('open');
  }
}

// create 24 doors
const initialNow = new Date();
for(let i=1;i<=24;i++){
  const d = document.createElement('button');
  d.className = 'door';
  d.innerHTML = `<span class="door-number">${i}</span><span class="countdown-text" aria-live="polite"></span>`;
  d.dataset.day = i;
  d.style.setProperty('--door-index', i);
  d.addEventListener('click', onDoorClick);
  // use the shared door background from CSS (assets/door.png)
  setDoorLockState(d, initialNow); // apply locked state before first paint to avoid flicker
  grid.appendChild(d);
}
updateDoorLocks();
setInterval(updateDoorLocks, 1000);

function onDoorClick(e){
  if(!DEV_OPEN && e.currentTarget.classList.contains('locked')){
    showLockDialog(e.currentTarget.dataset.day);
    return;
  }
  const day = e.currentTarget.dataset.day;
  openModal(day);
}

function showLockDialog(day){
  if(lockHistory){
    const fact = jazzFacts[(Number(day) - 1) % jazzFacts.length];
    lockHistory.innerHTML = `
      <p class="fact-eyebrow">Did you know?</p>
      <p class="fact-body">${fact}</p>
    `;
  }
  if(lockLead){
    const now = new Date();
    const unlockDate = getUnlockDate(day, now);
    const countdown = formatCountdownMs(unlockDate - now);
    lockLead.textContent = `Day ${day} unlocks at midnight — opens in ${countdown}. Until then, enjoy a Jazz fact.`;
  }
  if(lockDialog){
    lockDialog.classList.remove('hidden');
    lockDialog.setAttribute('aria-hidden','false');
  }
}
function closeLockDialog(){
  if(lockDialog){
    lockDialog.classList.add('hidden');
    lockDialog.setAttribute('aria-hidden','true');
  }
}
if(lockBackdrop) lockBackdrop.addEventListener('click', closeLockDialog);
if(lockCloseBtn) lockCloseBtn.addEventListener('click', closeLockDialog);
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape' && lockDialog && !lockDialog.classList.contains('hidden')){
    closeLockDialog();
  }
});

function applyBgMusicState(isDayPlaying){
  if(!bgMusic) return;
  if(!bgMusicEnabled){
    bgMusic.pause();
    return;
  }
  const targetVol = isDayPlaying ? 0.02 : 0.08;
  bgMusic.volume = targetVol;
  if(bgMusic.paused){
    bgMusic.play().catch(()=>{});
  }
}
function updateMusicToggleLabel(){
  if(!musicToggle) return;
  musicToggle.textContent = bgMusicEnabled ? 'Music on' : 'Music off';
  musicToggle.setAttribute('aria-pressed', String(bgMusicEnabled));
}
function toggleBgMusic(){
  if(!bgMusic){
    return;
  }
  // If enabled but paused (e.g., autoplay blocked), try to start without flipping state
  if(bgMusicEnabled && bgMusic.paused){
    bgMusic.play().catch(()=>{});
    return;
  }
  bgMusicEnabled = !bgMusicEnabled;
  if(!bgMusicEnabled){
    bgMusic.pause();
  }else{
    bgMusic.play().catch(()=>{});
  }
  applyBgMusicState(!audioEl.paused && !audioEl.ended);
  updateMusicToggleLabel();
}
if(musicToggle){
  musicToggle.addEventListener('click', toggleBgMusic);
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
    // Ensure the image starts hidden, then fades in
    const img = document.getElementById('dayImg');
    if(img){ img.style.opacity = '0'; }
    // trigger polished enter animation on the zoom frame image
    const ENTER_MODE = 'vertical'; // 'horizontal' or 'vertical'
    zoomFrame.classList.add('entering');
    zoomFrame.classList.toggle('horizontal', ENTER_MODE === 'horizontal');
    zoomFrame.classList.toggle('vertical', ENTER_MODE === 'vertical');
    zoomFrame.querySelectorAll('img').forEach(i => i.style.opacity = '1');
    // remove the class after the animation ends
    if(img){
      img.addEventListener('animationend', () => {
        zoomFrame.classList.remove('entering');
        zoomFrame.classList.remove('horizontal');
        zoomFrame.classList.remove('vertical');
        // leave the image visible after animation completes
        img.style.opacity = '1';
      }, { once: true });
    }
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
  applyBgMusicState(false);
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
  applyBgMusicState(true);
});
audioEl.addEventListener('pause', () => {
  if(audioEl.currentTime >= audioEl.duration && isFinite(audioEl.duration)){
    setPlayButtonState('play');
  }else{
    setPlayButtonState('play');
  }
  // Restore background music volume
  applyBgMusicState(false);
});
audioEl.addEventListener('ended', () => {
  // Restore background music volume when audio finishes
  applyBgMusicState(false);
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
if(bgMusic){
  applyBgMusicState(false);
  bgMusic.play().catch(() => {
    // If blocked by browser, play on any user interaction
    const playBg = () => {
      if(bgMusicEnabled){
        bgMusic.play().catch(()=>{});
      }
      document.removeEventListener('click', playBg);
      document.removeEventListener('keydown', playBg);
    };
    document.addEventListener('click', playBg);
    document.addEventListener('keydown', playBg);
  });
}
updateMusicToggleLabel();
