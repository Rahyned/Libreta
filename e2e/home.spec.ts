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

test.describe("Home", () => {
  test("muestra las películas semilla con sus ratings", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Nuestras películas" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Agregar película" })).toBeVisible();

    for (const title of [
      "Oppenheimer",
      "Everything Everywhere All at Once",
      "In the Mood for Love",
      "Spirited Away",
    ]) {
      await expect(page.getByRole("heading", { name: title })).toBeVisible();
    }

    const card = page.locator("article").filter({ hasText: "Oppenheimer" });
    await expect(card.getByText("Drama")).toBeVisible();
    await expect(card.getByText("sin calificar")).toHaveCount(0);
  });

  test("valida el título obligatorio del formulario", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Agregar película" }).click();
    await page.getByRole("button", { name: "Agregar", exact: true }).click();
    await expect(page.getByText("El título es obligatorio.")).toBeVisible();
  });

  test("agrega una película vista y la califica en el flujo", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Agregar película" }).click();

    await page.getByPlaceholder("Ej. Oppenheimer").fill("Dune: Parte Dos");
    await page.getByPlaceholder("2023").fill("2024");
    await page.getByPlaceholder("Drama, Comedia…").fill("Ciencia ficción");
    await page.getByRole("button", { name: "Agregar", exact: true }).click();

    await expect(
      page.getByRole("heading", { name: "Calificar · Dune: Parte Dos" })
    ).toBeVisible();
    await page.getByRole("button", { name: "4 estrellas o media" }).click();
    await page.getByPlaceholder("Nota personal de Yo…").fill("Dirección impecable");
    await page.getByRole("button", { name: "Guardar" }).click();

    await expect(
      page.getByRole("heading", { name: "Calificar · Dune: Parte Dos" })
    ).not.toBeVisible();

    const card = page
      .locator("article")
      .filter({ hasText: "Dune: Parte Dos" });
    await expect(card).toBeVisible();
    await expect(card.getByText("2024")).toBeVisible();
    await expect(card.getByText("sin calificar")).toHaveCount(1);

    const persisted = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("movie-libreta:data") ?? "{}")
    );
    expect(persisted.movies.some((m: any) => m.title === "Dune: Parte Dos")).toBe(true);
    expect(
      persisted.ratings.some(
        (r: any) => r.rating === 4 && r.personal_note === "Dirección impecable"
      )
    ).toBe(true);
  });

  test("filtra por búsqueda", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Oppenheimer" })
    ).toBeVisible();
    const search = page.getByPlaceholder("Buscar película o nota…");
    await search.fill("Oppenheimer");

    await expect(
      page.getByRole("heading", { name: "Oppenheimer" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Spirited Away" })
    ).not.toBeVisible();
  });
});