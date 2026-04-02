import { openEditDay, deleteDay, openEditExercise, deleteExercise } from './modals.js';
import { editSession, deleteSession } from '../features/history.js';

let longPressTimer = null;
let longPressTriggered = false;
let ctxRenameAction = null;
let ctxDeleteAction = null;

function openContextMenu(x, y, renameAction, deleteAction, renameLabel) {
  const contextMenu = document.getElementById('contextMenu');
  const contextOverlay = document.getElementById('contextOverlay');
  const ctxRename = document.getElementById('ctxRename');

  ctxRenameAction = renameAction;
  ctxDeleteAction = deleteAction;
  ctxRename.textContent = renameLabel || '\u270E RENAME';

  contextMenu.style.left = Math.min(x, window.innerWidth - 180) + 'px';
  contextMenu.style.top = Math.min(y, window.innerHeight - 100) + 'px';
  contextMenu.classList.add('open');
  contextOverlay.classList.add('open');
}

function closeContextMenu() {
  const contextMenu = document.getElementById('contextMenu');
  const contextOverlay = document.getElementById('contextOverlay');
  contextMenu.classList.remove('open');
  contextOverlay.classList.remove('open');
  ctxRenameAction = null;
  ctxDeleteAction = null;
}

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
      openContextMenu(px, py, () => openEditDay(target.dataset.dayId), () => deleteDay(target.dataset.dayId, target.dataset.dayName));
    } else if (type === 'exercise') {
      openContextMenu(
        px,
        py,
        () => openEditExercise(target.dataset.dayId, target.dataset.exId),
        () => deleteExercise(target.dataset.dayId, target.dataset.exId, target.dataset.exName),
      );
    } else if (type === 'session') {
      openContextMenu(
        px,
        py,
        () => editSession(target.dataset.logId),
        () => deleteSession(target.dataset.logId, target.dataset.exName),
        '\u270E EDIT',
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

export function initContextMenu() {
  const ctxRename = document.getElementById('ctxRename');
  const ctxDelete = document.getElementById('ctxDelete');
  const contextOverlay = document.getElementById('contextOverlay');

  ctxRename.addEventListener('click', () => {
    if (ctxRenameAction) ctxRenameAction();
    closeContextMenu();
  });

  ctxDelete.addEventListener('click', () => {
    if (ctxDeleteAction) ctxDeleteAction();
    closeContextMenu();
  });

  contextOverlay.addEventListener('click', closeContextMenu);

  document.addEventListener('touchstart', handlePressStart, { passive: true });
  document.addEventListener('touchend', handlePressEnd);
  document.addEventListener('touchmove', handlePressMove, { passive: true });
  document.addEventListener('mousedown', handlePressStart);
  document.addEventListener('mouseup', handlePressEnd);
  document.addEventListener('mousemove', handlePressMove);

  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('[data-long-press]')) e.preventDefault();
  });
}
