import { AnalysisState, FileStructure, SavedRepo } from '../types';

const STORAGE_KEYS = {
  SAVED_REPOS: 'github-analyzer-saved-repos'
} as const;

export function loadSavedRepos(): SavedRepo[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SAVED_REPOS);
    if (!data) return [];

    const repos = JSON.parse(data);
    return repos.map((repo: SavedRepo) => ({
      ...repo,
      fileStructure: repo.fileStructure.map((file: any) => ({
        ...file,
        content: file.content || 'Loading...'
      })),
      fileExplanations: repo.fileExplanations || {},
      chatMessages: repo.chatMessages || []
    }));
  } catch (err) {
    console.error('Error loading saved repos from localStorage:', err);
    return [];
  }
}

export function saveRepo(repo: SavedRepo): void {
  try {
    const savedRepos = loadSavedRepos();
    const existingIndex = savedRepos.findIndex(r => r.url === repo.url);
    
    if (existingIndex !== -1) {
      // Merge with existing data
      const existingRepo = savedRepos[existingIndex];
      savedRepos[existingIndex] = {
        ...existingRepo,
        ...repo,
        fileStructure: repo.fileStructure.map(file => {
          const existingFile = existingRepo.fileStructure.find(f => f.path === file.path);
          return {
            ...file,
            // Keep existing content if we have it and new content is Loading or undefined
            content: (file.content && file.content !== 'Loading...') ? file.content : existingFile?.content || 'Loading...'
          };
        }),
        fileExplanations: {
          ...existingRepo.fileExplanations,
          ...repo.fileExplanations
        }
      };
    } else {
      savedRepos.push({
        ...repo,
        fileStructure: repo.fileStructure.map(file => ({
          ...file,
          content: file.content || 'Loading...'
        }))
      });
    }
    
    localStorage.setItem(STORAGE_KEYS.SAVED_REPOS, JSON.stringify(savedRepos));
  } catch (err) {
    console.error('Error saving repo to localStorage:', err);
  }
}

export function deleteRepo(url: string): void {
  try {
    const savedRepos = loadSavedRepos().filter(repo => repo.url !== url);
    localStorage.setItem(STORAGE_KEYS.SAVED_REPOS, JSON.stringify(savedRepos));
  } catch (err) {
    console.error('Error deleting repo from localStorage:', err);
  }
}

export function exportSavedRepos(): string {
  try {
    const repos = loadSavedRepos();
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      repos
    };
    return JSON.stringify(exportData, null, 2);
  } catch (err) {
    console.error('Error exporting repos:', err);
    throw new Error('Failed to export repositories');
  }
}

export function importSavedRepos(jsonData: string): void {
  try {
    const data = JSON.parse(jsonData);
    if (!data.repos || !Array.isArray(data.repos)) {
      throw new Error('Invalid import data format');
    }
    
    // Merge with existing repos, replacing duplicates
    const existingRepos = loadSavedRepos();
    const mergedRepos = [...existingRepos];
    
    for (const repo of data.repos) {
      const existingIndex = mergedRepos.findIndex(r => r.url === repo.url);
      if (existingIndex !== -1) {
        mergedRepos[existingIndex] = repo;
      } else {
        mergedRepos.push(repo);
      }
    }
    
    localStorage.setItem(STORAGE_KEYS.SAVED_REPOS, JSON.stringify(mergedRepos));
  } catch (err) {
    console.error('Error importing repos:', err);
    throw new Error('Failed to import repositories');
  }
}