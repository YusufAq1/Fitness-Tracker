import { data, save, state } from '../state/store.js';
import { escapeHTML, escapeAttr } from '../utils/sanitize.js';
import { showToast } from '../ui/toast.js';
import { goBack } from '../ui/tabs.js';
import { openAddExercise } from '../ui/modals.js';
import { pushLog } from '../lib/sync.js';

function getLastLog(exId) {
  const logs = data.logs.filter((l) => l.exerciseId === exId).sort((a, b) => b.date - a.date);
  return logs[0] || null;
}

export function renderDays() {
  const el = document.getElementById('daysList');
  if (!el) return;

  if (!data.days.length) {
    el.innerHTML =
      '<div class="empty-state"><div class="empty-icon">💪</div>NO DAYS YET<br>ADD YOUR FIRST WORKOUT DAY</div>';
    return;
  }

  el.innerHTML = data.days
    .map((day) => {
      const exRows = day.exercises
        .map((ex) => {
          const last = getLastLog(ex.id);
          const lastStr = last
            ? last.sets.map((s) => `${s.kg}${s.unit || 'kg'}\u00D7${s.reps}`).join(' \u00B7 ')
            : '\u2014';
          return `<div class="exercise-row" data-long-press="exercise" data-day-id="${escapeAttr(day.id)}" data-ex-id="${escapeAttr(ex.id)}" data-ex-name="${escapeAttr(ex.name)}" data-action="open-log" data-day-name="${escapeAttr(day.name)}">
        <div style="flex:1">
          <div class="exercise-name">${escapeHTML(ex.name)}</div>
          <div class="exercise-last">${lastStr}</div>
        </div>
        <span class="ex-arrow">\u2192</span>
      </div>`;
        })
        .join('');

      return `<div class="day-card" id="dc-${escapeAttr(day.id)}">
      <div class="day-header" data-long-press="day" data-day-id="${escapeAttr(day.id)}" data-day-name="${escapeAttr(day.name)}" data-action="toggle-day">
        <div>
          <div class="day-name">${escapeHTML(day.name)}</div>
          <div class="day-meta">${day.exercises.length} EXERCISE${day.exercises.length !== 1 ? 'S' : ''}</div>
        </div>
        <div class="day-header-right">
          <span class="day-chevron">\u25BE</span>
        </div>
      </div>
      <div class="day-body">
        ${exRows || '<div style="color:var(--muted);font-size:13px;padding:12px 0">No exercises yet</div>'}
        <button class="add-exercise-btn" data-action="add-exercise" data-day-id="${escapeAttr(day.id)}">+ ADD EXERCISE</button>
      </div>
    </div>`;
    })
    .join('');
}

export function toggleDay(id) {
  const el = document.getElementById('dc-' + id);
  if (el) el.classList.toggle('open');
}

export function openLog(dayId, exId, exName, dayName) {
  state.editingLogId = null;
  state.logReturnTab = 'workouts';
  state.currentDayId = dayId;
  state.currentExId = exId;
  state.currentExName = exName;
  state.currentDayName = dayName;
  document.getElementById('logExName').textContent = exName;
  document.getElementById('logDayLabel').textContent =
    dayName.toUpperCase() +
    ' \u00B7 ' +
    new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();
  const last = getLastLog(exId);
  const sets = last ? last.sets.map((s) => ({ ...s })) : [{ kg: '', reps: '' }, { kg: '', reps: '' }];
  const unit = last && last.sets[0] && last.sets[0].unit ? last.sets[0].unit : 'kg';
  setUnit(unit);
  renderSets(sets);
  document.getElementById('saveLogBtn').textContent = 'SAVE SESSION';
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  document.getElementById('tab-log').classList.add('active');
}

export function renderSets(sets) {
  const tbody = document.getElementById('setsBody');
  if (!tbody) return;
  tbody.innerHTML = sets
    .map(
      (s, i) => `
    <tr class="set-row">
      <td class="set-num">${i + 1}</td>
      <td><input class="set-input" type="number" min="0" step="0.5" placeholder="0" value="${s.kg}" /></td>
      <td class="set-sep">\u00D7</td>
      <td><input class="set-input" type="number" min="0" step="1" placeholder="0" value="${s.reps}" /></td>
      <td><button class="set-delete" data-action="delete-set">\u2715</button></td>
    </tr>`,
    )
    .join('');
}

export function addSet() {
  const tbody = document.getElementById('setsBody');
  const rows = tbody.querySelectorAll('.set-row');
  const lastKg = rows.length ? rows[rows.length - 1].querySelectorAll('input')[0].value : '';
  const i = rows.length;
  const tr = document.createElement('tr');
  tr.className = 'set-row';
  tr.innerHTML = `
    <td class="set-num">${i + 1}</td>
    <td><input class="set-input" type="number" min="0" step="0.5" placeholder="0" value="${lastKg}" /></td>
    <td class="set-sep">\u00D7</td>
    <td><input class="set-input" type="number" min="0" step="1" placeholder="0" /></td>
    <td><button class="set-delete" data-action="delete-set">\u2715</button></td>`;
  tbody.appendChild(tr);
  renumberSets();
}

function renumberSets() {
  document.querySelectorAll('#setsBody .set-num').forEach((el, i) => (el.textContent = i + 1));
}

export function setUnit(unit) {
  state.currentUnit = unit;
  document.getElementById('unitKg').classList.toggle('active', unit === 'kg');
  document.getElementById('unitLbs').classList.toggle('active', unit === 'lbs');
  document.getElementById('weightHeader').textContent = unit.toUpperCase();
}

export function saveLog() {
  const rows = document.querySelectorAll('#setsBody .set-row');
  const sets = [];
  rows.forEach((row) => {
    const [kg, reps] = row.querySelectorAll('input');
    if (kg.value !== '' && reps.value !== '') {
      sets.push({ kg: parseFloat(kg.value), reps: parseInt(reps.value), unit: state.currentUnit });
    }
  });
  if (!sets.length) {
    showToast('ADD AT LEAST ONE SET');
    return;
  }

  if (state.editingLogId) {
    const log = data.logs.find((l) => l.id === state.editingLogId);
    if (log) {
      log.sets = sets;
      log.exerciseName = state.currentExName;
      log.dayName = state.currentDayName;
    }
    save();
    renderDays();
    showToast('SESSION UPDATED \u2713');
    if (log) pushLog(log);
  } else {
    const newLog = {
      id: Date.now() + '',
      exerciseId: state.currentExId,
      exerciseName: state.currentExName,
      dayName: state.currentDayName,
      date: Date.now(),
      sets,
    };
    data.logs.push(newLog);
    save();
    renderDays();
    showToast('SESSION SAVED \u2713');
    pushLog(newLog);
  }
  goBack();
}

// ─── EVENT DELEGATION ─────────────────────────────────
export function initWorkoutEvents() {
  const daysList = document.getElementById('daysList');
  if (!daysList) return;

  daysList.addEventListener('click', (e) => {
    // Delete set button
    const deleteBtn = e.target.closest('[data-action="delete-set"]');
    if (deleteBtn) {
      deleteBtn.closest('tr').remove();
      renumberSets();
      return;
    }

    // Toggle day
    const dayHeader = e.target.closest('[data-action="toggle-day"]');
    if (dayHeader) {
      toggleDay(dayHeader.dataset.dayId);
      return;
    }

    // Open log
    const exerciseRow = e.target.closest('[data-action="open-log"]');
    if (exerciseRow) {
      openLog(exerciseRow.dataset.dayId, exerciseRow.dataset.exId, exerciseRow.dataset.exName, exerciseRow.dataset.dayName);
      return;
    }

    // Add exercise
    const addExBtn = e.target.closest('[data-action="add-exercise"]');
    if (addExBtn) {
      openAddExercise(addExBtn.dataset.dayId);
    }
  });
}
