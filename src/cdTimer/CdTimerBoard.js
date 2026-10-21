import React from "react";
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

const ALL_CATEGORY_KEYS = CATEGORIES.map(({ key }) => key);

// The TL/RES/SS category sections. Used full-size in the popup and, for the
// categories the user picked, embedded on the main page.
const CdTimerBoard = ({ categoryKeys = ALL_CATEGORY_KEYS }) => {
  const [state, setState] = useCdTimerState();
  const now = useNow();

  return (
    <div className="w-full max-w-3xl flex flex-col gap-4">
      {CATEGORIES.filter(({ key }) => categoryKeys.includes(key)).map(
        (category) => {
          const { key } = category;
          return (
            <CategorySection
              key={key}
              category={category}
              members={state.members[key]}
              minutes={getCategoryMinutes(state, key)}
              now={now}
              onAdd={() => setState((prev) => addMember(prev, key))}
              onStart={(id) =>
                setState((prev) => startMember(prev, key, id, Date.now()))
              }
              onReset={(id) => setState((prev) => resetMember(prev, key, id))}
              onRename={(id, name) =>
                setState((prev) => renameMember(prev, key, id, name))
              }
              onRemove={(id) =>
                setState((prev) => removeMember(prev, key, id))
              }
              onMove={(fromId, toId) =>
                setState((prev) => moveMember(prev, key, fromId, toId))
              }
              onCustomMinutesChange={(minutes) =>
                setState((prev) => setCustomMinutes(prev, minutes))
              }
            />
          );
        }
      )}
    </div>
  );
};

export default CdTimerBoard;
