import { test as base, expect, Page } from '@playwright/test';

interface TestFixtures {
  authenticatedPage: Page;
  adminPage: Page;
  testProduct: {
    name: string;
    slug: string;
    price: number;
    sku: string;
  };
}

export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'e2e/.auth/customer.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'e2e/.auth/admin.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  testProduct: async ({}, use) => {
    const product = {
      name: `E2E Test Product ${Date.now()}`,
      slug: `e2e-test-product-${Date.now()}`,
      price: 2999,
      sku: `E2E-${Date.now()}`,
    };
    await use(product);
  },
});

export { expect };

// Common page helpers
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
}

export async function fillShippingAddress(page: Page) {
  await page.fill('input[name="name"]', 'E2E Test User');
  await page.fill('input[name="address"]', '123 E2E Street');
  await page.fill('input[name="city"]', 'Dhaka');
  await page.fill('input[name="postalCode"]', '1205');
  await page.selectOption('select[name="country"]', 'BD');
}

export async function addProductToCart(page: Page, productSlug: string) {
  await page.goto(`/products/${productSlug}`);
  await page.click('button:has-text("Add to Cart")');
  await page.waitForSelector('text=Added to cart');
}

export async function clearCart(page: Page) {
  await page.goto('/cart');
  const clearButton = page.locator('button:has-text("Clear Cart")');
  if (await clearButton.isVisible()) {
    await clearButton.click();
    await page.waitForSelector('text=Your cart is empty');
  }
}

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/auth/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
}
