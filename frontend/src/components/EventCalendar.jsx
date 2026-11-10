import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EventCalendar = ({ events }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Names of months and days
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Helper to get number of days in the month
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

  // Helper to get first day of month index (0: Sunday, 1: Monday, etc.)
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  // Previous month's trailing days
  const prevMonthDays = getDaysInMonth(year, month - 1);

  // Array to hold all cell information
  const calendarCells = [];

  // Trailing days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthDays - i)
    });
  }

  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i)
    });
  }

  // Leading days from next month to fill grid (multiple of 7)
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i)
    });
  }

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Helper to match events with a cell date (ignoring time)
  const getEventsForDate = (cellDate) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === cellDate.getDate() &&
        eventDate.getMonth() === cellDate.getMonth() &&
        eventDate.getFullYear() === cellDate.getFullYear()
      );
    });
  };

  const isToday = (cellDate) => {
    const today = new Date();
    return (
      today.getDate() === cellDate.getDate() &&
      today.getMonth() === cellDate.getMonth() &&
      today.getFullYear() === cellDate.getFullYear()
    );
  };

  return (
    <div className="glass-panel calendar-container">
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="calendar-nav-btn">
          &larr;
        </button>
        <h2 className="calendar-month-title">
          {monthNames[month]} {year}
        </h2>
        <button onClick={handleNextMonth} className="calendar-nav-btn">
          &rarr;
        </button>
      </div>

      <div className="calendar-grid-wrapper">
        <div className="calendar-grid">
          {/* Day headers */}
          {dayNames.map((name) => (
            <div key={name} className="calendar-day-header">
              {name}
            </div>
          ))}

          {/* Cells */}
          {calendarCells.map((cell, idx) => {
            const dateEvents = getEventsForDate(cell.date);
            const cellToday = isToday(cell.date);

            return (
              <div
                key={idx}
                className={`calendar-day-cell ${!cell.isCurrentMonth ? 'outside' : ''} ${
                  cellToday ? 'today' : ''
                }`}
              >
                <div className="calendar-day-num">{cell.day}</div>
                <div className="calendar-cell-events">
                  {dateEvents.map((evt) => (
                    <div
                      key={evt._id}
                      onClick={() => navigate(`/events/${evt._id}`)}
                      className={`calendar-event-dot badge-${evt.category}`}
                      title={evt.title}
                    >
                      {evt.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;
