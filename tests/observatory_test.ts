import test, { expect } from "playwright/test";

test("has meta description", async ({ page }) => {
    await page.goto("/");
    const metaDescription = page.locator('meta[name="description"]');
    expect(await metaDescription.getAttribute("content")).toBe("Keep track of deadlines");
})
