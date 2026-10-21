import { useState } from "react";

// Returns a copy of `list` with the item at `fromIndex` moved to `toIndex`.
export const moveItem = (list, fromIndex, toIndex) => {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= list.length ||
    toIndex >= list.length
  ) {
    return list;
  }
  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

// Live drag-and-drop reordering for one list. `dragProps(id)` is spread onto
// each item; while dragging, hovering another item of the same list calls
// `onMove(draggedId, hoveredId)`. Drags from other lists are ignored.
export const useDragReorder = (onMove) => {
  const [draggingId, setDraggingId] = useState(null);

  const dragProps = (id) => ({
    draggable: true,
    onDragStart: (e) => {
      e.dataTransfer.effectAllowed = "move";
      // Firefox only starts a drag when some data is set.
      e.dataTransfer.setData("text/plain", String(id));
      setDraggingId(id);
    },
    onDragEnter: () => {
      if (draggingId !== null && draggingId !== id) {
        onMove(draggingId, id);
      }
    },
    onDragOver: (e) => e.preventDefault(),
    onDrop: (e) => e.preventDefault(),
    onDragEnd: () => setDraggingId(null),
  });

  return { draggingId, dragProps };
};

export default useDragReorder;
