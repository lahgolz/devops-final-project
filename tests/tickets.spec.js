import { expect, test } from '@playwright/test';

import { sleep } from '../test-helpers/sleep';

test.describe('Tickets List Page', () => {
	test.describe('Page Structure and UI', () => {
		test('should have correct page title', async ({ page }) => {
			await page.goto('/tickets');

			await expect(page).toHaveTitle('Tickets List');
		});

		test('should display main heading', async ({ page }) => {
			await page.goto('/tickets');

			await expect(page.locator('h1')).toContainText('Tickets List');
		});

		test('should have back link to form page', async ({ page }) => {
			await page.goto('/tickets');

			const backLink = page.locator('a[href="/"]');

			await expect(backLink).toBeVisible();
			await expect(backLink).toContainText('← Back');
		});

		test('should have refresh button', async ({ page }) => {
			await page.goto('/tickets');

			const refreshButton = page.locator('#refreshBtn');

			await expect(refreshButton).toBeVisible();
			await expect(refreshButton).toContainText('Refresh');
		});

		test('should show ticket count', async ({ page }) => {
			await page.goto('/tickets');

			const ticketCount = page.locator('#ticketCount');

			await expect(ticketCount).toBeVisible();
		});
	});

	test.describe('Tickets Loading and Display', () => {
		test('should load and display tickets successfully', async ({ page }) => {
			await page.route('/api/tickets', async (route) => {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						success: true,
						data: [
							{
								id: 1,
								email: 'user1@example.com',
								message: 'This is a test ticket message',
								created_at: '2024-01-15T10:30:00Z',
								type_name: 'bug',
							},
							{
								id: 2,
								email: 'user2@example.com',
								message: 'Another ticket with a longer message that spans multiple lines',
								created_at: '2024-01-14T15:45:00Z',
								type_name: 'question',
							},
							{
								id: 3,
								email: 'user3@example.com',
								message: 'A suggestion for improvement',
								created_at: '2024-01-13T09:15:00Z',
								type_name: 'suggestion',
							},
						],
					}),
				});
			});

			await page.goto('/tickets');

			await expect(page.locator('#ticketsContainer')).toBeVisible();

			await expect(page.locator('#ticketCount')).toContainText('Total tickets: 3');

			const ticketCards = page.locator('.ticket-card');
			await expect(ticketCards).toHaveCount(3);

			const firstTicket = ticketCards.first();

			await expect(firstTicket.locator('.ticket-id')).toContainText('Ticket #1');
			await expect(firstTicket.locator('.ticket-email')).toContainText('user1@example.com');
			await expect(firstTicket.locator('.ticket-message')).toContainText('This is a test ticket message');
			await expect(firstTicket.locator('.ticket-type')).toContainText('bug');
		});

		test('should display no tickets message when empty', async ({ page }) => {
			await page.route('/api/tickets', async (route) => {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						success: true,
						data: [],
					}),
				});
			});

			await page.goto('/tickets');

			await expect(page.locator('#noTickets')).toBeVisible();
			await expect(page.locator('#noTickets')).toContainText('No tickets found.');
			await expect(page.locator('#ticketCount')).toContainText('No tickets found');
		});

		test('should handle API error gracefully', async ({ page }) => {
			await page.route('/api/tickets', async (route) => {
				await route.fulfill({
					status: 500,
					contentType: 'application/json',
					body: JSON.stringify({
						success: false,
						error: 'Internal server error',
					}),
				});
			});

			await page.goto('/tickets');

			await expect(page.locator('#message')).toBeVisible();
			await expect(page.locator('#message')).toContainText('Failed to load tickets');
		});

		test('should handle network error gracefully', async ({ page }) => {
			await page.route('/api/tickets', async (route) => {
				await route.abort();
			});

			await page.goto('/tickets');

			await expect(page.locator('#message')).toBeVisible();
			await expect(page.locator('#message')).toContainText('Failed to load tickets');
		});

		test('should handle 401 authentication error', async ({ page }) => {
			await page.route('/api/tickets', async (route) => {
				await route.fulfill({
					status: 401,
					contentType: 'application/json',
					body: JSON.stringify({
						success: false,
						error: 'Unauthorized',
					}),
				});
			});

			await page.goto('/tickets');

			await expect(page.locator('#message')).toBeVisible();
			await expect(page.locator('#message')).toContainText('Authentication required');
		});
	});

	test.describe('Ticket Card Styling and Types', () => {
		test.beforeEach(async ({ page }) => {
			// Skip this test in webkit due to basic auth handling differences
			// test.skip(browserName === 'webkit', 'Webkit handles basic auth differently');

			await page.route('/api/tickets', async (route) => {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						success: true,
						data: [
							{
								id: 1,
								email: 'bug@example.com',
								message: 'Bug report message',
								created_at: '2024-01-15T10:30:00Z',
								type_name: 'bug',
							},
							{
								id: 2,
								email: 'question@example.com',
								message: 'Question message',
								created_at: '2024-01-14T15:45:00Z',
								type_name: 'question',
							},
							{
								id: 3,
								email: 'suggestion@example.com',
								message: 'Suggestion message',
								created_at: '2024-01-13T09:15:00Z',
								type_name: 'suggestion',
							},
						],
					}),
				});
			});

			await page.goto('/tickets');
		});

		test('should display different ticket type styles', async ({ page }) => {
			const ticketCards = page.locator('.ticket-card');
			await expect(ticketCards).toHaveCount(3);

			const bugTicket = ticketCards.first();
			await expect(bugTicket.locator('.ticket-type')).toHaveClass(/type-bug/);

			const questionTicket = ticketCards.nth(1);
			await expect(questionTicket.locator('.ticket-type')).toHaveClass(/type-question/);

			const suggestionTicket = ticketCards.nth(2);
			await expect(suggestionTicket.locator('.ticket-type')).toHaveClass(/type-suggestion/);
		});

		test('should format dates correctly', async ({ page }) => {
			const firstTicket = page.locator('.ticket-card').first();
			const dateElement = firstTicket.locator('.ticket-date');

			await expect(dateElement).toBeVisible();
			await expect(dateElement).toContainText('Created:');
			await expect(dateElement).toContainText(/\w{3} \d{1,2}, \d{4}/);
		});

		test('should display ticket content correctly', async ({ page }) => {
			const tickets = page.locator('.ticket-card');

			for (let index = 0; index < 3; index++) {
				const ticket = tickets.nth(index);

				await expect(ticket.locator('.ticket-id')).toBeVisible();
				await expect(ticket.locator('.ticket-email')).toBeVisible();
				await expect(ticket.locator('.ticket-message')).toBeVisible();
				await expect(ticket.locator('.ticket-type')).toBeVisible();
				await expect(ticket.locator('.ticket-date')).toBeVisible();
			}
		});
	});

	test.describe('Refresh Functionality', () => {
		test('should refresh tickets when refresh button is clicked', async ({ page }) => {
			let callCount = 0;

			await page.route('/api/tickets', async (route) => {
				callCount++;

				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						success: true,
						data:
							callCount === 1
								? [
										{
											id: 1,
											email: 'initial@example.com',
											message: 'Initial ticket',
											created_at: '2024-01-15T10:30:00Z',
											type_name: 'bug',
										},
									]
								: [
										{
											id: 1,
											email: 'initial@example.com',
											message: 'Initial ticket',
											created_at: '2024-01-15T10:30:00Z',
											type_name: 'bug',
										},
										{
											id: 2,
											email: 'new@example.com',
											message: 'New ticket after refresh',
											created_at: '2024-01-15T11:00:00Z',
											type_name: 'question',
										},
									],
					}),
				});
			});

			await page.goto('/tickets');

			await expect(page.locator('#ticketCount')).toContainText('Total tickets: 1');

			await page.click('#refreshBtn');

			await expect(page.locator('#ticketCount')).toContainText('Total tickets: 2');
			await expect(page.locator('.ticket-card')).toHaveCount(2);
		});

		test('should disable refresh button during loading', async ({ page }) => {
			await page.route('/api/tickets', async (route) => {
				await sleep(1000);
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						success: true,
						data: [],
					}),
				});
			});

			await page.goto('/tickets');

			await page.click('#refreshBtn');

			await expect(page.locator('#refreshBtn')).toBeDisabled();
			await expect(page.locator('#refreshBtn')).toContainText('Loading...');

			await page.waitForTimeout(1500);
			await expect(page.locator('#refreshBtn')).toBeEnabled();
			await expect(page.locator('#refreshBtn')).toContainText('Refresh');
		});
	});

	test.describe('Message Auto-Hide', () => {
		test('should auto-hide error message after 5 seconds', async ({ page }) => {
			await page.route('/api/tickets', async (route) => {
				await route.fulfill({
					status: 500,
					contentType: 'application/json',
					body: JSON.stringify({ success: false }),
				});
			});

			await page.goto('/tickets');

			await expect(page.locator('#message')).toBeVisible();

			await page.waitForTimeout(5500);
			await expect(page.locator('#message')).toBeHidden();
		});
	});

	test.describe('Navigation', () => {
		test('should navigate back to form page when clicking back link', async ({ page }) => {
			await page.goto('/tickets');

			await page.click('a[href="/"]');

			await expect(page.locator('h1')).toContainText('Create New Ticket');
		});
	});

	test.describe('Error Handling Edge Cases', () => {
		test('should handle malformed JSON response', async ({ page }) => {
			await page.route('/api/tickets', async (route) => {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: 'invalid json response',
				});
			});

			await page.goto('/tickets');

			await expect(page.locator('#message')).toBeVisible();
			await expect(page.locator('#message')).toContainText('Failed to load tickets');
		});

		test('should handle response with missing data field', async ({ page }) => {
			await page.route('/api/tickets', async (route) => {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						success: true,
					}),
				});
			});

			await page.goto('/tickets');

			await expect(page.locator('#message')).toBeVisible();
			await expect(page.locator('#message')).toContainText('Failed to load tickets');
		});
	});
});
