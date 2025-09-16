
import React from 'react';
import { createContext } from 'react';
import { Theme } from '../types';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: Theme.Light,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = React.useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === Theme.Dark || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        return Theme.Dark;
    }
    return Theme.Light;
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(Theme.Light, Theme.Dark);
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === Theme.Light ? Theme.Dark : Theme.Light));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
