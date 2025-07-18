const { Op } = require("sequelize");
const {
  movie: movieModel,
  watchlist: watchlistModel,
  wishlist: wishlistModel,
  curatedList: curatedListModel,
  curatedListItem: curatedListItemModel,
  review: reviewModel,
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
    throw error;
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
      genre: movie.genres.map((g) => g.name).join(", "),
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

const addToCuratedlist = async (movieId, curatedListId) => {
  try {
    // Check if movie exists in DB or fetch from TMDB
    let movie = await movieExistsInDB(movieId);
    if (!movie) {
      const movieData = await fetchMovieAndCastDetails(movieId);
      movie = await movieModel.create(movieData);
    }

    // Check if curated list exists
    const curatedList = await curatedListModel.findByPk(curatedListId);
    if (!curatedList) {
      const error = new Error("Curated list does not exist.");
      error.status = 404;
      error.customMessage = "Not Found";
      throw error;
    }

    // Prevent duplicate movie entry in curated list
    const existingItem = await curatedListItemModel.findOne({
      where: { movieId: movie.id, curatedListId },
    });

    if (existingItem) {
      const error = new Error("Movie is already in the curated list.");
      error.status = 409;
      error.customMessage = "Conflict";
      throw error;
    }

    // Create entry
    return await curatedListItemModel.create({
      curatedListId,
      movieId: movie.id,
    });
  } catch (error) {
    throw error;
  }
};

const storeReviewsAndRatings = async (movieId, rating, reviewText) => {
  try {
    // Check if movie exists in DB or fetch from TMDB
    let movie = await movieExistsInDB(movieId);
    if (!movie) {
      const movieData = await fetchMovieAndCastDetails(movieId);
      movie = await movieModel.create(movieData);
    }

    return await reviewModel.create({ movieId: movie.id, rating, reviewText });
  } catch (error) {
    throw error;
  }
};

const getMoviesByGenreAndActor = async (genre, actor) => {
  try {
    const movies = await movieModel.findAll({
      where: {
        genre: { [Op.iLike]: `%${genre}%` },
        actors: { [Op.iLike]: `%${actor}%` },
      },
    });

    return movies;
  } catch (error) {
    throw error;
  }
};

const sortMovies = async (list, sortBy, order) => {
  const validLists = {
    watchlist: watchlistModel,
    wishlist: wishlistModel,
    curatedlist: curatedListItemModel,
  };

  const Model = validLists[list.toLowerCase()];
  if (!Model) {
    const error = new Error("Invalid list type.");
    error.status = 400;
    throw error;
  }

  try {
    const data = await Model.findAll({
      include: [
        {
          model: movieModel,
          attributes: [
            "title",
            "tmdbId",
            "genre",
            "actors",
            "releaseYear",
            "rating",
          ],
        },
      ],
      order: [
        [movieModel, sortBy, order.toUpperCase() === "ASC" ? "ASC" : "DESC"],
      ],
    });

    return data.map((record) => record.movie);
  } catch (error) {
    throw error;
  }
};

const fetchTopFiveMoviesByRating = async () => {
  try {
    // const data = await movieModel.findAll({
    //   attributes: ["title", "rating"],
    //   order: [["rating", "DESC"]],
    //   include: [{ model: reviewModel, attributes: ["reviewText"] }],
    // });

    // const movies = data.map((movieRecord) => {
    //   return {
    //     title: movieRecord.title,
    //     rating: movieRecord.rating,
    //     review: movieRecord.reviews.map((reviewRecord) => {
    //       return {
    //         text: reviewRecord.reviewText,
    //         wordCount: reviewRecord.reviewText
    //           ? reviewRecord.reviewText.split(" ").length
    //           : 0,
    //       };
    //     }),
    //   };
    // });

    const movies = await movieModel.findAll({
      limit: 5,
      attributes: ["title", "rating"],
      order: [["rating", "DESC"]],
      include: [
        {
          model: reviewModel,
          attributes: ["reviewText"],
          limit: 1, // only one review per movie
        },
      ],
    });

    return movies.map((movie) => {
      const review = movie.reviews?.[0]; // only one review (due to limit: 1)
      const reviewText = review?.reviewText || "";
      const wordCount = reviewText.trim().split(/\s+/).filter(Boolean).length;
      return {
        title: movie.title,
        rating: movie.rating,
        review: {
          text: reviewText,
          wordCount,
        },
      };
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  fetchMovies,
  addToWatchlist,
  addToWishlist,
  addToCuratedlist,
  storeReviewsAndRatings,
  getMoviesByGenreAndActor,
  sortMovies,
  fetchTopFiveMoviesByRating,
};
