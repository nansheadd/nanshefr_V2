export const getBrowserTimeZone = () => {
  if (typeof Intl === 'undefined' || typeof Intl.DateTimeFormat !== 'function') {
    return null;
  }

  try {
    const { timeZone } = new Intl.DateTimeFormat().resolvedOptions();
    return typeof timeZone === 'string' && timeZone.length > 0 ? timeZone : null;
  } catch {
    return null;
  }
};

export const getTimezoneOffsetMinutes = () => {
  if (typeof Date === 'undefined') {
    return null;
  }

  try {
    const offset = new Date().getTimezoneOffset();
    return Number.isFinite(offset) ? offset : null;
  } catch {
    return null;
  }
};

export default {
  getBrowserTimeZone,
  getTimezoneOffsetMinutes,
};
