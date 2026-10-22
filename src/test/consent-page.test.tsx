import { render, screen, fireEvent } from "@testing-library/react";
import ConsentApp from "@/pages/consent/ConsentApp";

describe("ConsentApp (/?__site=consent)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the study title and institution without care-app branding", () => {
    render(<ConsentApp />);
    expect(screen.getByText(/A Study of Home-Based Care and Caregiver Needs/i)).toBeInTheDocument();
    expect(screen.getAllByText(/杭州师范大学护理学院/).length).toBeGreaterThan(0);
    // No care-app brand may leak onto the consent page.
    expect(screen.queryByText(/ChallengeD/)).not.toBeInTheDocument();
    expect(screen.queryByText(/CareCNC/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Notch Safety/)).not.toBeInTheDocument();
  });

  it("shows the confirmation only after the agree button is tapped", () => {
    render(<ConsentApp />);
    expect(screen.queryByText(/已确认知情同意/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /确认同意/ }));
    expect(screen.getByText(/已确认知情同意/)).toBeInTheDocument();
    // The date label shows a real local date, never a fabricated ethics number.
    expect(screen.getByText(/Date:/)).toHaveTextContent(/\d{4}-\d{2}-\d{2}/);
  });

  it("keeps the consent confirmed after a reload (localStorage marker)", () => {
    window.localStorage.setItem("consent-confirmed:hznu-caregiver-study", "1");
    render(<ConsentApp />);
    expect(screen.getByText(/已确认知情同意/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /确认同意/ })).not.toBeInTheDocument();
  });

  it("does not display an invented ethics approval number or date", () => {
    render(<ConsentApp />);
    expect(screen.queryByText(/伦理审查证明/)).not.toBeInTheDocument();
  });
});
