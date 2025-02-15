"use client";
import React, { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import useRoutine from "../../hooks/useRoutine";
import DailyCalendar from "../../components/DailyCalendar";

const RoutineTracker = () => {
  const { user } = useAuth();
  const { tasks, addTask, toggleComplete, deleteTask } = useRoutine(user);
  const [newTask, setNewTask] = useState("");
  // Instead of a single hour, store an array of selected hours
  const [selectedHours, setSelectedHours] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-800 to-gray-900">
        <p className="text-2xl font-semibold text-white">
          Please log in to access your Routine Tracker.
        </p>
      </div>
    );
  }

  // Navigation: Previous and Next day
  const changeDay = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
    setSelectedHours([]); // clear selection when day changes
  };

  // Toggle selection for a given hour (0 represents midnight)
  const onHourClick = (date, hour) => {
    // Ensure we're working on the same day
    if (date.toDateString() !== selectedDate.toDateString()) {
      setSelectedDate(date);
      setSelectedHours([hour]);
      return;
    }
    if (selectedHours.includes(hour)) {
      // Remove hour from selection
      setSelectedHours(selectedHours.filter((h) => h !== hour));
    } else {
      // Add hour to selection
      setSelectedHours([...selectedHours, hour]);
    }
  };

  // Handle adding a new task using the selected hours.
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim() || selectedHours.length === 0) return;
    // Determine task start and finish from selected hours
    const minHour = Math.min(...selectedHours);
    const maxHour = Math.max(...selectedHours);
    
    // Create a start time and an end time.
    const taskStartTime = new Date(selectedDate);
    taskStartTime.setHours(minHour, 0, 0, 0);
    
    const taskEndTime = new Date(selectedDate);
    // End time is the hour after the maximum selected hour
    taskEndTime.setHours(maxHour + 1, 0, 0, 0);
    
    // Pass startTime and endTime to addTask 
    await addTask(newTask, taskStartTime, taskEndTime);
    setNewTask("");
    setSelectedHours([]);
  };

  // Filter tasks for the selected day based on the startTime property.
  console.log("tasks for day",tasks);
  const tasksForDay = tasks.filter((task) => {
    const taskStart = new Date(task.startTime);
    return taskStart.toDateString() === selectedDate.toDateString();
  });

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-5xl font-extrabold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        Daily Routine Tracker
      </h1>
      {/* Day Navigation */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={() => changeDay(-1)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition"
        >
          &larr; Previous Day
        </button>
        <div className="text-xl font-semibold">
          {selectedDate.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
        <button
          onClick={() => changeDay(1)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition"
        >
          Next Day &rarr;
        </button>
      </div>
      {/* Calendar */}
      <DailyCalendar
        selectedDate={selectedDate}
        tasks={tasks}
        selectedHours={selectedHours}
        onHourClick={onHourClick}
      />
      {/* Add Task Form */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {selectedHours.length > 0
            ? `Add task for ${selectedDate.toLocaleDateString()} from ${Math.min(
                ...selectedHours
              )}:00 to ${Math.max(...selectedHours) + 1}:00`
            : "Click on one or more time slots to select hours for your task"}
        </h2>
        {selectedHours.length > 0 && (
          <form
            onSubmit={handleAddTask}
            className="flex flex-col sm:flex-row gap-4 mb-6"
          >
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter a new task..."
              className="flex-1 p-4 rounded-l-xl border border-gray-300 outline-none shadow-sm focus:ring-2 focus:ring-blue-300"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold rounded-r-xl shadow-md hover:from-green-500 hover:to-blue-600 transition-all duration-300"
            >
              Add Task
            </button>
          </form>
        )}
      </div>
      {/* Task List */}
      <div className="space-y-6">
        {tasksForDay.map((task) => {
          const start = new Date(task.startTime);
          const end = new Date(task.endTime);
          return (
            <div
              key={task.id}
              className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-md border border-gray-200"
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() =>
                    toggleComplete(task.id, task.isCompleted)
                  }
                  className="h-6 w-6 mr-5 accent-green-500"
                />
                <span
                  className={`text-xl font-semibold ${
                    task.isCompleted
                      ? "line-through text-gray-500"
                      : "text-gray-800"
                  }`}
                >
                  {task.task}{" "}
                  <span className="text-sm text-gray-500 ml-2">
                    (
                    {start.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" - "}
                    {end.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    )
                  </span>
                </span>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-all duration-300"
              >
                Delete
              </button>
            </div>
          );
        })}
        {tasksForDay.length === 0 && (
          <p className="text-center text-xl text-gray-400">
            No tasks added yet. Start by adding a new task above.
          </p>
        )}
      </div>
    </div>
  );
};

export default RoutineTracker;
