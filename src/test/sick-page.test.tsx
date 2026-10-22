import { render, fireEvent } from "@testing-library/react";
import SickApp from "@/pages/sick/SickApp";

describe("SickApp (/?__site=sick)", () => {
  it("shows one picture and no words at all", () => {
    const { container } = render(<SickApp />);
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAttribute("src", expect.stringContaining("sick-notice.jpg"));
    // "No text" is the whole point: not a single character may render.
    expect(container.textContent).toBe("");
  });

  it("offers no download control and no link out", () => {
    const { container } = render(<SickApp />);
    expect(container.querySelector("a")).toBeNull();
    expect(container.querySelector("button")).toBeNull();
    expect(container.querySelector('[download]')).toBeNull();
    // The picture itself must not be draggable or selectable.
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("draggable", "false");
  });

  it("blocks the right-click save path over the picture", () => {
    const { container } = render(<SickApp />);
    const wrapper = container.querySelector("img")!.parentElement!;
    // fireEvent returns false when the handler called preventDefault.
    expect(fireEvent.contextMenu(wrapper)).toBe(false);
    const overlay = container.querySelector('[aria-hidden="true"]')!;
    expect(fireEvent.contextMenu(overlay)).toBe(false);
  });

  it("does not leak any care-app brand", () => {
    const { container } = render(<SickApp />);
    expect(container.textContent).not.toMatch(/ChallengeD|忆畅|CareCNC|护畅|Notch Safety|诺驰安全/);
  });
});
