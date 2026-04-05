import { todayHeader } from './utils/date.js';
import { showTab, goBack } from './ui/tabs.js';
import { initModals, openAddDay, executeConfirm } from './ui/modals.js';
import { initContextMenu } from './ui/context-menu.js';
import { renderDays, addSet, saveLog, setUnit, initWorkoutEvents } from './features/workouts.js';
import { showToast } from './ui/toast.js';
import { initAuth, onAuthChange } from './lib/auth.js';
import { initAuthUI, updateAuthUI } from './ui/auth-ui.js';
import { fullSync } from './lib/sync.js';
import { checkMigration } from './features/migration.js';
import { resetToDefaults } from './state/store.js';

window.onerror = (_msg, _src, _line, _col, err) => {
  console.error('Uncaught error:', err);
};

window.onunhandledrejection = (e) => {
  console.error('Unhandled rejection:', e.reason);
};

document.getElementById('headerDate').textContent = todayHeader();

initModals();
initContextMenu();
initWorkoutEvents();
renderDays();

initAuth().then(() => {
  initAuthUI();

  onAuthChange(async (user) => {
    updateAuthUI();
    if (user) {
      await fullSync();
      renderDays();
      await checkMigration();
    } else {
      resetToDefaults();
      renderDays();
    }
  });
});

document.querySelector('.nav').addEventListener('click', (e) => {
  const btn = e.target.closest('.nav-btn');
  if (btn) {
    const tabs = ['workouts', 'history', 'records'];
    const idx = [...document.querySelectorAll('.nav-btn')].indexOf(btn);
    if (idx >= 0) showTab(tabs[idx]);
  }
});

document.querySelector('[data-action-global="add-day"]')?.addEventListener('click', openAddDay);

document.querySelector('[data-action-global="go-back"]')?.addEventListener('click', () => {
  goBack();
});
document.getElementById('unitKg')?.addEventListener('click', () => setUnit('kg'));
document.getElementById('unitLbs')?.addEventListener('click', () => setUnit('lbs'));
document.querySelector('[data-action-global="add-set"]')?.addEventListener('click', addSet);
document.getElementById('saveLogBtn')?.addEventListener('click', saveLog);

document.getElementById('confirmAction')?.addEventListener('click', executeConfirm);

document.getElementById('setsBody')?.addEventListener('click', (e) => {
  const deleteBtn = e.target.closest('[data-action="delete-set"]');
  if (deleteBtn) {
    deleteBtn.closest('tr').remove();
    document.querySelectorAll('#setsBody .set-num').forEach((el, i) => (el.textContent = i + 1));
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => {
        setInterval(() => reg.update(), 30 * 60 * 1000);
        reg.addEventListener('updatefound', () => {
          const newSW = reg.installing;
          newSW.addEventListener('statechange', () => {
            if (newSW.state === 'activated') {
              showToast('APP UPDATED \u2014 RELOADING');
              setTimeout(() => location.reload(), 1500);
            }
          });
        });
      })
      .catch((err) => console.log('SW failed:', err));
  });
}
