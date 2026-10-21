import React from "react";
import { CATEGORIES } from "../cdTimer/cdTimerState";
import { CD_TIMER_TITLE } from "../cdTimer/CdTimerApp";
import {
  getOrderedTimers,
  isTimerVisible,
  resetConfigSettings,
  setCdCategoryVisible,
  setTimerVisible,
} from "./widgetSettingsState";

const Toggle = ({ checked, onChange, children }) => (
  <label
    className={`inline-flex items-center gap-1.5 py-1 px-2 rounded border text-sm select-none cursor-pointer ${
      checked
        ? "border-green-300 bg-green-50 text-gray-800"
        : "border-gray-300 text-gray-400 line-through"
    }`}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="accent-green-600"
    />
    {children}
  </label>
);

const WidgetSettingsPanel = ({ config, settings, setSettings, onClose }) => {
  return (
    <div
      data-testid="widget-settings"
      className="w-full max-w-3xl mb-8 p-4 bg-white shadow rounded-lg"
    >
      <div className="flex items-center mb-3">
        <h2 className="text-lg font-semibold">表示設定</h2>
        <span className="ml-2 text-xs text-gray-400">
          チェックを外すと非表示・タイマーはドラッグで並べ替え（このブラウザに保存）
        </span>
        <button
          onClick={onClose}
          aria-label="表示設定を閉じる"
          className="ml-auto px-2 text-gray-400 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <h3 className="font-semibold text-gray-700">{config.label}</h3>
          <button
            onClick={() =>
              setSettings((prev) => resetConfigSettings(prev, config.id))
            }
            className="ml-auto text-xs text-blue-500 hover:underline"
          >
            表示と並び順を初期化
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {getOrderedTimers(settings, config).map(({ title }) => (
            <Toggle
              key={title}
              checked={isTimerVisible(settings, config.id, title)}
              onChange={(visible) =>
                setSettings((prev) =>
                  setTimerVisible(prev, config.id, title, visible)
                )
              }
            >
              {title}
            </Toggle>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700 mb-2">
          {CD_TIMER_TITLE}をこのページに表示
        </h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ key, label }) => (
            <Toggle
              key={key}
              checked={settings.cdTimerCategories.includes(key)}
              onChange={(visible) =>
                setSettings((prev) => setCdCategoryVisible(prev, key, visible))
              }
            >
              {label}
            </Toggle>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WidgetSettingsPanel;
