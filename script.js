const grid = document.getElementById('grid');
const modal = document.getElementById('modal');
const backdrop = document.getElementById('backdrop');
const modalContent = document.getElementById('modalContent');
const zoomFrame = document.getElementById('zoomFrame');
const riddleText = document.getElementById('riddleText');
const audioEl = document.getElementById('audio');
const revealBtn = document.getElementById('revealBtn');
const replayBtn = document.getElementById('replayBtn');
const singerReveal = document.getElementById('singerReveal');
const closeBtn = document.getElementById('closeBtn');

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

function openModal(day){
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
  revealBtn.classList.add('hidden');
  replayBtn.classList.add('hidden');
  singerReveal.classList.add('hidden');
  singerReveal.style.opacity = '0';
  riddleText.textContent = "Listen closely before you reveal who’s behind today’s door.";

  // set day back image inline; prefer JPG then PNG then SVG
  const dayImg = document.getElementById('dayImg');
  const backJpg = `assets/images/day-${day}-back.jpg`;
  const backPng = `assets/images/day-${day}-back.png`;
  const backSvg = `assets/images/day-${day}-back.svg`;
  (async ()=>{
    try{
      let r = await fetch(backJpg, { method: 'HEAD' });
      if(r.ok){ dayImg.src = backJpg; return; }
      r = await fetch(backPng, { method: 'HEAD' });
      if(r.ok){ dayImg.src = backPng; return; }
      dayImg.src = backSvg;
    }catch(e){ dayImg.src = backSvg; }
  })();
  dayImg.alt = `Day ${day}`;

  // play audio when ready
  audioEl.play().catch(()=>{
    replayBtn.textContent = 'Play Audio';
    replayBtn.classList.remove('hidden');
    replayBtn.onclick = () => { audioEl.play(); replayBtn.classList.add('hidden'); };
  });
  audioEl.oncanplay = () => {
    replayBtn.textContent = 'Replay Audio';
    replayBtn.classList.remove('hidden');
  };

  audioEl.onended = () => {
    revealBtn.textContent = 'Reveal Singer';
    revealBtn.classList.remove('hidden');
    revealBtn.onclick = () => {
      doReveal(day);
    };
  };
}

function doReveal(day){
  // swap the day image to the revealed singer front; prefer PNG then SVG then fallback
  const dayImg = document.getElementById('dayImg');
  const frontJpg = `assets/images/day-${day}-front.jpg`;
  const frontPng = `assets/images/day-${day}-front.png`;
  const frontSvg = `assets/images/day-${day}-front.svg`;
  (async ()=>{
    try{
      let r = await fetch(frontJpg, { method: 'HEAD' });
      if(r.ok){ dayImg.src = frontJpg; }
      else{
        r = await fetch(frontPng, { method: 'HEAD' });
        if(r.ok) dayImg.src = frontPng;
        else{
          r = await fetch(frontSvg, { method: 'HEAD' });
          if(r.ok) dayImg.src = frontSvg;
          else dayImg.src = 'assets/images/singer-front.png';
        }
      }
    }catch(e){ dayImg.src = 'assets/images/singer-front.png'; }
    finally{ dayImg.style.opacity = '1'; revealBtn.classList.add('hidden'); }
  })();
}

function closeModal(){
  audioEl.pause();
  audioEl.currentTime = 0;
  document.querySelectorAll('.door.active').forEach(d => d.classList.remove('active'));
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden','true');
}

backdrop.addEventListener('click', closeModal);
closeBtn.addEventListener('click', closeModal);
replayBtn.addEventListener('click', () => {
  audioEl.currentTime = 0;
  audioEl.play();
});
