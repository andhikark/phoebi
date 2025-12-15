// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { DesignProvider } from "./state/DesignContext";
import "./index.css"; // or "./index.css" depending on your setup
import { InputBootstrap } from "./state/InputBootstrap";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <DesignProvider>
      <InputBootstrap />
      <RouterProvider router={router} />
    </DesignProvider>
  </React.StrictMode>
);
