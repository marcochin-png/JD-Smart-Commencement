/**
 * Accessibility Utilities for Text Size Control
 */

import { useState, useEffect } from 'react';

const TEXT_SIZE_KEY = 'preferredTextSize';
const TEXT_SIZES = ['sm', 'md', 'lg'] as const;

export type TextSize = typeof TEXT_SIZES[number];

/**
 * Get the saved text size preference from localStorage
 */
export function getSavedTextSize(): TextSize {
  if (typeof window === 'undefined') return 'md';
  
  try {
    const saved = localStorage.getItem(TEXT_SIZE_KEY);
    if (saved && TEXT_SIZES.includes(saved as TextSize)) {
      return saved as TextSize;
    }
  } catch (e) {
    console.error('Error reading text size from localStorage:', e);
  }
  
  return 'md';
}

/**
 * Save text size preference to localStorage
 */
export function saveTextSize(size: TextSize): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(TEXT_SIZE_KEY, size);
  } catch (e) {
    console.error('Error saving text size to localStorage:', e);
  }
}

/**
 * Apply text size class to body element
 */
export function applyTextSize(size: TextSize): void {
  if (typeof document === 'undefined') return;
  
  const body = document.body;
  
  // Remove all text size classes
  TEXT_SIZES.forEach(s => {
    body.classList.remove(`text-size-${s}`);
  });
  
  // Add the selected text size class
  body.classList.add(`text-size-${size}`);
  
  // Update active state on font control buttons
  updateFontControlActiveState(size);
}

/**
 * Update the active state visual on font control buttons
 */
export function updateFontControlActiveState(activeSize: TextSize): void {
  if (typeof document === 'undefined') return;
  
  const buttons = document.querySelectorAll('.font-control');
  
  buttons.forEach(button => {
    const element = button as HTMLElement;
    const size = element.getAttribute('data-size');
    
    if (size === activeSize) {
      element.classList.add('active');
    } else {
      element.classList.remove('active');
    }
  });
}

/**
 * Initialize text size on page load
 */
export function initializeTextSize(): void {
  const savedSize = getSavedTextSize();
  applyTextSize(savedSize);
}

/**
 * Handle font control button click
 */
export function handleFontControlClick(size: TextSize): void {
  saveTextSize(size);
  applyTextSize(size);
}

/**
 * React hook for text size control
 */
export function useTextSize() {
  const [textSize, setTextSizeState] = useState<TextSize>(getSavedTextSize());
  
  const setTextSize = (size: TextSize) => {
    saveTextSize(size);
    applyTextSize(size);
    setTextSizeState(size);
  };
  
  useEffect(() => {
    initializeTextSize();
  }, []);
  
  return { textSize, setTextSize };
}
