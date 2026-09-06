import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.route(/wikipedia\.org/, (route) => route.abort());
});

test.afterEach(async ({ page }) => {
  await page.unroute(/wikipedia\.org/);
});

test.describe("Watchlist", () => {
  test("empieza vacía con las películas semilla ya vistas", async ({ page }) => {
    await page.goto("/#/watchlist");
    await expect(page.getByRole("heading", { name: "Watchlist" })).toBeVisible();
    await expect(page.getByText("Watchlist vacía")).toBeVisible();
  });

  test("agrega una película pendiente y la marca como vista", async ({ page }) => {
    await page.goto("/#/watchlist");
    await page
      .getByRole("button", { name: "Agregar a la watchlist" })
      .click();

    await page.getByPlaceholder("Ej. Oppenheimer").fill("Dune");
    await page
      .getByRole("button", { name: "Aún no la vimos (en la watchlist)" })
      .click();
    await page.getByRole("button", { name: "Agregar", exact: true }).click();

    const item = page.locator('[class*="paper-card"]').filter({ hasText: "Dune" });
    await expect(item.getByRole("heading", { name: "Dune" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Marcar como vista" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Marcar como vista" }).click();
    await expect(page.getByText("Watchlist vacía")).toBeVisible();

    await page.goto("/");
    const card = page.locator("article").filter({ hasText: "Dune" });
    await expect(card).toBeVisible();
    await expect(card.getByText("Por ver")).not.toBeVisible();
  });
});