// Quiz/riddle dialog functionality
import { dayMeta } from './constants.js';

let quizAnswered = false;

export function openRiddleDialog(day) {
  // Allow repeating the quiz; reset answered state on open
  quizAnswered = false;
  
  const meta = dayMeta[day];
  if(!meta) return;
  
  // Create quiz overlay
  const modalContent = document.getElementById('modalContent');
  if(!modalContent) return;
  
  let overlay = modalContent.querySelector('.quiz-overlay');
  if(!overlay){
    overlay = document.createElement('div');
    overlay.className = 'quiz-overlay';
    modalContent.appendChild(overlay);
  }
  
  overlay.innerHTML = `
    <div class="quiz-panel">
      <button class="quiz-close" aria-label="Close quiz">✕</button>
      <h3 class="quiz-title">Who is the mysterious guest?</h3>
      <p class="quiz-lead">Select the correct vocalist:</p>
      <div class="quiz-options" role="radiogroup" aria-label="Singer choices"></div>
      <div class="quiz-feedback" role="status" aria-live="polite"></div>
    </div>
  `;
  
  const optionsContainer = overlay.querySelector('.quiz-options');
  const feedback = overlay.querySelector('.quiz-feedback');
  const closeBtn = overlay.querySelector('.quiz-close');
  
  // Build choices: correct + distractors
  const correct = meta.singer;
  const distractors = getDistractors(day, correct);
  const choices = [correct, ...distractors].sort(() => Math.random() - 0.5);
  
  choices.forEach((name, idx) => {
    const label = document.createElement('label');
    label.className = 'quiz-option';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'quiz-choice';
    radio.value = name;
    radio.id = `quiz-opt-${idx}`;
    
    const span = document.createElement('span');
    span.textContent = name;
    
    label.appendChild(radio);
    label.appendChild(span);
    optionsContainer.appendChild(label);
    
    radio.addEventListener('change', () => {
      if(quizAnswered) return;
      quizAnswered = true;
      const isCorrect = name === correct;
      // Close quiz and trigger reveal immediately
      overlay.classList.add('hidden');
      document.dispatchEvent(new CustomEvent('quiz-answered', { detail: { correct: isCorrect, day } }));
    });
  });
  
  closeBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
  });
  
  overlay.classList.remove('hidden');
}

function getDistractors(day, correct) {
  const meta = dayMeta[day];
  if(meta && meta.distractors && meta.distractors.length >= 3){
    return meta.distractors.slice(0, 3);
  }
  // Fallback: gather random singers
  const allSingers = Object.values(dayMeta).map(m => m.singer).filter(s => s !== correct);
  const shuffled = allSingers.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export function isCorrectSelected() {
  return quizAnswered;
}

export function resetQuiz() {
  quizAnswered = false;
}
