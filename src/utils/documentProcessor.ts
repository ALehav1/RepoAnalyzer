import { SavedRepo } from '../types';
import { addDocument, removeDocuments, persistDocuments } from './embeddingStore';

export const processRepository = async (repo: SavedRepo) => {
  // First, remove any existing documents for this repo
  removeDocuments(repo.url);

  // Process README
  if (repo.analysis?.readme) {
    await addDocument({
      content: repo.analysis.readme,
      metadata: {
        repoUrl: repo.url,
        type: 'readme'
      }
    });
  }

  // Process critical analysis
  if (repo.analysis?.criticalAnalysis) {
    await addDocument({
      content: repo.analysis.criticalAnalysis,
      metadata: {
        repoUrl: repo.url,
        type: 'criticalAnalysis'
      }
    });
  }

  // Process file explanations
  for (const [path, explanation] of Object.entries(repo.fileExplanations || {})) {
    await addDocument({
      content: explanation,
      metadata: {
        repoUrl: repo.url,
        type: 'fileExplanation',
        path
      }
    });
  }

  // Process chat messages
  if (repo.chatMessages && repo.chatMessages.length > 0) {
    const chatText = repo.chatMessages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    await addDocument({
      content: chatText,
      metadata: {
        repoUrl: repo.url,
        type: 'chatMessage'
      }
    });
  }

  // Persist to localStorage
  persistDocuments();
};

export const removeRepository = (repoUrl: string) => {
  removeDocuments(repoUrl);
  persistDocuments();
};
