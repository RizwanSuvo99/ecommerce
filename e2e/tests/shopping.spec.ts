import {
  test,
  expect,
  addProductToCart,
  clearCart,
  fillShippingAddress,
  waitForPageLoad,
} from '../fixtures';

test.describe('Shopping flow', () => {
  test.describe('Product browsing', () => {
    test('should display product listing on shop page', async ({ page }) => {
      await page.goto('/shop');
      await waitForPageLoad(page);

      const products = page.locator('[data-testid="product-card"]');
      await expect(products.first()).toBeVisible();
      expect(await products.count()).toBeGreaterThan(0);
    });

    test('should filter products by category', async ({ page }) => {
      await page.goto('/shop');
      await page.click('[data-testid="category-filter"]');
      await page.click('text=Electronics');

      await waitForPageLoad(page);
      await expect(page).toHaveURL(/category=electronics/);

      const products = page.locator('[data-testid="product-card"]');
      await expect(products.first()).toBeVisible();
    });

    test('should filter products by price range', async ({ page }) => {
      await page.goto('/shop');
      await page.fill('input[name="minPrice"]', '1000');
      await page.fill('input[name="maxPrice"]', '5000');
      await page.click('button:has-text("Apply")');

      await waitForPageLoad(page);
      await expect(page).toHaveURL(/minPrice=1000.*maxPrice=5000/);
    });

    test('should search products', async ({ page }) => {
      await page.goto('/');
      await page.fill('[data-testid="search-input"]', 'headphones');
      await page.press('[data-testid="search-input"]', 'Enter');

      await expect(page).toHaveURL(/\/search\?q=headphones/);
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    });

    test('should navigate to product detail page', async ({ page }) => {
      await page.goto('/shop');
      await waitForPageLoad(page);

      const firstProduct = page.locator('[data-testid="product-card"]').first();
      const productName = await firstProduct.locator('h3').textContent();
      await firstProduct.click();

      await expect(page).toHaveURL(/\/products\/.+/);
      await expect(page.locator('h1')).toContainText(productName || '');
    });

    test('should display product details', async ({ page }) => {
      await page.goto('/shop');
      await page.locator('[data-testid="product-card"]').first().click();
      await waitForPageLoad(page);

      await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-description"]')).toBeVisible();
      await expect(page.locator('button:has-text("Add to Cart")')).toBeVisible();
    });

    test('should paginate products', async ({ page }) => {
      await page.goto('/shop');
      await waitForPageLoad(page);

      const nextPage = page.locator('[data-testid="pagination-next"]');
      if (await nextPage.isVisible()) {
        await nextPage.click();
        await expect(page).toHaveURL(/page=2/);
      }
    });
  });

  test.describe('Cart operations', () => {
    test('should add product to cart', async ({ page }) => {
      await page.goto('/shop');
      await page.locator('[data-testid="product-card"]').first().click();
      await waitForPageLoad(page);

      await page.click('button:has-text("Add to Cart")');

      await expect(page.locator('[data-testid="cart-badge"]')).toHaveText('1');
      await expect(page.locator('text=Added to cart')).toBeVisible();
    });

    test('should update item quantity in cart', async ({ authenticatedPage: page }) => {
      await clearCart(page);
      await page.goto('/shop');
      await page.locator('[data-testid="product-card"]').first().click();
      await page.click('button:has-text("Add to Cart")');

      await page.goto('/cart');
      await waitForPageLoad(page);

      await page.click('[data-testid="quantity-increase"]');

      await expect(page.locator('[data-testid="item-quantity"]').first()).toHaveValue('2');
    });

    test('should remove item from cart', async ({ authenticatedPage: page }) => {
      await clearCart(page);
      await page.goto('/shop');
      await page.locator('[data-testid="product-card"]').first().click();
      await page.click('button:has-text("Add to Cart")');

      await page.goto('/cart');
      await page.click('[data-testid="remove-item"]');

      await expect(page.locator('text=Your cart is empty')).toBeVisible();
    });

    test('should apply coupon code', async ({ authenticatedPage: page }) => {
      await clearCart(page);
      await page.goto('/shop');
      await page.locator('[data-testid="product-card"]').first().click();
      await page.click('button:has-text("Add to Cart")');

      await page.goto('/cart');
      await page.fill('input[name="coupon"]', 'SAVE20');
      await page.click('button:has-text("Apply")');

      await expect(page.locator('[data-testid="discount"]')).toBeVisible();
    });
  });

  test.describe('Checkout flow', () => {
    test('should complete checkout with COD', async ({ authenticatedPage: page }) => {
      await clearCart(page);

      // Add product to cart
      await page.goto('/shop');
      await page.locator('[data-testid="product-card"]').first().click();
      await page.click('button:has-text("Add to Cart")');

      // Go to cart and proceed to checkout
      await page.goto('/cart');
      await page.click('text=Proceed to Checkout');
      await expect(page).toHaveURL(/\/checkout/);

      // Fill shipping address
      await fillShippingAddress(page);
      await page.click('button:has-text("Continue")');

      // Select payment method
      await page.click('[data-testid="payment-cod"]');
      await page.click('button:has-text("Place Order")');

      // Verify order confirmation
      await expect(page).toHaveURL(/\/orders\/confirmation/);
      await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
      await expect(page.locator('text=Order placed successfully')).toBeVisible();
    });

    test('should redirect to login if not authenticated', async ({ page }) => {
      await page.goto('/shop');
      await page.locator('[data-testid="product-card"]').first().click();
      await page.click('button:has-text("Add to Cart")');

      await page.goto('/cart');
      await page.click('text=Proceed to Checkout');

      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });
});
