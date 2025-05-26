// contexts/ThemeContext.tsx
import * as SecureStore from "expo-secure-store";
import React, { createContext, ReactNode, useContext, useState } from "react";

type ThemeContextType = {
  theme: "light" | "dark";
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const MFThemeProvider = ({
  children,
  colorScheme,
}: {
  children: ReactNode;
  colorScheme?: any;
}) => {
  const [theme, setTheme] = useState<"light" | "dark">(colorScheme);
  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    await SecureStore.setItemAsync("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
