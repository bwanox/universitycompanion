"use client";
import React, { useState } from "react";

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
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'list'
  const [isAnimating, setIsAnimating] = useState(false);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Navigation functions
  const goToPreviousMonth = () => {
    setIsAnimating(true);
    setTimeout(() => {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
      setIsAnimating(false);
    }, 150);
  };

  const goToNextMonth = () => {
    setIsAnimating(true);
    setTimeout(() => {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
      setIsAnimating(false);
    }, 150);
  };

  const goToToday = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentMonth(today.getMonth());
      setCurrentYear(today.getFullYear());
      setIsAnimating(false);
    }, 150);
  };

  // Calculate calendar days
  const firstOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstWeekday = firstOfMonth.getDay();
  const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

  // Build calendar cells
  const cells = [];
  
  // Previous month days
  for (let i = firstWeekday; i > 0; i--) {
    cells.push({
      date: new Date(currentYear, currentMonth - 1, prevMonthLastDay - i + 1),
      currentMonth: false,
    });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({
      date: new Date(currentYear, currentMonth, i),
      currentMonth: true,
    });
  }
  
  // Next month days
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({
      date: new Date(currentYear, currentMonth + 1, i),
      currentMonth: false,
    });
  }

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Get events for current month
  const eventsThisMonth = sortedEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
  });

  // Get upcoming events (next 30 days)
  const upcomingEvents = sortedEvents.filter(event => {
    const eventDate = new Date(event.date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return eventDate >= today && eventDate <= thirtyDaysFromNow;
  }).slice(0, 5);

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-0 mb-4 lg:mb-6">
        <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
          <h3 className="text-lg lg:text-2xl font-black text-white truncate">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={goToToday}
            className="px-3 lg:px-4 py-1.5 lg:py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg lg:rounded-xl text-xs lg:text-sm font-bold text-white transition-all duration-300 hover:scale-105 flex-shrink-0"
          >
            Today
          </button>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar">
          {/* View Mode Toggle */}
          <div className="flex gap-1 lg:gap-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg lg:rounded-xl p-0.5 lg:p-1 flex-shrink-0">
            <button
              onClick={() => setViewMode('month')}
              className={`px-2 lg:px-4 py-1.5 lg:py-2 rounded-md lg:rounded-lg text-xs lg:text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                viewMode === 'month'
                  ? 'bg-gradient-to-r from-purple-400 to-violet-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span className="hidden sm:inline">📅 Month</span>
              <span className="sm:hidden">📅</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 lg:px-4 py-1.5 lg:py-2 rounded-md lg:rounded-lg text-xs lg:text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-purple-400 to-violet-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span className="hidden sm:inline">📋 List</span>
              <span className="sm:hidden">📋</span>
            </button>
          </div>

          {/* Navigation */}
          <div className="flex gap-1 lg:gap-2 flex-shrink-0">
            <button
              onClick={goToPreviousMonth}
              className="w-8 h-8 lg:w-10 lg:h-10 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg lg:rounded-xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
            >
              <svg className="w-4 h-4 lg:w-5 lg:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button
              onClick={goToNextMonth}
              className="w-8 h-8 lg:w-10 lg:h-10 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg lg:rounded-xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
            >
              <svg className="w-4 h-4 lg:w-5 lg:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl lg:rounded-2xl p-2 lg:p-4 overflow-hidden">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 lg:gap-2 mb-1 lg:mb-2">
                {dayNames.map((day, index) => (
                  <div
                    key={index}
                    className="text-center py-2 lg:py-3 text-xs lg:text-sm font-black text-purple-300"
                  >
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.substring(0, 1)}</span>
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className={`grid grid-cols-7 gap-1 lg:gap-2 transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                {cells.map((cell, index) => {
                  const dateStr = formatDate(cell.date);
                  const eventsForDay = events.filter((ev) => ev.date === dateStr);
                  const hasEvent = eventsForDay.length > 0;
                  const isToday = dateStr === formatDate(today);
                  const isPast = cell.date < today && dateStr !== formatDate(today);

                  return (
                    <button
                      key={index}
                      onClick={() => onDayClick(dateStr, eventsForDay)}
                      disabled={!cell.currentMonth}
                      className={`
                        relative aspect-square p-1 lg:p-2 rounded-lg lg:rounded-xl text-center transition-all duration-300 group
                        ${!cell.currentMonth 
                          ? 'text-white/20 cursor-default' 
                          : isPast
                          ? 'text-white/40 hover:bg-white/5 hover:text-white/60'
                          : 'text-white hover:bg-white/15 hover:scale-105 lg:hover:scale-110 cursor-pointer'
                        }
                        ${isToday && cell.currentMonth
                          ? 'bg-gradient-to-br from-purple-400 to-violet-500 text-white font-black shadow-lg lg:shadow-xl ring-2 lg:ring-4 ring-purple-300/50 animate-pulse-slow'
                          : hasEvent && cell.currentMonth
                          ? 'bg-gradient-to-br from-fuchsia-500/40 to-violet-500/40 border border-fuchsia-400/50 lg:border-2 font-bold shadow-md lg:shadow-lg shadow-fuchsia-500/20'
                          : 'bg-white/5 hover:shadow-lg lg:hover:shadow-xl hover:shadow-purple-500/20'
                        }
                      `}
                      style={{ 
                        animationDelay: `${index * 10}ms`,
                        animation: !isAnimating && cell.currentMonth ? 'fadeInScale 0.3s ease-out forwards' : 'none'
                      }}
                    >
                      <div className="text-sm lg:text-lg font-bold group-hover:scale-110 lg:group-hover:scale-125 transition-transform duration-300">{cell.date.getDate()}</div>
                      {hasEvent && cell.currentMonth && (
                        <>
                          <div className="absolute bottom-0.5 lg:bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5 lg:gap-1">
                            {eventsForDay.slice(0, 3).map((_, i) => (
                              <div
                                key={i}
                                className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-fuchsia-300 animate-pulse shadow-sm lg:shadow-lg shadow-fuchsia-500/50"
                                style={{ animationDelay: `${i * 200}ms` }}
                              />
                            ))}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-400/0 via-fuchsia-400/20 to-violet-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg lg:rounded-xl pointer-events-none"></div>
                        </>
                      )}
                      {eventsForDay.length > 3 && cell.currentMonth && (
                        <div className="absolute top-0.5 lg:top-1 right-0.5 lg:right-1 text-[10px] lg:text-xs font-black text-fuchsia-200 bg-fuchsia-500/50 px-1 lg:px-1.5 py-0.5 rounded-full animate-bounce-slow">
                          +{eventsForDay.length - 3}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 lg:gap-4 mt-3 lg:mt-4">
              <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 backdrop-blur-sm border border-purple-400/30 rounded-xl lg:rounded-2xl p-3 lg:p-4 text-center">
                <div className="text-2xl lg:text-3xl font-black text-white">{eventsThisMonth.length}</div>
                <div className="text-xs lg:text-sm text-purple-200 font-semibold mt-0.5 lg:mt-1">This Month</div>
              </div>
              <div className="bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 backdrop-blur-sm border border-fuchsia-400/30 rounded-xl lg:rounded-2xl p-3 lg:p-4 text-center">
                <div className="text-2xl lg:text-3xl font-black text-white">{upcomingEvents.length}</div>
                <div className="text-xs lg:text-sm text-fuchsia-200 font-semibold mt-0.5 lg:mt-1">Upcoming</div>
              </div>
              <div className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 backdrop-blur-sm border border-violet-400/30 rounded-xl lg:rounded-2xl p-3 lg:p-4 text-center">
                <div className="text-2xl lg:text-3xl font-black text-white">{events.length}</div>
                <div className="text-xs lg:text-sm text-violet-200 font-semibold mt-0.5 lg:mt-1">Total</div>
              </div>
            </div>
          </div>

          {/* Upcoming Events Sidebar */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl lg:rounded-2xl p-4 lg:p-5 h-fit max-h-[400px] lg:max-h-[600px] overflow-y-auto">
            <h4 className="text-base lg:text-lg font-black text-white mb-3 lg:mb-4 flex items-center gap-2">
              <span className="text-xl lg:text-2xl">⏰</span>
              <span className="truncate">Upcoming Assignments</span>
            </h4>
            
            {upcomingEvents.length > 0 ? (
              <div className="space-y-2 lg:space-y-3">
                {upcomingEvents.map((event, index) => {
                  const eventDate = new Date(event.date);
                  const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysUntil <= 3;
                  const isThisWeek = daysUntil <= 7;
                  
                  return (
                    <div
                      key={event.id}
                      className={`p-3 lg:p-4 rounded-lg lg:rounded-xl border transition-all duration-300 hover:scale-105 cursor-pointer ${
                        isUrgent
                          ? 'bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-400/40 hover:border-red-400/60'
                          : isThisWeek
                          ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-orange-400/40 hover:border-orange-400/60'
                          : 'bg-gradient-to-br from-purple-500/20 to-violet-500/20 border-purple-400/40 hover:border-purple-400/60'
                      }`}
                      onClick={() => onDayClick(event.date, [event])}
                    >
                      <div className="flex items-start justify-between mb-1.5 lg:mb-2">
                        <span className={`text-[10px] lg:text-xs font-black px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-md lg:rounded-lg ${
                          isUrgent
                            ? 'bg-red-500/30 text-red-200'
                            : isThisWeek
                            ? 'bg-orange-500/30 text-orange-200'
                            : 'bg-purple-500/30 text-purple-200'
                        }`}>
                          {daysUntil === 0 ? 'TODAY' : daysUntil === 1 ? 'TOMORROW' : `${daysUntil} DAYS`}
                        </span>
                        <span className="text-[10px] lg:text-xs text-white/60 font-semibold">
                          {eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs lg:text-sm font-bold text-white line-clamp-2">{event.title}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 lg:py-12">
                <div className="text-4xl lg:text-5xl mb-2 lg:mb-3 opacity-50">🎉</div>
                <p className="text-white/60 text-xs lg:text-sm font-semibold">No upcoming assignments</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // List View
        <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <h4 className="text-lg lg:text-xl font-black text-white mb-4 lg:mb-6 flex items-center gap-2">
            <span className="text-xl lg:text-2xl">📋</span>
            <span className="truncate">All Assignments for {monthNames[currentMonth]} {currentYear}</span>
          </h4>
          
          {eventsThisMonth.length > 0 ? (
            <div className="space-y-2 lg:space-y-3">
              {eventsThisMonth.map((event) => {
                const eventDate = new Date(event.date);
                const isPast = eventDate < today;
                const isToday = formatDate(eventDate) === formatDate(today);
                
                return (
                  <div
                    key={event.id}
                    className={`p-4 lg:p-5 rounded-xl lg:rounded-2xl border transition-all duration-300 hover:scale-102 cursor-pointer ${
                      isPast
                        ? 'bg-white/5 border-white/20 opacity-50'
                        : isToday
                        ? 'bg-gradient-to-br from-purple-500/30 to-violet-500/30 border-purple-400/50'
                        : 'bg-gradient-to-br from-purple-500/20 to-violet-500/20 border-purple-400/40 hover:border-purple-400/60'
                    }`}
                    onClick={() => onDayClick(event.date, [event])}
                  >
                    <div className="flex items-start gap-3 justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-base lg:text-lg font-bold text-white mb-1 truncate">{event.title}</p>
                        <p className="text-xs lg:text-sm text-white/70 font-semibold truncate">
                          {eventDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {isToday && (
                          <span className="px-2 lg:px-3 py-0.5 lg:py-1 bg-purple-500/40 border border-purple-400/50 rounded-full text-[10px] lg:text-xs font-black text-purple-200">
                            TODAY
                          </span>
                        )}
                        {isPast && (
                          <span className="px-2 lg:px-3 py-0.5 lg:py-1 bg-white/10 border border-white/20 rounded-full text-[10px] lg:text-xs font-black text-white/50">
                            PAST
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 lg:py-20">
              <div className="text-5xl lg:text-6xl mb-3 lg:mb-4 opacity-50">📭</div>
              <p className="text-white/60 text-base lg:text-lg font-semibold">No assignments this month</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomCalendar;
