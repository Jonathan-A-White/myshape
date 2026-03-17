import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AssessmentProvider } from "@/contexts/AssessmentContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { LandingPage } from "@/pages/LandingPage";

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <ThemeProvider>
        <AssessmentProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AssessmentProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe("LandingPage", () => {
  it("renders welcome message", () => {
    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>,
    );
    expect(screen.getByText("Welcome to MySHAPE")).toBeInTheDocument();
  });

  it("renders start button", () => {
    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>,
    );
    expect(screen.getByText("Start New Assessment")).toBeInTheDocument();
  });
});

describe("Database", () => {
  it("can import database module", async () => {
    const { db } = await import("@/db/database");
    expect(db).toBeDefined();
    expect(db.assessments).toBeDefined();
  });
});
