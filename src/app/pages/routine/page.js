"use client";
import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd"; // Draggable & resizable calendar
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
            src: `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&mute=1`,
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
    await addTask(newTask, taskStartTime, taskEndTime);
    setNewTask("");
    setSelectedHours([]);
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

  /*** MINIMIZATION STATES ***/
  const [isSidebarMinimized, setSidebarMinimized] = useState(false);
  const [isCalendarMinimized, setCalendarMinimized] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-2xl font-semibold text-white">
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
          selectedTheme.type === "color" ? selectedTheme.value : "none",
      }}
    >
      {/* Music Theme Navigation Bar (ADDITION) */}
      <div className="absolute top-0 left-0 right-0 z-50 flex justify-evenly p-2">
        {musicThemes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleMusicClick(theme)}
            className={`text-2xl font-semibold tracking-wide transition-colors focus:outline-none ${
              selectedMusicTheme && selectedMusicTheme.id === theme.id
                ? "underline text-green-400"
                : "text-white hover:text-gray-300"
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
        <div className="absolute top-4 left-4 bottom-4 w-72 bg-white bg-opacity-90 p-6 rounded-2xl shadow-2xl z-50 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Themes</h2>
            <button
              onClick={() => setSidebarMinimized(true)}
              className="text-gray-600 hover:text-gray-800 transition-colors"
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
            className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />

          {/* Local Themes Section */}
          <h4 className="text-lg font-semibold text-gray-700 mb-2">Color Themes</h4>
          <div className="flex flex-wrap gap-3 mb-4">
            {localThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme)}
                className="w-16 h-16 border rounded-lg flex items-center justify-center shadow hover:scale-105 transition-transform"
                style={{ background: theme.value }}
                title={theme.name}
              ></button>
            ))}
          </div>

          {/* YouTube Themes Section */}
          <h4 className="text-lg font-semibold text-gray-700 mb-2">YouTube Themes</h4>
          <div className="flex flex-col gap-3 mb-4">
            {youtubeThemes.length > 0 ? (
              youtubeThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className="border border-gray-300 rounded-lg p-3 flex flex-col hover:bg-gray-100 transition"
                >
                  <span className="text-sm font-medium text-gray-800">{theme.name}</span>
                  <a
                    href={theme.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 mt-1 break-all"
                  >
                    {theme.src}
                  </a>
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                {searchTerm ? "No results found" : "Search to load YouTube themes"}
              </p>
            )}
          </div>

          {/* Volume Slider (for non-YouTube videos) */}
          {selectedTheme.type === "video" &&
            !selectedTheme.src.includes("youtube.com") && (
              <div className="mt-4">
                <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-1">
                  Volume
                </label>
                <input
                  type="range"
                  id="volume"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
        </div>
      ) : (
        <button
          onClick={() => setSidebarMinimized(false)}
          className="fixed top-1/2 left-0 transform -translate-y-1/2 z-50 p-3 bg-white rounded-r-full shadow-lg hover:bg-gray-100 transition"
        >
          Themes
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
        >
          <div className="flex justify-between items-center bg-gray-200 p-3 cursor-move rounded-t-lg">
            <span className="font-semibold text-gray-700">Calendar</span>
            <button
              onClick={() => setCalendarMinimized(true)}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              {/* Minimize Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
          </div>
          <div className="h-full overflow-auto bg-white bg-opacity-95 rounded-b-lg shadow-inner">
            <DailyCalendar
              selectedDate={selectedDate}
              tasks={tasks}
              selectedHours={selectedHours}
              onHourClick={onHourClick}
            />
          </div>
        </Rnd>
      ) : (
        <button
          onClick={() => setCalendarMinimized(false)}
          className="fixed bottom-20 right-20 z-50 p-4 bg-gray-200 rounded-full shadow-xl hover:bg-gray-300 transition"
        >
          Calendar
        </button>
      )}

      {/* Stylish Timer in Center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
        <PomodoroClock />
      </div>

      {/* Add Task Form */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 z-10">
        <form
          onSubmit={handleAddTask}
          className="flex items-center bg-white bg-opacity-90 p-3 rounded-full shadow-lg"
        >
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="New task..."
            className="flex-1 p-3 rounded-full outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
          <button
            type="submit"
            className="ml-4 px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition transform hover:scale-105"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoutineTracker;
