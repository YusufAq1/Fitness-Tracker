import { signUp, signIn, signInWithGoogle, signOut, resetPassword, getUser, isLoggedIn } from '../lib/auth.js';
import { isSupabaseConfigured } from '../lib/supabase.js';
import { showToast } from './toast.js';
import { pullFromCloud } from '../lib/sync.js';
import { renderDays } from '../features/workouts.js';

let currentAuthView = 'login'; // 'login' | 'signup' | 'forgot'

function getAuthContainer() {
  return document.getElementById('authView');
}

function getAccountContainer() {
  return document.getElementById('accountSection');
}

export function renderAuthView() {
  const container = getAuthContainer();
  if (!container) return;

  if (currentAuthView === 'signup') {
    container.innerHTML = `
      <div class="auth-card">
        <div class="auth-title">CREATE ACCOUNT</div>
        <div class="auth-subtitle">Sync your workouts across devices</div>
        <input class="modal-input" id="authUsername" type="text" placeholder="Username" maxlength="30" aria-label="Username" />
        <input class="modal-input" id="authEmail" type="email" placeholder="Email" aria-label="Email" />
        <input class="modal-input" id="authPassword" type="password" placeholder="Password (min 6 chars)" aria-label="Password" />
        <button class="save-btn" id="authSubmitBtn">SIGN UP</button>
        <button class="auth-google-btn" id="authGoogleBtn">
          <span class="auth-google-icon">G</span> CONTINUE WITH GOOGLE
        </button>
        <div class="auth-switch">
          Already have an account? <button class="auth-link" id="authSwitchBtn">LOG IN</button>
        </div>
      </div>`;
    setupAuthEvents('signup');
  } else if (currentAuthView === 'forgot') {
    container.innerHTML = `
      <div class="auth-card">
        <div class="auth-title">RESET PASSWORD</div>
        <div class="auth-subtitle">We'll send a reset link to your email</div>
        <input class="modal-input" id="authEmail" type="email" placeholder="Email" aria-label="Email" />
        <button class="save-btn" id="authSubmitBtn">SEND RESET LINK</button>
        <div class="auth-switch">
          <button class="auth-link" id="authSwitchBtn">BACK TO LOGIN</button>
        </div>
      </div>`;
    setupAuthEvents('forgot');
  } else {
    container.innerHTML = `
      <div class="auth-card">
        <div class="auth-title">LOG IN</div>
        <div class="auth-subtitle">Access your workouts anywhere</div>
        <input class="modal-input" id="authEmail" type="email" placeholder="Email" aria-label="Email" />
        <input class="modal-input" id="authPassword" type="password" placeholder="Password" aria-label="Password" />
        <button class="save-btn" id="authSubmitBtn">LOG IN</button>
        <button class="auth-google-btn" id="authGoogleBtn">
          <span class="auth-google-icon">G</span> CONTINUE WITH GOOGLE
        </button>
        <div class="auth-switch">
          <button class="auth-link" id="authForgotBtn">Forgot password?</button>
          <span> · </span>
          <button class="auth-link" id="authSwitchBtn">SIGN UP</button>
        </div>
      </div>`;
    setupAuthEvents('login');
  }
}

function setupAuthEvents(view) {
  const submitBtn = document.getElementById('authSubmitBtn');
  const switchBtn = document.getElementById('authSwitchBtn');
  const forgotBtn = document.getElementById('authForgotBtn');
  const googleBtn = document.getElementById('authGoogleBtn');

  submitBtn?.addEventListener('click', () => handleSubmit(view));
  googleBtn?.addEventListener('click', handleGoogleSignIn);

  // Enter key submits
  const inputs = getAuthContainer().querySelectorAll('input');
  inputs.forEach((input) => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSubmit(view);
    });
  });

  if (view === 'login') {
    switchBtn?.addEventListener('click', () => {
      currentAuthView = 'signup';
      renderAuthView();
    });
    forgotBtn?.addEventListener('click', () => {
      currentAuthView = 'forgot';
      renderAuthView();
    });
  } else if (view === 'signup') {
    switchBtn?.addEventListener('click', () => {
      currentAuthView = 'login';
      renderAuthView();
    });
  } else if (view === 'forgot') {
    switchBtn?.addEventListener('click', () => {
      currentAuthView = 'login';
      renderAuthView();
    });
  }
}

async function handleSubmit(view) {
  const email = document.getElementById('authEmail')?.value?.trim();
  const password = document.getElementById('authPassword')?.value;
  const username = document.getElementById('authUsername')?.value?.trim();
  const submitBtn = document.getElementById('authSubmitBtn');

  if (!email) {
    showToast('ENTER YOUR EMAIL');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'LOADING...';

  try {
    if (view === 'signup') {
      if (!password || password.length < 6) {
        showToast('PASSWORD MUST BE 6+ CHARS');
        return;
      }
      await signUp(email, password, username || 'User');
      showToast('CHECK YOUR EMAIL TO CONFIRM');
      currentAuthView = 'login';
      renderAuthView();
    } else if (view === 'login') {
      if (!password) {
        showToast('ENTER YOUR PASSWORD');
        return;
      }
      await signIn(email, password);
      showToast('LOGGED IN \u2713');
      await pullFromCloud();
      renderDays();
      updateAuthUI();
    } else if (view === 'forgot') {
      await resetPassword(email);
      showToast('RESET LINK SENT');
      currentAuthView = 'login';
      renderAuthView();
    }
  } catch (err) {
    showToast(err.message?.toUpperCase() || 'AUTH ERROR');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      if (view === 'signup') submitBtn.textContent = 'SIGN UP';
      else if (view === 'login') submitBtn.textContent = 'LOG IN';
      else submitBtn.textContent = 'SEND RESET LINK';
    }
  }
}

async function handleGoogleSignIn() {
  try {
    await signInWithGoogle();
  } catch (err) {
    showToast(err.message?.toUpperCase() || 'GOOGLE SIGN-IN FAILED');
  }
}

export function renderAccountSection() {
  const container = getAccountContainer();
  if (!container) return;

  if (!isSupabaseConfigured()) {
    container.innerHTML = `
      <div class="account-card">
        <div class="account-info">
          <div class="account-label">OFFLINE MODE</div>
          <div class="account-detail">Data stored locally on this device</div>
        </div>
      </div>`;
    return;
  }

  if (isLoggedIn()) {
    const user = getUser();
    const email = user.email || 'Unknown';
    const username = user.user_metadata?.username || email.split('@')[0];
    container.innerHTML = `
      <div class="account-card">
        <div class="account-avatar">${username[0].toUpperCase()}</div>
        <div class="account-info">
          <div class="account-name">${username}</div>
          <div class="account-detail">${email}</div>
          <div class="account-badge">SYNCED</div>
        </div>
      </div>
      <button class="data-btn data-btn-export" id="syncNowBtn">\u21BB SYNC NOW</button>
      <button class="data-btn data-btn-import auth-signout-btn" id="signOutBtn">SIGN OUT</button>`;

    document.getElementById('signOutBtn')?.addEventListener('click', async () => {
      try {
        await signOut();
        showToast('SIGNED OUT');
        updateAuthUI();
      } catch (_err) {
        showToast('SIGN OUT FAILED');
      }
    });

    document.getElementById('syncNowBtn')?.addEventListener('click', async () => {
      const btn = document.getElementById('syncNowBtn');
      btn.disabled = true;
      btn.textContent = 'SYNCING...';
      try {
        await pullFromCloud();
        renderDays();
        showToast('SYNCED \u2713');
      } catch (_err) {
        showToast('SYNC FAILED');
      } finally {
        btn.disabled = false;
        btn.textContent = '\u21BB SYNC NOW';
      }
    });
  } else {
    container.innerHTML = '';
    renderAuthView();
  }
}

export function updateAuthUI() {
  const authView = getAuthContainer();

  if (isLoggedIn()) {
    if (authView) authView.style.display = 'none';
    renderAccountSection();
  } else {
    if (authView) authView.style.display = 'block';
    renderAuthView();
    renderAccountSection();
  }
}

export function initAuthUI() {
  if (!getAuthContainer()) return;
  updateAuthUI();
}
