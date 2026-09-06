import { beforeEach, describe, expect, it } from "vitest";
import { api } from "./api";

describe("mock api", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("seeds dos usuarios por defecto", async () => {
    const users = await api.getUsers();
    expect(users).toHaveLength(2);
    expect(users[0].name).toBe("Yo");
    expect(users[1].name).toBe("Mi pareja");
  });

  it("seeds películas de ejemplo", async () => {
    const movies = await api.getMovies();
    expect(movies.length).toBeGreaterThanOrEqual(4);
    expect(movies[0].movie.title).toBe("Oppenheimer");
  });

  it("agrega película al inicio y devuelve sin valoraciones", async () => {
    const created = await api.addMovie({
      title: "Dune",
      year: 2021,
      genre: "Ciencia ficción",
    });
    expect(created.movie.title).toBe("Dune");
    expect(created.ratings).toEqual([]);
    expect(created.movie.kind).toBe("movie");

    const movies = await api.getMovies();
    expect(movies[0].movie.title).toBe("Dune");
  });

  it("agrega una serie con temporadas y estado", async () => {
    const created = await api.addMovie({
      title: "Severance",
      year: 2022,
      genre: "Thriller",
      kind: "series",
      seasons: 2,
      status: "En curso",
    });
    expect(created.movie.kind).toBe("series");
    expect(created.movie.seasons).toBe(2);
    expect(created.movie.status).toBe("En curso");

    const movies = await api.getMovies();
    const series = movies.find((m) => m.movie.title === "Severance");
    expect(series?.movie.kind).toBe("series");
    expect(series?.movie.seasons).toBe(2);
  });

  it("guardar valoración upserta (inserta y luego actualiza)", async () => {
    const rating = await api.saveRating({
      movie_id: "m1",
      user_id: "user1",
      rating: 2.5,
      mood: "😐 Regular",
    });
    expect(rating.rating).toBe(2.5);

    const updated = await api.saveRating({
      movie_id: "m1",
      user_id: "user1",
      rating: 4,
      mood: "😄 Me encantó",
    });
    expect(updated.rating).toBe(4);
    expect(updated.id).toBe(rating.id);
  });

  it("exportBackup genera JSON válido con schemaVersion", async () => {
    const raw = await api.exportBackup();
    const data = JSON.parse(raw) as {
      app: string;
      schemaVersion: number;
      users: unknown[];
      movies: { title: string; kind?: string }[];
      ratings: unknown[];
    };
    expect(data.app).toBe("movie-libreta");
    expect(data.schemaVersion).toBe(1);
    expect(data.users.length).toBeGreaterThanOrEqual(2);
    expect(data.movies.length).toBeGreaterThanOrEqual(4);
    expect(data.ratings.length).toBeGreaterThanOrEqual(8);
    expect(data.movies.some((m) => m.kind === "series")).toBe(true);
  });

  it("importBackup agrega películas nuevas y fusiona duplicados", async () => {
    const report = await api.importBackup(
      JSON.stringify({
        users: [{ id: "u-new", name: "Test", color: "#ffffff" }],
        movies: [
          { id: "b1", title: "Dune", year: 2021, genre: null },
          { id: "b2", title: "Oppenheimer", year: 2023, genre: null },
          { id: "b3", title: "The Office", year: 2005, genre: "Comedia", kind: "series", seasons: 9 },
        ],
        ratings: [
          { movie_id: "b1", user_id: "u-new", rating: 4.5 },
          { movie_id: "b1", user_id: "no-existe", rating: 3 },
        ],
      })
    );
    expect(report.users_imported).toBe(1);
    expect(report.movies_imported).toBe(2);
    expect(report.movies_merged).toBe(1);
    expect(report.ratings_imported).toBe(1);

    const movies = await api.getMovies();
    const dune = movies.find((m) => m.movie.title === "Dune");
    expect(dune).toBeDefined();
    expect(dune?.movie.kind).toBe("movie");
    expect(dune?.ratings).toHaveLength(1);

    const office = movies.find((m) => m.movie.title === "The Office");
    expect(office?.movie.kind).toBe("series");
    expect(office?.movie.seasons).toBe(9);
  });
});