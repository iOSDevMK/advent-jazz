import { DEV_OPEN, CALENDAR_MONTH } from './constants.js';

let badgeEl = null;
let modalEl = null;
let lockDialogEl = null;
let bgMusicEl = null;
let isMusicEnabledFn = null;

let badgeCycleTimer = null;
let badgeCycleIndex = 1;
let badgeCycleDir = 1;
let badgeHopTimer = null;
let lastBadgeLeft = null;
let lastBadgeTop = null;
let visibilityObserver = null;

function getTodayDoorElement() {
  const now = new Date();
  if (now.getMonth() !== CALENDAR_MONTH) return null;
  const day = now.getDate();
  return document.querySelector(`.door[data-day="${day}"]`);
}

function getDoorElementByDay(day) {
  return document.querySelector(`.door[data-day="${day}"]`);
}

function getUnlockedMaxDay() {
  const now = new Date();
  if (DEV_OPEN) return 24;
  if (now.getMonth() !== CALENDAR_MONTH) return 1;
  return Math.min(24, Math.max(1, now.getDate()));
}

function triggerBadgeHop() {
  if (!badgeEl) return;
  badgeEl.classList.add('hopping');
  if (badgeHopTimer) clearTimeout(badgeHopTimer);
  badgeHopTimer = setTimeout(() => {
    badgeEl.classList.remove('hopping');
  }, 900);
}

function positionBadgeOverDay(day = null, force = false) {
  if (!badgeEl || (!force && badgeEl.classList.contains('hidden'))) return;
  const targetDoor = day ? getDoorElementByDay(day) : getTodayDoorElement();
  const door = targetDoor;
  if (!door) {
    badgeEl.style.left = '50%';
    badgeEl.style.top = '16px';
    return;
  }
  const rect = door.getBoundingClientRect();
  const badgeSize = badgeEl.offsetWidth || 70;
  const left = rect.left + (rect.width / 2);
  const top = rect.top + (rect.height * 0.2) - (badgeSize * 0.1);
  badgeEl.style.left = `${left}px`;
  badgeEl.style.top = `${top}px`;
  if (force || left !== lastBadgeLeft || top !== lastBadgeTop) {
    triggerBadgeHop();
  }
  lastBadgeLeft = left;
  lastBadgeTop = top;
}

function startBadgeCycle() {
  const maxDay = getUnlockedMaxDay();
  stopBadgeCycle();
  if (maxDay <= 1) {
    badgeCycleIndex = 1;
    positionBadgeOverDay(1, true);
    return;
  }
  badgeCycleIndex = 1;
  badgeCycleDir = 1;
  positionBadgeOverDay(badgeCycleIndex, true);
  badgeCycleTimer = setInterval(() => {
    const max = getUnlockedMaxDay();
    if (max <= 1) {
      stopBadgeCycle();
      positionBadgeOverDay(1, true);
      return;
    }
    badgeCycleIndex += badgeCycleDir;
    if (badgeCycleIndex >= max) {
      badgeCycleIndex = max;
      badgeCycleDir = -1;
    } else if (badgeCycleIndex <= 1) {
      badgeCycleIndex = 1;
      badgeCycleDir = 1;
    }
    positionBadgeOverDay(badgeCycleIndex, true);
  }, 1800);
}

function stopBadgeCycle() {
  if (badgeCycleTimer) {
    clearInterval(badgeCycleTimer);
    badgeCycleTimer = null;
  }
}

export function updateMusicBadge() {
  if (!badgeEl) return;
  const playing = bgMusicEl && isMusicEnabledFn && isMusicEnabledFn() && !bgMusicEl.paused && !bgMusicEl.ended;
  const modalOpen = modalEl && !modalEl.classList.contains('hidden');
  const lockOpen = lockDialogEl && !lockDialogEl.classList.contains('hidden');
  const shouldShow = playing && !modalOpen && !lockOpen;
  if (shouldShow) {
    badgeEl.classList.remove('hidden');
    startBadgeCycle();
  } else {
    badgeEl.classList.add('hidden');
    stopBadgeCycle();
  }
}

export function setupMusicBadge({ badgeElement, modalElement, lockDialogElement, bgMusicElement, isMusicEnabled }) {
  badgeEl = badgeElement;
  modalEl = modalElement;
  lockDialogEl = lockDialogElement;
  bgMusicEl = bgMusicElement;
  isMusicEnabledFn = isMusicEnabled;
  if (!badgeEl) return;

  if (!visibilityObserver) {
    visibilityObserver = new MutationObserver(() => updateMusicBadge());
  }
  if (modalEl) {
    visibilityObserver.observe(modalEl, { attributes: true, attributeFilter: ['class'] });
  }
  if (lockDialogEl) {
    visibilityObserver.observe(lockDialogEl, { attributes: true, attributeFilter: ['class'] });
  }

  window.addEventListener('resize', () => positionBadgeOverDay());
  window.addEventListener('scroll', () => positionBadgeOverDay());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopBadgeCycle();
    } else {
      updateMusicBadge();
    }
  });
}

export function positionBadgeOverToday(force = false) {
  positionBadgeOverDay(null, force);
}
