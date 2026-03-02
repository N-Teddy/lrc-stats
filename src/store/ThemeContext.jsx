import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ACCENTS = {
    CYAN: { name: 'Neon Cyan', color: '#00d2ff', rgb: '0, 210, 255' },
    GREEN: { name: 'Cyber Green', color: '#39ff14', rgb: '57, 255, 20' },
    CRIMSON: { name: 'Industrial Crimson', color: '#ff4d4d', rgb: '255, 77, 77' }
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem('lrc-theme') || 'dark');
    const [accent, setAccent] = useState(() => localStorage.getItem('lrc-accent') || 'CYAN');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('lrc-theme', theme);
    }, [theme]);

    useEffect(() => {
        const accentData = ACCENTS[accent] || ACCENTS.CYAN;
        document.documentElement.style.setProperty('--accent-primary', accentData.color);
        document.documentElement.style.setProperty('--accent-primary-rgb', accentData.rgb);
        localStorage.setItem('lrc-accent', accent);
    }, [accent]);

    const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

    const accentData = ACCENTS[accent] || ACCENTS.CYAN;

    return (
        <ThemeContext.Provider value={{
            theme, toggleTheme,
            accent, setAccent,
            accentColor: accentData.color,
            accentRgb: accentData.rgb
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
