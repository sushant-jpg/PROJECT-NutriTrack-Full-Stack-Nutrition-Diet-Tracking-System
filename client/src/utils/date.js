const pad = (value) => String(value).padStart(2, '0');

export function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function localDateTimeInput(date = new Date()) {
  return `${localDateString(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function shiftDate(dateString, amount) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day + amount, 12);
  return localDateString(date);
}

export function displayDate(dateString, options = {}) {
  if (!dateString) return '—';
  const date = new Date(`${String(dateString).slice(0, 10)}T12:00:00`);
  return new Intl.DateTimeFormat('en-NP', {
    year: 'numeric', month: 'short', day: 'numeric', ...options
  }).format(date);
}

export function displayDateTime(dateTime) {
  if (!dateTime) return '—';
  const normalized = String(dateTime).replace(' ', 'T');
  return new Intl.DateTimeFormat('en-NP', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kathmandu'
  }).format(new Date(`${normalized}+05:45`));
}

export function displayTime(dateTime) {
  if (!dateTime) return '—';
  const time = String(dateTime).slice(11, 16);
  const [hour, minute] = time.split(':').map(Number);
  const date = new Date(2000, 0, 1, hour, minute);
  return new Intl.DateTimeFormat('en-NP', { hour: 'numeric', minute: '2-digit' }).format(date);
}

export function toDateTimeInput(value) {
  return value ? String(value).replace(' ', 'T').slice(0, 16) : '';
}

