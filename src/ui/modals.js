import { data, save, generateId, state } from '../state/store.js';
import { renderDays } from '../features/workouts.js';
import { showToast } from './toast.js';
import { pushTemplate, removeTemplate } from '../lib/sync.js';

export function openModal(id) {
  document.getElementById(id).classList.add('open');
}

export function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

export function executeConfirm() {
  if (state.confirmCallback) {
    state.confirmCallback();
    state.confirmCallback = null;
  }
}

// ─── ADD DAY ──────────────────────────────────────────
export function openAddDay() {
  openModal('addDayModal');
  const input = document.getElementById('dayNameInput');
  input.value = '';
  input.focus();
}

export function confirmAddDay() {
  const name = document.getElementById('dayNameInput').value.trim();
  if (!name) return;
  const newDay = { id: generateId('d-'), name, exercises: [] };
  data.days.push(newDay);
  save();
  renderDays();
  closeModal('addDayModal');
  pushTemplate(newDay);
}

// ─── ADD EXERCISE ─────────────────────────────────────
export function openAddExercise(dayId) {
  state.addExDayId = dayId;
  openModal('addExModal');
  const input = document.getElementById('exNameInput');
  input.value = '';
  input.focus();
}

export function confirmAddExercise() {
  const name = document.getElementById('exNameInput').value.trim();
  if (!name) return;
  const day = data.days.find((d) => d.id === state.addExDayId);
  if (day) {
    day.exercises.push({ id: generateId('e-'), name });
    save();
    renderDays();
    closeModal('addExModal');
    setTimeout(() => {
      const dc = document.getElementById('dc-' + state.addExDayId);
      if (dc) dc.classList.add('open');
    }, 50);
    pushTemplate(day);
  }
}

// ─── EDIT DAY ─────────────────────────────────────────
export function openEditDay(dayId) {
  state.editDayId = dayId;
  const day = data.days.find((d) => d.id === dayId);
  if (!day) return;
  document.getElementById('editDayNameInput').value = day.name;
  openModal('editDayModal');
  document.getElementById('editDayNameInput').focus();
}

export function confirmEditDay() {
  const name = document.getElementById('editDayNameInput').value.trim();
  if (!name) return;
  const day = data.days.find((d) => d.id === state.editDayId);
  if (day) {
    day.name = name;
    save();
    renderDays();
    closeModal('editDayModal');
    showToast('DAY RENAMED');
    pushTemplate(day);
  }
}

// ─── DELETE DAY ───────────────────────────────────────
export function deleteDay(dayId, dayName) {
  document.getElementById('confirmTitle').textContent = 'DELETE DAY';
  document.getElementById('confirmMsg').textContent = `Delete "${dayName}" and all its exercises? This cannot be undone.`;
  state.confirmCallback = () => {
    data.days = data.days.filter((d) => d.id !== dayId);
    save();
    renderDays();
    closeModal('confirmModal');
    showToast('DAY DELETED');
    removeTemplate(dayId);
  };
  openModal('confirmModal');
}

// ─── EDIT EXERCISE ────────────────────────────────────
export function openEditExercise(dayId, exId) {
  state.editExDayId = dayId;
  state.editExId = exId;
  const day = data.days.find((d) => d.id === dayId);
  const ex = day ? day.exercises.find((e) => e.id === exId) : null;
  if (!ex) return;
  document.getElementById('editExNameInput').value = ex.name;
  openModal('editExModal');
  document.getElementById('editExNameInput').focus();
}

export function confirmEditExercise() {
  const name = document.getElementById('editExNameInput').value.trim();
  if (!name) return;
  const day = data.days.find((d) => d.id === state.editExDayId);
  const ex = day ? day.exercises.find((e) => e.id === state.editExId) : null;
  if (ex) {
    ex.name = name;
    save();
    renderDays();
    closeModal('editExModal');
    showToast('EXERCISE RENAMED');
    pushTemplate(day);
  }
}

// ─── DELETE EXERCISE ──────────────────────────────────
export function deleteExercise(dayId, exId, exName) {
  document.getElementById('confirmTitle').textContent = 'DELETE EXERCISE';
  document.getElementById('confirmMsg').textContent = `Delete "${exName}"? This cannot be undone.`;
  state.confirmCallback = () => {
    const day = data.days.find((d) => d.id === dayId);
    if (day) {
      day.exercises = day.exercises.filter((e) => e.id !== exId);
      save();
      renderDays();
      closeModal('confirmModal');
      showToast('EXERCISE DELETED');
      pushTemplate(day);
    }
  };
  openModal('confirmModal');
}

// ─── MODAL EVENT LISTENERS ───────────────────────────
export function initModals() {
  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (e.target === el) el.classList.remove('open');
    });
  });

  // Close buttons with data-close attribute
  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });

  // Confirm buttons
  document.getElementById('confirmAddDayBtn')?.addEventListener('click', confirmAddDay);
  document.getElementById('confirmAddExBtn')?.addEventListener('click', confirmAddExercise);
  document.getElementById('confirmEditDayBtn')?.addEventListener('click', confirmEditDay);
  document.getElementById('confirmEditExBtn')?.addEventListener('click', confirmEditExercise);

  // Enter key in modals
  document.getElementById('dayNameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmAddDay();
  });
  document.getElementById('exNameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmAddExercise();
  });
  document.getElementById('editDayNameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmEditDay();
  });
  document.getElementById('editExNameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmEditExercise();
  });

  // Escape key closes any open modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach((el) => el.classList.remove('open'));
    }
  });
}
