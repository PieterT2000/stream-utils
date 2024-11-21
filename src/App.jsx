import React, { useState, useEffect, useRef } from "react";
import "./styles/style.css";

const startAudio = new Audio("/start.mp3");
const pauseAudio = new Audio("/pause.mp3");

const PomodoroTimer = () => {
  const SESSION_LENGTH = 50 * 60;
  const DEFAULT_PAUSE_LENGTH = 10 * 60;
  const CUSTOM_BREAKS = [
    { hour: 12, minute: 30, length: 25 * 60, minSessions: 3 },
    { hour: 17, minute: 30, length: 25 * 60, minSessions: 2 },
  ];

  const [timeLeft, setTimeLeft] = useState(SESSION_LENGTH);
  const [isSession, setIsSession] = useState(true);
  const [customBreakTriggered, setCustomBreakTriggered] = useState({});
  const [sessionCount, setSessionCount] = useState(1);

  const timerRef = useRef(null);
  const [skipCount, setSkipCount] = useState(true);

  useEffect(() => {
    const tick = () => {
      setTimeLeft((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          // Switch between session and break
          if (isSession) {
            setIsSession(false);
            return getBreakLength();
          } else {
            setIsSession(true);
            setSessionCount((prevCount) => prevCount + 1);
            return SESSION_LENGTH;
          }
        }
      });
    };

    timerRef.current = setTimeout(tick, 1000);

    return () => clearTimeout(timerRef.current);
  }, [timeLeft, isSession]);

  useEffect(() => {
    // prevents audio from playing on initial render
    if (skipCount) {
      console.log("skipping");
      setSkipCount(false);
      return;
    }

    if (isSession) {
      playAudio(startAudio);
    } else {
      playAudio(pauseAudio);
    }
  }, [isSession]);

  const playAudio = (audio) => {
    audio.play().catch((error) => console.log(error));
  };

  const getBreakLength = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    let minSessionsCumulative = 0;
    for (const { hour, minute, length, minSessions } of CUSTOM_BREAKS) {
      const isWithinCustomBreakTime =
        currentHour > hour || (currentHour === hour && currentMinute >= minute);
      minSessionsCumulative += minSessions;
      if (
        isWithinCustomBreakTime &&
        !customBreakTriggered[`${hour}:${minute}`] &&
        sessionCount >= minSessionsCumulative
      ) {
        setCustomBreakTriggered((prev) => ({
          ...prev,
          [`${hour}:${minute}`]: true,
        }));
        return length;
      }
    }

    return DEFAULT_PAUSE_LENGTH;
  };

  const formatTime = (secs) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${day}/${month}`;
  };

  const formatCurrentTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <>
      <div className="col-1">
        <div className="wrapper">
          <div className="countHeading font">
            <h1 className="count-prefix">{isSession ? "Session" : "Break"}</h1>
            {isSession && <span id="count">{sessionCount}/-</span>}
          </div>
          <h1 className="font timerHeading color1 shadow">
            <span id="timer">{formatTime(timeLeft)}</span>
          </h1>
        </div>
      </div>
      <div className="col-2">
        <div className="wrapper">
          <h2 className="font dateHeading">
            <span id="time">{formatCurrentTime(new Date())}</span> ~{" "}
            <span id="date">{formatDate(new Date())}</span>
          </h2>
        </div>
      </div>
    </>
  );
};

export function App() {
  return <PomodoroTimer />;
}
