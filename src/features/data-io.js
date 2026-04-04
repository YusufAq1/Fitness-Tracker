import { data, replaceData } from '../state/store.js';
import { validateImportData } from '../utils/sanitize.js';
import { renderDays } from './workouts.js';
import { showToast } from '../ui/toast.js';
import { closeModal } from '../ui/modals.js';
import { state } from '../state/store.js';

export function exportData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vyra-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('BACKUP EXPORTED');
}

export function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsed = JSON.parse(e.target.result);
      const result = validateImportData(parsed);

      if (!result.valid) {
        showToast('INVALID: ' + result.reason.toUpperCase());
        return;
      }

      document.getElementById('confirmTitle').textContent = 'IMPORT DATA';
      document.getElementById('confirmMsg').textContent =
        'This will replace all your current data with the backup. Continue?';
      document.getElementById('confirmAction').textContent = 'IMPORT';
      state.confirmCallback = () => {
        replaceData(result.data);
        renderDays();
        closeModal('confirmModal');
        document.getElementById('confirmAction').textContent = 'DELETE';
        showToast('DATA RESTORED');
      };
      document.getElementById('confirmModal').classList.add('open');
    } catch (_err) {
      showToast('INVALID BACKUP FILE');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}
