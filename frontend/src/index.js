import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import IdentityForm from "./pages/IdentityForm/identityForm";
import Lextale from "./pages/Lextale/lextale";
import LdtExperiment from "./pages/LdtExperiment/ldtExperiment";
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
        path: "/lextale",
        element: (
          <ProtectedRoute>
            <Lextale />
          </ProtectedRoute>
        )
      },
      {
        path: "/ldt-experiment",
        element: (
          <ProtectedRoute>
            <LdtExperiment />
          </ProtectedRoute>
        )
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);