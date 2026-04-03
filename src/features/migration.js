import { data } from '../state/store.js';
import { isLoggedIn } from '../lib/auth.js';
import { fetchTemplates } from '../lib/db.js';
import { pushAllToCloud } from '../lib/sync.js';
import { showToast } from '../ui/toast.js';

const MIGRATION_KEY = 'overload_migrated';

/**
 * Check if local data should be migrated to cloud.
 * Shows migration prompt on first login if local data exists.
 */
export async function checkMigration() {
  if (!isLoggedIn()) return;
  if (localStorage.getItem(MIGRATION_KEY)) return;

  // Check if user already has cloud data
  try {
    const cloudTemplates = await fetchTemplates();
    if (cloudTemplates && cloudTemplates.length > 0) {
      // User already has cloud data, skip migration
      localStorage.setItem(MIGRATION_KEY, 'true');
      return;
    }
  } catch (_err) {
    return;
  }

  // Check if there's meaningful local data to migrate
  const hasLocalData = data.days.length > 0 && (data.logs.length > 0 || data.days.some((d) => d.exercises.length > 0));
  if (!hasLocalData) {
    localStorage.setItem(MIGRATION_KEY, 'true');
    return;
  }

  // Show migration prompt
  showMigrationPrompt();
}

function showMigrationPrompt() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.id = 'migrationModal';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-title">UPLOAD LOCAL DATA?</div>
      <div class="modal-confirm-msg">
        You have <strong>${data.days.length} workout day${data.days.length !== 1 ? 's' : ''}</strong>
        and <strong>${data.logs.length} session${data.logs.length !== 1 ? 's' : ''}</strong> on this device.
        <br><br>
        Would you like to upload them to your account so they sync across all your devices?
      </div>
      <div class="modal-actions">
        <button class="modal-cancel" id="migrationSkip">SKIP</button>
        <button class="modal-confirm" id="migrationUpload">UPLOAD</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  document.getElementById('migrationSkip').addEventListener('click', () => {
    localStorage.setItem(MIGRATION_KEY, 'true');
    overlay.remove();
  });

  document.getElementById('migrationUpload').addEventListener('click', async () => {
    const uploadBtn = document.getElementById('migrationUpload');
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'UPLOADING...';

    try {
      await pushAllToCloud();
      localStorage.setItem(MIGRATION_KEY, 'true');
      showToast('DATA UPLOADED \u2713');
      overlay.remove();
    } catch (err) {
      console.error('Migration failed:', err);
      showToast('UPLOAD FAILED');
      uploadBtn.disabled = false;
      uploadBtn.textContent = 'RETRY';
    }
  });
}
