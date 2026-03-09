import React, { useState, useRef, useEffect } from 'react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Aesthetic glassmorphism calendar picker that matches Tourmitra's sunset theme.
 *
 * Props:
 *  - value        : 'YYYY-MM-DD' string or ''
 *  - onChange      : (dateString) => void
 *  - placeholder   : string  (default "Select a date")
 *  - minDate       : Date object — earliest selectable date (default today)
 *  - label         : optional top label text
 *  - compact       : boolean — slightly smaller variant for sidebars
 *  - style         : inline styles on the wrapper
 *  - inputClassName: extra className for the trigger input
 */
const CalendarPicker = ({
  value = '',
  onChange,
  placeholder = 'Select a date',
  minDate,
  label,
  compact = false,
  style = {},
  inputClassName = '',
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const min = minDate || today;

  // Parse the controlled value (guard against non-date strings like "Next Week")
  const parsedValue = (() => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const d = new Date(value + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  })();

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsedValue ? parsedValue.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedValue ? parsedValue.getMonth() : today.getMonth());
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // When value changes externally, sync view
  useEffect(() => {
    if (parsedValue) {
      setViewYear(parsedValue.getFullYear());
      setViewMonth(parsedValue.getMonth());
    }
  }, [value]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const selectDate = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    if (d < min) return;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setOpen(false);
  };

  const isSelected = (day) => {
    if (!parsedValue) return false;
    return parsedValue.getFullYear() === viewYear && parsedValue.getMonth() === viewMonth && parsedValue.getDate() === day;
  };

  const isDisabled = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    return d < min;
  };

  const isToday = (day) => {
    return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
  };

  const canGoPrev = () => {
    const prevDate = new Date(viewYear, viewMonth - 1, 1);
    const minMonth = new Date(min.getFullYear(), min.getMonth(), 1);
    return prevDate >= minMonth;
  };

  // Display text
  const displayText = parsedValue
    ? `${parsedValue.getDate()} ${MONTH_NAMES[parsedValue.getMonth()].slice(0, 3)} ${parsedValue.getFullYear()}`
    : '';

  return (
    <div className="tm-calendar-wrap" ref={ref} style={{ position: 'relative', ...style }}>
      {/* Trigger */}
      <div
        className={`tm-calendar-trigger ${inputClassName} ${compact ? 'compact' : ''} ${open ? 'active' : ''}`}
        onClick={() => setOpen(!open)}
      >
        {label && <div className="tm-calendar-label">{label}</div>}
        <div className="tm-calendar-display">
          {displayText || <span className="tm-calendar-placeholder">{placeholder}</span>}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.5 }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
      </div>

      {/* Dropdown calendar */}
      {open && (
        <div className={`tm-calendar-dropdown ${compact ? 'compact' : ''}`}>
          {/* Header */}
          <div className="tm-calendar-header">
            <button
              className="tm-calendar-nav-btn"
              onClick={prevMonth}
              disabled={!canGoPrev()}
              aria-label="Previous month"
            >
              ‹
            </button>
            <span className="tm-calendar-month-label">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button className="tm-calendar-nav-btn" onClick={nextMonth} aria-label="Next month">
              ›
            </button>
          </div>

          {/* Day labels */}
          <div className="tm-calendar-grid tm-calendar-day-labels">
            {DAY_LABELS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Day cells */}
          <div className="tm-calendar-grid tm-calendar-days">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOfWeek }, (_, i) => (
              <span key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const disabled = isDisabled(day);
              const selected = isSelected(day);
              const todayMark = isToday(day);
              return (
                <button
                  key={day}
                  className={`tm-calendar-day ${selected ? 'selected' : ''} ${todayMark ? 'today' : ''} ${disabled ? 'disabled' : ''}`}
                  onClick={() => !disabled && selectDate(day)}
                  disabled={disabled}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick actions */}
          <div className="tm-calendar-footer">
            <button
              className="tm-calendar-quick-btn"
              onClick={() => { onChange(''); setOpen(false); }}
            >
              Clear
            </button>
            <button
              className="tm-calendar-quick-btn today-btn"
              onClick={() => selectDate(today.getDate()) || (() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); })}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPicker;
