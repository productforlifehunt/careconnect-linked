import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MessageResponse } from "./message";

describe("MessageResponse", () => {
  it("loads the rich markdown renderer when message content is displayed", async () => {
    render(<MessageResponse>Care **updates**</MessageResponse>);

    expect(await screen.findByText("updates")).toBeInTheDocument();
  });

  it("loads CJK typography only for CJK message content", async () => {
    render(<MessageResponse>你好，**照护**</MessageResponse>);

    expect(await screen.findByText("照护")).toBeInTheDocument();
  });
});
