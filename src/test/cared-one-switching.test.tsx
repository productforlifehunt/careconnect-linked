import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import CaredOnes from "@/pages/CaredOnes";

const navigate = vi.hoisted(() => vi.fn());
vi.mock("@/lib/router-compat", () => ({
  useSearchParams: () => [new URLSearchParams()],
  useParams: () => ({ personId: "70", card: "family-voice" }),
  useNavigate: () => navigate,
}));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "zh" }, t: (key: string, options?: any) => key === "common.edit" ? "编辑" : typeof options === "string" ? options : options?.defaultValue || key }) }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/contexts/SiteContext", () => ({ useSite: () => ({ caredOneSingular: "被护理者", navLabels: { caredOnes: "被护理者" } }) }));
vi.mock("@/services/wp-auth", () => ({ getStoredWPUser: () => ({ user_id: 1 }) }));
vi.mock("@/hooks/use-care-data", () => ({
  useUserCaredOnes: () => ({ data: [
    { id: "existing-relation-a", user_id: "70", cared_one: { full_name: "应用内名字测试" } },
    { id: "existing-relation-b", user_id: "wp-71", cared_one: { full_name: "QA Bravo" } },
  ], isLoading: false }),
  useCreateUserCaredOne: () => ({}), useDeleteUserCaredOne: () => ({}), useSearchProfiles: () => ({ data: [] }),
}));
vi.mock("@/components/cared-ones/FamilyVoiceCard", () => ({ FamilyVoiceCard: () => null }));
vi.mock("@/components/cared-ones/EmergencyShareSetting", () => ({ EmergencyShareSetting: () => null }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it("switches to QA Bravo's family voice tool without opening a popup", () => {
  render(<CaredOnes />);
  fireEvent.click(screen.getByRole("button", { name: "QA Bravo", exact: true }));
  expect(navigate).toHaveBeenCalledWith("/cared-ones/71/family-voice");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("opens QA Bravo's popup only through Edit without switching the selected person", () => {
  render(<CaredOnes />);
  fireEvent.click(screen.getByRole("button", { name: "QA Bravo — 编辑" }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "QA Bravo" })).toBeInTheDocument();
  expect(navigate).not.toHaveBeenCalled();
});