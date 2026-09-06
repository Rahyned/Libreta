import { beforeEach, describe, expect, it } from "vitest";
import { useMovieStore } from "./useMovieStore";

describe("movie store", () => {
  beforeEach(() => {
    localStorage.clear();
    useMovieStore.setState({
      movies: [],
      users: [],
      loading: false,
      error: null,
      meId: null,
      partnerId: null,
    });
  });

  it("load() cargó usuarios y películas", async () => {
    await useMovieStore.getState().load();
    const s = useMovieStore.getState();
    expect(s.users).toHaveLength(2);
    expect(s.movies.length).toBeGreaterThanOrEqual(4);
    expect(s.meId).toBe("user1");
    expect(s.partnerId).toBe("user2");
    expect(s.loading).toBe(false);
    expect(s.error).toBeNull();
  });

  it("addMovie() agrega al inicio de la lista", async () => {
    await useMovieStore.getState().load();
    await useMovieStore.getState().addMovie({
      title: "Dune",
      year: 2021,
    });
    const movies = useMovieStore.getState().movies;
    expect(movies[0].movie.title).toBe("Dune");
  });

  it("deleteMovie() elimina la película", async () => {
    await useMovieStore.getState().load();
    await useMovieStore.getState().deleteMovie("m1");
    const movies = useMovieStore.getState().movies;
    expect(movies.some((m) => m.movie.id === "m1")).toBe(false);
  });

  it("updateUser() renombra al usuario", async () => {
    await useMovieStore.getState().load();
    await useMovieStore.getState().updateUser("user1", "Yo mejorada", "#123456");
    const me = useMovieStore
      .getState()
      .users.find((u) => u.id === "user1");
    expect(me?.name).toBe("Yo mejorada");
    expect(me?.color).toBe("#123456");
  });
});