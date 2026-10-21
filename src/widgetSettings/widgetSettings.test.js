import { render, screen, fireEvent, within } from "@testing-library/react";
import App from "../App";
import {
  STORAGE_KEY,
  createInitialSettings,
  getVisibleTimers,
  moveTimer,
  parseSettings,
  setCdCategoryVisible,
  setTimerVisible,
} from "./widgetSettingsState";

jest.mock("../timerConfigs", () => [
  {
    label: "Boss",
    id: 1,
    description: "Boss notes",
    timers: [
      { duration: 60, title: "Teleport" },
      { duration: 240, title: "Jail" },
      { isSeparator: true },
      { duration: 15, title: "First Teleport" },
    ],
  },
]);

const config = {
  id: 1,
  timers: [
    { title: "A" },
    { title: "B" },
    { isSeparator: true },
    { title: "C" },
  ],
};

const titles = (settings) =>
  getVisibleTimers(settings, config).map(({ title }) => title);

const timerOrder = () =>
  screen
    .getAllByTestId(/^timer-/)
    .map((el) => el.getAttribute("data-testid").replace("timer-", ""));

beforeEach(() => {
  localStorage.clear();
});

test("separators are ignored and timers can be hidden", () => {
  let settings = createInitialSettings();
  expect(titles(settings)).toEqual(["A", "B", "C"]);

  settings = setTimerVisible(settings, 1, "B", false);
  expect(titles(settings)).toEqual(["A", "C"]);

  settings = setTimerVisible(settings, 1, "B", true);
  expect(titles(settings)).toEqual(["A", "B", "C"]);
});

test("moveTimer reorders, and unknown timers go last in config order", () => {
  let settings = moveTimer(createInitialSettings(), config, "C", "A");
  expect(titles(settings)).toEqual(["C", "A", "B"]);

  // Hidden timers keep their place in the order.
  settings = setTimerVisible(settings, 1, "A", false);
  settings = moveTimer(settings, config, "B", "C");
  settings = setTimerVisible(settings, 1, "A", true);
  expect(titles(settings)).toEqual(["B", "C", "A"]);

  const withNewTimer = {
    ...config,
    timers: [{ title: "New" }, ...config.timers],
  };
  expect(
    getVisibleTimers(settings, withNewTimer).map(({ title }) => title)
  ).toEqual(["B", "C", "A", "New"]);
});

test("cd categories keep the canonical order", () => {
  let settings = setCdCategoryVisible(createInitialSettings(), "custom", true);
  settings = setCdCategoryVisible(settings, "20", true);
  expect(settings.cdTimerCategories).toEqual(["20", "custom"]);
  settings = setCdCategoryVisible(settings, "custom", false);
  expect(settings.cdTimerCategories).toEqual(["20"]);
});

test("parseSettings drops unknown values", () => {
  expect(parseSettings("broken")).toEqual(createInitialSettings());
  expect(
    parseSettings(
      JSON.stringify({
        configs: { 1: { order: ["B", 1], hiddenTimers: ["A", 3] } },
        cdTimerCategories: ["20", "99"],
      })
    )
  ).toEqual({
    configs: { 1: { order: ["B"], hiddenTimers: ["A"] } },
    cdTimerCategories: ["20"],
  });
});

test("title uses the config name and the description is at the bottom", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { level: 1, name: "Boss Timer" })
  ).toBeInTheDocument();

  const description = screen.getByText("Boss notes");
  const lastTimer = screen.getByTestId("timer-First Teleport");
  expect(
    lastTimer.compareDocumentPosition(description) &
      Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
});

test("timers can be dragged into a new order, which is persisted", () => {
  render(<App />);
  expect(timerOrder()).toEqual(["Teleport", "Jail", "First Teleport"]);

  fireEvent.dragStart(screen.getByTestId("timer-First Teleport"), {
    dataTransfer: { setData: () => {} },
  });
  fireEvent.dragEnter(screen.getByTestId("timer-Teleport"));
  fireEvent.dragEnd(screen.getByTestId("timer-First Teleport"));

  expect(timerOrder()).toEqual(["First Teleport", "Teleport", "Jail"]);
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).configs["1"].order).toEqual(
    ["First Teleport", "Teleport", "Jail"]
  );
});

test("settings panel hides timers and resets", () => {
  render(<App />);
  fireEvent.click(screen.getByText("⚙ 表示設定"));
  const panel = within(screen.getByTestId("widget-settings"));

  fireEvent.click(panel.getByLabelText("Jail"));
  expect(screen.queryByTestId("timer-Jail")).not.toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).configs["1"]).toEqual({
    order: [],
    hiddenTimers: ["Jail"],
  });

  fireEvent.click(panel.getByText("表示と並び順を初期化"));
  expect(timerOrder()).toEqual(["Teleport", "Jail", "First Teleport"]);
});

test("TL/RES/SS categories can be shown on the main page", () => {
  render(<App />);
  expect(screen.queryByText("＋ メンバーを追加する")).not.toBeInTheDocument();

  fireEvent.click(screen.getByText("⚙ 表示設定"));
  const panel = within(screen.getByTestId("widget-settings"));
  fireEvent.click(panel.getByLabelText("RES"));

  expect(screen.getByRole("heading", { name: "RES" })).toBeInTheDocument();
  fireEvent.click(screen.getByText("＋ メンバーを追加する"));
  expect(screen.getByText("RES1")).toBeInTheDocument();
});
