import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, expect, it, vi } from "vitest";
import Resources from "./Resources";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "zh" }, t: (key: string) => key }) }));
vi.mock("@/components/challenged/StudyNotesPanel", () => ({ StudyNotesPanel: () => null }));
vi.mock("@/features/shared/current-user", () => ({ getCurrentUserIdNumber: () => 46 }));
vi.mock("@/data/lesson-content-ids", () => ({ LESSON_CONTENT_IDS: {} }));
vi.mock("@/data/isupport-modules", () => {
  const module = { key: "module-one", number: 1, title: "Module", titleZh: "第一模块", description: "", descriptionZh: "", accent: "", icon: () => null, lessons: [{ key: "lesson-one", title: "Lesson", titleZh: "第一课", summary: "", summaryZh: "" }] };
  return { ISUPPORT_MODULES: [module], TOTAL_LESSONS: 1, getModule: (key: string) => key === module.key ? module : null, getNextLesson: () => null, loadLessonContent: vi.fn(async () => ({ ...module.lessons[0], sections: [] })) };
});

afterEach(cleanup);

it("restores the module and lesson selection through back and forward history", async () => {
  const router = createMemoryRouter([{ path: "/resources", Component: Resources }], { initialEntries: ["/resources"] });
  render(<RouterProvider router={router} />);
  fireEvent.click(screen.getByRole("button", { name: /第一模块/ }));
  await waitFor(() => expect(router.state.location.search).toBe("?module=module-one"));
  fireEvent.click(screen.getByRole("button", { name: /第一课/ }));
  await waitFor(() => expect(router.state.location.search).toBe("?module=module-one&lesson=lesson-one"));
  await waitFor(() => expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("第一课"));
  await act(async () => { await router.navigate(-1); });
  await waitFor(() => expect(router.state.location.search).toBe("?module=module-one"));
  await act(async () => { await router.navigate(-1); });
  await waitFor(() => expect(router.state.location.search).toBe(""));
  await act(async () => { await router.navigate(1); });
  await act(async () => { await router.navigate(1); });
  await waitFor(() => expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("第一课"));
});