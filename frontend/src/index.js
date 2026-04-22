import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import IdentityForm from "./pages/IdentityForm/identityForm";
import LdtExperiment from "./pages/LdtExperiment/ldtExperimentNew";
import ProtectedRoute from "./root/protectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <IdentityForm />,
      },
      {
        path: "/ldt-experiment",
        element: (
          <ProtectedRoute>
            <LdtExperiment />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);