// HybridAi/src/context/ThemeContext.tsx

"use client";

import { Theme, ThemeContext } from "./ThemeContext";
import { useState, useEffect, ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    let initialTheme: Theme | null = null;
    if (systemTheme === "dark") {
      initialTheme = "dark";
    } else if (systemTheme === "light") {
      initialTheme = "light";
    } else {
      initialTheme = systemTheme;
    }

    setTheme(initialTheme);
    document.body.classList.toggle("light-theme", initialTheme === "light");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.body.classList.toggle("light-theme", newTheme === "light");
    localStorage.setItem("theme", newTheme);

    const root = document.documentElement;
    if (newTheme === "light") {
      root.classList.add("light-theme");
      root.classList.remove("dark-theme");
    } else {
      root.classList.add("dark-theme");
      root.classList.remove("light-theme");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
