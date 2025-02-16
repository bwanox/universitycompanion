"use client";
import { useState, useEffect } from "react";
import styles from "../styles/pomodoroClock.module.scss";

const PomodoroClock = () => {
  const [active, setActive] = useState(false);
  const [type, setType] = useState("Session");
  const [sessionTime, setSessionTime] = useState(1500);
  const [breakTime, setBreakTime] = useState(300);
  const [currentTime, setCurrentTime] = useState(1500);
  const [sessionCount, setSessionCount] = useState(0);
  const startAudio = new Audio("https://media.jpkarlsven.com/audio/codepen/pomodoro-clock/start.mp3");
  const endAudio = new Audio("https://media.jpkarlsven.com/audio/codepen/pomodoro-clock/stop.mp3");

  useEffect(() => {
    let timer;
    if (active) {
      timer = setInterval(() => {
        setCurrentTime((prevTime) => {
          if (prevTime > 0) return prevTime - 1;

          if (type === "Session") {
            setType("Break");
            setCurrentTime(breakTime);
            endAudio.play();
          } else {
            setType("Session");
            setCurrentTime(sessionTime);
            setSessionCount((count) => count + 1);
            startAudio.play();
          }
          return prevTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [active, breakTime, sessionTime, type]);

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const changeTime = (setter, value) => {
    if (!active) {
      setter((prev) => Math.max(60, prev + value));
      setCurrentTime((prev) => (type === "Session" ? sessionTime : breakTime));
    }
  };

  const reset = () => {
    setActive(false);
    setType("Session");
    setSessionTime(1500);
    setBreakTime(300);
    setCurrentTime(1500);
    setSessionCount(0);
  };

  // Progress calculation
  const progress = (currentTime / (type === "Session" ? sessionTime : breakTime)) * 100;

  return (
    <div className={styles.clock}>
      {/* Progress Circle with Dynamic Style */}
      <div
        className={`${styles.progressRadial} ${type === "Session" ? styles.session : styles.break}`}
        style={{
          background: `conic-gradient(#4a90e2 ${progress}%, #333 ${progress}% 100%)`
        }}
      >
        <div className={styles.overlay}>{formatTime(currentTime)}</div>
      </div>

      {/* Session Info */}
      <div className={styles.sessionInfo}>
        <h2>{sessionCount === 0 ? "Pomodoro Clock" : type === "Session" ? `Session ${sessionCount}` : "Break!"}</h2>
      </div>

      {/* Time Settings */}
      <div className={styles.settings}>
        <div className={styles.timeSession}>
          <h6>Session Time</h6>
          <p className={styles.timeDisplay}>{sessionTime / 60} min</p>
          <button onClick={() => changeTime(setSessionTime, -60)}>-</button>
          <button onClick={() => changeTime(setSessionTime, 60)}>+</button>
        </div>
        <div className={styles.timeBreak}>
          <h6>Break Time</h6>
          <p className={styles.timeDisplay}>{breakTime / 60} min</p>
          <button onClick={() => changeTime(setBreakTime, -60)}>-</button>
          <button onClick={() => changeTime(setBreakTime, 60)}>+</button>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button onClick={() => setActive(!active)}>{active ? "Pause" : "Start"}</button>
        <button onClick={reset}>Reset</button>
      </div>
    </div>
  );
};

export default PomodoroClock;
