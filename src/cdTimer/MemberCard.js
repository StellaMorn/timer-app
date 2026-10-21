import React, { useState } from "react";
import { getRemainingSeconds, isJustReady, isRunning } from "./cdTimerState";

const formatTime = (timeInSeconds) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

const MemberCard = ({
  member,
  now,
  isDragging,
  onStart,
  onReset,
  onRename,
  onRemove,
  dragProps,
}) => {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(member.name);

  const running = isRunning(member, now);
  const justReady = isJustReady(member, now);
  const remaining = getRemainingSeconds(member, now);
  const progress =
    running && member.duration ? (remaining / member.duration) * 100 : 0;

  const beginEdit = (e) => {
    e.stopPropagation();
    if (running) {
      return;
    }
    setDraftName(member.name);
    setEditing(true);
  };

  const commitEdit = () => {
    onRename(draftName);
    setEditing(false);
  };

  const stateClasses = running
    ? "bg-gray-200 border-gray-300 cursor-default"
    : "bg-green-100 border-green-300 hover:bg-green-200 cursor-pointer";

  return (
    <div
      role="button"
      tabIndex={running ? -1 : 0}
      aria-disabled={running}
      aria-label={`${member.name} ${running ? formatTime(remaining) : "READY"}`}
      data-testid={`member-${member.name}`}
      {...dragProps}
      draggable={!editing}
      onClick={() => !running && !editing && onStart()}
      onKeyDown={(e) => {
        if (!running && !editing && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onStart();
        }
      }}
      className={`relative overflow-hidden w-36 h-32 p-2 rounded-lg border shadow select-none flex flex-col transition-colors ${stateClasses} ${
        justReady ? "cd-just-ready" : ""
      } ${isDragging ? "opacity-40" : ""}`}
    >
      <div className="flex items-start gap-1">
        {editing ? (
          <input
            autoFocus
            value={draftName}
            maxLength={20}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") {
                commitEdit();
              } else if (e.key === "Escape") {
                setEditing(false);
              }
            }}
            className="w-full min-w-0 px-1 text-sm font-semibold rounded border border-gray-300"
          />
        ) : (
          <span
            onClick={beginEdit}
            title={running ? undefined : "クリックで名前を編集"}
            className={`flex-1 min-w-0 truncate text-sm font-semibold ${
              running ? "text-gray-500" : "hover:underline cursor-text"
            }`}
          >
            {member.name}
          </span>
        )}
        {!running && !editing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`「${member.name}」を削除しますか？`)) {
                onRemove();
              }
            }}
            aria-label={`${member.name}を削除`}
            className="leading-none px-1 text-gray-400 hover:text-red-500"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center">
        {running ? (
          <span className="text-3xl font-bold tabular-nums text-gray-600">
            {formatTime(remaining)}
          </span>
        ) : (
          <span
            className={`font-extrabold tracking-wider text-green-600 ${
              justReady ? "text-3xl" : "text-xl"
            }`}
          >
            {justReady ? "UP!" : "READY"}
          </span>
        )}
      </div>

      {running && (
        <div className="flex flex-col gap-1">
          <div className="h-1 w-full bg-gray-300 rounded overflow-hidden">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="py-0.5 text-xs bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded"
          >
            リセット
          </button>
        </div>
      )}
    </div>
  );
};

export default MemberCard;
