"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { getCurrentFY } from "./fy";

interface FYContextValue {
  selectedFY: string;
  setSelectedFY: (fy: string) => void;
}

const FYContext = createContext<FYContextValue | null>(null);

export function FYProvider({ children }: { children: ReactNode }) {
  const [selectedFY, setSelectedFY] = useState(getCurrentFY);
  return (
    <FYContext.Provider value={{ selectedFY, setSelectedFY }}>
      {children}
    </FYContext.Provider>
  );
}

export function useFY() {
  const ctx = useContext(FYContext);
  if (!ctx) throw new Error("useFY must be used within FYProvider");
  return ctx;
}
