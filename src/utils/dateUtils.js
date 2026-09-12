// Utility to get today's date in local system/zonal time in YYYY-MM-DD format
export const getTodayZonalDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Checks if the Indian Stock Market (NSE/BSE) is currently open:
 * Monday to Friday, 9:15 AM to 3:30 PM IST (Asia/Kolkata timezone).
 * @returns {boolean}
 */
export const isIndianMarketOpen = () => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    let weekday = '';
    let hour = 0;
    let minute = 0;

    for (const part of parts) {
      if (part.type === 'weekday') weekday = part.value;
      if (part.type === 'hour') hour = parseInt(part.value, 10);
      if (part.type === 'minute') minute = parseInt(part.value, 10);
    }

    // Market operates Monday to Friday only
    const openDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    if (!openDays.includes(weekday)) {
      return false;
    }

    // Market hours: 9:15 AM (555 mins) to 3:30 PM (930 mins) IST
    const currentMins = hour * 60 + minute;
    return currentMins >= 555 && currentMins < 930;
  } catch {
    // Fallback using local device time
    const now = new Date();
    const day = now.getDay(); // 0 = Sun, 6 = Sat
    if (day === 0 || day === 6) return false;
    const mins = now.getHours() * 60 + now.getMinutes();
    return mins >= 555 && mins < 930;
  }
};
