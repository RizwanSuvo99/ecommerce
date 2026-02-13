import { test, expect, loginAs, waitForPageLoad } from '../fixtures';

test.describe('Authentication flows', () => {
  test.describe('Registration', () => {
    test('should register a new user', async ({ page }) => {
      await page.goto('/auth/register');
      await waitForPageLoad(page);

      const uniqueEmail = `e2e-register-${Date.now()}@example.com`;

      await page.fill('input[name="name"]', 'E2E New User');
      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="password"]', 'E2ePassword123!');
      await page.fill('input[name="confirmPassword"]', 'E2ePassword123!');
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL(/\/(account|$)/);
      await expect(page.locator('text=E2E New User')).toBeVisible();
    });

    test('should show validation errors for invalid input', async ({ page }) => {
      await page.goto('/auth/register');

      await page.fill('input[name="email"]', 'not-an-email');
      await page.fill('input[name="password"]', '123');
      await page.click('button[type="submit"]');

      await expect(page.locator('text=valid email')).toBeVisible();
      await expect(page.locator('text=at least')).toBeVisible();
    });

    test('should reject duplicate email registration', async ({ page }) => {
      await page.goto('/auth/register');

      await page.fill('input[name="name"]', 'Duplicate User');
      await page.fill('input[name="email"]', 'customer@ecommerce.test');
      await page.fill('input[name="password"]', 'TestPassword123!');
      await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
      await page.click('button[type="submit"]');

      await expect(page.locator('text=already exists')).toBeVisible();
    });
  });

  test.describe('Login', () => {
    test('should login with valid credentials', async ({ page }) => {
      await loginAs(page, 'customer@ecommerce.test', 'CustomerPassword123!');

      await expect(page).toHaveURL(/\/(account|$)/);
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test('should show error for wrong credentials', async ({ page }) => {
      await loginAs(page, 'customer@ecommerce.test', 'WrongPassword!');

      await expect(page.locator('text=Invalid credentials')).toBeVisible();
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should redirect to login for protected routes', async ({ page }) => {
      await page.goto('/account');

      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should redirect back after login', async ({ page }) => {
      // Try to access protected page
      await page.goto('/account/orders');

      // Should redirect to login with return URL
      await expect(page).toHaveURL(/\/auth\/login.*redirect/);

      // Login
      await page.fill('input[name="email"]', 'customer@ecommerce.test');
      await page.fill('input[name="password"]', 'CustomerPassword123!');
      await page.click('button[type="submit"]');

      // Should redirect back to orders
      await expect(page).toHaveURL(/\/account\/orders/);
    });
  });

  test.describe('Logout', () => {
    test('should logout and redirect to home', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account');
      await authenticatedPage.click('[data-testid="user-menu"]');
      await authenticatedPage.click('text=Logout');

      await expect(authenticatedPage).toHaveURL('/');
      await expect(authenticatedPage.locator('text=Login')).toBeVisible();
    });
  });

  test.describe('Password reset', () => {
    test('should navigate to forgot password page', async ({ page }) => {
      await page.goto('/auth/login');
      await page.click('text=Forgot password');

      await expect(page).toHaveURL(/\/auth\/forgot-password/);
    });

    test('should send password reset email', async ({ page }) => {
      await page.goto('/auth/forgot-password');
      await page.fill('input[name="email"]', 'customer@ecommerce.test');
      await page.click('button[type="submit"]');

      await expect(page.locator('text=reset link')).toBeVisible();
    });
  });

  test.describe('Admin access', () => {
    test('should redirect non-admin users from admin routes', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/dashboard');

      // Should redirect to home or show forbidden
      await expect(authenticatedPage).not.toHaveURL(/\/admin\/dashboard/);
    });

    test('should allow admin access to admin routes', async ({ adminPage }) => {
      await adminPage.goto('/admin/dashboard');

      await expect(adminPage).toHaveURL(/\/admin\/dashboard/);
      await expect(adminPage.locator('text=Dashboard')).toBeVisible();
    });
  });
});
