import { state } from '../state/store.js';
import { renderHistory } from '../features/history.js';
import { renderRecords } from '../features/records.js';

const TAB_INDEX = { workouts: 0, history: 1, records: 2 };

export function showTab(tab) {
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach((b) => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  document.getElementById('tab-' + tab).classList.add('active');
  const activeBtn = document.querySelectorAll('.nav-btn')[TAB_INDEX[tab]];
  activeBtn.classList.add('active');
  activeBtn.setAttribute('aria-selected', 'true');
  if (tab === 'history') renderHistory();
  if (tab === 'records') renderRecords();
}

export function goBack() {
  state.editingLogId = null;
  document.getElementById('tab-log').classList.remove('active');
  document.getElementById('tab-' + state.logReturnTab).classList.add('active');
  document.querySelectorAll('.nav-btn')[TAB_INDEX[state.logReturnTab]].classList.add('active');
  if (state.logReturnTab === 'history') renderHistory();
  if (state.logReturnTab === 'records') renderRecords();
  state.logReturnTab = 'workouts';
}
