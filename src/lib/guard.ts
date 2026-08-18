import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { readSession } from "./session";

/** Kicks the user back to the games page when there is no valid activation session. */
export function useRequireSession() {
  const navigate = useNavigate();
  useEffect(() => {
    const check = () => {
      if (!readSession()) navigate({ to: "/games" });
    };
    check();
    const t = setInterval(check, 5000);
    return () => clearInterval(t);
  }, [navigate]);
}
