import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService.js';

const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  const [settings, setSettings] = useState(() => storageService.getAccessibilitySettings());

  useEffect(() => {
    // Sync settings to document.body classes for immediate global styling
    const body = document.body;
    body.classList.remove('theme-high-contrast', 'font-standard', 'font-large', 'font-extra-large', 'reduced-motion');

    if (settings.highContrast) {
      body.classList.add('theme-high-contrast');
    }
    body.classList.add(`font-${settings.fontSize}`);

    if (settings.reducedMotion) {
      body.classList.add('reduced-motion');
    }

    storageService.saveAccessibilitySettings(settings);
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
