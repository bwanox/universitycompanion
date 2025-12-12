"use client";
import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import { useAuth } from "../../auth/AuthContext";
import useRoutine from "../../hooks/useRoutine";
import DailyCalendar from "../../components/DailyCalendar";
import PomodoroClock from "../../components/pomodoroClock";

const RoutineTracker = () => {
  const { user } = useAuth();
  const { tasks, addTask, toggleComplete, deleteTask } = useRoutine(user);
  const [newTask, setNewTask] = useState("");
  const [selectedHours, setSelectedHours] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskText, setEditTaskText] = useState("");
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictingTasks, setConflictingTasks] = useState([]);

  /*** TIMER STATE & LOGIC ***/
  const [timerType, setTimerType] = useState("Pomodoro");
  const [timerDuration, setTimerDuration] = useState(25 * 60); // in seconds
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
      // Optionally trigger a sound or notification here.
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const handleTimerStartStop = () => {
    setTimerRunning((prev) => !prev);
  };

  const handleTimerReset = () => {
    setTimerRunning(false);
    setTimeLeft(timerDuration);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  /*** THEME SELECTION ***/
  const localThemes = [
    { id: 1, name: "Celestial Aurora", type: "color", value: "#8EC0E4" },
    { id: 2, name: "Enchanted Forest", type: "color", value: "#8ABF88" },
    { id: 3, name: "Mystic Dusk", type: "color", value: "#B09DC3" },
    { id: 4, name: "Serene Solstice", type: "color", value: "#F6D186" },
    { id: 5, name: "Ethereal Mist", type: "color", value: "#E3E8F0" },
  ];

  // Dynamic YouTube themes
  const [youtubeThemes, setYoutubeThemes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!searchTerm) {
      setYoutubeThemes([]);
      return;
    }
    const fetchYoutubeThemes = async () => {
      try {
        // IMPORTANT: Do not expose your API key in production!
        const API_KEY = "AIzaSyDVnQLg8DFdEo3G3bHMjx8XHtYDNYgyTb0";
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
            searchTerm
          )}&key=${API_KEY}&maxResults=10&type=video`
        );
        const data = await response.json();
        const themes = data.items.map((item) => {
          const videoId = item.id.videoId;
          return {
            id: videoId,
            name: item.snippet.title,
            type: "video",
            src: `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}`,
          };
        });
        setYoutubeThemes(themes);
      } catch (error) {
        console.error("Error fetching YouTube videos:", error);
      }
    };
    fetchYoutubeThemes();
  }, [searchTerm]);

  // Set the selected theme (default to the first local color theme)
  const [selectedTheme, setSelectedTheme] = useState(localThemes[0]);

  /*** VOLUME CONTROL FOR VIDEO BACKGROUND ***/
  const [volume, setVolume] = useState(0.5);
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = volume === 0;
    }
  }, [volume, selectedTheme]);

  /*** MUSIC THEME SELECTION (ADDITION) ***/
  const musicThemes = [
    { id: 1, name: "Nature", file: "/assets/nature.wav" },
    { id: 2, name: "Sea", file: "/assets/sea.wav" },
    { id: 3, name: "Rain", file: "/assets/rain.wav" },
    { id: 4, name: "Campfire", file: "/assets/campfire.wav" },
  ];

  // Default to the first music theme
  const [selectedMusicTheme, setSelectedMusicTheme] = useState(musicThemes[0]);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (selectedMusicTheme) {
      const audio = new Audio(selectedMusicTheme.file);
      audio.loop = true;
      audio.play();
      audioRef.current = audio;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [selectedMusicTheme]);

  // When a video (or YouTube) theme starts, stop any playing music.
  useEffect(() => {
    if (selectedTheme.type === "video") {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setSelectedMusicTheme(null);
    }
  }, [selectedTheme]);

  // Click handler: toggle music on/off if the same theme is clicked.
  const handleMusicClick = (theme) => {
    if (selectedMusicTheme && selectedMusicTheme.id === theme.id) {
      // Stop the music if it's already playing.
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setSelectedMusicTheme(null);
    } else {
      setSelectedMusicTheme(theme);
    }
  };

  /*** TASK ADDING FUNCTION ***/
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim() || selectedHours.length === 0) return;
    
    const minHour = Math.min(...selectedHours);
    const maxHour = Math.max(...selectedHours);
    const taskStartTime = new Date(selectedDate);
    taskStartTime.setHours(minHour, 0, 0, 0);
    const taskEndTime = new Date(selectedDate);
    taskEndTime.setHours(maxHour + 1, 0, 0, 0);
    
    // Check for conflicts
    const conflicts = tasks.filter((task) => {
      if (!task.startTime || !task.endTime) return false;
      const taskStart = new Date(task.startTime.seconds ? task.startTime.toDate() : task.startTime);
      const taskEnd = new Date(task.endTime.seconds ? task.endTime.toDate() : task.endTime);
      // Check if task is on the same day
      if (taskStart.toDateString() !== selectedDate.toDateString()) return false;
      // Check if time ranges overlap
      return (
        (taskStartTime >= taskStart && taskStartTime < taskEnd) ||
        (taskEndTime > taskStart && taskEndTime <= taskEnd) ||
        (taskStartTime <= taskStart && taskEndTime >= taskEnd)
      );
    });
    
    if (conflicts.length > 0) {
      setConflictingTasks(conflicts);
      setShowConflictModal(true);
      return;
    }
    
    await addTask(newTask, taskStartTime, taskEndTime);
    setNewTask("");
    setSelectedHours([]);
  };

  const handleReplaceConflictingTasks = async () => {
    // Delete all conflicting tasks
    for (const task of conflictingTasks) {
      await deleteTask(task.id);
    }
    
    // Add the new task
    const minHour = Math.min(...selectedHours);
    const maxHour = Math.max(...selectedHours);
    const taskStartTime = new Date(selectedDate);
    taskStartTime.setHours(minHour, 0, 0, 0);
    const taskEndTime = new Date(selectedDate);
    taskEndTime.setHours(maxHour + 1, 0, 0, 0);
    
    await addTask(newTask, taskStartTime, taskEndTime);
    setNewTask("");
    setSelectedHours([]);
    setShowConflictModal(false);
    setConflictingTasks([]);
  };

  const handleCancelConflict = () => {
    setShowConflictModal(false);
    setConflictingTasks([]);
  };

  /*** TASK FILTERING ***/
  const tasksForDay = tasks.filter((task) => {
    const taskStart = new Date(task.startTime);
    return taskStart.toDateString() === selectedDate.toDateString();
  });

  /*** HANDLE CALENDAR HOUR SELECTION ***/
  const onHourClick = (date, hour) => {
    if (date.toDateString() !== selectedDate.toDateString()) {
      setSelectedDate(date);
      setSelectedHours([hour]);
      return;
    }
    if (selectedHours.includes(hour)) {
      setSelectedHours(selectedHours.filter((h) => h !== hour));
    } else {
      setSelectedHours([...selectedHours, hour]);
    }
  };

  /*** HANDLE TASK CLICK ***/
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = async () => {
    if (selectedTask) {
      await deleteTask(selectedTask.id);
      setShowTaskModal(false);
      setSelectedTask(null);
    }
  };

  const handleStartEdit = () => {
    setEditingTask(selectedTask);
    setEditTaskText(selectedTask.task);
    setShowTaskModal(false);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editTaskText.trim() || !editingTask) return;
    
    // Delete old task and create new one with updated text
    await deleteTask(editingTask.id);
    const startTime = new Date(editingTask.startTime.seconds ? editingTask.startTime.toDate() : editingTask.startTime);
    const endTime = new Date(editingTask.endTime.seconds ? editingTask.endTime.toDate() : editingTask.endTime);
    await addTask(editTaskText, startTime, endTime);
    
    setEditingTask(null);
    setEditTaskText("");
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditTaskText("");
  };

  /*** MINIMIZATION STATES ***/
  const [isSidebarMinimized, setSidebarMinimized] = useState(false);
  const [isCalendarMinimized, setCalendarMinimized] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-teal-950 via-emerald-900 to-lime-950 relative overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-teal-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-lime-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <p className="text-3xl font-black text-white relative z-10 drop-shadow-2xl">
          Please log in to access My Space.
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative h-screen w-full overflow-hidden font-sans transition-all duration-300"
      style={{
        background:
          selectedTheme.type === "color" ? selectedTheme.value : "linear-gradient(to bottom right, #042f2e, #14532d, #365314)",
      }}
    >
      {/* Music Theme Navigation Bar (ADDITION) */}
      <div className="absolute top-0 left-0 right-0 z-50 flex justify-evenly p-2 sm:p-4 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm">
        {musicThemes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleMusicClick(theme)}
            className={`text-sm sm:text-lg lg:text-xl font-black tracking-wide transition-all focus:outline-none transform hover:scale-110 duration-300 px-2 py-1 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl ${
              selectedMusicTheme && selectedMusicTheme.id === theme.id
                ? "bg-gradient-to-r from-lime-400 to-emerald-500 text-white shadow-lg shadow-lime-500/50"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            {theme.name}
          </button>
        ))}
      </div>

      {/* Creative overlay for added depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-transparent to-black opacity-40 pointer-events-none"></div>

      {/* Render video themes if selected */}
      {selectedTheme.type === "video" &&
      selectedTheme.src.includes("youtube.com") ? (
        <iframe
          src={selectedTheme.src}
          title="YouTube video background"
          frameBorder="0"
          allow="autoplay; encrypted-media; fullscreen"
          className="absolute top-0 left-0 w-full h-full object-cover"
        ></iframe>
      ) : selectedTheme.type === "video" ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src={selectedTheme.src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : null}

      {/* Themes Sidebar */}
      {!isSidebarMinimized ? (
        <div className="absolute top-16 sm:top-20 lg:top-4 left-2 right-2 sm:left-4 sm:right-auto bottom-2 sm:bottom-4 w-auto sm:w-72 lg:w-80 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl sm:rounded-3xl p-3 sm:p-4 lg:p-6 shadow-2xl z-50 overflow-y-auto max-h-[calc(100vh-8rem)] sm:max-h-none">
          <div className="flex justify-between items-center mb-3 sm:mb-4 lg:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-400 to-lime-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                <span className="text-lg sm:text-xl">🎨</span>
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-black bg-gradient-to-r from-teal-200 to-lime-200 bg-clip-text text-transparent">Themes</h2>
            </div>
            <button
              onClick={() => setSidebarMinimized(true)}
              className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
            >
              {/* Minimize Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
          </div>
          {/* Search Input for YouTube Themes */}
          <input
            type="text"
            placeholder="Search YouTube themes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 sm:p-3 lg:p-4 text-sm sm:text-base bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-white/50 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 lg:mb-6 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all font-medium"
          />

          {/* Local Themes Section */}
          <h4 className="text-sm sm:text-base lg:text-lg font-black text-white mb-2 sm:mb-3 flex items-center gap-2">
            <span>🎨</span> Color Themes
          </h4>
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
            {localThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme)}
                className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 border-2 border-white/30 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 hover:border-teal-400"
                style={{ background: theme.value }}
                title={theme.name}
              ></button>
            ))}
          </div>

          {/* YouTube Themes Section */}
          <h4 className="text-sm sm:text-base lg:text-lg font-black text-white mb-2 sm:mb-3 flex items-center gap-2">
            <span>🎬</span> YouTube Themes
          </h4>
          <div className="flex flex-col gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
            {youtubeThemes.length > 0 ? (
              youtubeThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 flex flex-col hover:bg-white/20 transition-all duration-300 hover:scale-105 transform"
                >
                  <span className="text-xs sm:text-sm font-bold text-white mb-1">{theme.name}</span>
                  <a
                    href={theme.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] sm:text-xs text-teal-300 hover:text-teal-200 mt-1 break-all"
                  >
                    {theme.src}
                  </a>
                </button>
              ))
            ) : (
              <p className="text-xs sm:text-sm text-white/60 text-center py-3 sm:py-4">
                {searchTerm ? "No results found" : "Search to load YouTube themes"}
              </p>
            )}
          </div>

          {/* Volume Slider (for non-YouTube videos) */}
          {selectedTheme.type === "video" &&
            !selectedTheme.src.includes("youtube.com") && (
              <div className="mt-3 sm:mt-4 lg:mt-6 p-2 sm:p-3 lg:p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl">
                <label htmlFor="volume" className="block text-xs sm:text-sm font-bold text-white mb-2 sm:mb-3 flex items-center gap-2">
                  <span>🔊</span> Volume
                </label>
                <input
                  type="range"
                  id="volume"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-teal-400"
                />
              </div>
            )}
        </div>
      ) : (
        <button
          onClick={() => setSidebarMinimized(false)}
          className="fixed top-20 sm:top-1/2 left-0 transform sm:-translate-y-1/2 z-50 px-3 py-2 sm:px-5 sm:py-3 bg-gradient-to-r from-teal-400 to-emerald-500 text-white text-sm sm:text-base font-black rounded-r-xl sm:rounded-r-2xl shadow-2xl hover:from-teal-500 hover:to-emerald-600 transition-all duration-300 hover:scale-105 hover:shadow-teal-500/50"
        >
          🎨 <span className="hidden sm:inline">Themes</span>
        </button>
      )}

      {/* Draggable & Resizable Calendar */}
      {!isCalendarMinimized ? (
        <Rnd
          default={{ x: window.innerWidth - 380, y: 80, width: 350, height: 600 }}
          minWidth={300}
          minHeight={400}
          bounds="parent"
          style={{ zIndex: 50 }}
          enableResizing={window.innerWidth >= 1024}
          disableDragging={window.innerWidth < 1024}
          className="lg:relative fixed bottom-0 left-0 right-0 lg:bottom-auto lg:left-auto lg:right-auto w-full lg:w-auto"
        >
          <div className="flex justify-between items-center bg-gradient-to-r from-teal-500 to-emerald-500 p-2 sm:p-3 lg:p-4 cursor-move rounded-t-2xl sm:rounded-t-3xl">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl lg:text-2xl">📅</span>
              <span className="font-black text-white text-sm sm:text-base lg:text-lg">Calendar</span>
            </div>
            <button
              onClick={() => setCalendarMinimized(true)}
              className="text-white hover:text-white/70 transition-colors p-1 sm:p-2 hover:bg-white/20 rounded-lg sm:rounded-xl"
            >
              {/* Minimize Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
          </div>
          <div className="h-64 sm:h-80 lg:h-full overflow-auto bg-white/10 backdrop-blur-xl rounded-b-2xl sm:rounded-b-3xl shadow-inner border-x border-b border-white/30">
            <DailyCalendar
              selectedDate={selectedDate}
              tasks={tasks}
              selectedHours={selectedHours}
              onHourClick={onHourClick}
              onTaskClick={handleTaskClick}
            />
          </div>
        </Rnd>
      ) : (
        <button
          onClick={() => setCalendarMinimized(false)}
          className="fixed bottom-20 sm:bottom-24 right-2 sm:right-4 lg:right-8 z-50 px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 bg-gradient-to-r from-teal-400 to-emerald-500 text-white text-sm sm:text-base font-black rounded-xl sm:rounded-2xl shadow-2xl hover:from-teal-500 hover:to-emerald-600 transition-all duration-300 hover:scale-110 hover:shadow-teal-500/50"
        >
          📅 <span className="hidden sm:inline">Calendar</span>
        </button>
      )}

      {/* Stylish Timer in Center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-2 sm:px-4 pt-16 sm:pt-20 lg:pt-0 pb-20 sm:pb-32 lg:pb-0">
        <PomodoroClock />
      </div>

      {/* Add Task Form or Edit Task Form */}
      <div className="absolute bottom-2 sm:bottom-6 left-1/2 transform -translate-x-1/2 w-[calc(100%-1rem)] sm:w-full max-w-md px-2 sm:px-4 z-10">
        {editingTask ? (
          <form
            onSubmit={handleUpdateTask}
            className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white/10 backdrop-blur-xl border border-white/30 p-2 sm:p-3 lg:p-4 rounded-2xl sm:rounded-3xl shadow-2xl gap-2"
          >
            <input
              type="text"
              value={editTaskText}
              onChange={(e) => setEditTaskText(e.target.value)}
              placeholder="Update task..."
              className="flex-1 p-2 sm:p-3 lg:p-4 text-sm sm:text-base bg-white/10 backdrop-blur-sm text-white placeholder-white/50 border border-white/20 rounded-xl sm:rounded-2xl outline-none focus:ring-2 focus:ring-teal-400 transition-all font-medium"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-3 lg:px-6 lg:py-4 text-sm sm:text-base bg-gradient-to-r from-blue-400 to-blue-500 text-white font-black rounded-xl sm:rounded-2xl hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                ✓ <span className="hidden sm:inline">Update</span>
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 sm:flex-none px-4 py-2 sm:px-5 sm:py-3 lg:px-6 lg:py-4 text-sm sm:text-base bg-gradient-to-r from-gray-400 to-gray-500 text-white font-black rounded-xl sm:rounded-2xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                ✕ <span className="hidden sm:inline">Cancel</span>
              </button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleAddTask}
            className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white/10 backdrop-blur-xl border border-white/30 p-2 sm:p-3 lg:p-4 rounded-2xl sm:rounded-3xl shadow-2xl gap-2"
          >
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="New task..."
              className="flex-1 p-2 sm:p-3 lg:p-4 text-sm sm:text-base bg-white/10 backdrop-blur-sm text-white placeholder-white/50 border border-white/20 rounded-xl sm:rounded-2xl outline-none focus:ring-2 focus:ring-teal-400 transition-all font-medium"
            />
            <button
              type="submit"
              className="px-6 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 text-sm sm:text-base bg-gradient-to-r from-lime-400 to-emerald-500 text-white font-black rounded-xl sm:rounded-2xl hover:from-lime-500 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-lime-500/50"
            >
              ➕ Add
            </button>
          </form>
        )}
      </div>

      {/* Task Management Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4" onClick={() => setShowTaskModal(false)}>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-teal-400/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl max-w-md w-full transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <span className="text-xl sm:text-2xl">📋</span>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black bg-gradient-to-r from-teal-200 to-emerald-200 bg-clip-text text-transparent">Manage Task</h3>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-white font-bold text-base sm:text-lg mb-2">{selectedTask.task}</p>
              <p className="text-white/70 text-xs sm:text-sm">
                {new Date(selectedTask.startTime.seconds ? selectedTask.startTime.toDate() : selectedTask.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {" - "}
                {new Date(selectedTask.endTime.seconds ? selectedTask.endTime.toDate() : selectedTask.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleStartEdit}
                className="flex-1 px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-blue-400 to-blue-500 text-white font-black rounded-xl sm:rounded-2xl hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit
              </button>
              <button
                onClick={handleDeleteTask}
                className="flex-1 px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-red-400 to-red-500 text-white font-black rounded-xl sm:rounded-2xl hover:from-red-500 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Delete
              </button>
            </div>
            
            <button
              onClick={() => setShowTaskModal(false)}
              className="mt-3 sm:mt-4 w-full px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl sm:rounded-2xl transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Conflict Warning Modal */}
      {showConflictModal && conflictingTasks.length > 0 && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4" onClick={handleCancelConflict}>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-orange-400/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl max-w-md w-full transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <span className="text-xl sm:text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black bg-gradient-to-r from-orange-200 to-red-200 bg-clip-text text-transparent">Time Slot Conflict</h3>
            </div>
            
            <p className="text-white/90 mb-3 sm:mb-4 text-base sm:text-lg font-semibold">
              This time slot is already occupied by {conflictingTasks.length} task{conflictingTasks.length > 1 ? 's' : ''}:
            </p>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 max-h-40 sm:max-h-48 overflow-y-auto">
              {conflictingTasks.map((task, index) => (
                <div key={task.id} className={`${index > 0 ? 'mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/10' : ''}`}>
                  <p className="text-white font-bold text-sm sm:text-base mb-1">{task.task}</p>
                  <p className="text-white/60 text-xs sm:text-sm">
                    {new Date(task.startTime.seconds ? task.startTime.toDate() : task.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {" - "}
                    {new Date(task.endTime.seconds ? task.endTime.toDate() : task.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-white/70 mb-4 sm:mb-6 text-xs sm:text-sm">
              Do you want to replace the existing task{conflictingTasks.length > 1 ? 's' : ''} with "<strong className="text-white">{newTask}</strong>"?
            </p>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleReplaceConflictingTasks}
                className="flex-1 px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-orange-400 to-red-500 text-white font-black rounded-xl sm:rounded-2xl hover:from-orange-500 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Replace
              </button>
              <button
                onClick={handleCancelConflict}
                className="flex-1 px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-gray-400 to-gray-500 text-white font-black rounded-xl sm:rounded-2xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineTracker;
