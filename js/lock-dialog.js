// Lock dialog management
import { jazzFacts } from './constants.js';
import { getUnlockDate, formatCountdownMs } from './calendar.js';
import { prepareFactAudio, stopFactAudio } from './facts.js';

export function showLockDialog(lockDialog, lockLead, lockHistory, factAudio, factAudioBtn, day) {
  if (lockHistory) {
    const factIndex = (Number(day) - 1) % jazzFacts.length;
    const fact = jazzFacts[factIndex];
    lockHistory.innerHTML = `
      <p class="fact-eyebrow">Did you know?</p>
      <p class="fact-body">${fact}</p>
    `;
    prepareFactAudio(factAudio, factAudioBtn, factIndex + 1);
  }
  if (lockLead) {
    const now = new Date();
    const unlockDate = getUnlockDate(day, now);
    const countdown = formatCountdownMs(unlockDate - now);
    lockLead.textContent = `Day ${day} unlocks at midnight — opens in ${countdown}. Until then, enjoy a Jazz fact.`;
  }
  if (lockDialog) {
    lockDialog.classList.remove('hidden');
    lockDialog.setAttribute('aria-hidden', 'false');
  }
}

export function closeLockDialog(lockDialog, factAudio) {
  if (lockDialog) {
    lockDialog.classList.add('hidden');
    lockDialog.setAttribute('aria-hidden', 'true');
  }
  stopFactAudio(factAudio);
}

export function setupLockDialogEventListeners(lockDialog, lockBackdrop, lockCloseBtn, factAudio) {
  const handleClose = () => closeLockDialog(lockDialog, factAudio);
  
  if (lockBackdrop) {
    lockBackdrop.addEventListener('click', handleClose);
  }
  if (lockCloseBtn) {
    lockCloseBtn.addEventListener('click', handleClose);
  }
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lockDialog && !lockDialog.classList.contains('hidden')) {
      handleClose();
    }
  });
}
