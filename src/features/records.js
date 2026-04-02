import { data } from '../state/store.js';
import { escapeHTML } from '../utils/sanitize.js';
import { formatDate } from '../utils/date.js';

export function getPersonalRecords() {
  const prs = {};
  const sorted = [...data.logs].sort((a, b) => a.date - b.date);
  sorted.forEach((log) => {
    const maxWeight = Math.max(...log.sets.map((s) => s.kg));
    const bestSet = log.sets.reduce((best, s) => (s.kg > best.kg || (s.kg === best.kg && s.reps > best.reps) ? s : best));
    if (!prs[log.exerciseId] || maxWeight > prs[log.exerciseId].weight) {
      prs[log.exerciseId] = {
        exerciseName: log.exerciseName,
        weight: maxWeight,
        reps: bestSet.reps,
        unit: bestSet.unit || 'kg',
        date: log.date,
        logId: log.id,
      };
    }
  });
  return prs;
}

export function isPersonalRecord(log, prs) {
  const pr = prs[log.exerciseId];
  return pr && pr.logId === log.id;
}

export function renderRecords() {
  const prs = getPersonalRecords();
  const prValues = Object.values(prs);
  const listEl = document.getElementById('recordsList');
  if (!listEl) return;

  if (!prValues.length) {
    listEl.innerHTML =
      '<div class="empty-state"><div class="empty-icon">🏆</div>NO RECORDS YET<br>LOG A SESSION TO SET YOUR FIRST PR</div>';
    return;
  }

  prValues.sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));

  listEl.innerHTML = prValues
    .map((p) => {
      const totalSessions = data.logs.filter((l) => l.exerciseName === p.exerciseName).length;
      return `<div class="record-card">
      <div class="record-header">
        <div class="record-name">${escapeHTML(p.exerciseName)}</div>
        <div class="record-sessions">${totalSessions} SESSION${totalSessions !== 1 ? 'S' : ''}</div>
      </div>
      <div class="record-value">${p.weight}${escapeHTML(p.unit)} \u00D7 ${p.reps}</div>
      <div class="record-date">SET ON ${formatDate(p.date).toUpperCase()}</div>
    </div>`;
    })
    .join('');
}
