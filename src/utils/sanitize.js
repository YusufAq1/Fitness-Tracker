/**
 * Escape HTML special characters to prevent XSS.
 */
export function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/**
 * Escape a string for safe use inside a data-* attribute value.
 */
export function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Validate imported backup data structure.
 * Returns { valid: true, data } or { valid: false, reason }.
 */
export function validateImportData(imported) {
  if (!imported || typeof imported !== 'object') {
    return { valid: false, reason: 'Invalid file format' };
  }

  if (!Array.isArray(imported.days)) {
    return { valid: false, reason: 'Missing or invalid days array' };
  }

  for (const day of imported.days) {
    if (typeof day.id !== 'string' || typeof day.name !== 'string') {
      return { valid: false, reason: 'Invalid day entry' };
    }
    if (day.name.length > 50) {
      return { valid: false, reason: 'Day name too long' };
    }
    if (!Array.isArray(day.exercises)) {
      return { valid: false, reason: 'Invalid exercises in day: ' + day.name };
    }
    for (const ex of day.exercises) {
      if (typeof ex.id !== 'string' || typeof ex.name !== 'string') {
        return { valid: false, reason: 'Invalid exercise entry' };
      }
      if (ex.name.length > 60) {
        return { valid: false, reason: 'Exercise name too long' };
      }
    }
  }

  if (imported.logs !== undefined) {
    if (!Array.isArray(imported.logs)) {
      return { valid: false, reason: 'Invalid logs array' };
    }
    for (const log of imported.logs) {
      if (typeof log.id !== 'string' || typeof log.exerciseId !== 'string') {
        return { valid: false, reason: 'Invalid log entry' };
      }
      if (!Array.isArray(log.sets)) {
        return { valid: false, reason: 'Invalid sets in log' };
      }
      for (const set of log.sets) {
        if (typeof set.kg !== 'number' || typeof set.reps !== 'number') {
          return { valid: false, reason: 'Invalid set data' };
        }
      }
    }
  }

  return { valid: true, data: imported };
}
