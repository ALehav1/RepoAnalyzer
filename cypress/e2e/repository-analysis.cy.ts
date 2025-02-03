describe('Repository Analysis', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should analyze a repository successfully', () => {
    // Mock successful API response
    cy.intercept('POST', '/api/analyze', {
      statusCode: 200,
      body: {
        analysisId: 'test-123',
        status: 'completed',
        data: {
          codeQuality: {
            score: 85,
            details: ['Good code organization', 'Low complexity'],
            recommendations: ['Add more comments'],
          },
          documentation: {
            score: 75,
            details: ['Documentation present', 'Some missing docstrings'],
            recommendations: ['Add more function documentation'],
          },
          bestPractices: {
            score: 90,
            details: ['Follows style guide', 'Good naming conventions'],
            recommendations: [],
          },
        },
      },
    }).as('analyzeRepo');

    // Enter repository URL
    cy.findByLabelText(/github repository url/i)
      .type('https://github.com/facebook/react');

    // Submit form
    cy.findByRole('button', { name: /analyze repository/i })
      .click();

    // Wait for API call
    cy.wait('@analyzeRepo');

    // Check results are displayed
    cy.findByText('Code Quality').should('be.visible');
    cy.findByText('85%').should('be.visible');
    cy.findByText('Good code organization').should('be.visible');

    cy.findByText('Documentation').should('be.visible');
    cy.findByText('75%').should('be.visible');
    cy.findByText('Documentation present').should('be.visible');

    cy.findByText('Best Practices').should('be.visible');
    cy.findByText('90%').should('be.visible');
    cy.findByText('Follows style guide').should('be.visible');
  });

  it('should handle analysis errors gracefully', () => {
    // Mock failed API response
    cy.intercept('POST', '/api/analyze', {
      statusCode: 500,
      body: {
        error: 'Failed to analyze repository',
      },
    }).as('analyzeRepoError');

    // Enter repository URL
    cy.findByLabelText(/github repository url/i)
      .type('https://github.com/invalid/repo');

    // Submit form
    cy.findByRole('button', { name: /analyze repository/i })
      .click();

    // Wait for API call
    cy.wait('@analyzeRepoError');

    // Check error message is displayed
    cy.findByText(/failed to analyze repository/i)
      .should('be.visible');
  });

  it('should validate repository URL format', () => {
    // Enter invalid URL
    cy.findByLabelText(/github repository url/i)
      .type('invalid-url');

    // Check error message
    cy.findByText(/please enter a valid github repository url/i)
      .should('be.visible');

    // Submit button should be disabled
    cy.findByRole('button', { name: /analyze repository/i })
      .should('be.disabled');

    // Enter valid URL
    cy.findByLabelText(/github repository url/i)
      .clear()
      .type('https://github.com/facebook/react');

    // Error message should be gone
    cy.findByText(/please enter a valid github repository url/i)
      .should('not.exist');

    // Submit button should be enabled
    cy.findByRole('button', { name: /analyze repository/i })
      .should('be.enabled');
  });

  it('should show loading state during analysis', () => {
    // Mock slow API response
    cy.intercept('POST', '/api/analyze', (req) => {
      req.reply({
        delay: 2000,
        statusCode: 200,
        body: {
          analysisId: 'test-123',
          status: 'completed',
          data: {
            codeQuality: {
              score: 85,
              details: ['Good code organization'],
            },
          },
        },
      });
    }).as('analyzeRepoSlow');

    // Enter repository URL and submit
    cy.findByLabelText(/github repository url/i)
      .type('https://github.com/facebook/react');
    cy.findByRole('button', { name: /analyze repository/i })
      .click();

    // Check loading state
    cy.findByText(/analyzing repository/i)
      .should('be.visible');
    cy.findByRole('progressbar')
      .should('be.visible');

    // Wait for response and check loading state is gone
    cy.wait('@analyzeRepoSlow');
    cy.findByText(/analyzing repository/i)
      .should('not.exist');
  });
});
