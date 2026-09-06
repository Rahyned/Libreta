import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.describe("Navegación", () => {
  test("recorre las cinco secciones desde el sidebar", async ({ page }) => {
    const links = [
      ["Películas", "/", "Nuestras películas"],
      ["Series", "/#/series", "Nuestras series"],
      ["Watchlist", "/#/watchlist", "Watchlist"],
      ["Comparación", "/#/comparacion", "Comparación"],
      ["Ajustes", "/#/ajustes", "Ajustes"],
    ];

    await page.goto("/");
    for (const [label, url, heading] of links) {
      await page.getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(new RegExp(url.replace(/^\//, "") + "$"));
      await expect(
        page.getByRole("heading", { name: heading, exact: true })
      ).toBeVisible();
    }
  });

  test("mantiene la ruta activa al abrir de nuevo", async ({ page }) => {
    await page.goto("/#/comparacion");
    await expect(
      page.getByRole("heading", { name: "Comparación" })
    ).toBeVisible();
  });
});