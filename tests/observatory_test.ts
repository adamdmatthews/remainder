import test, { expect } from "playwright/test";

test("has meta description", async ({ page }) => {
    await page.goto("/");
    const metaDescription = page.locator('meta[name="description"]');
    expect(await metaDescription.getAttribute("content")).toBe("Keep track of deadlines");
})

test("has security policy header", async ({ page }) => {
    const response = await page.goto("/");
    const headers = response!.headers()!;
    expect(headers["content-security-policy"]).toContain("default-src 'none'");
})

test("no console errors", async ({ page }) => {
    let errors: string[] = [];
    page.on("console", (msg) => {
        if (msg.type() === "error") {
            errors.push(msg.text());
        }
    });
    await page.goto("/");
    expect(errors).toEqual([]);
})
