const {
  movie: movieModel,
  watchlist: watchlistModel,
  wishlist: wishlistModel,
} = require("../models");
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
    console.error(
      `Error fetching actors for movieId ${movieId}`,
      error.message
    );
    return "";
  }
};

const fetchMovies = async (query) => {
  if (!API_KEY) {
    throw new Error("Missing TMDB API KEY");
  }

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?query=${query}&api_key=${API_KEY}`
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

const movieExistsInDB = async (movieId) => {
  return await movieModel.findOne({ where: { tmdbId: movieId } });
};

const fetchMovieAndCastDetails = async (tmdbId) => {
  try {
    const actors = await getActors(tmdbId);

    const movieRes = await axios.get(
      `https://api.themoviedb.org/3/movie/${tmdbId}`,
      {
        params: {
          api_key: API_KEY,
        },
      }
    );

    const movie = movieRes.data;

    return {
      title: movie.original_title,
      tmdbId: movie.id,
      genre: movie.genres.map((g) => g.id).join(", "),
      actors,
      releaseYear: movie.release_date.split("-")[0] || null,
      rating: movie.vote_average,
      description: movie.overview,
    };
  } catch (error) {
    const err = new Error("Movie not found in TMDB.");
    err.status = 404;
    err.customMessage = "Movie not found";
    throw err;
  }
};

// const fetchMovieAndCastDetails = async (tmdbId) => {
//   try {
//     const [movieRes, actors] = await Promise.all([
//       axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}`, {
//         params: { api_key: API_KEY },
//       }),
//       getActors(tmdbId),
//     ]);

//     const movie = movieRes.data;

//     return {
//       title: movie.original_title,
//       tmdbId: movie.id,
//       genre: movie.genres.map((g) => g.id).join(", "),
//       actors,
//       releaseYear: movie.release_date?.split("-")[0] || null,
//       rating: movie.vote_average,
//       description: movie.overview,
//     };
//   } catch (error) {
//     const err = new Error("Movie not found in TMDB.");
//     err.status = 404;
//     err.customMessage = "Movie not found";
//     throw err;
//   }
// };

const addToWatchlist = async (movieId) => {
  try {
    let movie = await movieExistsInDB(movieId);

    if (!movie) {
      const movieData = await fetchMovieAndCastDetails(movieId);
      movie = await movieModel.create(movieData);
    }

    const existingWatchlistEntry = await watchlistModel.findOne({
      where: { movieId: movie.id },
    });

    if (existingWatchlistEntry) {
      const error = new Error("Movie is already in the watchlist.");
      error.status = 409;
      error.customMessage = "Conflict";
      throw error;
    }

    return await watchlistModel.create({ movieId: movie.id });
  } catch (error) {
    throw error;
  }
};

const addToWishlist = async (movieId) => {
  try {
    let movie = await movieExistsInDB(movieId);

    if (!movie) {
      const movieData = await fetchMovieAndCastDetails(movieId);
      movie = await movieModel.create(movieData);
    }

    const existingWishlistEntry = await wishlistModel.findOne({
      where: { movieId: movie.id },
    });

    if (existingWishlistEntry) {
      const error = new Error("Movie is already in the wishlist.");
      error.status = 409;
      error.customMessage = "Conflict";
      throw error;
    }

    return await wishlistModel.create({ movieId: movie.id });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  fetchMovies,
  movieExistsInDB,
  addToWatchlist,
  addToWishlist,
};
