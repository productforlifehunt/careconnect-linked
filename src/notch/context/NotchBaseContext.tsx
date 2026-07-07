import { createContext, useContext } from "react";

/** Base path where NotchApp is mounted. "" when running as its own site, "/notch" when embedded. */
export const NotchBaseContext = createContext<string>("/notch");

export function useNotchBase() {
  return useContext(NotchBaseContext);
}

/** Build a route path prefixed with the current mount base. */
export function useNotchPath() {
  const base = useNotchBase();
  return (sub: string) => `${base}${sub.startsWith("/") ? sub : "/" + sub}`.replace(/\/+/g, "/") || "/";
}
