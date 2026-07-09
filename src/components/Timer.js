import React, { useState, useEffect, useCallback } from "react";
import useTimer from "../hook/useTimer";
import { useSpeechSynthesis } from "react-speech-kit";

const formatTime = (timeInSeconds) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

const DEFAULT_COLOR_CHANGE_THRESHOLD = 10;
const SPEECH_RATE = 1.5;

const Timer = ({
  duration,
  title,
  nullableColorChangeThreshold,
  reminderSpeech,
  setTimerInstances,
  soundEnabled,
}) => {
  const colorChangeThreshold =
    nullableColorChangeThreshold === null ||
    nullableColorChangeThreshold === undefined
      ? DEFAULT_COLOR_CHANGE_THRESHOLD
      : nullableColorChangeThreshold;

  const [timerColor, setTimerColor] = useState("text-green-500");
  const [thresholdReached, setThresholdReached] = useState(false);
  const { seconds, start, reset, running, stop } = useTimer({
    initialSeconds: duration,
    initiallyRunning: false,
  });
  const { speak, supported: isSpeechSynthesisSupported } = useSpeechSynthesis();

  const isActive = running;

  const timerStart = useCallback(() => {
    start();
    setTimerColor("text-green-500");
  }, [start, setTimerColor]);

  const timerRestart = useCallback(() => {
    reset();
    setThresholdReached(false);
    setTimerColor("text-green-500");
  }, [reset, setThresholdReached, setTimerColor]);

  const timerStop = useCallback(() => {
    stop();
    setTimerColor("text-green-500");
    setThresholdReached(false);
  }, [stop, setThresholdReached, setTimerColor]);

  // useEffect(() => {
  //   setTimerInstances((timerInstances) => ({
  //     ...timerInstances,
  //     [title.toLowerCase()]: {
  //       start: timerStart,
  //       reset: timerRestart,
  //       stop: timerStop,
  //       running: running,
  //     },
  //   }));
  // }, [timerStart, timerRestart, timerStop, running, setTimerInstances, title]);

  useEffect(() => {
    if (isActive && seconds <= colorChangeThreshold) {
      setTimerColor("text-red-500");
    }
  }, [isActive, seconds, colorChangeThreshold]);

  useEffect(() => {
    if (isActive && !thresholdReached && seconds <= colorChangeThreshold) {
      setThresholdReached(true);
      if (soundEnabled && isSpeechSynthesisSupported && reminderSpeech) {
        speak({ text: reminderSpeech, rate: SPEECH_RATE });
      }
    }
  }, [
    isActive,
    seconds,
    colorChangeThreshold,
    reminderSpeech,
    thresholdReached,
    speak,
    isSpeechSynthesisSupported,
    soundEnabled,
  ]);

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className={`text-4xl font-bold ${timerColor}`}>
        {formatTime(seconds)}
      </div>
      <button
        onClick={() => {
          if (isActive) {
            timerRestart();
          } else {
            timerStart();
          }
        }}
        className={`px-4 py-2 ${
          isActive ? "bg-orange-500" : "bg-blue-500"
        } text-white font-semibold rounded`}
      >
        {isActive ? "Restart" : "Start"}
      </button>
      <div className="h-10">
        {isActive && (
          <button
            onClick={timerStop}
            className="px-4 py-2 bg-red-500 text-white font-semibold rounded"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
};

export default Timer;
