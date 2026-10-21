import React, { useState, useEffect } from "react";
import MemberCard from "./MemberCard";

const CustomMinutesInput = ({ minutes, onChange }) => {
  const [draft, setDraft] = useState(String(minutes));

  useEffect(() => {
    setDraft(String(minutes));
  }, [minutes]);

  const commit = () => {
    const value = parseInt(draft, 10);
    if (Number.isFinite(value) && value > 0) {
      onChange(value);
      setDraft(String(value));
    } else {
      setDraft(String(minutes));
    }
  };

  return (
    <label className="flex items-center gap-1 text-sm text-gray-600">
      <input
        type="number"
        min={1}
        max={999}
        value={draft}
        aria-label="カスタム時間（分）"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        className="w-16 py-0.5 px-1 rounded border border-gray-300 text-right"
      />
      分
    </label>
  );
};

const CategorySection = ({
  category,
  members,
  minutes,
  now,
  draggingId,
  onAdd,
  onStart,
  onReset,
  onRename,
  onRemove,
  onCustomMinutesChange,
  onDragStart,
  onDragEnter,
  onDragEnd,
}) => {
  const isCustom = category.minutes === null;

  return (
    <section className="w-full p-4 bg-white shadow rounded-lg">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <h2 className="text-lg font-semibold">{category.label}</h2>
        {isCustom && (
          <CustomMinutesInput minutes={minutes} onChange={onCustomMinutesChange} />
        )}
        <button
          onClick={onAdd}
          className="ml-auto px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded"
        >
          ＋ メンバーを追加する
        </button>
      </div>
      {members.length === 0 ? (
        <p className="text-sm text-gray-400">メンバーがいません</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {members.map((member, index) => (
            <MemberCard
              key={member.id}
              member={member}
              now={now}
              isDragging={draggingId === member.id}
              onStart={() => onStart(member.id)}
              onReset={() => onReset(member.id)}
              onRename={(name) => onRename(member.id, name)}
              onRemove={() => onRemove(member.id)}
              onDragStart={(e) => onDragStart(e, member.id)}
              onDragEnter={() => onDragEnter(index)}
              onDragEnd={onDragEnd}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CategorySection;
