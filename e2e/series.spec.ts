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

test.describe("Series", () => {
  test("muestra las series semilla con badge, temporadas y estado", async ({
    page,
  }) => {
    await page.goto("/#/series");
    await expect(
      page.getByRole("heading", { name: "Nuestras series" })
    ).toBeVisible();

    for (const title of ["The Bear", "Arcane"]) {
      await expect(
        page.getByRole("heading", { name: title })
      ).toBeVisible();
    }

    const bear = page.locator("article").filter({ hasText: "The Bear" });
    await expect(bear.getByText("Serie")).toBeVisible();
    await expect(bear.getByText("3 temporadas")).toBeVisible();
    await expect(bear.getByText("Completada")).toBeVisible();
  });

  test("agrega una serie con temporadas y estado y la califica", async ({
    page,
  }) => {
    await page.goto("/#/series");
    await page.getByRole("button", { name: "Agregar serie" }).click();

    await page.getByPlaceholder("Ej. The Bear").fill("Severance");
    await page.getByPlaceholder("2023").fill("2022");
    await page.getByPlaceholder("3", { exact: true }).fill("2");
    await page
      .locator("select")
      .filter({ hasText: "En curso" })
      .selectOption("En curso");
    await page.getByRole("button", { name: "Agregar", exact: true }).click();

    await page
      .getByRole("button", { name: "4 estrellas o media" })
      .click();
    await page.getByRole("button", { name: "Guardar" }).click();

    const card = page.locator("article").filter({ hasText: "Severance" });
    await expect(card).toBeVisible();
    await expect(card.getByText("Serie")).toBeVisible();
    await expect(card.getByText("2 temporadas")).toBeVisible();
    await expect(card.getByText("En curso")).toBeVisible();
  });

  test("aparece con badge en la comparación y el filtro la separa", async ({
    page,
  }) => {
    await page.goto("/#/comparacion");
    await expect(
      page.getByRole("heading", { name: "Comparación" })
    ).toBeVisible();

    const row = page
      .locator("div.divide-y > div")
      .filter({ hasText: "The Bear" });
    await expect(row.getByText("Serie")).toBeVisible();

    await page.getByRole("button", { name: "Películas", exact: true }).click();
    await expect(page.getByText("The Bear").first()).not.toBeVisible();
  });
});