import {
  createBrowserRouter,
  RouterProvider,
  type RouteObject,
} from "react-router-dom";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AssessmentProvider } from "@/contexts/AssessmentContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { AppShell } from "@/components/layout/AppShell";
import { LandingPage } from "@/pages/LandingPage";
import { SectionHubPage } from "@/pages/SectionHubPage";
import { SpiritualGiftsPage } from "@/pages/SpiritualGiftsPage";
import { SpiritualGiftsResultsPage } from "@/pages/SpiritualGiftsResultsPage";
import { HeartPage } from "@/pages/HeartPage";
import { AbilitiesPage } from "@/pages/AbilitiesPage";
import { AbilitiesResultsPage } from "@/pages/AbilitiesResultsPage";
import { PersonalityPage } from "@/pages/PersonalityPage";
import { PersonalityResultsPage } from "@/pages/PersonalityResultsPage";
import { ExperiencesPage } from "@/pages/ExperiencesPage";
import { FinalResultsPage } from "@/pages/FinalResultsPage";
import { ParticipantInfoPage } from "@/pages/ParticipantInfoPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { CompletedQuestionsPage } from "@/pages/CompletedQuestionsPage";
import { ErrorPage } from "@/ErrorPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

const basename = import.meta.env.BASE_URL;

// Every route gets the friendly error page, so a render error never falls
// through to React Router's developer page.
function withErrorElement(list: RouteObject[]): RouteObject[] {
  return list.map((route) => ({
    ...route,
    errorElement: <ErrorPage />,
    ...(route.children && { children: withErrorElement(route.children) }),
  })) as RouteObject[];
}

export const routes: RouteObject[] = withErrorElement([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "assessment", element: <SectionHubPage /> },
      { path: "assessment/participant", element: <ParticipantInfoPage /> },
      { path: "assessment/spiritual-gifts", element: <SpiritualGiftsPage /> },
      {
        path: "assessment/spiritual-gifts/results",
        element: <SpiritualGiftsResultsPage />,
      },
      { path: "assessment/heart", element: <HeartPage /> },
      { path: "assessment/abilities", element: <AbilitiesPage /> },
      {
        path: "assessment/abilities/results",
        element: <AbilitiesResultsPage />,
      },
      { path: "assessment/personality", element: <PersonalityPage /> },
      {
        path: "assessment/personality/results",
        element: <PersonalityResultsPage />,
      },
      { path: "assessment/experiences", element: <ExperiencesPage /> },
      { path: "assessment/results", element: <FinalResultsPage /> },
      { path: "assessment/review", element: <CompletedQuestionsPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

const router = createBrowserRouter(routes, { basename });

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AssessmentProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </AssessmentProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
