import { SavedPattern } from '../types';

const STORAGE_KEY = 'github-analyzer-saved-patterns';

export function loadSavedPatterns(): SavedPattern[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error loading saved patterns:', err);
    return [];
  }
}

export function savePattern(pattern: SavedPattern): void {
  try {
    const patterns = loadSavedPatterns();
    patterns.push(pattern);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
  } catch (err) {
    console.error('Error saving pattern:', err);
  }
}

export function deletePattern(id: string): void {
  try {
    const patterns = loadSavedPatterns().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
  } catch (err) {
    console.error('Error deleting pattern:', err);
  }
}