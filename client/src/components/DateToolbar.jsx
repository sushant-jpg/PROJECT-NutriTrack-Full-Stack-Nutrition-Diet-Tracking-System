import { CalendarDays, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { displayDate, localDateString, shiftDate } from '../utils/date';

export default function DateToolbar({ date, onChange, onRefresh, refreshing = false }) {
  const today = localDateString();
  return (
    <div className="date-toolbar">
      <div><span className="eyebrow">Selected date</span><strong>{date === today ? 'Today' : displayDate(date)}</strong></div>
      <div className="date-actions">
        <button type="button" className="icon-button" onClick={() => onChange(shiftDate(date, -1))} aria-label="Previous date"><ChevronLeft /></button>
        <label className="date-picker"><CalendarDays size={17} /><span className="sr-only">Choose date</span><input type="date" value={date} onChange={(event) => onChange(event.target.value)} /></label>
        <button type="button" className="icon-button" onClick={() => onChange(shiftDate(date, 1))} aria-label="Next date"><ChevronRight /></button>
        <button type="button" className="button button-secondary button-small" onClick={() => onChange(today)} disabled={date === today}>Today</button>
        <button type="button" className="icon-button" onClick={onRefresh} disabled={refreshing} aria-label="Refresh meal data"><RefreshCw className={refreshing ? 'spin' : ''} size={18} /></button>
      </div>
    </div>
  );
}

