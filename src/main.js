import "./styles/style.css";
import { MAX_SESSIONS, SESSION_LENGTH } from "./consts.js";
const dateEl = document.getElementById("date");
const timeEl = document.getElementById("time");
const sessionCountEl = document.getElementById("count");
const sessionTimerEl = document.getElementById("timer");
const startAlarm = new Audio("/start.mp3");
const pauseAlarm = new Audio("/pause.mp3");
startAlarm.loop = pauseAlarm.loop = false;

let canPlayAudio = false;
startAlarm.addEventListener("canplaythrough", function () {
  canPlayAudio = true;
});

const localStorageKey = "startDateTime";

let doBreak = false;

const padDigit = (num) => (num < 10 ? "0" : "") + num;

function playAudio(alarm) {
  if (canPlayAudio) {
    try {
      alarm.play();
    } catch (error) {
      console.log(error);
    }
  }
}

// store start time in localstorage
function storeStartTime() {
  const now = new Date();
  const startDateTime = {
    time: now.getTime(),
    date: now.toLocaleDateString(),
  };

  const storedStartDateTime = localStorage.getItem(localStorageKey);
  if (storedStartDateTime) {
    const { date } = JSON.parse(storedStartDateTime);

    if (date === startDateTime.date) {
      // same day
      // return;
    }
  }

  localStorage.setItem(localStorageKey, JSON.stringify(startDateTime));
}
function renderSessionCount() {
  if (doBreak) {
    sessionCountEl.textContent = "Break";
    return;
  }
  const storedStartDateTime = localStorage.getItem(localStorageKey);
  if (storedStartDateTime) {
    const { time } = JSON.parse(storedStartDateTime);
    const now = new Date();
    const diff = now.getTime() - time;
    const diffInHours = Math.ceil(diff / 1000 / 60 / 60);
    sessionCountEl.textContent = `${diffInHours}/${MAX_SESSIONS}`;
  }
}
function renderDateTime() {
  const now = new Date();
  dateEl.textContent = `${padDigit(now.getDate())}/${padDigit(
    now.getMonth() + 1
  )}`;
  timeEl.textContent = `${padDigit(now.getHours())}:${padDigit(
    now.getMinutes()
  )}`;
}
function prettyTime(secs) {
  const days = Math.floor(secs / 86400);
  secs %= 86400;
  const hours = Math.floor(secs / 3600);
  secs %= 3600;
  const mins = Math.floor(secs / 60);
  secs %= 60;
  const pretty = `${padDigit(hours)}:${padDigit(mins)}:${padDigit(secs)}`;
  return pretty;
}
function renderSessionTimer() {
  const storedStartDateTime = localStorage.getItem(localStorageKey);
  if (storedStartDateTime) {
    const { time } = JSON.parse(storedStartDateTime);
    const now = new Date();
    const diff = now.getTime() - time;
    const diffInSecs = Math.floor(diff / 1000);
    // in pomodoro or break
    if (diffInSecs % 3600 < SESSION_LENGTH) {
      // still in pomodoro
      // play alarm at the start
      if (diffInSecs % 3600 <= 1) {
        doBreak = false;
        if (diffInSecs >= 3600) {
          // don't play at the very start but from the start of the second hour onwards
          playAudio(startAlarm);
        }
      }
      const remaining = SESSION_LENGTH - (diffInSecs % 3600);
      sessionTimerEl.textContent = prettyTime(remaining);
    } else {
      // in break
      if (!doBreak) {
        playAudio(pauseAlarm);
        doBreak = true;
      }
      const remaining = 10 * 60 + SESSION_LENGTH - (diffInSecs % 3600);
      sessionTimerEl.textContent = prettyTime(remaining);
    }
  }
}

function render() {
  renderDateTime();
  renderSessionCount();
  renderSessionTimer();
}

storeStartTime();
setInterval(render, 1000);