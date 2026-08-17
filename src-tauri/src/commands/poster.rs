use std::collections::HashMap;

use tauri::State;

use crate::db;
use crate::models::MovieSearchResult;
use crate::AppState;

const TMDB_KEY_SETTING: &str = "tmdb_api_key";
const TMDB_SEARCH_URL: &str = "https://api.themoviedb.org/3/search/movie";
const TMDB_GENRE_URL: &str = "https://api.themoviedb.org/3/genre/movie/list";
const TMDB_IMAGE_BASE: &str = "https://image.tmdb.org/t/p/w500";

#[derive(serde::Deserialize)]
struct TmdbSearch {
    results: Vec<TmdbResult>,
}

#[derive(serde::Deserialize)]
struct TmdbResult {
    poster_path: Option<String>,
    title: Option<String>,
    release_date: Option<String>,
    genre_ids: Vec<i64>,
}

#[derive(serde::Deserialize)]
struct GenreList {
    genres: Vec<Genre>,
}

#[derive(serde::Deserialize)]
struct Genre {
    id: i64,
    name: String,
}

#[derive(serde::Deserialize)]
struct WikiApiQuery {
    query: WikiPages,
}

#[derive(serde::Deserialize)]
struct WikiPages {
    pages: HashMap<String, WikiPage>,
}

#[derive(serde::Deserialize)]
struct WikiPage {
    title: Option<String>,
    thumbnail: Option<WikiThumbnail>,
}

#[derive(serde::Deserialize)]
struct WikiThumbnail {
    source: Option<String>,
}

#[tauri::command]
pub async fn search_movie(
    state: State<'_, AppState>,
    title: String,
    year: Option<i32>,
) -> Result<Option<MovieSearchResult>, String> {
    let title = title.trim();
    if title.is_empty() {
        return Ok(None);
    }

    let key: Option<String> = {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        db::get_setting(&conn, TMDB_KEY_SETTING).map_err(|e| e.to_string())?
    };

    if let Some(key) = key.filter(|k| !k.trim().is_empty()) {
        if let Some(found) = search_tmdb(&key, title, year).await {
            return Ok(Some(found));
        }
    }

    Ok(search_wikipedia(title).await)
}

async fn search_tmdb(
    key: &str,
    title: &str,
    year: Option<i32>,
) -> Option<MovieSearchResult> {
    let client = reqwest::Client::new();

    for lang in ["es-ES", "en-US"] {
        let mut params: Vec<(String, String)> = vec![
            ("api_key".to_string(), key.to_string()),
            ("query".to_string(), title.to_string()),
            ("language".to_string(), lang.to_string()),
        ];
        if let Some(y) = year {
            params.push(("year".to_string(), y.to_string()));
        }

        let resp = client.get(TMDB_SEARCH_URL).query(&params).send().await.ok()?;
        if !resp.status().is_success() {
            continue;
        }
        let Ok(data) = resp.json::<TmdbSearch>().await else {
            continue;
        };

        for r in data.results {
            let Some(poster_path) = r.poster_path else {
                continue;
            };

            let genres = tmdb_genre_names(&client, key).await;
            let genres: Vec<String> = r
                .genre_ids
                .iter()
                .filter_map(|id| genres.get(id).cloned())
                .collect();

            let parsed_year = r
                .release_date
                .as_deref()
                .and_then(|d| d.get(0..4))
                .and_then(|s| s.parse::<i32>().ok());

            return Some(MovieSearchResult {
                title: r.title.unwrap_or_else(|| title.to_string()),
                year: parsed_year,
                genres,
                poster_url: format!("{}{}", TMDB_IMAGE_BASE, poster_path),
                source: "tmdb".to_string(),
            });
        }
    }

    None
}

async fn tmdb_genre_names(
    client: &reqwest::Client,
    key: &str,
) -> HashMap<i64, String> {
    let params = [("api_key", key), ("language", "es-ES")];
    if let Ok(resp) = client.get(TMDB_GENRE_URL).query(&params).send().await {
        if resp.status().is_success() {
            if let Ok(data) = resp.json::<GenreList>().await {
                return data
                    .genres
                    .into_iter()
                    .map(|g| (g.id, g.name))
                    .collect();
            }
        }
    }
    HashMap::new()
}

async fn search_wikipedia(title: &str) -> Option<MovieSearchResult> {
    let client = reqwest::Client::new();
    let variants = vec![
        title.to_string(),
        format!("{} (film)", title),
        format!("{} (película)", title),
    ];

    for wiki in ["en", "es"] {
        let url = format!("https://{}.wikipedia.org/w/api.php", wiki);
        for variant in &variants {
            let params = [
                ("action", "query"),
                ("titles", variant),
                ("prop", "pageimages"),
                ("pithumbsize", "500"),
                ("redirects", "1"),
                ("format", "json"),
            ];

            if let Ok(resp) = client.get(&url).query(&params).send().await {
                if resp.status().is_success() {
                    if let Ok(data) = resp.json::<WikiApiQuery>().await {
                        for page in data.query.pages.values() {
                            if let Some(thumb) = &page.thumbnail {
                                if let Some(source) = &thumb.source {
                                    return Some(MovieSearchResult {
                                        poster_url: source.clone(),
                                        title: page
                                            .title
                                            .clone()
                                            .unwrap_or_else(|| title.to_string()),
                                        year: None,
                                        genres: vec![],
                                        source: "wikipedia".to_string(),
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    None
}