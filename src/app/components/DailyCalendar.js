"use client";
import React from "react";

const DailyCalendar = ({ selectedDate, tasks, selectedHours, onHourClick }) => {
  // Build an array of hours from 0 (midnight) to 23 (11 PM)
  const hours = [];
  for (let h = 0; h < 24; h++) {
    hours.push(h);
  }

  const cellHeight = 64; // Each time slot is 64px high

  // Helper: Convert a Firestore Timestamp to a JS Date.
  // If it's already a Date or a string, convert it accordingly.
  const convertToDate = (time) => {
    if (!time) return null;
    return typeof time.toDate === "function" ? time.toDate() : new Date(time);
  };

  // Filter tasks for the selected date, ensuring that startTime exists.
  const tasksForDay = tasks.filter((task) => {
    const taskStart = convertToDate(task.startTime);
    if (!taskStart) return false;
    return taskStart.toDateString() === selectedDate.toDateString();
  });
  console.log(tasksForDay); // Debugging line to check tasks for the selected date

  // Helper to format hour labels (0 -> 12 AM, 13 -> 1 PM, etc.)
  const formatHourLabel = (hour) => {
    if (hour === 0) return "12 AM";
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return "12 PM";
    return `${hour - 12} PM`;
  };

  // Given a task's startTime (as a Date), compute vertical offset in px
  const getTaskTop = (startTime) => {
    const hr = startTime.getHours();
    return hr * cellHeight;
  };

  return (
    <div className="relative bg-white rounded-lg shadow overflow-hidden">
      {/* Timeline Column */}
      <div className="absolute inset-y-0 left-0 w-20 border-r border-gray-300 bg-gray-50 z-10">
        {hours.map((hour, idx) => (
          <div
            key={idx}
            className="h-16 flex items-center justify-end pr-2 text-sm text-gray-600 border-b border-gray-200"
          >
            {formatHourLabel(hour)}
          </div>
        ))}
      </div>

      {/* Main Calendar Area */}
      <div className="ml-20 relative">
        {/* Background grid lines */}
        {hours.map((_, idx) => (
          <div
            key={idx}
            className="absolute left-0 right-0 border-t border-dashed border-gray-200"
            style={{ top: idx * cellHeight }}
          ></div>
        ))}

        {/* Clickable zones for each hour */}
        {hours.map((hr, idx) => {
          const isSelected = selectedHours.includes(hr);
          return (
            <div
              key={`zone-${idx}`}
              className={`absolute left-0 right-0 cursor-pointer transition-colors ${
                isSelected ? "bg-blue-200" : "hover:bg-blue-50"
              }`}
              style={{ top: idx * cellHeight, height: cellHeight }}
              onClick={() => onHourClick(selectedDate, hr)}
            />
          );
        })}

        {/* Render tasks */}
        {tasksForDay.map((task) => {
          const start = convertToDate(task.startTime);
          const end = convertToDate(task.endTime);
          // If either start or end is null, skip rendering this task.
          if (!start || !end) return null;

          const taskTop = getTaskTop(start);

          // Calculate duration in hours then convert to pixels.
          const durationHours =
            (end.getTime() - start.getTime()) / (60 * 60 * 1000);
          const taskHeight = durationHours * cellHeight;

          return (
            <div
              key={task.id}
              className="absolute left-4 right-4 bg-gradient-to-r from-green-200 to-green-100 p-2 rounded-lg shadow hover:shadow-lg cursor-pointer transition transform hover:scale-105"
              style={{
                top: taskTop + 4,
                height: taskHeight - 8,
              }}
              onClick={() => onHourClick(selectedDate, start.getHours())}
            >
              <p className="font-semibold text-sm text-gray-800 truncate">
                {task.task}
              </p>
              <p className="text-xs text-gray-600">
                {start.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" - "}
                {end.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          );
        })}

        {/* Container height to cover full timeline */}
        <div style={{ height: hours.length * cellHeight }}></div>
      </div>
    </div>
  );
};

export default DailyCalendar;
