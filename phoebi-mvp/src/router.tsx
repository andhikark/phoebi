// src/router.tsx
import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ChallengeIntroPage } from "./pages/ChallengeIntroPage";
import { DesignPage } from "./pages/DesignPage";
import { SummaryPage } from "./pages/SummaryPage";
import { CreativeChallengePage } from "./pages/CreativeChallengePage";
import { MaterialChallengePage } from "./pages/MaterialChallengePage";
import { StoryChallengePage } from "./pages/StoryChallengePage";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <ChallengeIntroPage /> },
      { path: "/design", element: <DesignPage /> },
      { path: "/summary", element: <SummaryPage /> },
      { path: "/creative", element: <CreativeChallengePage/>},
      { path: "/material", element: <MaterialChallengePage/>},
      { path: "/story", element: <StoryChallengePage/>},
    ],
  },
]);
