import React, { useState, useEffect } from "react";
import CategorySection from "./CategorySection";
import useCdTimerState, { useNow } from "./useCdTimerState";
import {
  CATEGORIES,
  addMember,
  getCategoryMinutes,
  moveMember,
  removeMember,
  renameMember,
  resetMember,
  setCustomMinutes,
  startMember,
} from "./cdTimerState";

export const CD_TIMER_TITLE = "TL/RES/SSタイマー";
export const CD_TIMER_VIEW = "cd-timer";

export const openCdTimerPopup = () => {
  const url = `${window.location.pathname}?view=${CD_TIMER_VIEW}`;
  window.open(url, "cdTimer", "popup,width=760,height=820");
};

const CdTimerApp = () => {
  const [state, setState] = useCdTimerState();
  const now = useNow();
  // { categoryKey, id } of the card being dragged, or null.
  const [dragging, setDragging] = useState(null);

  useEffect(() => {
    document.title = CD_TIMER_TITLE;
  }, []);

  const handleDragStart = (categoryKey) => (e, id) => {
    e.dataTransfer.effectAllowed = "move";
    // Firefox only starts a drag when some data is set.
    e.dataTransfer.setData("text/plain", id);
    setDragging({ categoryKey, id });
  };

  // Reorder live while hovering over another card of the same category.
  const handleDragEnter = (categoryKey) => (toIndex) => {
    if (!dragging || dragging.categoryKey !== categoryKey) {
      return;
    }
    setState((prev) => {
      const fromIndex = prev.members[categoryKey].findIndex(
        ({ id }) => id === dragging.id
      );
      return moveMember(prev, categoryKey, fromIndex, toIndex);
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">{CD_TIMER_TITLE}</h1>
      <div className="w-full max-w-3xl flex flex-col gap-4">
        {CATEGORIES.map((category) => {
          const { key } = category;
          return (
            <CategorySection
              key={key}
              category={category}
              members={state.members[key]}
              minutes={getCategoryMinutes(state, key)}
              now={now}
              draggingId={dragging?.categoryKey === key ? dragging.id : null}
              onAdd={() => setState((prev) => addMember(prev, key))}
              onStart={(id) =>
                setState((prev) => startMember(prev, key, id, Date.now()))
              }
              onReset={(id) => setState((prev) => resetMember(prev, key, id))}
              onRename={(id, name) =>
                setState((prev) => renameMember(prev, key, id, name))
              }
              onRemove={(id) => setState((prev) => removeMember(prev, key, id))}
              onCustomMinutesChange={(minutes) =>
                setState((prev) => setCustomMinutes(prev, minutes))
              }
              onDragStart={handleDragStart(key)}
              onDragEnter={handleDragEnter(key)}
              onDragEnd={() => setDragging(null)}
            />
          );
        })}
      </div>
      <p className="mt-6 text-xs text-gray-500">
        カードをクリックでタイマー開始 / 名前クリックで編集 / ドラッグで並べ替え
      </p>
    </div>
  );
};

export default CdTimerApp;
