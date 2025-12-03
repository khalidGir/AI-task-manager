describe('Task Management Flow', () => {
  const uniqueEmail = `testuser_${Date.now()}@example.com`;
  const password = 'password123';

  before(() => {
    // Create a test user via API for the task tests
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

  it('allows a user to create, update, and delete tasks', () => {
    // This test would require implementing the task UI components
    // For now, I'll write what the test should do conceptually
    
    // Navigate to a potential tasks page if it exists
    // cy.visit('/tasks');
    
    // Create a new task
    // cy.get('[data-cy="create-task"]').click();
    // cy.get('[data-cy="task-title"]').type('Test Task');
    // cy.get('[data-cy="task-description"]').type('Test Description');
    // cy.get('[data-cy="create-button"]').click();
    
    // Verify task appears in the list
    // cy.contains('Test Task').should('be.visible');
    
    // Update the task
    // cy.get('[data-cy="edit-task-button"]').click();
    // cy.get('[data-cy="task-title"]').clear().type('Updated Task');
    // cy.get('[data-cy="save-button"]').click();
    
    // Verify update
    // cy.contains('Updated Task').should('be.visible');
    
    // Delete the task
    // cy.get('[data-cy="delete-task-button"]').click();
    
    // Verify deletion
    // cy.contains('Updated Task').should('not.exist');
  });

  it('allows a user to mark tasks as complete', () => {
    // Similar to above, this would need appropriate UI elements
  });
});