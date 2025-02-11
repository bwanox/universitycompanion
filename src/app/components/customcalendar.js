import React from "react";
import "../styles/customcalendar.scss"; // Import the SCSS file

// Helper function to format Date objects as YYYY-MM-DD
const formatDate = (date) => {
  const y = date.getFullYear();
  let m = date.getMonth() + 1;
  let d = date.getDate();
  if (m < 10) m = "0" + m;
  if (d < 10) d = "0" + d;
  return `${y}-${m}-${d}`;
};

const CustomCalendar = ({ events, onAddEvent, onDayClick }) => {
  // Use today's date to determine the current month and year
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // current month (0-indexed)

  // Get the month name for display in header
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = monthNames[month];

  // Calculate first day of the month and number of days in the month
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = firstOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

  // Get previous month info to fill the first row (if necessary)
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  // Build an array of cell objects (42 cells for a 6x7 grid)
  const cells = [];
  // Fill in previous month's trailing days:
  for (let i = firstWeekday; i > 0; i--) {
    cells.push({
      date: new Date(year, month - 1, prevMonthLastDay - i + 1),
      currentMonth: false,
    });
  }
  // Fill in current month days:
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({
      date: new Date(year, month, i),
      currentMonth: true,
    });
  }
  // Fill in next month's leading days to complete the grid:
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({
      date: new Date(year, month + 1, i),
      currentMonth: false,
    });
  }

  // Build cell elements with dynamic classes and onClick handler.
  const cellElements = cells.map((cell, index) => {
    const dateStr = formatDate(cell.date);
    // Filter events for this day:
    const eventsForDay = events.filter((ev) => ev.date === dateStr);
    const hasEvent = eventsForDay.length > 0;

    let cellClass = "calendar-table__col";
    if (!cell.currentMonth) {
      cellClass += " calendar-table__inactive";
    }
    if (hasEvent && cell.currentMonth) {
      cellClass += " calendar-table__event";
    }
    // Optionally mark today's date:
    if (dateStr === formatDate(today)) {
      cellClass += " calendar-table__today";
    }

    return (
      <div
        key={index}
        className={cellClass}
        onClick={() => onDayClick(dateStr, eventsForDay)}
      >
        <div className="calendar-table__item">
          <span>{cell.date.getDate()}</span>
        </div>
      </div>
    );
  });

  // Group cells into rows of 7:
  const rows = [];
  for (let i = 0; i < cellElements.length; i += 7) {
    rows.push(
      <div className="calendar-table__row" key={i}>
        {cellElements.slice(i, i + 7)}
      </div>
    );
  }

  return (
    <div className="main-container-wrapper">
      <header>
        <button
          className="header__btn header__btn--left"
          title="Menu"
          onClick={() => console.log("Menu clicked")}
        >
          <svg className="icon" width="20px" viewBox="0 0 20 16" fill="none">
            <path fill="#fff" d="M0 0h20v2H0zM0 7h20v2H0zM0 14h20v2H0z" />
          </svg>
        </button>
        <button
          className="header__btn header__btn--right"
          title="Add event"
          onClick={onAddEvent}
        >
          <svg className="icon" width="26px" viewBox="0 0 512 512" fill="none">
            <path
              fill="#fff"
              d="M416 277.333H277.333V416h-42.666V277.333H96v-42.666h138.667V96h42.666v138.667H416v42.666z"
            />
          </svg>
        </button>
      </header>
      <main>
        <div className="calendar-container">
          <div className="calendar-container__header">
            <button
              className="calendar-container__btn calendar-container__btn--left"
              title="Previous"
              onClick={() => console.log("Previous clicked")}
            >
              <i className="icon ion-ios-arrow-back"></i>
            </button>
            <h2 className="calendar-container__title">
              {monthName} {year}
            </h2>
            <button
              className="calendar-container__btn calendar-container__btn--right"
              title="Next"
              onClick={() => console.log("Next clicked")}
            >
              <i className="icon ion-ios-arrow-forward"></i>
            </button>
          </div>
          <div className="calendar-container__body">
            <div className="calendar-table">
              <div className="calendar-table__header">
                <div className="calendar-table__row">
                  <div className="calendar-table__col">S</div>
                  <div className="calendar-table__col">M</div>
                  <div className="calendar-table__col">T</div>
                  <div className="calendar-table__col">W</div>
                  <div className="calendar-table__col">T</div>
                  <div className="calendar-table__col">F</div>
                  <div className="calendar-table__col">S</div>
                </div>
              </div>
              <div className="calendar-table__body">{rows}</div>
            </div>
          </div>
        </div>
        <div className="events-container">
          <span className="events__title">Upcoming events this month</span>
          <ul className="events__list">
            {events && events.length > 0 ? (
              events.map((event) => (
                <li key={event.id} className="events__item">
                  <div className="events__item--left">
                    <span className="events__name">{event.title}</span>
                    <span className="events__date">{event.date}</span>
                  </div>
                  <span className="events__tag">
                    {event.time ? event.time : "All day"}
                  </span>
                </li>
              ))
            ) : (
              <li className="events__item">No events available.</li>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default CustomCalendar;
