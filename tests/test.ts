import { expect, test } from '@playwright/test';

// I'd like a cleaner way to handle the current time in tests
// but I guess this is good enough for now, flaky tests can just be rerun

test.beforeEach(async ({ page }) => {
	await page.goto('/');
})

test('page has correct title', async ({ page }) => {
	await expect(page).toHaveTitle('remainder');
});

test.describe(() => {
	test.describe.configure({ retries: 3 });
	test('clock gets current time', async ({ page }) => {
		const date = new Date();
		const clockElement = page.getByText('Time: ');
		await expect(clockElement).toContainText(date.toLocaleTimeString('en-GB'));
	});
})
