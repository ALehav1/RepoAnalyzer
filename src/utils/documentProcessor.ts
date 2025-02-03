import { SavedRepo } from '../types';
import { addDocument, removeDocuments, persistDocuments } from './embeddingStore';

export const processRepository = async (repo: SavedRepo) => {
  try {
    console.log('Starting repository processing for:', repo.url);
    
    // First, remove any existing documents for this repo
    console.log('Removing existing documents...');
    removeDocuments(repo.url);

    // Process README
    if (repo.analysis?.readme) {
      console.log('Processing README...');
      await addDocument({
        content: repo.analysis.readme,
        metadata: {
          repoUrl: repo.url,
          type: 'readme'
        }
      });
      console.log('README processed successfully');
    }

    // Process critical analysis
    if (repo.analysis?.criticalAnalysis) {
      console.log('Processing critical analysis...');
      await addDocument({
        content: repo.analysis.criticalAnalysis,
        metadata: {
          repoUrl: repo.url,
          type: 'criticalAnalysis'
        }
      });
      console.log('Critical analysis processed successfully');
    }

    // Process file explanations
    if (repo.fileExplanations && Object.keys(repo.fileExplanations).length > 0) {
      console.log('Processing file explanations...');
      for (const [path, explanation] of Object.entries(repo.fileExplanations)) {
        console.log('Processing explanation for:', path);
        await addDocument({
          content: explanation,
          metadata: {
            repoUrl: repo.url,
            type: 'fileExplanation',
            path
          }
        });
      }
      console.log('File explanations processed successfully');
    }

    // Process chat messages
    if (repo.chatMessages && repo.chatMessages.length > 0) {
      console.log('Processing chat messages...');
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
      console.log('Chat messages processed successfully');
    }

    // Persist to localStorage
    console.log('Persisting documents to localStorage...');
    persistDocuments();
    console.log('Repository processing completed successfully');
  } catch (error) {
    console.error('Error processing repository:', error);
    // Clean up any partial processing
    removeDocuments(repo.url);
    throw new Error(`Failed to process repository: ${error.message}`);
  }
};

export const removeRepository = (repoUrl: string) => {
  removeDocuments(repoUrl);
  persistDocuments();
};
