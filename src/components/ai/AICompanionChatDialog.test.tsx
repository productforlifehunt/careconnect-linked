import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "en" } }) }));
vi.mock("@/contexts/SiteContext", () => ({ useSite: () => ({ id: "challenged" }) }));
vi.mock("@/components/ai/AIChatWarmup", () => ({ AIChatWarmup: () => null }));
vi.mock("@/components/ai/AICompanionChat", () => ({ AICompanionChat: () => null }));

import { AICompanionChatDialog } from "./AICompanionChatDialog";

afterEach(cleanup);

it("keeps the assistant centered and aligned to the page content width", async () => {
  render(<AICompanionChatDialog open onOpenChange={() => undefined} request={{ id: "layout-check", appGuide: true }} />);

  const dialog = await screen.findByRole("dialog");
  expect(dialog).toHaveClass("fixed", "left-1/2", "top-1/2", "w-[calc(100vw-2rem)]", "max-w-7xl");
});
