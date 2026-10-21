import React, { useEffect } from "react";
import CdTimerBoard from "./CdTimerBoard";

export const CD_TIMER_TITLE = "TL/RES/SSタイマー";
export const CD_TIMER_VIEW = "cd-timer";
export const CD_TIMER_HINT =
  "カードをクリックでタイマー開始 / 名前クリックで編集 / ドラッグで並べ替え";

export const openCdTimerPopup = () => {
  const url = `${window.location.pathname}?view=${CD_TIMER_VIEW}`;
  window.open(url, "cdTimer", "popup,width=760,height=820");
};

const CdTimerApp = () => {
  useEffect(() => {
    document.title = CD_TIMER_TITLE;
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">{CD_TIMER_TITLE}</h1>
      <CdTimerBoard />
      <p className="mt-6 text-xs text-gray-500">{CD_TIMER_HINT}</p>
    </div>
  );
};

export default CdTimerApp;
