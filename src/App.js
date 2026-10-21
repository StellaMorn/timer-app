import React, { useState } from "react";
import ConfigToggle from "./components/ConfigToggle";
import timerConfigs from "./timerConfigs";
import TimerOrSeparator from "./components/TimerOrSeparator";
import Footer from "./components/Footer";
import {
  CD_TIMER_HINT,
  CD_TIMER_TITLE,
  openCdTimerPopup,
} from "./cdTimer/CdTimerApp";
import CdTimerBoard from "./cdTimer/CdTimerBoard";
import WidgetSettingsPanel from "./widgetSettings/WidgetSettingsPanel";
import usePersistentState from "./hook/usePersistentState";
import useDragReorder from "./hook/useDragReorder";
import {
  STORAGE_KEY as WIDGET_SETTINGS_STORAGE_KEY,
  getVisibleTimers,
  moveTimer,
  parseSettings,
} from "./widgetSettings/widgetSettingsState";
import { useSpeechRecognition } from "react-speech-kit";

const SOUND_ENABLED_STORAGE_KEY = "soundEnabled";

function App() {
  const [activeConfig, setActiveConfig] = useState(timerConfigs[0]);
  const [timerInstances, setTimerInstances] = useState({});
  const [widgetSettings, setWidgetSettings] = usePersistentState(
    WIDGET_SETTINGS_STORAGE_KEY,
    parseSettings
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const visibleTimers = getVisibleTimers(widgetSettings, activeConfig);
  const { draggingId: draggingTitle, dragProps } = useDragReorder(
    (fromTitle, toTitle) =>
      setWidgetSettings((prev) =>
        moveTimer(prev, activeConfig, fromTitle, toTitle)
      )
  );
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-4 px-4">
      <h1 className="text-4xl font-bold mb-8">{activeConfig.label} Timer</h1>
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
        <button
          onClick={openCdTimerPopup}
          className="py-1 px-2 rounded border border-green-400 text-green-700 font-medium hover:bg-green-50"
        >
          ⏱ {CD_TIMER_TITLE}
        </button>
        <button
          onClick={() => setSettingsOpen((prev) => !prev)}
          aria-expanded={settingsOpen}
          className={`py-1 px-2 rounded border font-medium ${
            settingsOpen
              ? "border-blue-400 bg-blue-50 text-blue-700"
              : "border-gray-300 text-gray-700"
          }`}
        >
          ⚙ 表示設定
        </button>
      </div>
      {settingsOpen && (
        <WidgetSettingsPanel
          config={activeConfig}
          settings={widgetSettings}
          setSettings={setWidgetSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
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
      {visibleTimers.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {visibleTimers.map((timer, index) => (
            <div
              key={`${activeConfig.id}_${timer.title}`}
              data-testid={`timer-${timer.title}`}
              {...dragProps(timer.title)}
              className={`cursor-grab ${
                draggingTitle === timer.title ? "opacity-40" : ""
              }`}
            >
              <TimerOrSeparator
                index={index}
                duration={timer.duration}
                title={timer.title}
                colorChangeThreshold={timer.colorChangeThreshold}
                reminderSpeech={timer.reminderSpeech}
                setTimerInstances={setTimerInstances}
                soundEnabled={soundEnabled}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">
          タイマーはすべて非表示です（⚙ 表示設定から戻せます）
        </p>
      )}
      {widgetSettings.cdTimerCategories.length > 0 && (
        <div className="w-full max-w-3xl mt-10 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4">{CD_TIMER_TITLE}</h2>
          <CdTimerBoard categoryKeys={widgetSettings.cdTimerCategories} />
          <p className="mt-3 text-xs text-gray-500">{CD_TIMER_HINT}</p>
        </div>
      )}
      {activeConfig.description && activeConfig.description.trim() !== "" && (
        <div
          className="w-full max-w-3xl mt-10 p-4 bg-white shadow rounded-lg"
          style={{ lineHeight: "1.5", fontSize: "0.75rem" }}
        >
          <div className="text-gray-500">
            {formatDescription(activeConfig.description)}
          </div>
        </div>
      )}
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
