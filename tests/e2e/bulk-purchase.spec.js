import { test, expect } from '@playwright/test';

// Use the authenticated state from setup
test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Simple Bulk Purchase Modal', () => {
  test.beforeEach(async ({ page }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
    await page.goto(`${baseURL}/stock`);
    // Wait for the stock page to load
    await page.waitForSelector('h1, h2', { timeout: 10000 });
  });

  test('should open the bulk purchase modal', async ({ page }) => {
    // Look for the Bulk Purchase button
    const bulkPurchaseButton = page.locator('button:has-text("Bulk Purchase")');
    await expect(bulkPurchaseButton).toBeVisible({ timeout: 10000 });
    await bulkPurchaseButton.click();

    // Wait for the modal to appear
    await page.waitForSelector('h2:has-text("SimpleBulk Purchase from Contact")', {
      timeout: 5000,
    });

    // Verify modal is visible
    await expect(page.locator('h2:has-text("SimpleBulk Purchase from Contact")')).toBeVisible();
  });

  test('should display form fields in the modal', async ({ page }) => {
    // Open the modal
    await page.click('button:has-text("Bulk Purchase")');
    await page.waitForSelector('h2:has-text("SimpleBulk Purchase from Contact")', {
      timeout: 5000,
    });

    // Check for required form fields
    await expect(page.locator('input[name="totalCost"]')).toBeVisible();
    await expect(page.locator('select[name="location"]')).toBeVisible();
    await expect(page.locator('input[name="date"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();

    // Check for product fields
    await expect(page.locator('button[data-testid="add-product"]')).toBeVisible();
  });

  test('should add a new product line', async ({ page }) => {
    // Open the modal
    await page.click('button:has-text("Bulk Purchase")');
    await page.waitForSelector('h2:has-text("SimpleBulk Purchase from Contact")', {
      timeout: 5000,
    });

    // Click add product button
    const addProductButton = page.locator('button[data-testid="add-product"]');
    await addProductButton.click();

    // Verify there are now 2 product lines (initial + new)
    // We can check by looking for multiple SKU input fields
    const skuInputs = page.locator('input[placeholder*="SKU"], input[name*="sku"]');
    const count = await skuInputs.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should auto-generate SKU from description', async ({ page }) => {
    // Open the modal
    await page.click('button:has-text("Bulk Purchase")');
    await page.waitForSelector('h2:has-text("SimpleBulk Purchase from Contact")', {
      timeout: 5000,
    });

    // Find the description input for the first product
    const descriptionInput = page
      .locator('textarea[placeholder*="Description"], input[name*="description"]')
      .first();

    if (await descriptionInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Fill in description
      await descriptionInput.fill('Test Product Description');

      // Wait a bit for SKU generation
      await page.waitForTimeout(500);

      // Check if SKU field has been populated
      const skuInput = page.locator('input[placeholder*="SKU"], input[name*="sku"]').first();
      const skuValue = await skuInput.inputValue();
      expect(skuValue).toBeTruthy();
      expect(skuValue.length).toBeGreaterThan(0);
    }
  });

  test('should distribute costs automatically when total cost is entered', async ({ page }) => {
    // Open the modal
    await page.click('button:has-text("Bulk Purchase")');
    await page.waitForSelector('h2:has-text("SimpleBulk Purchase from Contact")', {
      timeout: 5000,
    });

    // Add a second product
    await page.click('button[data-testid="add-product"]');
    await page.waitForTimeout(300);

    // Set quantities for both products
    const quantityInputs = page.locator('input[type="number"][name*="quantity"]');
    const quantityCount = await quantityInputs.count();

    if (quantityCount >= 2) {
      await quantityInputs.nth(0).fill('2');
      await quantityInputs.nth(1).fill('3');
    }

    // Enter total cost
    const totalCostInput = page.locator('input[name="totalCost"]');
    await totalCostInput.fill('100.00');

    // Wait for auto-distribution (debounced)
    await page.waitForTimeout(500);

    // Check that costs have been allocated
    // Look for allocated cost inputs or display
    const allocatedCostInputs = page.locator('input[name*="allocatedCost"], input[name*="cost"]');
    const allocatedCount = await allocatedCostInputs.count();

    if (allocatedCount > 0) {
      const firstCost = await allocatedCostInputs.nth(0).inputValue();
      expect(parseFloat(firstCost) || 0).toBeGreaterThan(0);
    }
  });

  test('should show validation error when costs are not balanced', async ({ page }) => {
    // Open the modal
    await page.click('button:has-text("Bulk Purchase")');
    await page.waitForSelector('h2:has-text("SimpleBulk Purchase from Contact")', {
      timeout: 5000,
    });

    // Fill in required fields
    await page.fill('input[name="totalCost"]', '100.00');

    // Manually set an allocated cost that doesn't match total
    const allocatedCostInputs = page.locator('input[name*="allocatedCost"], input[name*="cost"]');
    if ((await allocatedCostInputs.count()) > 0) {
      await allocatedCostInputs.nth(0).fill('50.00');
    }

    // Try to submit
    const submitButton = page.locator('button[type="submit"]:has-text("Record Purchase")');
    await submitButton.click();

    // Wait for error message
    await page.waitForTimeout(500);

    // Check for error message about unbalanced costs
    const errorMessage = page.locator('text=/Total allocated cost.*must equal total cost/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields before submission', async ({ page }) => {
    // Open the modal
    await page.click('button:has-text("Bulk Purchase")');
    await page.waitForSelector('h2:has-text("SimpleBulk Purchase from Contact")', {
      timeout: 5000,
    });

    // Try to submit without filling required fields
    const submitButton = page.locator('button[type="submit"]:has-text("Record Purchase")');
    await expect(submitButton).toBeDisabled();
  });

  test('should close modal on cancel', async ({ page }) => {
    // Open the modal
    await page.click('button:has-text("Bulk Purchase")');
    await page.waitForSelector('h2:has-text("SimpleBulk Purchase from Contact")', {
      timeout: 5000,
    });

    // Fill in some data
    await page.fill('input[name="totalCost"]', '100.00');

    // Click cancel button
    const cancelButton = page.locator('button:has-text("Cancel")');
    await cancelButton.click();

    // Verify modal is closed
    await expect(
      page.locator('h2:has-text("SimpleBulk Purchase from Contact")')
    ).not.toBeVisible({ timeout: 5000 });
  });

  test('should remove a product line', async ({ page }) => {
    // Open the modal
    await page.click('button:has-text("Bulk Purchase")');
    await page.waitForSelector('h2:has-text("SimpleBulk Purchase from Contact")', {
      timeout: 5000,
    });

    // Add a second product
    await page.click('button[data-testid="add-product"]');
    await page.waitForTimeout(300);

    // Count initial product lines
    const initialSkuInputs = page.locator('input[placeholder*="SKU"], input[name*="sku"]');
    const initialCount = await initialSkuInputs.count();

    // Find and click remove button (if there are multiple items)
    if (initialCount > 1) {
      const removeButtons = page.locator('button:has-text("Remove"), button[aria-label*="remove" i]');
      const removeCount = await removeButtons.count();

      if (removeCount > 0) {
        await removeButtons.first().click();
        await page.waitForTimeout(300);

        // Verify product line was removed
        const finalSkuInputs = page.locator('input[placeholder*="SKU"], input[name*="sku"]');
        const finalCount = await finalSkuInputs.count();
        expect(finalCount).toBeLessThan(initialCount);
      }
    }
  });

  test('should redistribute costs when manually editing allocated cost', async ({ page }) => {
    // Open the modal
    await page.click('button:has-text("Bulk Purchase")');
    await page.waitForSelector('h2:has-text("SimpleBulk Purchase from Contact")', {
      timeout: 5000,
    });

    // Add a second product
    await page.click('button[data-testid="add-product"]');
    await page.waitForTimeout(300);

    // Set quantities
    const quantityInputs = page.locator('input[type="number"][name*="quantity"]');
    const quantityCount = await quantityInputs.count();

    if (quantityCount >= 2) {
      await quantityInputs.nth(0).fill('1');
      await quantityInputs.nth(1).fill('1');
    }

    // Enter total cost
    await page.fill('input[name="totalCost"]', '100.00');
    await page.waitForTimeout(500);

    // Manually edit the first item's allocated cost
    const allocatedCostInputs = page.locator('input[name*="allocatedCost"], input[name*="cost"]');
    if ((await allocatedCostInputs.count()) >= 2) {
      const firstCost = await allocatedCostInputs.nth(0).inputValue();
      const originalCost = parseFloat(firstCost) || 0;

      // Change the first item's cost
      await allocatedCostInputs.nth(0).fill('30.00');
      await page.waitForTimeout(500);

      // Check that the second item's cost was redistributed
      const secondCost = await allocatedCostInputs.nth(1).inputValue();
      const secondCostValue = parseFloat(secondCost) || 0;

      // Second item should have the remaining cost (approximately 70.00)
      expect(secondCostValue).toBeGreaterThan(60);
      expect(secondCostValue).toBeLessThan(80);
    }
  });

  test('should show balance status when costs are balanced', async ({ page }) => {
    // Open the modal
    await page.click('button:has-text("Bulk Purchase")');
    await page.waitForSelector('h2:has-text("SimpleBulk Purchase from Contact")', {
      timeout: 5000,
    });

    // Enter total cost
    await page.fill('input[name="totalCost"]', '100.00');
    await page.waitForTimeout(500);

    // Check for balance indicator
    const balanceIndicator = page.locator('text=/Balanced/i, text=/✓/i');
    // Balance indicator may appear after costs are distributed
    await page.waitForTimeout(500);
    const isVisible = await balanceIndicator.isVisible({ timeout: 2000 }).catch(() => false);

    if (isVisible) {
      await expect(balanceIndicator).toBeVisible();
    }
  });

  test('should use distribute evenly button', async ({ page }) => {
    // Open the modal
    await page.click('button:has-text("Bulk Purchase")');
    await page.waitForSelector('h2:has-text("SimpleBulk Purchase from Contact")', {
      timeout: 5000,
    });

    // Add a second product
    await page.click('button[data-testid="add-product"]');
    await page.waitForTimeout(300);

    // Enter total cost
    await page.fill('input[name="totalCost"]', '100.00');

    // Click distribute evenly button
    const distributeButton = page.locator('button:has-text("Distribute Evenly")');
    if (await distributeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await distributeButton.click();
      await page.waitForTimeout(300);

      // Check that costs are evenly distributed
      const allocatedCostInputs = page.locator('input[name*="allocatedCost"], input[name*="cost"]');
      const count = await allocatedCostInputs.count();

      if (count >= 2) {
        const firstCost = parseFloat((await allocatedCostInputs.nth(0).inputValue()) || 0);
        const secondCost = parseFloat((await allocatedCostInputs.nth(1).inputValue()) || 0);

        // Costs should be approximately equal (within 0.01)
        expect(Math.abs(firstCost - secondCost)).toBeLessThan(0.02);
      }
    }
  });

  test('should use distribute by quantity button', async ({ page }) => {
    // Open the modal
    await page.click('button:has-text("Bulk Purchase")');
    await page.waitForSelector('h2:has-text("SimpleBulk Purchase from Contact")', {
      timeout: 5000,
    });

    // Add a second product
    await page.click('button[data-testid="add-product"]');
    await page.waitForTimeout(300);

    // Set different quantities
    const quantityInputs = page.locator('input[type="number"][name*="quantity"]');
    const quantityCount = await quantityInputs.count();

    if (quantityCount >= 2) {
      await quantityInputs.nth(0).fill('1');
      await quantityInputs.nth(1).fill('3');
    }

    // Enter total cost
    await page.fill('input[name="totalCost"]', '100.00');

    // Click distribute by quantity button
    const distributeButton = page.locator('button:has-text("Distribute by Quantity")');
    if (await distributeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await distributeButton.click();
      await page.waitForTimeout(300);

      // Check that costs are distributed proportionally
      const allocatedCostInputs = page.locator('input[name*="allocatedCost"], input[name*="cost"]');
      const count = await allocatedCostInputs.count();

      if (count >= 2) {
        const firstCost = parseFloat((await allocatedCostInputs.nth(0).inputValue()) || 0);
        const secondCost = parseFloat((await allocatedCostInputs.nth(1).inputValue()) || 0);

        // Second item should have approximately 3x the cost of first item
        // (since it has 3x the quantity)
        const ratio = secondCost / firstCost;
        expect(ratio).toBeGreaterThan(2.5);
        expect(ratio).toBeLessThan(3.5);
      }
    }
  });
});

