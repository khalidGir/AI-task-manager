describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear local storage to ensure a clean state for each test
    cy.clearLocalStorage();
    // Ensure the backend is clean for new user creation
    // This assumes you have a way to clear test data in your backend
    // For now, we'll rely on unique emails for signup.
    // In a real E2E setup, you'd typically reset the DB via API call.
  });

  it('allows a user to sign up, log in, and view the dashboard', () => {
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const password = 'password123';

    // Visit the signup page
    cy.visit('/signup');

    // Fill out the signup form
    cy.get('input[type="email"]').type(uniqueEmail);
    cy.get('input[type="password"]').first().type(password); // First password input
    cy.get('input[type="password"]').last().type(password); // Confirm password input
    cy.get('button[type="submit"]').click();

    // Verify redirection to dashboard after successful signup (auto-login)
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome to your Dashboard!').should('be.visible');
    cy.contains(`Welcome, ${uniqueEmail}`).should('be.visible');

    // Logout
    cy.get('button').contains('Logout').click();
    cy.url().should('include', '/login');

    // Now, try logging in with the newly created user
    cy.visit('/login');
    cy.get('input[type="email"]').type(uniqueEmail);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();

    // Verify redirection to dashboard after successful login
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome to your Dashboard!').should('be.visible');
    cy.contains(`Welcome, ${uniqueEmail}`).should('be.visible');
  });

  it('shows error on invalid login credentials', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('nonexistent@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.contains('Login failed. Please check your credentials.').should('be.visible');
    cy.url().should('include', '/login'); // Should stay on login page
  });
});