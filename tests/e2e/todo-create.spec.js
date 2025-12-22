import { test, expect } from '@playwright/test';

// Use the authenticated state from setup
test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Todo Creation', () => {
  test('should create a new todo entry', async ({ page }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
    const testTodo = {
      task: `Test Todo ${Date.now()}`,
      description: 'This is a test todo created by Playwright',
      category: '', // Will be set after categories load
      status: '', // Will be set after status loads
      priority: '5',
    };

    // Navigate to todo list page
    await page.goto(`${baseURL}/todo`);

    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Todo List")', { timeout: 10000 });

    // Click the "Add New" button
    await page.click('button:has-text("Add New")');

    // Wait for the modal to appear
    await page.waitForSelector('h2:has-text("Create Todo")', { timeout: 5000 });

    // Wait for categories and status to load
    await page.waitForSelector('select#category:not([disabled])', { timeout: 10000 });
    await page.waitForSelector('select#status:not([disabled])', { timeout: 10000 });

    // Fill in the task field
    await page.fill('input#task', testTodo.task);

    // Fill in the description field
    await page.fill('input#description', testTodo.description);

    // Select a category (select the first available option that's not the placeholder)
    const categorySelect = page.locator('select#category');
    const categoryOptions = await categorySelect.locator('option').all();
    if (categoryOptions.length > 1) {
      // Skip the first option (placeholder) and select the second
      const firstCategoryValue = await categoryOptions[1].getAttribute('value');
      await categorySelect.selectOption(firstCategoryValue);
      testTodo.category = firstCategoryValue;
    }

    // Select a status (select the first available option that's not the placeholder)
    const statusSelect = page.locator('select#status');
    const statusOptions = await statusSelect.locator('option').all();
    if (statusOptions.length > 1) {
      // Skip the first option (placeholder) and select the second
      const firstStatusValue = await statusOptions[1].getAttribute('value');
      await statusSelect.selectOption(firstStatusValue);
      testTodo.status = firstStatusValue;
    }

    // Select priority (default is 5, but let's set it explicitly)
    await page.selectOption('select#priority', testTodo.priority);

    // Submit the form
    await page.click('button[type="submit"]:has-text("Save")');

    // Wait for success message or modal to close
    await page
      .waitForSelector('text=Todo updated successfully', { timeout: 10000 })
      .catch(async () => {
        // If success message doesn't appear, wait for modal to close
        await page.waitForSelector('h2:has-text("Create Todo")', {
          state: 'hidden',
          timeout: 10000,
        });
      });

    // Verify the todo appears in the list
    // Wait for the page to refresh/update
    await page.waitForTimeout(1000);

    // Check if the new todo is visible in the list
    const todoCard = page.locator(`text=${testTodo.task}`).first();
    await expect(todoCard).toBeVisible({ timeout: 10000 });

    // Verify the todo details are correct
    const todoCardContainer = todoCard.locator('..').locator('..').locator('..');
    await expect(todoCardContainer.locator(`text=${testTodo.description}`)).toBeVisible();
  });

  test('should show validation errors for required fields', async ({ page }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

    // Navigate to todo list page
    await page.goto(`${baseURL}/todo`);

    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Todo List")', { timeout: 10000 });

    // Click the "Add New" button
    await page.click('button:has-text("Add New")');

    // Wait for the modal to appear
    await page.waitForSelector('h2:has-text("Create Todo")', { timeout: 5000 });

    // Try to submit without filling required fields
    await page.click('button[type="submit"]:has-text("Save")');

    // HTML5 validation should prevent submission
    // Check if the form is still visible (not submitted)
    await expect(page.locator('h2:has-text("Create Todo")')).toBeVisible();
  });

  test('should close modal on cancel', async ({ page }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

    // Navigate to todo list page
    await page.goto(`${baseURL}/todo`);

    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Todo List")', { timeout: 10000 });

    // Click the "Add New" button
    await page.click('button:has-text("Add New")');

    // Wait for the modal to appear
    await page.waitForSelector('h2:has-text("Create Todo")', { timeout: 5000 });

    // Fill in some data
    await page.fill('input#task', 'Test task');

    // Look for a cancel/close button - if it exists, click it
    // Otherwise, click outside the modal or press Escape
    const cancelButton = page.locator('button:has-text("Cancel")');
    if (await cancelButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await cancelButton.click();
    } else {
      // Press Escape to close modal
      await page.keyboard.press('Escape');
    }

    // Verify modal is closed
    await expect(page.locator('h2:has-text("Create Todo")')).not.toBeVisible({ timeout: 5000 });
  });
});
