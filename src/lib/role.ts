import { useEffect, useState } from "react";
import type { Role } from "./mock-data";

const KEY = "kafd-demo-role";

export function getRole(): Role {
  if (typeof window === "undefined") return "visitor";
  return (localStorage.getItem(KEY) as Role) || "visitor";
}

export function setRole(r: Role) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, r);
  window.dispatchEvent(new Event("kafd-role-change"));
}

export function useRole(): [Role, (r: Role) => void] {
  const [role, setLocal] = useState<Role>("visitor");
  useEffect(() => {
    setLocal(getRole());
    const h = () => setLocal(getRole());
    window.addEventListener("kafd-role-change", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("kafd-role-change", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return [role, (r) => { setRole(r); setLocal(r); }];
}
