import { useRef } from "react";

export function useSubmissionId() {
  const idRef = useRef(null);

  if (!idRef.current) {
    idRef.current =
      Math.random().toString(36).slice(2, 6) +
      Date.now().toString().slice(-4);
  }

  return idRef.current;
}