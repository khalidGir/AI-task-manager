describe('Timeline and Analytics Flow', () => {
  const uniqueEmail = `timelineuser_${Date.now()}@example.com`;
  const password = 'password123';

  before(() => {
    // Create a test user via API for the timeline/analytics tests
    cy.request('POST', 'http://localhost:3001/api/v1/auth/signup', {
      email: uniqueEmail,
      password: password
    });
  });

  beforeEach(() => {
    // Clear local storage to ensure a clean state for each test
    cy.clearLocalStorage();
    
    // Login before each test
    cy.visit('/login');
    cy.get('input[type="email"]').type(uniqueEmail);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
    
    // Wait for dashboard to load
    cy.url().should('include', '/dashboard');
  });

  it('allows a user to navigate to timeline and view events', () => {
    // Navigate to timeline page
    cy.get('a[href="/timeline"]').click();
    cy.url().should('include', '/timeline');
    
    // Verify timeline page elements
    cy.contains('Activity Timeline').should('be.visible');
    
    // Verify filter options exist
    cy.get('select[id="filter"]').should('exist');
    
    // Check that timeline shows appropriate content (might be empty initially)
    cy.contains('No activity events found').should('be.visible')
      .or()
      .get('[data-cy="event-item"]').should('exist');
  });

  it('allows a user to navigate to analytics and view data', () => {
    // Navigate to analytics page
    cy.get('a[href="/analytics"]').click();
    cy.url().should('include', '/analytics');
    
    // Verify analytics page elements
    cy.contains('Analytics Dashboard').should('be.visible');
    
    // Verify dashboard metrics are displayed
    cy.contains('Total Tasks').should('be.visible');
    cy.contains('Completed Tasks').should('be.visible');
    cy.contains('Pending Tasks').should('be.visible');
    
    // Check for chart component
    // cy.get('[data-cy="analytics-chart"]').should('exist');
    
    // Verify AI recommendations section
    cy.contains('AI Recommendations').should('be.visible');
  });

  it('allows filtering events on timeline page', () => {
    cy.get('a[href="/timeline"]').click();
    cy.url().should('include', '/timeline');
    
    // Test filter changes
    cy.get('select[id="filter"]').select('today');
    cy.get('select[id="filter"]').should('have.value', 'today');
    
    cy.get('select[id="filter"]').select('week');
    cy.get('select[id="filter"]').should('have.value', 'week');
    
    cy.get('select[id="filter"]').select('all');
    cy.get('select[id="filter"]').should('have.value', 'all');
  });
});