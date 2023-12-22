import { expect, test, type Page } from '@playwright/test';
import { hoursToSeconds, minutesToSeconds } from 'date-fns';

// I'd like a cleaner way to handle time in tests
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

async function getSeconds(regExp: RegExp, text: string) {
	const match = regExp.exec(text);
	const hours = parseInt(match!.groups!['hours']);
	const minutes = parseInt(match!.groups!['minutes']);
	const seconds = parseInt(match!.groups!['seconds']);
	return hoursToSeconds(hours) + minutesToSeconds(minutes) + seconds;
}

async function getTimeInSeconds(page: Page) {
	const timeRegex = /Time: (?<hours>\d{2}):(?<minutes>\d{2}):(?<seconds>\d{2})/;
	const time = await page.getByText('Time: ').textContent();
	return getSeconds(timeRegex, time!);
}

async function getDeadlineInSeconds(page: Page) {
	const deadlineRegex = /Deadline: (?<hours>\d{2}):(?<minutes>\d{2}):(?<seconds>\d{2})/;
	const deadline = await page.getByText('Deadline: ').textContent();
	return getSeconds(deadlineRegex, deadline!);
}

async function getCountdownInSeconds(page: Page) {
	const countdownRegex = /Time remaining: (?<hours>\d{1,2})h (?<minutes>\d{1,2})m (?<seconds>\d{1,2})s/;
	const countdown = await page.getByText('Time remaining: ').textContent();
	return getSeconds(countdownRegex, countdown!);
}

test('coundown plus current time is deadline', async ({ page }) => {
	const timeInSeconds = await getTimeInSeconds(page);
	const countdownInSeconds = await getCountdownInSeconds(page);
	// check if it's near midnight
	const deadlineInSeconds = timeInSeconds + countdownInSeconds < hoursToSeconds(24)
		? await getDeadlineInSeconds(page)
		: await getDeadlineInSeconds(page) + hoursToSeconds(24);
	expect(timeInSeconds + countdownInSeconds).toEqual(deadlineInSeconds);
})

test('deadline starts about an hour ahead', async ({ page }) => {
	const countdownInSeconds = await getCountdownInSeconds(page);
	expect(countdownInSeconds).toBeLessThanOrEqual(minutesToSeconds(65));
	expect(countdownInSeconds).toBeGreaterThanOrEqual(minutesToSeconds(55));
});

test('plus button increments deadline', async ({ page }) => {
	const incrementButton = page.getByText('+5');
	const originalDeadline = await getDeadlineInSeconds(page);
	await incrementButton.click();
	const newDeadline = await getDeadlineInSeconds(page);
	expect(newDeadline).toBe(originalDeadline + minutesToSeconds(5));
})

test('minus button decrements deadline', async ({ page }) => {
	const decrementButton = page.getByText('-5');
	const originalDeadline = await getDeadlineInSeconds(page);
	await decrementButton.click();
	const newDeadline = await getDeadlineInSeconds(page);
	expect(newDeadline).toBe(originalDeadline - minutesToSeconds(5));
})

test('reports missed deadline', async ({ page }) => {
	const decrementButton = page.getByText('-5');
	for (let i = 0; i < 13; i++) {
		await decrementButton.click();
	}
	await expect(page.getByText('Time remaining')).toContainText('Deadline passed');
})

test('reports deadline over a day', async ({ page }) => {
	const incrementButton = page.getByText('+5');
	for (let i = 0; i < 280; i++) {
		await incrementButton.click();
	}
	await expect(page.getByText('Time remaining')).toContainText('Over a day');
})
