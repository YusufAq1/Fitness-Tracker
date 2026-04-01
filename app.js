// ─── STATE ───────────────────────────────────────────
let data = JSON.parse(localStorage.getItem('overload_data') || 'null') || {
  days: [
    { id: 'd1', name: 'Day A', exercises: [{ id: 'e1', name: 'Bench Press' }, { id: 'e2', name: 'Overhead Press' }] },
    { id: 'd2', name: 'Day B', exercises: [{ id: 'e3', name: 'Squat' }, { id: 'e4', name: 'Romanian Deadlift' }] }
  ],
  logs: []  // { id, exerciseId, exerciseName, dayName, date, sets: [{kg, reps}] }
};

let currentDayId = null;
let currentExId = null;
let currentExName = null;
let currentDayName = null;
let addExDayId = null;
let historyFilter = 'ALL';
let editDayId = null;
let editExDayId = null;
let editExId = null;
let confirmCallback = null;
let currentUnit = 'kg';

function save() { localStorage.setItem('overload_data', JSON.stringify(data)); }

// ─── DATE ─────────────────────────────────────────────
function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
document.getElementById('headerDate').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();

// ─── TABS ─────────────────────────────────────────────
function showTab(tab) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  const tabIndex = { workouts: 0, history: 1, records: 2 };
  document.querySelectorAll('.nav-btn')[tabIndex[tab]].classList.add('active');
  if (tab === 'history') renderHistory();
  if (tab === 'records') renderRecords();
}

function goBack() {
  document.getElementById('tab-log').classList.remove('active');
  document.getElementById('tab-workouts').classList.add('active');
  document.querySelectorAll('.nav-btn')[0].classList.add('active');
}

// ─── WORKOUTS ─────────────────────────────────────────
function renderDays() {
  const el = document.getElementById('daysList');
  if (!data.days.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">💪</div>NO DAYS YET<br>ADD YOUR FIRST WORKOUT DAY</div>';
    return;
  }
  el.innerHTML = data.days.map(day => {
    const exRows = day.exercises.map(ex => {
      const last = getLastLog(ex.id);
      const lastStr = last ? last.sets.map(s => {
        const unit = s.unit || 'kg';
        return `${s.kg}${unit}×${s.reps}`;
      }).join(' · ') : '—';
      return `<div class="exercise-row" data-long-press="exercise" data-day-id="${day.id}" data-ex-id="${ex.id}" data-ex-name="${esc(ex.name)}" onclick="openLog('${day.id}','${ex.id}','${esc(ex.name)}','${esc(day.name)}')">
        <div style="flex:1">
          <div class="exercise-name">${ex.name}</div>
          <div class="exercise-last">${lastStr}</div>
        </div>
        <span class="ex-arrow">→</span>
      </div>`;
    }).join('');
    return `<div class="day-card" id="dc-${day.id}">
      <div class="day-header" data-long-press="day" data-day-id="${day.id}" data-day-name="${esc(day.name)}" onclick="toggleDay('${day.id}')">
        <div>
          <div class="day-name">${day.name}</div>
          <div class="day-meta">${day.exercises.length} EXERCISE${day.exercises.length !== 1 ? 'S' : ''}</div>
        </div>
        <div class="day-header-right">
          <span class="day-chevron">▾</span>
        </div>
      </div>
      <div class="day-body">
        ${exRows || '<div style="color:var(--muted);font-size:13px;padding:12px 0">No exercises yet</div>'}
        <button class="add-exercise-btn" onclick="openAddExercise('${day.id}')">+ ADD EXERCISE</button>
      </div>
    </div>`;
  }).join('');
}

function toggleDay(id) {
  document.getElementById('dc-' + id).classList.toggle('open');
}

function esc(s) { return s.replace(/'/g, "\\'"); }

function getLastLog(exId) {
  const logs = data.logs.filter(l => l.exerciseId === exId).sort((a, b) => b.date - a.date);
  return logs[0] || null;
}

// ─── LOG EXERCISE ──────────────────────────────────────
function openLog(dayId, exId, exName, dayName) {
  currentDayId = dayId; currentExId = exId;
  currentExName = exName; currentDayName = dayName;
  document.getElementById('logExName').textContent = exName;
  document.getElementById('logDayLabel').textContent = dayName.toUpperCase() + ' · ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();
  const last = getLastLog(exId);
  const sets = last ? last.sets.map(s => ({ ...s })) : [{ kg: '', reps: '' }, { kg: '', reps: '' }];
  const unit = last && last.sets[0] && last.sets[0].unit ? last.sets[0].unit : 'kg';
  setUnit(unit);
  renderSets(sets);
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('tab-log').classList.add('active');
}

function renderSets(sets) {
  document.getElementById('setsBody').innerHTML = sets.map((s, i) => `
    <tr class="set-row">
      <td class="set-num">${i + 1}</td>
      <td><input class="set-input" type="number" min="0" step="0.5" placeholder="0" value="${s.kg}" /></td>
      <td class="set-sep">×</td>
      <td><input class="set-input" type="number" min="0" step="1" placeholder="0" value="${s.reps}" /></td>
      <td><button class="set-delete" onclick="deleteSet(this)">✕</button></td>
    </tr>`).join('');
}

function addSet() {
  const tbody = document.getElementById('setsBody');
  const rows = tbody.querySelectorAll('.set-row');
  const lastKg = rows.length ? rows[rows.length - 1].querySelectorAll('input')[0].value : '';
  const i = rows.length;
  const tr = document.createElement('tr');
  tr.className = 'set-row';
  tr.innerHTML = `
    <td class="set-num">${i + 1}</td>
    <td><input class="set-input" type="number" min="0" step="0.5" placeholder="0" value="${lastKg}" /></td>
    <td class="set-sep">×</td>
    <td><input class="set-input" type="number" min="0" step="1" placeholder="0" /></td>
    <td><button class="set-delete" onclick="deleteSet(this)">✕</button></td>`;
  tbody.appendChild(tr);
  renumberSets();
}

function deleteSet(btn) {
  btn.closest('tr').remove();
  renumberSets();
}

function renumberSets() {
  document.querySelectorAll('#setsBody .set-num').forEach((el, i) => el.textContent = i + 1);
}

function saveLog() {
  const rows = document.querySelectorAll('#setsBody .set-row');
  const sets = [];
  rows.forEach(row => {
    const [kg, reps] = row.querySelectorAll('input');
    if (kg.value !== '' && reps.value !== '') {
      sets.push({ kg: parseFloat(kg.value), reps: parseInt(reps.value), unit: currentUnit });
    }
  });
  if (!sets.length) { showToast('ADD AT LEAST ONE SET'); return; }
  data.logs.push({
    id: Date.now() + '',
    exerciseId: currentExId,
    exerciseName: currentExName,
    dayName: currentDayName,
    date: Date.now(),
    sets
  });
  save();
  renderDays();
  showToast('SESSION SAVED ✓');
  goBack();
}

// ─── ADD DAY ──────────────────────────────────────────
function openAddDay() { document.getElementById('addDayModal').classList.add('open'); document.getElementById('dayNameInput').value = ''; document.getElementById('dayNameInput').focus(); }
function confirmAddDay() {
  const name = document.getElementById('dayNameInput').value.trim();
  if (!name) return;
  data.days.push({ id: 'd' + Date.now(), name, exercises: [] });
  save(); renderDays(); closeModal('addDayModal');
}

// ─── ADD EXERCISE ─────────────────────────────────────
function openAddExercise(dayId) {
  addExDayId = dayId;
  document.getElementById('addExModal').classList.add('open');
  document.getElementById('exNameInput').value = '';
  document.getElementById('exNameInput').focus();
}
function confirmAddExercise() {
  const name = document.getElementById('exNameInput').value.trim();
  if (!name) return;
  const day = data.days.find(d => d.id === addExDayId);
  if (day) day.exercises.push({ id: 'e' + Date.now(), name });
  save(); renderDays(); closeModal('addExModal');
  setTimeout(() => { const dc = document.getElementById('dc-' + addExDayId); if (dc) dc.classList.add('open'); }, 50);
}

function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => { if (e.target === el) el.classList.remove('open'); });
});

// Enter key in modals
document.getElementById('dayNameInput').addEventListener('keydown', e => { if (e.key === 'Enter') confirmAddDay(); });
document.getElementById('exNameInput').addEventListener('keydown', e => { if (e.key === 'Enter') confirmAddExercise(); });
document.getElementById('editDayNameInput').addEventListener('keydown', e => { if (e.key === 'Enter') confirmEditDay(); });
document.getElementById('editExNameInput').addEventListener('keydown', e => { if (e.key === 'Enter') confirmEditExercise(); });

// ─── EDIT DAY ─────────────────────────────────────────
function openEditDay(dayId) {
  editDayId = dayId;
  const day = data.days.find(d => d.id === dayId);
  if (!day) return;
  document.getElementById('editDayNameInput').value = day.name;
  document.getElementById('editDayModal').classList.add('open');
  document.getElementById('editDayNameInput').focus();
}
function confirmEditDay() {
  const name = document.getElementById('editDayNameInput').value.trim();
  if (!name) return;
  const day = data.days.find(d => d.id === editDayId);
  if (day) {
    day.name = name;
    save(); renderDays(); closeModal('editDayModal');
    showToast('DAY RENAMED');
  }
}

// ─── DELETE DAY ───────────────────────────────────────
function deleteDay(dayId, dayName) {
  document.getElementById('confirmTitle').textContent = 'DELETE DAY';
  document.getElementById('confirmMsg').textContent = `Delete "${dayName}" and all its exercises? This cannot be undone.`;
  confirmCallback = () => {
    data.days = data.days.filter(d => d.id !== dayId);
    save(); renderDays(); closeModal('confirmModal');
    showToast('DAY DELETED');
  };
  document.getElementById('confirmModal').classList.add('open');
}

// ─── EDIT EXERCISE ────────────────────────────────────
function openEditExercise(dayId, exId) {
  editExDayId = dayId;
  editExId = exId;
  const day = data.days.find(d => d.id === dayId);
  const ex = day ? day.exercises.find(e => e.id === exId) : null;
  if (!ex) return;
  document.getElementById('editExNameInput').value = ex.name;
  document.getElementById('editExModal').classList.add('open');
  document.getElementById('editExNameInput').focus();
}
function confirmEditExercise() {
  const name = document.getElementById('editExNameInput').value.trim();
  if (!name) return;
  const day = data.days.find(d => d.id === editExDayId);
  const ex = day ? day.exercises.find(e => e.id === editExId) : null;
  if (ex) {
    ex.name = name;
    save(); renderDays(); closeModal('editExModal');
    showToast('EXERCISE RENAMED');
  }
}

// ─── DELETE EXERCISE ──────────────────────────────────
function deleteExercise(dayId, exId, exName) {
  document.getElementById('confirmTitle').textContent = 'DELETE EXERCISE';
  document.getElementById('confirmMsg').textContent = `Delete "${exName}"? This cannot be undone.`;
  confirmCallback = () => {
    const day = data.days.find(d => d.id === dayId);
    if (day) day.exercises = day.exercises.filter(e => e.id !== exId);
    save(); renderDays(); closeModal('confirmModal');
    showToast('EXERCISE DELETED');
  };
  document.getElementById('confirmModal').classList.add('open');
}

function executeConfirm() {
  if (confirmCallback) { confirmCallback(); confirmCallback = null; }
}

// ─── UNIT TOGGLE ──────────────────────────────────────
function setUnit(unit) {
  currentUnit = unit;
  document.getElementById('unitKg').classList.toggle('active', unit === 'kg');
  document.getElementById('unitLbs').classList.toggle('active', unit === 'lbs');
  document.getElementById('weightHeader').textContent = unit.toUpperCase();
}

// ─── PERSONAL RECORDS ─────────────────────────────────
function getPersonalRecords() {
  const prs = {};
  // Sort logs oldest-first to find the first time each max was set
  const sorted = [...data.logs].sort((a, b) => a.date - b.date);
  sorted.forEach(log => {
    const maxWeight = Math.max(...log.sets.map(s => s.kg));
    const bestSet = log.sets.reduce((best, s) => s.kg > best.kg || (s.kg === best.kg && s.reps > best.reps) ? s : best);
    if (!prs[log.exerciseId] || maxWeight > prs[log.exerciseId].weight) {
      prs[log.exerciseId] = {
        exerciseName: log.exerciseName,
        weight: maxWeight,
        reps: bestSet.reps,
        unit: bestSet.unit || 'kg',
        date: log.date,
        logId: log.id
      };
    }
  });
  return prs;
}

function isPersonalRecord(log, prs) {
  const pr = prs[log.exerciseId];
  return pr && pr.logId === log.id;
}

// ─── HISTORY ──────────────────────────────────────────
function renderHistory() {
  const prs = getPersonalRecords();

  // Build filter chips
  const names = ['ALL', ...new Set(data.logs.map(l => l.exerciseName))];
  const filterEl = document.getElementById('historyFilter');
  filterEl.innerHTML = names.map(n => `<button class="filter-chip ${historyFilter === n ? 'active' : ''}" onclick="setFilter('${esc(n)}')">${n.toUpperCase()}</button>`).join('');

  const listEl = document.getElementById('historyList');
  let filtered = historyFilter === 'ALL' ? data.logs : data.logs.filter(l => l.exerciseName === historyFilter);
  filtered = [...filtered].sort((a, b) => b.date - a.date);

  if (!filtered.length) {
    listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">📊</div>NO HISTORY YET<br>LOG YOUR FIRST SESSION</div>';
    return;
  }

  listEl.innerHTML = filtered.map(log => {
    const prev = getPrevLog(log.exerciseId, log.date);
    const maxKg = Math.max(...log.sets.map(s => s.kg));
    const prevMaxKg = prev ? Math.max(...prev.sets.map(s => s.kg)) : null;
    const totalReps = log.sets.reduce((a, s) => a + s.reps, 0);
    const prevReps = prev ? prev.sets.reduce((a, s) => a + s.reps, 0) : null;
    const diff = prevMaxKg !== null ? maxKg - prevMaxKg : null;
    const repsDiff = prevReps !== null ? totalReps - prevReps : null;
    const chips = log.sets.map(s => `<span class="history-set-chip">${s.kg}${s.unit || 'kg'} × ${s.reps}</span>`).join('');
    const pct = prevMaxKg ? Math.min(100, Math.round((maxKg / (prevMaxKg * 1.5)) * 100)) : 50;
    const isPR = isPersonalRecord(log, prs);

    let progressHTML = '';
    if (prev) {
      const wUnit = log.sets[0] && log.sets[0].unit ? log.sets[0].unit : 'kg';
      const kgLabel = diff > 0 ? `<span class="up">▲ +${diff}${wUnit}</span>` : diff < 0 ? `<span class="down">▼ ${diff}${wUnit}</span>` : `<span>= same weight</span>`;
      const repsLabel = repsDiff > 0 ? `<span class="up">+${repsDiff} reps</span>` : repsDiff < 0 ? `<span class="down">${repsDiff} reps</span>` : `<span>= same reps</span>`;
      progressHTML = `<div class="progress-bar-wrap">
        <div class="progress-label"><span>VS PREV SESSION</span><span>${kgLabel} · ${repsLabel}</span></div>
        <div class="pbar-bg"><div class="pbar-fill" style="width:${pct}%"></div></div>
      </div>`;
    }

    return `<div class="history-entry">
      <div class="history-ex-name-row">
        <div class="history-ex-name">${log.exerciseName}</div>${isPR ? '<span class="pr-badge">PR</span>' : ''}
      </div>
      <div class="history-meta">${log.dayName.toUpperCase()} · ${formatDate(log.date).toUpperCase()}</div>
      <div class="history-sets">${chips}</div>
      ${progressHTML}
    </div>`;
  }).join('');
}

function getPrevLog(exId, beforeDate) {
  return data.logs
    .filter(l => l.exerciseId === exId && l.date < beforeDate)
    .sort((a, b) => b.date - a.date)[0] || null;
}

function setFilter(name) {
  historyFilter = name;
  renderHistory();
}

// ─── RECORDS ──────────────────────────────────────────
function renderRecords() {
  const prs = getPersonalRecords();
  const prValues = Object.values(prs);
  const listEl = document.getElementById('recordsList');

  if (!prValues.length) {
    listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">🏆</div>NO RECORDS YET<br>LOG A SESSION TO SET YOUR FIRST PR</div>';
    return;
  }

  // Sort alphabetically by exercise name
  prValues.sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));

  listEl.innerHTML = prValues.map(p => {
    const totalSessions = data.logs.filter(l => l.exerciseName === p.exerciseName).length;

    return `<div class="record-card">
      <div class="record-header">
        <div class="record-name">${p.exerciseName}</div>
        <div class="record-sessions">${totalSessions} SESSION${totalSessions !== 1 ? 'S' : ''}</div>
      </div>
      <div class="record-value">${p.weight}${p.unit} × ${p.reps}</div>
      <div class="record-date">SET ON ${formatDate(p.date).toUpperCase()}</div>
    </div>`;
  }).join('');
}

// ─── TOAST ────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// ─── EXPORT / IMPORT ──────────────────────────────────
function exportData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'overload-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('BACKUP EXPORTED');
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!imported.days || !Array.isArray(imported.days)) {
        showToast('INVALID BACKUP FILE');
        return;
      }
      document.getElementById('confirmTitle').textContent = 'IMPORT DATA';
      document.getElementById('confirmMsg').textContent = 'This will replace all your current data with the backup. Continue?';
      document.getElementById('confirmAction').textContent = 'IMPORT';
      confirmCallback = () => {
        data = imported;
        save(); renderDays(); closeModal('confirmModal');
        document.getElementById('confirmAction').textContent = 'DELETE';
        showToast('DATA RESTORED');
      };
      document.getElementById('confirmModal').classList.add('open');
    } catch (err) {
      showToast('INVALID BACKUP FILE');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ─── LONG-PRESS CONTEXT MENU ──────────────────────────
const contextMenu = document.getElementById('contextMenu');
const contextOverlay = document.getElementById('contextOverlay');
const ctxRename = document.getElementById('ctxRename');
const ctxDelete = document.getElementById('ctxDelete');
let longPressTimer = null;
let longPressTriggered = false;
let ctxRenameAction = null;
let ctxDeleteAction = null;

function openContextMenu(x, y, renameAction, deleteAction) {
  ctxRenameAction = renameAction;
  ctxDeleteAction = deleteAction;

  contextMenu.style.left = Math.min(x, window.innerWidth - 180) + 'px';
  contextMenu.style.top = Math.min(y, window.innerHeight - 100) + 'px';
  contextMenu.classList.add('open');
  contextOverlay.classList.add('open');
}

function closeContextMenu() {
  contextMenu.classList.remove('open');
  contextOverlay.classList.remove('open');
  ctxRenameAction = null;
  ctxDeleteAction = null;
}

ctxRename.addEventListener('click', () => {
  if (ctxRenameAction) ctxRenameAction();
  closeContextMenu();
});

ctxDelete.addEventListener('click', () => {
  if (ctxDeleteAction) ctxDeleteAction();
  closeContextMenu();
});

contextOverlay.addEventListener('click', closeContextMenu);

function handlePressStart(e) {
  const target = e.target.closest('[data-long-press]');
  if (!target) return;

  longPressTriggered = false;
  const touch = e.touches ? e.touches[0] : e;
  const px = touch.clientX;
  const py = touch.clientY;

  longPressTimer = setTimeout(() => {
    longPressTriggered = true;
    if (navigator.vibrate) navigator.vibrate(30);

    const type = target.dataset.longPress;
    if (type === 'day') {
      const dayId = target.dataset.dayId;
      const dayName = target.dataset.dayName;
      openContextMenu(px, py,
        () => openEditDay(dayId),
        () => deleteDay(dayId, dayName)
      );
    } else if (type === 'exercise') {
      const dayId = target.dataset.dayId;
      const exId = target.dataset.exId;
      const exName = target.dataset.exName;
      openContextMenu(px, py,
        () => openEditExercise(dayId, exId),
        () => deleteExercise(dayId, exId, exName)
      );
    }
  }, 500);
}

function handlePressEnd(e) {
  clearTimeout(longPressTimer);
  if (longPressTriggered) {
    e.preventDefault();
    longPressTriggered = false;
  }
}

function handlePressMove() {
  clearTimeout(longPressTimer);
}

document.addEventListener('touchstart', handlePressStart, { passive: true });
document.addEventListener('touchend', handlePressEnd);
document.addEventListener('touchmove', handlePressMove, { passive: true });
document.addEventListener('mousedown', handlePressStart);
document.addEventListener('mouseup', handlePressEnd);
document.addEventListener('mousemove', handlePressMove);

// Prevent default context menu on long-press targets
document.addEventListener('contextmenu', e => {
  if (e.target.closest('[data-long-press]')) e.preventDefault();
});

// ─── INIT ─────────────────────────────────────────────
renderDays();

// ─── SERVICE WORKER ───────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        // Check for updates every 30 minutes while the app is open
        setInterval(() => reg.update(), 30 * 60 * 1000);
        reg.addEventListener('updatefound', () => {
          const newSW = reg.installing;
          newSW.addEventListener('statechange', () => {
            if (newSW.state === 'activated') {
              showToast('APP UPDATED — RELOADING');
              setTimeout(() => location.reload(), 1500);
            }
          });
        });
      })
      .catch(err => console.log('SW failed:', err));
  });
}
