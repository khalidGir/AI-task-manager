describe('Complete User Flow', () => {
  const uniqueEmail = `completeflow_${Date.now()}@example.com`;
  const password = 'password123';

  it('completes a full user journey: signup → login → dashboard → timeline → analytics → logout', () => {
    // Clear local storage to ensure a clean state
    cy.clearLocalStorage();

    // 1. Navigate to signup page
    cy.visit('/signup');
    
    // 2. Fill out signup form
    cy.get('input#email').type(uniqueEmail);
    cy.get('input#password').type(password);
    cy.get('input#confirmPassword').type(password);
    cy.get('button[type="submit"]').click();

    // 3. Verify successful signup and auto-login redirects to dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome to your Dashboard!').should('be.visible');
    cy.contains(`Welcome, ${uniqueEmail}`).should('be.visible');

    // 4. Navigate to timeline page
    cy.get('a[href="/timeline"]').click();
    cy.url().should('include', '/timeline');
    cy.contains('Activity Timeline').should('be.visible');

    // 5. Navigate to analytics page
    cy.get('a[href="/analytics"]').click();
    cy.url().should('include', '/analytics');
    cy.contains('Analytics Dashboard').should('be.visible');

    // 6. Navigate back to dashboard
    cy.get('a[href="/dashboard"]').click();
    cy.url().should('include', '/dashboard');

    // 7. Logout
    cy.get('button').contains('Logout').click();
    cy.url().should('include', '/login');
    cy.contains('Login to your account').should('be.visible');

    // 8. Login again with the same credentials
    cy.get('input#email').type(uniqueEmail);
    cy.get('input#password').type(password);
    cy.get('button[type="submit"]').click();

    // 9. Verify successful login redirects to dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome to your Dashboard!').should('be.visible');
    cy.contains(`Welcome, ${uniqueEmail}`).should('be.visible');
  });
});