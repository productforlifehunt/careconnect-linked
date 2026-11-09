import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ on: false, load: vi.fn() }));
vi.mock("@/features/inspector/recorder", () => ({
  isResearcherAccount: () => true,
  inspectModeOn: () => state.on,
  setInspectMode: (on: boolean) => {
    state.on = on;
  },
}));
vi.mock("@/services/wp-auth", () => ({ getWPToken: () => "test-session" }));
vi.mock("@/features/inspector/notes-cache", () => ({
  inspectorNotesCache: { reset: vi.fn(), load: state.load },
}));
vi.mock("./ReadWriteInspector", () => ({
  default: () => <div>Inspector opened</div>,
}));
import { InspectorGate } from "./InspectorGate";
afterEach(() => {
  cleanup();
  state.on = false;
  vi.clearAllMocks();
});
it("does not load private note catalogue before the researcher opens the inspector", async () => {
  render(<InspectorGate />);
  expect(state.load).not.toHaveBeenCalled();
  const button = screen.getByRole("button", { name: "读写核对 / Inspect" });
  const launcher = button.parentElement!;
  const capture = vi.fn();
  Object.assign(launcher, { setPointerCapture: capture });
  const down = new MouseEvent("pointerdown", {
    bubbles: true,
    button: 0,
    clientX: 820,
    clientY: 70,
  });
  Object.defineProperty(down, "pointerId", { value: 1 });
  fireEvent(launcher, down);
  const up = new MouseEvent("pointerup", {
    bubbles: true,
    button: 0,
    clientX: 820,
    clientY: 70,
  });
  Object.defineProperty(up, "pointerId", { value: 1 });
  fireEvent(launcher, up);
  expect(capture).toHaveBeenCalledOnce();
  fireEvent.click(launcher);
  expect(await screen.findByText("Inspector opened")).toBeInTheDocument();
  expect(state.on).toBe(true);
});

it("lets the closed inspector launcher move without opening the inspector", () => {
  render(<InspectorGate />);
  const button = screen.getByRole("button", { name: "读写核对 / Inspect" });
  const launcher = button.parentElement!;
  const capture = vi.fn();
  Object.assign(launcher, { setPointerCapture: capture });
  launcher.getBoundingClientRect = () =>
    ({
      left: 800,
      top: 50,
      width: 160,
      height: 40,
      right: 960,
      bottom: 90,
      x: 800,
      y: 50,
      toJSON: () => ({}),
    }) as DOMRect;

  const dispatchPointer = (type: string, clientX: number, clientY: number) => {
    const event = new MouseEvent(type, {
      bubbles: true,
      button: 0,
      clientX,
      clientY,
    });
    Object.defineProperty(event, "pointerId", { value: 1 });
    fireEvent(launcher, event);
  };
  dispatchPointer("pointerdown", 820, 70);
  expect(capture).toHaveBeenCalledOnce();
  dispatchPointer("pointermove", 870, 95);
  expect(capture).toHaveBeenCalledOnce();
  dispatchPointer("pointerup", 870, 95);

  expect(launcher).toHaveStyle({ left: "850px", top: "75px" });
  fireEvent.click(launcher);
  expect(screen.queryByText("Inspector opened")).not.toBeInTheDocument();
});

it("opens on the next click after a drag has ended", async () => {
  render(<InspectorGate />);
  const button = screen.getByRole("button", { name: "读写核对 / Inspect" });
  const launcher = button.parentElement!;
  launcher.getBoundingClientRect = () =>
    ({
      left: 800,
      top: 50,
      width: 160,
      height: 40,
      right: 960,
      bottom: 90,
      x: 800,
      y: 50,
      toJSON: () => ({}),
    }) as DOMRect;

  const dispatchPointer = (type: string, clientX: number, clientY: number) => {
    const event = new MouseEvent(type, {
      bubbles: true,
      button: 0,
      clientX,
      clientY,
    });
    Object.defineProperty(event, "pointerId", { value: 1 });
    fireEvent(launcher, event);
  };
  dispatchPointer("pointerdown", 820, 70);
  dispatchPointer("pointermove", 870, 95);
  dispatchPointer("pointerup", 870, 95);
  fireEvent.click(launcher);
  expect(screen.queryByText("Inspector opened")).not.toBeInTheDocument();

  await new Promise((resolve) => window.setTimeout(resolve, 10));
  fireEvent.click(button);
  expect(await screen.findByText("Inspector opened")).toBeInTheDocument();
});
