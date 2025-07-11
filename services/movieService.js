const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.TMDB_API_KEY;

const getActors = async (movieId) => {
  if (!API_KEY) {
    throw new Error("Missing TMDB API KEY");
  }

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}/credits`,
      {
        params: { api_key: API_KEY },
      }
    );

    const actors = response.data.cast
      .filter((actor) => {
        return actor.known_for_department === "Acting";
      })
      .slice(0, 5)
      .map((actor) => actor.name)
      .join(", ");

    return actors;
  } catch (error) {
    console.error(`Error fetching actors for movieId ${movieId}`, err.message);
    return "";
  }
};

const fetchMovies = async (query) => {
  if (!API_KEY) {
    throw new Error("Missing TMDB API KEY");
  }

  try {
    const response = await axios.get(
      "https://api.themoviedb.org/3/search/movie",
      {
        params: {
          query,
          api_key: API_KEY,
        },
      }
    );

    const movies = await Promise.all(
      response.data.results.map(async (movie) => {
        const actors = await getActors(movie.id);

        return {
          title: movie.original_title,
          tmdbId: movie.id,
          genre: movie.genre_ids.join(", "),
          actors,
          releaseYear: movie.release_date.split("-")[0],
          rating: movie.vote_average,
          description: movie.overview,
        };
      })
    );

    return movies;
  } catch (error) {
    const errMessage =
      error.response?.data?.status_message || error.message || "API error";
    throw new Error(`TMDB API Error: ${errMessage}`);
  }
};

// const fetchMovies = async (query) => {
//   const ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;

//   if (!ACCESS_TOKEN) {
//     throw new Error("Missing TMDB ACCESS TOKEN");
//   }

//   try {
//     const response = await axios.get(
//       "https://api.themoviedb.org/3/search/movie",
//       {
//         params: { query },
//         headers: {
//           Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
//           Accept: "application/json",
//         },
//         timeout: 7000, // 7 seconds timeout
//       }
//     );

//     return response.data;
//   } catch (error) {
//     const errMessage =
//       error.response?.data?.status_message || error.message || "API error";
//     throw new Error(`TMDB API Error: ${errMessage}`);
//   }
// };

module.exports = { fetchMovies };
