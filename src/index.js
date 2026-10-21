import React from "react";
import ReactDOM from "react-dom";
import "./tailwind.css";
import App from "./App";
import CdTimerApp, { CD_TIMER_VIEW } from "./cdTimer/CdTimerApp";
import reportWebVitals from "./reportWebVitals";

const isCdTimerView =
  new URLSearchParams(window.location.search).get("view") === CD_TIMER_VIEW;

ReactDOM.render(
  <React.StrictMode>
    {isCdTimerView ? <CdTimerApp /> : <App />}
  </React.StrictMode>,
  document.getElementById("root")
);

reportWebVitals();
