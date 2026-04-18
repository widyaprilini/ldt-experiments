import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  const hasState = location.state?.form;
  const hasSession = sessionStorage.getItem("ldt_access");

  if (!hasState || !hasSession) {
    return <Navigate to="/" replace />;
  }

  return children;
}