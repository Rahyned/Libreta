import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.describe("Tema oscuro", () => {
  test("alterna a oscuro y persiste al recargar", async ({ page }) => {
    await page.goto("/#/ajustes");

    const isDark = () =>
      page.evaluate(() =>
        document.documentElement.classList.contains("dark")
      );

    await expect(page.getByRole("heading", { name: "Ajustes" })).toBeVisible();
    await expect(await isDark()).toBe(false);

    await page.getByRole("button", { name: "Oscuro" }).click();
    await expect(await isDark()).toBe(true);

    await page.reload();
    await expect(await isDark()).toBe(true);

    await page.getByRole("button", { name: "Claro" }).click();
    await expect(await isDark()).toBe(false);
  });
});