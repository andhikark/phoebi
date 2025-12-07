// src/router.tsx
import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ChallengeIntroPage } from "./pages/ChallengeIntroPage";
import { DesignPage } from "./pages/DesignPage";
import { SummaryPage } from "./pages/SummaryPage";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <ChallengeIntroPage /> },
      { path: "/design", element: <DesignPage /> },
      { path: "/summary", element: <SummaryPage /> },
    ],
  },
]);
