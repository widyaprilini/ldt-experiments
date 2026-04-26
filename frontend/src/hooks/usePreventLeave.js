import { useBlocker, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export function usePreventLeave(when) {
  const blocker = useBlocker(when);
  const navigate = useNavigate();

  useEffect(() => {
    if (blocker.state === "blocked") {
      const confirmLeave = window.confirm(
        "Are you sure you want to leave the experiment?"
      );      

      if (confirmLeave) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker, navigate]);

  useEffect(() => {
    if (!when) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [when]);
}