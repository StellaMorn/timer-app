import React, { useState } from "react";
import ConfigToggle from "./components/ConfigToggle";
import timerConfigs from "./timerConfigs";
import TimerOrSeparator from "./components/TimerOrSeparator";
import Footer from "./components/Footer";
import { useSpeechRecognition } from "react-speech-kit";

const SOUND_ENABLED_STORAGE_KEY = "soundEnabled";

function App() {
  const [activeConfig, setActiveConfig] = useState(timerConfigs[0]);
  const [timerInstances, setTimerInstances] = useState({});
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const stored = localStorage.getItem(SOUND_ENABLED_STORAGE_KEY);
    return stored === null ? true : stored === "true";
  });

  const handleConfigChange = (config) => {
    setActiveConfig(config);
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(SOUND_ENABLED_STORAGE_KEY, String(next));
      return next;
    });
  };

  const { listen, listening, stop, supported } = useSpeechRecognition({
    onResult: (result) => {
      console.log(result);
      handleVoiceCommands(result);
    },
  });

  const handleVoiceCommands = (command) => {
    const commandArray = command.toLowerCase().split(" ");

    // Get the action (start, stop, restart)
    const action = commandArray[0];

    // Get the timer title
    const timerTitle = commandArray.slice(1).join(" ");
    if (
      action &&
      timerTitle &&
      (action === "start" || action === "stop" || action === "restart")
    ) {
      if (timerInstances[timerTitle]) {
        // Call the corresponding function based on the action
        switch (action) {
          case "start":
            if (!timerInstances[timerTitle]["start"]) {
              break;
            }
            timerInstances[timerTitle]["start"]();
            break;
          case "stop":
            if (!timerInstances[timerTitle]["stop"]) {
              break;
            }
            timerInstances[timerTitle]["stop"]();
            break;
          case "restart":
            if (
              !timerInstances[timerTitle]["restart"] ||
              !timerInstances[timerTitle]["running"]
            ) {
              break;
            }
            timerInstances[timerTitle]["restart"]();
            break;
          default:
            break;
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-4">
      <h1 className="text-4xl font-bold mb-8">Timers</h1>
      {activeConfig.description && activeConfig.description.trim() !== "" && (
        <div
          className="w-2/3 h-36 mb-8 p-4 bg-white shadow rounded-lg overflow-y-auto"
          style={{ lineHeight: "1.5", fontSize: "0.75rem" }}
        >
          <p className="text-gray-500">
            {formatDescription(activeConfig.description)}
          </p>
        </div>
      )}
      <div className="flex items-center gap-4 mb-8">
        <ConfigToggle onConfigChange={handleConfigChange} />
        <button
          onClick={toggleSound}
          aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
          className={`py-1 px-2 rounded border font-medium ${
            soundEnabled
              ? "border-gray-300 text-gray-700"
              : "border-red-300 text-red-500"
          }`}
        >
          {soundEnabled ? "🔊 Sound On" : "🔇 Sound Off"}
        </button>
      </div>
      {/* {supported && (
        <button
          onClick={() => (listening ? stop() : listen())}
          className={`px-4 py-2 ${
            listening ? "bg-red-500" : "bg-blue-500"
          } text-white font-semibold rounded`}
        >
          {listening ? "Stop Listening" : "Start Listening"}
        </button>
      )} */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {activeConfig.timers.map((timer, index) => (
          <TimerOrSeparator
            key={`${activeConfig.id}_${
              timer.title ? timer.title : `separator-${index}`
            }`}
            index={index}
            isSeparator={timer.isSeparator}
            duration={timer.duration}
            title={timer.title}
            colorChangeThreshold={timer.colorChangeThreshold}
            reminderSpeech={timer.reminderSpeech}
            setTimerInstances={setTimerInstances}
            soundEnabled={soundEnabled}
          />
        ))}
      </div>
      <Footer />
    </div>
  );
}

function formatDescription(description) {
  return description.split("\n").map((line, index) => (
    <p key={index} className="mb-1 mt-1">
      {line}
    </p>
  ));
}

export default App;
