/** Format a date string to readable form: Sep 21, 2026 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

/** Format currency in ETB */
export const formatCurrency = (amount) => {
  if (amount == null) return '—';
  return `${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB`;
};

/** Capitalise first letter */
export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

/** Map a status string to a CSS class modifier */
export const statusClass = (status) => {
  const map = {
    active:     'success',
    present:    'success',
    approved:   'success',
    paid:       'success',
    connected:  'success',
    pending:    'warning',
    permitted:  'warning',
    inactive:   'neutral',
    absent:     'danger',
    rejected:   'danger',
    suspended:  'danger',
    failed:     'danger',
    cancelled:  'neutral',
    transferred:'neutral',
    not_connected: 'neutral',
  };
  return map[status] || 'neutral';
};

/** Teaching days SET string → readable label */
export const formatDays = (daysStr) => {
  if (!daysStr) return '—';
  return daysStr.split(',').join(', ');
};

/** Extract error message from Axios error */
export const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || 'An unexpected error occurred';
