import { chromium, FullConfig } from '@playwright/test';

const API_URL = process.env.E2E_API_URL || 'http://localhost:4000/api';

async function globalSetup(config: FullConfig) {
  console.log('Starting e2e global setup...');

  // Wait for API to be ready
  const maxRetries = 30;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await fetch(`${API_URL}/health`);
      if (response.ok) {
        console.log('API is ready');
        break;
      }
    } catch {
      // API not ready yet
    }
    retries++;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  if (retries >= maxRetries) {
    throw new Error('API did not become ready in time');
  }

  // Seed test data
  try {
    await fetch(`${API_URL}/health/seed-test-data`, { method: 'POST' });
    console.log('Test data seeded');
  } catch (error) {
    console.warn('Could not seed test data:', error);
  }

  // Create admin session and save auth state
  const browser = await chromium.launch();
  const adminPage = await browser.newPage();

  try {
    await adminPage.goto(`${config.projects[0].use.baseURL}/auth/login`);
    await adminPage.fill('input[name="email"]', 'admin@ecommerce.test');
    await adminPage.fill('input[name="password"]', 'AdminPassword123!');
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL('**/admin/dashboard');

    await adminPage.context().storageState({ path: 'e2e/.auth/admin.json' });
    console.log('Admin auth state saved');
  } catch (error) {
    console.warn('Could not create admin session:', error);
  }

  // Create customer session
  const customerPage = await browser.newPage();

  try {
    await customerPage.goto(`${config.projects[0].use.baseURL}/auth/login`);
    await customerPage.fill('input[name="email"]', 'customer@ecommerce.test');
    await customerPage.fill('input[name="password"]', 'CustomerPassword123!');
    await customerPage.click('button[type="submit"]');
    await customerPage.waitForURL('**/account');

    await customerPage.context().storageState({ path: 'e2e/.auth/customer.json' });
    console.log('Customer auth state saved');
  } catch (error) {
    console.warn('Could not create customer session:', error);
  }

  await browser.close();
  console.log('Global setup complete');
}

export default globalSetup;
