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
  document.querySelectorAll('.door').forEach(door => setDoorLockState(door, now));
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
}
