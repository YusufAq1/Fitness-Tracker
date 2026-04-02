import { data, save, state } from '../state/store.js';
import { escapeHTML, escapeAttr } from '../utils/sanitize.js';
import { formatDate } from '../utils/date.js';
import { getPersonalRecords, isPersonalRecord } from './records.js';
import { showToast } from '../ui/toast.js';
import { closeModal } from '../ui/modals.js';
import { setUnit, renderSets } from './workouts.js';

export function getPrevLog(exId, beforeDate) {
  return data.logs.filter((l) => l.exerciseId === exId && l.date < beforeDate).sort((a, b) => b.date - a.date)[0] || null;
}

export function setFilter(name) {
  state.historyFilter = name;
  renderHistory();
}

export function renderHistory() {
  const prs = getPersonalRecords();

  // Build filter chips
  const names = ['ALL', ...new Set(data.logs.map((l) => l.exerciseName))];
  const filterEl = document.getElementById('historyFilter');
  if (!filterEl) return;

  filterEl.innerHTML = names
    .map(
      (n) =>
        `<button class="filter-chip ${state.historyFilter === n ? 'active' : ''}" data-filter="${escapeAttr(n)}">${escapeHTML(n.toUpperCase())}</button>`,
    )
    .join('');

  // Event delegation for filter chips
  filterEl.onclick = (e) => {
    const chip = e.target.closest('.filter-chip');
    if (chip) setFilter(chip.dataset.filter);
  };

  const listEl = document.getElementById('historyList');
  let filtered = state.historyFilter === 'ALL' ? data.logs : data.logs.filter((l) => l.exerciseName === state.historyFilter);
  filtered = [...filtered].sort((a, b) => b.date - a.date);

  if (!filtered.length) {
    listEl.innerHTML =
      '<div class="empty-state"><div class="empty-icon">📊</div>NO HISTORY YET<br>LOG YOUR FIRST SESSION</div>';
    return;
  }

  listEl.innerHTML = filtered
    .map((log) => {
      const prev = getPrevLog(log.exerciseId, log.date);
      const maxKg = Math.max(...log.sets.map((s) => s.kg));
      const prevMaxKg = prev ? Math.max(...prev.sets.map((s) => s.kg)) : null;
      const totalReps = log.sets.reduce((a, s) => a + s.reps, 0);
      const prevReps = prev ? prev.sets.reduce((a, s) => a + s.reps, 0) : null;
      const diff = prevMaxKg !== null ? maxKg - prevMaxKg : null;
      const repsDiff = prevReps !== null ? totalReps - prevReps : null;
      const chips = log.sets
        .map((s) => `<span class="history-set-chip">${s.kg}${escapeHTML(s.unit || 'kg')} \u00D7 ${s.reps}</span>`)
        .join('');
      const pct = prevMaxKg ? Math.min(100, Math.round((maxKg / (prevMaxKg * 1.5)) * 100)) : 50;
      const isPR = isPersonalRecord(log, prs);

      let progressHTML = '';
      if (prev) {
        const wUnit = log.sets[0] && log.sets[0].unit ? log.sets[0].unit : 'kg';
        const kgLabel =
          diff > 0
            ? `<span class="up">\u25B2 +${diff}${escapeHTML(wUnit)}</span>`
            : diff < 0
              ? `<span class="down">\u25BC ${diff}${escapeHTML(wUnit)}</span>`
              : `<span>= same weight</span>`;
        const repsLabel =
          repsDiff > 0
            ? `<span class="up">+${repsDiff} reps</span>`
            : repsDiff < 0
              ? `<span class="down">${repsDiff} reps</span>`
              : `<span>= same reps</span>`;
        progressHTML = `<div class="progress-bar-wrap">
        <div class="progress-label"><span>VS PREV SESSION</span><span>${kgLabel} \u00B7 ${repsLabel}</span></div>
        <div class="pbar-bg"><div class="pbar-fill" style="width:${pct}%"></div></div>
      </div>`;
      }

      return `<div class="history-entry" data-long-press="session" data-log-id="${escapeAttr(log.id)}" data-ex-name="${escapeAttr(log.exerciseName)}">
      <div class="history-ex-name-row">
        <div class="history-ex-name">${escapeHTML(log.exerciseName)}</div>${isPR ? '<span class="pr-badge">PR</span>' : ''}
      </div>
      <div class="history-meta">${escapeHTML(log.dayName.toUpperCase())} \u00B7 ${formatDate(log.date).toUpperCase()}</div>
      <div class="history-sets">${chips}</div>
      ${progressHTML}
    </div>`;
    })
    .join('');
}

// ─── EDIT / DELETE SESSION ─────────────────────────────
export function editSession(logId) {
  const log = data.logs.find((l) => l.id === logId);
  if (!log) return;
  state.editingLogId = logId;
  state.logReturnTab = 'history';
  state.currentExId = log.exerciseId;
  state.currentExName = log.exerciseName;
  state.currentDayName = log.dayName;
  document.getElementById('logExName').textContent = log.exerciseName;
  document.getElementById('logDayLabel').textContent =
    log.dayName.toUpperCase() + ' \u00B7 ' + formatDate(log.date).toUpperCase();
  const unit = log.sets[0] && log.sets[0].unit ? log.sets[0].unit : 'kg';
  setUnit(unit);
  renderSets(log.sets.map((s) => ({ ...s })));
  document.getElementById('saveLogBtn').textContent = 'UPDATE SESSION';
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  document.getElementById('tab-log').classList.add('active');
}

export function deleteSession(logId, exerciseName) {
  document.getElementById('confirmTitle').textContent = 'DELETE SESSION';
  document.getElementById('confirmMsg').textContent = `Delete this ${exerciseName} session? This cannot be undone.`;
  state.confirmCallback = () => {
    data.logs = data.logs.filter((l) => l.id !== logId);
    save();
    renderHistory();
    closeModal('confirmModal');
    showToast('SESSION DELETED');
  };
  document.getElementById('confirmModal').classList.add('open');
}
