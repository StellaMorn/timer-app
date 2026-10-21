import { render, screen, fireEvent, act } from "@testing-library/react";
import CdTimerApp from "./CdTimerApp";
import {
  STORAGE_KEY,
  addMember,
  createInitialState,
  isJustReady,
  isRunning,
  moveMember,
  nextDefaultName,
  parseState,
  renameMember,
  startMember,
} from "./cdTimerState";

const addButtons = () => screen.getAllByText("＋ メンバーを追加する");

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  jest.useRealTimers();
});

test("default names count up per category", () => {
  expect(nextDefaultName([], "TL")).toBe("TL1");
  expect(
    nextDefaultName([{ name: "TL1" }, { name: "Bishop" }, { name: "TL3" }], "TL")
  ).toBe("TL4");

  let state = createInitialState();
  ["20", "30", "10", "custom"].forEach((key) => {
    state = addMember(state, key);
  });
  expect(
    ["20", "30", "10", "custom"].map((key) => state.members[key][0].name)
  ).toEqual(["TL1", "RES1", "SS1", "CUSTOM1"]);
});

test("startMember uses the category duration and ignores running timers", () => {
  let state = addMember(createInitialState(), "20");
  const { id } = state.members["20"][0];
  state = startMember(state, "20", id, 1000);
  expect(state.members["20"][0].endAt).toBe(1000 + 20 * 60 * 1000);

  const restarted = startMember(state, "20", id, 5000);
  expect(restarted.members["20"][0].endAt).toBe(1000 + 20 * 60 * 1000);

  const member = state.members["20"][0];
  expect(isRunning(member, member.endAt - 1)).toBe(true);
  expect(isJustReady(member, member.endAt)).toBe(true);
});

test("rename ignores blank names and moveMember reorders", () => {
  let state = addMember(addMember(createInitialState(), "10"), "10");
  const [first, second] = state.members["10"];
  state = renameMember(state, "10", first.id, "   ");
  expect(state.members["10"][0].name).toBe("SS1");

  state = moveMember(state, "10", first.id, second.id);
  expect(state.members["10"].map(({ id }) => id)).toEqual([second.id, first.id]);
});

test("parseState falls back to defaults on broken storage", () => {
  expect(parseState("{not json")).toEqual(createInitialState());
});

test("adds members and persists names to localStorage", () => {
  render(<CdTimerApp />);
  fireEvent.click(addButtons()[0]);
  fireEvent.click(addButtons()[0]);

  expect(screen.getByText("TL1")).toBeInTheDocument();
  expect(screen.getByText("TL2")).toBeInTheDocument();

  fireEvent.click(screen.getByText("TL1"));
  const input = screen.getByDisplayValue("TL1");
  fireEvent.change(input, { target: { value: "ビショップ" } });
  fireEvent.keyDown(input, { key: "Enter" });

  expect(screen.getByText("ビショップ")).toBeInTheDocument();
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
  expect(stored.members["20"].map(({ name }) => name)).toEqual([
    "ビショップ",
    "TL2",
  ]);
});

test("click starts the timer, only reset works while running", () => {
  jest.useFakeTimers();
  render(<CdTimerApp />);
  fireEvent.click(addButtons()[2]); // 10分

  const card = screen.getByTestId("member-SS1");
  fireEvent.click(card);
  expect(screen.getByText("10:00")).toBeInTheDocument();

  // Clicking the card or the name again does nothing while running.
  fireEvent.click(card);
  fireEvent.click(screen.getByText("SS1"));
  expect(screen.queryByDisplayValue("SS1")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("SS1を削除")).not.toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(3000);
  });
  expect(screen.getByText("09:57")).toBeInTheDocument();

  fireEvent.click(screen.getByText("リセット"));
  expect(screen.getByText("READY")).toBeInTheDocument();
});

test("shows UP! when the cooldown finishes", () => {
  jest.useFakeTimers();
  render(<CdTimerApp />);
  fireEvent.change(screen.getByLabelText("カスタム時間（分）"), {
    target: { value: "1" },
  });
  fireEvent.blur(screen.getByLabelText("カスタム時間（分）"));
  fireEvent.click(addButtons()[3]);
  fireEvent.click(screen.getByTestId("member-CUSTOM1"));

  act(() => {
    jest.advanceTimersByTime(60 * 1000);
  });
  expect(screen.getByText("UP!")).toBeInTheDocument();
  expect(screen.getByTestId("member-CUSTOM1")).toHaveClass("cd-just-ready");

  act(() => {
    jest.advanceTimersByTime(10 * 1000);
  });
  expect(screen.getByText("READY")).toBeInTheDocument();
});
