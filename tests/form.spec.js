import { expect, test } from '@playwright/test';

test.describe('Ticket Creation Form', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test.describe('Page Structure and UI', () => {
		test('should have correct page title', async ({ page }) => {
			await expect(page).toHaveTitle('New Tickets');
		});

		test('should display main heading', async ({ page }) => {
			await expect(page.locator('h1')).toContainText('Create New Ticket');
		});

		test('should have link to tickets page', async ({ page }) => {
			const ticketsLink = page.locator('a[href="/tickets"]');
			await expect(ticketsLink).toBeVisible();
			await expect(ticketsLink).toContainText('View All Tickets (Admin)');
		});

		test('should have all form fields', async ({ page }) => {
			await expect(page.locator('#typeId')).toBeVisible();
			await expect(page.locator('#email')).toBeVisible();
			await expect(page.locator('#message')).toBeVisible();
			await expect(page.locator('button[type="submit"]')).toBeVisible();
		});

		test('should have correct form field labels', async ({ page }) => {
			await expect(page.locator('label[for="typeId"]')).toContainText('Ticket Type:');
			await expect(page.locator('label[for="email"]')).toContainText('Email:');
			await expect(page.locator('label[for="message"]')).toContainText('Message:');
		});

		test('should have correct placeholders', async ({ page }) => {
			await expect(page.locator('#email')).toHaveAttribute('placeholder', 'your.email@example.com');
			await expect(page.locator('#message')).toHaveAttribute(
				'placeholder',
				'Please describe your issue or question...',
			);
		});

		test('should have submit button with correct text', async ({ page }) => {
			await expect(page.locator('#submitBtn')).toContainText('Create Ticket');
		});
	});

	test.describe('Ticket Types Loading', () => {
		test('should load ticket types successfully', async ({ page }) => {
			await page.waitForFunction(() => {
				const select = document.querySelector('#typeId');

				return select && select.options.length > 1;
			});

			const typeSelect = page.locator('#typeId');
			const options = await typeSelect.locator('option').all();

			expect(options.length).toBeGreaterThan(1);

			await expect(typeSelect.locator('option').first()).toContainText('Select a type...');
		});

		test('should handle ticket types loading error gracefully', async ({ page }) => {
			await page.route('/api/ticket-types', async (route) => {
				await route.fulfill({
					status: 500,
					contentType: 'application/json',
					body: JSON.stringify({ success: false, error: 'Server error' }),
				});
			});

			await page.reload();

			await expect(page.locator('#notification')).toBeVisible();
			await expect(page.locator('#notification')).toContainText('Failed to load ticket types');

			const typeSelect = page.locator('#typeId');

			await expect(typeSelect.locator('option')).toContainText('Error loading types');
		});
	});

	test.describe('Form Validation', () => {
		test('should show validation errors from server', async ({ page }) => {
			await page.route('/api/new-ticket', async (route) => {
				await route.fulfill({
					status: 400,
					contentType: 'application/json',
					body: JSON.stringify({
						success: false,
						errors: ['Invalid email format', 'Message too short'],
					}),
				});
			});

			await page.waitForFunction(() => {
				const select = document.querySelector('#typeId');

				return select && select.options.length > 1;
			});

			await page.selectOption('#typeId', { index: 1 });
			await page.fill('#email', 'test@example.com');
			await page.fill('#message', 'A');

			await page.click('#submitBtn');

			await expect(page.locator('#notification')).toBeVisible();
			await expect(page.locator('#notification')).toContainText('Message too short');
		});
	});

	test.describe('Successful Form Submission', () => {
		test('should successfully create ticket with valid data', async ({ page }) => {
			await page.route('/api/new-ticket', async (route) => {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						success: true,
						message: 'Ticket created successfully',
					}),
				});
			});

			await page.waitForFunction(() => {
				const select = document.querySelector('#typeId');

				return select && select.options.length > 1;
			});

			await page.selectOption('#typeId', { index: 1 });
			await page.fill('#email', 'test@example.com');
			await page.fill('#message', 'This is a test message');

			await page.click('#submitBtn');

			await expect(page.locator('#notification')).toBeVisible();
			await expect(page.locator('#notification')).toContainText('Ticket created successfully!');

			await expect(page.locator('#email')).toHaveValue('');
			await expect(page.locator('#message')).toHaveValue('');
			await expect(page.locator('#typeId')).toHaveValue('');
		});

		test('should handle server error gracefully', async ({ page }) => {
			await page.route('/api/new-ticket', async (route) => {
				await route.fulfill({
					status: 500,
					contentType: 'application/json',
					body: JSON.stringify({
						success: false,
						error: 'Internal server error',
					}),
				});
			});

			await page.waitForFunction(() => {
				const select = document.querySelector('#typeId');

				return select && select.options.length > 1;
			});

			await page.selectOption('#typeId', { index: 1 });
			await page.fill('#email', 'test@example.com');
			await page.fill('#message', 'This is a test message');

			await page.click('#submitBtn');

			await page.waitForSelector('#notification:not([style*="display: none"])', { timeout: 10_000 });
			await expect(page.locator('#notification')).toBeVisible();
			await expect(page.locator('#notification')).toContainText('Failed to create ticket');
		});

		test('should handle network error gracefully', async ({ page }) => {
			await page.route('/api/new-ticket', async (route) => {
				await route.abort();
			});

			await page.waitForFunction(() => {
				const select = document.querySelector('#typeId');

				return select && select.options.length > 1;
			});

			await page.selectOption('#typeId', { index: 1 });
			await page.fill('#email', 'test@example.com');
			await page.fill('#message', 'This is a test message');

			await page.click('#submitBtn');

			await page.waitForSelector('#notification:not([style*="display: none"])', { timeout: 10_000 });
			await expect(page.locator('#notification')).toBeVisible();
			await expect(page.locator('#notification')).toContainText('An error occurred while creating the ticket');
		});
	});

	test.describe('Button States', () => {
		test('should disable submit button during submission', async ({ page }) => {
			await page.route('/api/new-ticket', async (route) => {
				// Add delay to simulate slow response
				await page.waitForTimeout(1000);
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({ success: true }),
				});
			});

			await page.waitForFunction(() => {
				const select = document.querySelector('#typeId');

				return select && select.options.length > 1;
			});

			await page.selectOption('#typeId', { index: 1 });
			await page.fill('#email', 'test@example.com');
			await page.fill('#message', 'This is a test message');

			await page.click('#submitBtn');

			await expect(page.locator('#submitBtn')).toBeDisabled();
			await expect(page.locator('#submitBtn')).toContainText('Creating Ticket...');

			await page.waitForTimeout(1500);
			await expect(page.locator('#submitBtn')).toBeEnabled();
			await expect(page.locator('#submitBtn')).toContainText('Create Ticket');
		});
	});

	test.describe('Message Auto-Hide', () => {
		test('should auto-hide success message after 5 seconds', async ({ page }) => {
			await page.route('/api/new-ticket', async (route) => {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({ success: true }),
				});
			});

			await page.waitForFunction(() => {
				const select = document.querySelector('#typeId');

				return select && select.options.length > 1;
			});

			await page.selectOption('#typeId', { index: 1 });
			await page.fill('#email', 'test@example.com');
			await page.fill('#message', 'This is a test message');

			await page.click('#submitBtn');

			await expect(page.locator('#notification')).toBeVisible();

			await page.waitForTimeout(5500);
			await expect(page.locator('#notification')).toBeHidden();
		});
	});

	test.describe('Navigation', () => {
		test('should navigate to tickets page when clicking admin link', async ({ page }) => {
			await page.click('a[href="/tickets"]');

			expect(page.url()).toContain('/tickets');
		});
	});
});
