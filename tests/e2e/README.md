# Playwright E2E Tests

This directory contains end-to-end tests for the application using Playwright.

## Setup

1. Install Playwright browsers (if not already installed):
   ```bash
   npx playwright install
   ```

2. Create a `.env` file in the project root with test credentials:
   ```env
   TEST_USER_EMAIL=your-test-email@example.com
   TEST_USER_PASSWORD=your-test-password
   TEST_2FA_CODE=your-2fa-code  # Optional, only if 2FA is enabled for test user
   PLAYWRIGHT_BASE_URL=http://localhost:5173  # Optional, defaults to localhost:5173
   ```

## Running Tests

### Run all E2E tests:
```bash
npm run test:e2e
```

### Run tests with UI mode (interactive):
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser):
```bash
npm run test:e2e:headed
```

### Debug tests:
```bash
npm run test:e2e:debug
```

### Run only the auth setup:
```bash
npm run test:e2e:setup
```

## Test Structure

- `auth.setup.js` - Authentication setup that runs before tests to create a logged-in session
- `todo-create.spec.js` - Tests for creating todo entries

## Authentication

The tests use a setup file (`auth.setup.js`) that authenticates once and saves the session state. This authenticated state is then reused by all tests, making them faster and more reliable.

The auth state is saved to `playwright/.auth/user.json` (which is gitignored).

## Writing New Tests

1. Create a new test file in `tests/e2e/` with the pattern `*.spec.js`
2. Use the authenticated state by adding at the top:
   ```javascript
   test.use({ storageState: 'playwright/.auth/user.json' });
   ```
3. Or if you need a fresh session, omit the storageState line

## Troubleshooting

### Tests fail with authentication errors
- Make sure your `.env` file has correct `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`
- Run `npm run test:e2e:setup` to regenerate the auth state
- Check that the test user account exists and is active

### Tests can't find elements
- Make sure the dev server is running or set `PLAYWRIGHT_BASE_URL` to your deployed URL
- Check that selectors match the current UI (use Playwright's codegen: `npx playwright codegen`)

### 2FA issues
- If your test user has 2FA enabled, set `TEST_2FA_CODE` in `.env`
- Consider disabling 2FA for test users in your test environment
- The auth setup will handle 2FA automatically if `TEST_2FA_CODE` is provided

