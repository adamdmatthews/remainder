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
	const deadlineInSeconds = await getDeadlineInSeconds(page);
	const countdownInSeconds = await getCountdownInSeconds(page);
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

function getTaskRows(page: Page) {
	return page.getByRole('table').locator('tbody').locator('tr');
}

test('starts with no tasks', async ({ page }) => {
	const tasks = getTaskRows(page);
	await expect(tasks).toHaveCount(0);
})

test('can add a task', async ({ page }) => {
	const addButton = page.getByText('Add task');
	await addButton.click();
	const tasks = getTaskRows(page);
	await expect(tasks).toHaveCount(1);
})

test('can add multiple tasks', async ({ page }) => {
	const addButton = page.getByText('Add task');
	for (let i = 0; i < 3; i++) {
		await addButton.click();
	}
	const tasks = getTaskRows(page);
	await expect(tasks).toHaveCount(3);
})

test('can delete a task', async ({ page }) => {
	const addButton = page.getByText('Add task');
	await addButton.click();
	const task = getTaskRows(page).nth(0);
	const deleteButton = task.getByRole('button');
	await deleteButton.click();
	const tasks = getTaskRows(page);
	await expect(tasks).toHaveCount(0);
})

test('deletes correct task', async ({ page }) => {
	const addButton = page.getByText('Add task');
	for (let i = 0; i < 3; i++) {
		await addButton.click();
	}
	const tasks = getTaskRows(page);

	const task1Title = await tasks.nth(0).locator('td').nth(0).textContent();
	const task2Title = await tasks.nth(1).locator('td').nth(0).textContent();
	const task3Title = await tasks.nth(2).locator('td').nth(0).textContent();

	const task2delete = tasks.nth(1).getByRole('button');
	await task2delete.click();

	const table = page.getByRole('table');
	await expect(table).toContainText(task1Title!);
	await expect(table).not.toContainText(task2Title!);
	await expect(table).toContainText(task3Title!);
})

test('created task deadline is deadline', async ({ page }) => {
	const addButton = page.getByText('Add task');
	await addButton.click();
	const tasks = getTaskRows(page);
	const taskDeadline = await tasks.nth(0).locator('td').nth(1).textContent();
	const timeRemaining = (await page.getByText('Time remaining: ').textContent())?.replace('Time remaining: ', '');
	expect(taskDeadline).toBe(timeRemaining);
})

test('task deadlines are distinct', async ({ page }) => {
	const addButton = page.getByText('Add task');
	for (let i = 0; i < 3; i++) {
		await addButton.click();
	}
	const tasks = getTaskRows(page);
	const task1Deadline = await tasks.nth(0).locator('td').nth(1).textContent();
	const task2Deadline = await tasks.nth(1).locator('td').nth(1).textContent();
	const task3Deadline = await tasks.nth(2).locator('td').nth(1).textContent();
	expect(task1Deadline).not.toBe(task2Deadline);
	expect(task1Deadline).not.toBe(task3Deadline);
	expect(task2Deadline).not.toBe(task3Deadline);
})

test('task deadlines are max 1 second different', async ({ page }) => {
	// this test is ugly and won't work near midnight
	// it needs fixing at some point
	const addButton = page.getByText('Add task');
	for (let i = 0; i < 5; i++) {
		await addButton.click();
	}
	const regex = /(?<hours>\d+)h (?<minutes>\d+)m (?<seconds>\d+)s/;
	const deadlineText = await Promise.all((await getTaskRows(page).all()).map(async (task) => task.locator('td').nth(1).textContent()));
	const deadlineSeconds = await Promise.all(deadlineText.map((text) => getSeconds(regex, text!)));
	for (let i = 2; i < deadlineSeconds.length; i++) {
		const firstDifference = deadlineSeconds[i] - deadlineSeconds[i - 1];
		const secondDifference = deadlineSeconds[i - 1] - deadlineSeconds[i - 2];
		expect(Math.abs(firstDifference - secondDifference)).toBeLessThanOrEqual(1);
	}
})
