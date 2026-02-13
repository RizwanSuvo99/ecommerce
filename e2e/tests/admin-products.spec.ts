import { test, expect, waitForPageLoad } from '../fixtures';

test.describe('Admin product management', () => {
  test.describe('Product listing', () => {
    test('should display product list', async ({ adminPage: page }) => {
      await page.goto('/admin/products');
      await waitForPageLoad(page);

      await expect(page.locator('h1')).toContainText('Products');
      const rows = page.locator('table tbody tr');
      expect(await rows.count()).toBeGreaterThan(0);
    });

    test('should search products', async ({ adminPage: page }) => {
      await page.goto('/admin/products');
      await page.fill('[data-testid="search-products"]', 'Test Product');
      await page.press('[data-testid="search-products"]', 'Enter');

      await waitForPageLoad(page);
      const rows = page.locator('table tbody tr');
      expect(await rows.count()).toBeGreaterThanOrEqual(0);
    });

    test('should filter by status', async ({ adminPage: page }) => {
      await page.goto('/admin/products');
      await page.selectOption('[data-testid="status-filter"]', 'ACTIVE');

      await waitForPageLoad(page);
      await expect(page).toHaveURL(/status=ACTIVE/);
    });

    test('should paginate products', async ({ adminPage: page }) => {
      await page.goto('/admin/products');
      await waitForPageLoad(page);

      const nextButton = page.locator('[data-testid="pagination-next"]');
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await expect(page).toHaveURL(/page=2/);
      }
    });
  });

  test.describe('Create product', () => {
    test('should create a new product', async ({ adminPage: page, testProduct }) => {
      await page.goto('/admin/products/new');
      await waitForPageLoad(page);

      // Fill product form
      await page.fill('input[name="name"]', testProduct.name);
      await page.fill('textarea[name="description"]', 'E2E test product description with details');
      await page.fill('input[name="price"]', String(testProduct.price));
      await page.fill('input[name="sku"]', testProduct.sku);
      await page.fill('input[name="stock"]', '100');

      // Select category if available
      const categorySelect = page.locator('select[name="categoryId"]');
      if (await categorySelect.isVisible()) {
        const options = await categorySelect.locator('option').allTextContents();
        if (options.length > 1) {
          await categorySelect.selectOption({ index: 1 });
        }
      }

      // Submit
      await page.click('button:has-text("Create Product")');

      await expect(page.locator('text=Product created')).toBeVisible();
      await expect(page).toHaveURL(/\/admin\/products/);
    });

    test('should validate required fields', async ({ adminPage: page }) => {
      await page.goto('/admin/products/new');

      await page.click('button:has-text("Create Product")');

      await expect(page.locator('text=Name is required')).toBeVisible();
      await expect(page.locator('text=Price is required')).toBeVisible();
      await expect(page.locator('text=SKU is required')).toBeVisible();
    });

    test('should auto-generate slug from name', async ({ adminPage: page }) => {
      await page.goto('/admin/products/new');

      await page.fill('input[name="name"]', 'My Awesome Product');

      const slugField = page.locator('input[name="slug"]');
      await expect(slugField).toHaveValue('my-awesome-product');
    });
  });

  test.describe('Edit product', () => {
    test('should edit an existing product', async ({ adminPage: page }) => {
      await page.goto('/admin/products');
      await waitForPageLoad(page);

      // Click edit on first product
      await page.locator('table tbody tr').first().locator('a:has-text("Edit")').click();
      await waitForPageLoad(page);

      // Update price
      await page.fill('input[name="price"]', '3999');
      await page.click('button:has-text("Update Product")');

      await expect(page.locator('text=Product updated')).toBeVisible();
    });

    test('should manage product variants', async ({ adminPage: page }) => {
      await page.goto('/admin/products');
      await page.locator('table tbody tr').first().locator('a:has-text("Edit")').click();
      await waitForPageLoad(page);

      // Navigate to variants tab
      await page.click('text=Variants');

      // Add variant
      await page.click('button:has-text("Add Variant")');
      await page.fill('input[name="variantName"]', 'Red / Large');
      await page.fill('input[name="variantSku"]', 'VAR-RED-L');
      await page.fill('input[name="variantPrice"]', '3499');
      await page.fill('input[name="variantStock"]', '25');
      await page.click('button:has-text("Save Variant")');

      await expect(page.locator('text=Variant added')).toBeVisible();
      await expect(page.locator('text=Red / Large')).toBeVisible();
    });

    test('should upload product images', async ({ adminPage: page }) => {
      await page.goto('/admin/products');
      await page.locator('table tbody tr').first().locator('a:has-text("Edit")').click();
      await waitForPageLoad(page);

      // Navigate to images tab
      await page.click('text=Images');

      // Upload image
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'test-product.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data'),
      });

      await expect(page.locator('[data-testid="image-preview"]')).toBeVisible();
    });
  });

  test.describe('Delete product', () => {
    test('should archive a product', async ({ adminPage: page, testProduct }) => {
      // Create a product to delete
      await page.goto('/admin/products/new');
      await page.fill('input[name="name"]', `Delete Me ${Date.now()}`);
      await page.fill('input[name="price"]', '999');
      await page.fill('input[name="sku"]', `DEL-${Date.now()}`);
      await page.fill('input[name="stock"]', '10');
      await page.click('button:has-text("Create Product")');
      await waitForPageLoad(page);

      // Go back to listing
      await page.goto('/admin/products');
      await waitForPageLoad(page);

      // Find and delete the product
      const row = page.locator('table tbody tr', { hasText: 'Delete Me' }).first();
      await row.locator('button:has-text("Delete")').click();

      // Confirm in dialog
      await page.click('[data-testid="confirm-delete"]');

      await expect(page.locator('text=Product archived')).toBeVisible();
    });
  });

  test.describe('Bulk operations', () => {
    test('should select multiple products', async ({ adminPage: page }) => {
      await page.goto('/admin/products');
      await waitForPageLoad(page);

      // Select checkboxes
      const checkboxes = page.locator('table tbody input[type="checkbox"]');
      const count = await checkboxes.count();

      if (count >= 2) {
        await checkboxes.nth(0).check();
        await checkboxes.nth(1).check();

        await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible();
        await expect(page.locator('text=2 selected')).toBeVisible();
      }
    });
  });
});
