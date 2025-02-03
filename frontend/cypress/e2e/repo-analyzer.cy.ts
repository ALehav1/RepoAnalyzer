describe('RepoAnalyzer E2E Tests', () => {
  beforeEach(() => {
    cy.intercept('GET', '/repos', { fixture: 'repositories.json' }).as('getRepos');
    cy.intercept('POST', '/repos/analyze', { fixture: 'analyze-response.json' }).as('analyzeRepo');
    cy.visit('/');
  });

  describe('Homepage', () => {
    it('should analyze a repository', () => {
      cy.get('input[placeholder*="GitHub URL"]')
        .type('https://github.com/facebook/react');
      cy.get('button').contains('Analyze').click();
      cy.wait('@analyzeRepo');
      cy.url().should('include', '/repo/');
    });

    it('should handle bulk upload', () => {
      cy.get('button').contains('Bulk Upload').click();
      cy.get('input[type="file"]').attachFile('repos.csv');
      cy.get('button').contains('Upload').click();
      cy.get('.mantine-Alert-message').should('contain', 'Successfully uploaded');
    });
  });

  describe('Saved Repositories', () => {
    beforeEach(() => {
      cy.visit('/saved-repos');
      cy.wait('@getRepos');
    });

    it('should display repository list', () => {
      cy.get('[data-testid="repo-card"]').should('have.length.at.least', 1);
    });

    it('should filter repositories', () => {
      cy.get('input[placeholder*="Search"]').type('react');
      cy.get('[data-testid="repo-card"]').should('have.length', 1);
    });

    it('should sort repositories', () => {
      cy.get('select').select('stars');
      cy.get('[data-testid="repo-card"]').first().should('contain', 'react');
    });
  });

  describe('Repository Detail', () => {
    beforeEach(() => {
      cy.intercept('GET', '/repos/*', { fixture: 'repository.json' });
      cy.intercept('GET', '/repos/*/metrics', { fixture: 'metrics.json' });
      cy.intercept('GET', '/repos/*/files', { fixture: 'files.json' });
      cy.visit('/repo/1');
    });

    it('should display repository metrics', () => {
      cy.get('[data-testid="code-quality"]').should('exist');
      cy.get('[data-testid="language-dist"]').should('exist');
    });

    it('should navigate through tabs', () => {
      cy.get('button').contains('Files').click();
      cy.get('[data-testid="file-explorer"]').should('be.visible');
      
      cy.get('button').contains('Analysis').click();
      cy.get('[data-testid="analysis-charts"]').should('be.visible');
      
      cy.get('button').contains('Patterns').click();
      cy.get('[data-testid="design-patterns"]').should('be.visible');
    });

    it('should interact with file explorer', () => {
      cy.get('button').contains('Files').click();
      cy.get('[data-testid="file-explorer"]').contains('src').click();
      cy.get('[data-testid="file-explorer"]').contains('index.js').click();
      cy.get('[data-testid="code-viewer"]').should('be.visible');
    });
  });

  describe('Best Practices', () => {
    beforeEach(() => {
      cy.visit('/best-practices');
    });

    it('should display patterns', () => {
      cy.get('[data-testid="pattern-card"]').should('have.length.at.least', 1);
    });

    it('should filter patterns', () => {
      cy.get('input[placeholder*="Search"]').type('Factory');
      cy.get('[data-testid="pattern-card"]').should('have.length', 1);
      cy.get('[data-testid="pattern-card"]').should('contain', 'Factory Pattern');
    });

    it('should show pattern details', () => {
      cy.get('[data-testid="pattern-card"]').first().click();
      cy.get('[data-testid="pattern-details"]').should('be.visible');
      cy.get('[data-testid="implementation"]').should('be.visible');
    });
  });

  describe('Chat Interface', () => {
    beforeEach(() => {
      cy.intercept('POST', '/repos/*/chat', { fixture: 'chat-response.json' });
      cy.visit('/repo/1');
      cy.get('button').contains('Chat').click();
    });

    it('should send and receive messages', () => {
      cy.get('input[placeholder*="Ask"]').type('How can I improve this code?{enter}');
      cy.get('[data-testid="chat-message"]').should('have.length', 2);
      cy.get('[data-testid="chat-message"]').last().should('contain', 'Here\'s how');
    });

    it('should display code blocks in chat', () => {
      cy.get('input[placeholder*="Ask"]').type('Show me an example{enter}');
      cy.get('[data-testid="code-block"]').should('be.visible');
      cy.get('[data-testid="copy-code"]').should('exist');
    });
  });
});
