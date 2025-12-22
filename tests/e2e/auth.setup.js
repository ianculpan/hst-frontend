import { test as setup, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
dotenv.config({ path: resolve(process.cwd(), '.env') });

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL || 'test@prospect-it.co.uk';
  const password = process.env.TEST_USER_PASSWORD || 'password';
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

  // Navigate to login page
  await page.goto(`${baseURL}/login`);

  // Wait for login form to be visible
  await page.waitForSelector('input#email', { timeout: 10000 });
  await page.waitForSelector('input#password', { timeout: 10000 });

  // Fill in login form using specific IDs
  await page.fill('input#email', email);
  await page.fill('input#password', password);

  // Click submit button
  await page.click('button[type="submit"]');

  // Wait a bit for the form to process
  await page.waitForTimeout(2000);

  // Check if 2FA is required (check for twoFactorCode input)
  const twoFactorInput = page.locator('input#twoFactorCode');
  const is2FAVisible = await twoFactorInput.isVisible({ timeout: 3000 }).catch(() => false);

  if (is2FAVisible) {
    // If 2FA is required, provide the code
    const twoFactorCode = process.env.TEST_2FA_CODE || '';
    if (twoFactorCode) {
      await page.fill('input#twoFactorCode', twoFactorCode);
      await page.click('button[type="submit"]');

      // Wait for auth token to appear after 2FA (more reliable than URL change)
      await page.waitForFunction(() => localStorage.getItem('auth_token') !== null, {
        timeout: 10000,
      });
    } else {
      throw new Error(
        '2FA code required but TEST_2FA_CODE not set in environment variables. Please set TEST_2FA_CODE in your .env file or disable 2FA for the test user.'
      );
    }
  } else {
    // No 2FA - wait for auth token to appear in localStorage (more reliable than URL change)
    try {
      // Wait for auth token to appear - this is the most reliable indicator of successful login
      await page.waitForFunction(() => localStorage.getItem('auth_token') !== null, {
        timeout: 10000,
      });
    } catch {
      // If token doesn't appear, check for error messages
      const authTokenCheck = await page.evaluate(() => localStorage.getItem('auth_token'));
      if (!authTokenCheck) {
        const errorMessage = page.locator('text=/error/i, text=/invalid/i, text=/failed/i');
        const hasError = await errorMessage.isVisible({ timeout: 1000 }).catch(() => false);
        if (hasError) {
          throw new Error('Login failed - check credentials and error messages on the page');
        }
        throw new Error(
          'Login timeout - auth_token not found. Check credentials and ensure login was successful.'
        );
      }
    }
  }

  // Verify we're logged in by checking for auth token in localStorage
  const authToken = await page.evaluate(() => localStorage.getItem('auth_token'));
  if (!authToken) {
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/auth-failed.png' });
    throw new Error(
      'Authentication failed - auth_token not found in localStorage. Check credentials and ensure login was successful.'
    );
  }
  expect(authToken).toBeTruthy();

  // Save signed-in state
  await page.context().storageState({ path: authFile });
});
