// Calendar door management and unlock logic
import { CALENDAR_MONTH, DEV_OPEN } from './constants.js';

const calendarYear = new Date().getFullYear();

export function getUnlockDate(day, nowRef = new Date()) {
  // Doors open at local midnight for each December day
  const year = nowRef.getMonth() === CALENDAR_MONTH ? nowRef.getFullYear() : calendarYear;
  return new Date(year, CALENDAR_MONTH, Number(day), 0, 0, 0, 0);
}

export function formatCountdownMs(diffMs) {
  const totalMin = Math.max(0, Math.floor(diffMs / 60000));
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  return `${hours}h ${mins}m`;
}

export function updateDoorLocks() {
  const now = new Date();
  const doors = Array.from(document.querySelectorAll('.door'));
  doors.forEach(door => setDoorLockState(door, now));
}

export function setDoorLockState(door, now) {
  const day = Number(door.dataset.day);
  const countdownEl = door.querySelector('.countdown-text');
  const unlockDate = getUnlockDate(day, now);
  const isUnlocked = DEV_OPEN || now >= unlockDate;
  door.classList.toggle('locked', !isUnlocked);
  door.setAttribute('aria-disabled', String(!isUnlocked));
  if (!countdownEl) return;
  if (isUnlocked) {
    countdownEl.textContent = DEV_OPEN ? 'Dev: open' : 'Open now';
    countdownEl.classList.add('open');
  } else {
    countdownEl.textContent = `Opens in ${formatCountdownMs(unlockDate - now)}`;
    countdownEl.classList.remove('open');
  }
}

export function createDoors(grid, onDoorClick) {
  const initialNow = new Date();
  for (let i = 1; i <= 24; i++) {
    const d = document.createElement('button');
    d.className = 'door';
    d.innerHTML = `<span class="door-number">${i}</span><span class="countdown-text" aria-live="polite"></span>`;
    d.dataset.day = i;
    d.style.setProperty('--door-index', i);
    d.addEventListener('click', onDoorClick);
    setDoorLockState(d, initialNow);
    grid.appendChild(d);
  }
  // Initialize snowfall layer
  ensureSnowLayer();
}

export function ensureSnowLayer(){
  // Use a global body-level overlay so it can sit above all UI
  let snow = document.querySelector('.snow-layer');
  if(!snow){
    snow = document.createElement('div');
    snow.className = 'snow-layer';
    document.body.appendChild(snow);
  }
}

export function toggleSnowfall(active){
  ensureSnowLayer();
  const snow = document.querySelector('.snow-layer');
  if(!snow) return;
  snow.classList.toggle('active', !!active);
  if(active && snow.childElementCount === 0){
    // Use a single snowflake-area with many flakes per provided script
    const area = document.createElement('div');
    area.className = 'snowflake-area';
    snow.appendChild(area);
    const count = getSnowflakeCount();
    for(let i=0;i<count;i++){
      const snowflake = document.createElement('div');
      snowflake.classList.add('snowflake');

      const randomSize = Math.random() * 4 + 1;
      const randomDuration = Math.random() * 11 + 4;
      const randomXPosition = Math.random() * 100;
      const randomDelay = Math.random() * 6;
      const randomOpacity = Math.random() * 0.2 + 0.4;

      snowflake.style.left = `${randomXPosition}%`;
      snowflake.style.animationDuration = `${randomDuration}s`;
      snowflake.style.width = `${randomSize}px`;
      snowflake.style.animationDelay = `${randomDelay}s`;
      snowflake.style.opacity = `${randomOpacity}`;

      area.appendChild(snowflake);
    }
  }
  if(!active){
    // clear flakes when not active to reduce DOM
    snow.innerHTML = '';
  }
}

function getSnowflakeCount(){
  const width = window.innerWidth || window.screen.width;
  const height = window.innerHeight || window.screen.height;
  const area = Math.max(1, (width * height));
  // Base density tuned for performance
  let base;
  if(width < 480){
    base = 180;
  } else if(width < 768){
    base = 260;
  } else if(width < 1024){
    base = 340;
  } else {
    base = 420;
  }
  // Adjust slightly by screen area
  const scaled = Math.min(600, Math.round(base * Math.min(1.4, area / (1280*800))));
  // Respect reduced motion
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return prefersReduced ? Math.floor(scaled * 0.4) : scaled;
}
