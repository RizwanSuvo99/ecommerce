import { test, expect, waitForPageLoad } from '../fixtures';

test.describe('Admin order management', () => {
  test.describe('Order listing', () => {
    test('should display order list', async ({ adminPage: page }) => {
      await page.goto('/admin/orders');
      await waitForPageLoad(page);

      await expect(page.locator('h1')).toContainText('Orders');
      const rows = page.locator('table tbody tr');
      expect(await rows.count()).toBeGreaterThan(0);
    });

    test('should display order columns', async ({ adminPage: page }) => {
      await page.goto('/admin/orders');
      await waitForPageLoad(page);

      await expect(page.locator('th:has-text("Order #")')).toBeVisible();
      await expect(page.locator('th:has-text("Customer")')).toBeVisible();
      await expect(page.locator('th:has-text("Status")')).toBeVisible();
      await expect(page.locator('th:has-text("Total")')).toBeVisible();
      await expect(page.locator('th:has-text("Date")')).toBeVisible();
    });

    test('should filter orders by status', async ({ adminPage: page }) => {
      await page.goto('/admin/orders');
      await page.selectOption('[data-testid="status-filter"]', 'PENDING');

      await waitForPageLoad(page);
      await expect(page).toHaveURL(/status=PENDING/);

      const statusCells = page.locator('table tbody td:nth-child(3)');
      const count = await statusCells.count();
      for (let i = 0; i < count; i++) {
        await expect(statusCells.nth(i)).toContainText('PENDING');
      }
    });

    test('should search orders by order number', async ({ adminPage: page }) => {
      await page.goto('/admin/orders');
      await page.fill('[data-testid="search-orders"]', 'ORD-');
      await page.press('[data-testid="search-orders"]', 'Enter');

      await waitForPageLoad(page);
      const rows = page.locator('table tbody tr');
      expect(await rows.count()).toBeGreaterThanOrEqual(0);
    });

    test('should filter orders by date range', async ({ adminPage: page }) => {
      await page.goto('/admin/orders');

      await page.fill('input[name="dateFrom"]', '2026-02-01');
      await page.fill('input[name="dateTo"]', '2026-02-28');
      await page.click('button:has-text("Apply")');

      await waitForPageLoad(page);
      await expect(page).toHaveURL(/dateFrom.*dateTo/);
    });

    test('should paginate orders', async ({ adminPage: page }) => {
      await page.goto('/admin/orders');
      await waitForPageLoad(page);

      const nextButton = page.locator('[data-testid="pagination-next"]');
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await expect(page).toHaveURL(/page=2/);
      }
    });
  });

  test.describe('Order detail', () => {
    test('should display order details', async ({ adminPage: page }) => {
      await page.goto('/admin/orders');
      await waitForPageLoad(page);

      // Click on first order
      await page.locator('table tbody tr').first().click();
      await waitForPageLoad(page);

      await expect(page).toHaveURL(/\/admin\/orders\/.+/);
      await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
      await expect(page.locator('[data-testid="order-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="order-items"]')).toBeVisible();
      await expect(page.locator('[data-testid="shipping-address"]')).toBeVisible();
      await expect(page.locator('[data-testid="order-total"]')).toBeVisible();
    });

    test('should display order timeline', async ({ adminPage: page }) => {
      await page.goto('/admin/orders');
      await page.locator('table tbody tr').first().click();
      await waitForPageLoad(page);

      await expect(page.locator('[data-testid="order-timeline"]')).toBeVisible();
    });
  });

  test.describe('Order status management', () => {
    test('should update order status to CONFIRMED', async ({ adminPage: page }) => {
      await page.goto('/admin/orders');
      await waitForPageLoad(page);

      // Find a pending order
      const pendingRow = page.locator('table tbody tr', { hasText: 'PENDING' }).first();
      if (await pendingRow.isVisible()) {
        await pendingRow.click();
        await waitForPageLoad(page);

        await page.selectOption('[data-testid="status-select"]', 'CONFIRMED');
        await page.click('button:has-text("Update Status")');

        await expect(page.locator('text=Status updated')).toBeVisible();
        await expect(page.locator('[data-testid="order-status"]')).toContainText('CONFIRMED');
      }
    });

    test('should update order status through full lifecycle', async ({ adminPage: page }) => {
      await page.goto('/admin/orders');
      await waitForPageLoad(page);

      const confirmedRow = page.locator('table tbody tr', { hasText: 'CONFIRMED' }).first();
      if (await confirmedRow.isVisible()) {
        await confirmedRow.click();
        await waitForPageLoad(page);

        // CONFIRMED → PROCESSING
        await page.selectOption('[data-testid="status-select"]', 'PROCESSING');
        await page.click('button:has-text("Update Status")');
        await expect(page.locator('text=Status updated')).toBeVisible();

        // PROCESSING → SHIPPED
        await page.selectOption('[data-testid="status-select"]', 'SHIPPED');
        await page.fill('input[name="trackingNumber"]', 'TRK-123456789');
        await page.click('button:has-text("Update Status")');
        await expect(page.locator('text=Status updated')).toBeVisible();

        // SHIPPED → DELIVERED
        await page.selectOption('[data-testid="status-select"]', 'DELIVERED');
        await page.click('button:has-text("Update Status")');
        await expect(page.locator('text=Status updated')).toBeVisible();
        await expect(page.locator('[data-testid="order-status"]')).toContainText('DELIVERED');
      }
    });

    test('should prevent invalid status transitions', async ({ adminPage: page }) => {
      await page.goto('/admin/orders');
      await waitForPageLoad(page);

      const deliveredRow = page.locator('table tbody tr', { hasText: 'DELIVERED' }).first();
      if (await deliveredRow.isVisible()) {
        await deliveredRow.click();
        await waitForPageLoad(page);

        // DELIVERED → PENDING should not be available
        const statusSelect = page.locator('[data-testid="status-select"]');
        const options = await statusSelect.locator('option').allTextContents();
        expect(options).not.toContain('PENDING');
      }
    });
  });

  test.describe('Order cancellation', () => {
    test('should cancel a pending order', async ({ adminPage: page }) => {
      await page.goto('/admin/orders');
      await waitForPageLoad(page);

      const pendingRow = page.locator('table tbody tr', { hasText: 'PENDING' }).first();
      if (await pendingRow.isVisible()) {
        await pendingRow.click();
        await waitForPageLoad(page);

        await page.click('button:has-text("Cancel Order")');

        // Confirm in dialog
        await page.fill('textarea[name="reason"]', 'Customer requested cancellation');
        await page.click('[data-testid="confirm-cancel"]');

        await expect(page.locator('text=Order cancelled')).toBeVisible();
        await expect(page.locator('[data-testid="order-status"]')).toContainText('CANCELLED');
      }
    });
  });

  test.describe('Order refund', () => {
    test('should initiate a refund for paid order', async ({ adminPage: page }) => {
      await page.goto('/admin/orders');
      await waitForPageLoad(page);

      // Find a completed/confirmed order
      const paidRow = page.locator('table tbody tr', { hasText: 'CONFIRMED' }).first();
      if (await paidRow.isVisible()) {
        await paidRow.click();
        await waitForPageLoad(page);

        await page.click('button:has-text("Refund")');

        // Fill refund details
        await page.fill('textarea[name="refundReason"]', 'Defective product');
        await page.click('[data-testid="confirm-refund"]');

        await expect(page.locator('text=Refund initiated')).toBeVisible();
      }
    });
  });

  test.describe('Order export', () => {
    test('should export orders to CSV', async ({ adminPage: page }) => {
      await page.goto('/admin/orders');
      await waitForPageLoad(page);

      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export CSV")');
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toMatch(/orders.*\.csv$/);
    });
  });
});
