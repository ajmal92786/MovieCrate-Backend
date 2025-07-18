const {
  fetchMovies,
  addToWatchlist,
  addToWishlist,
  addToCuratedlist,
  storeReviewsAndRatings,
  getMoviesByGenreAndActor,
  sortMovies,
  fetchTopFiveMoviesByRating,
} = require("../services/movieService");

const searchMovies = async (req, res) => {
  const { query } = req.query;
  if (!query || query.trim() === "") {
    return res.status(400).json({ message: "Query parameter is required" });
  }

  try {
    const movies = await fetchMovies(query);
    return res.json({ movies });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const saveMovieToWatchlist = async (req, res) => {
  const { movieId } = req.body;
  if (!movieId)
    return res.status(400).json({ message: "Movie ID is required." });

  try {
    await addToWatchlist(movieId);
    return res.status(201).json({
      message: "Movie added to watchlist successfully.",
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      message: error.customMessage || "Internal Server Error",
      error: error.message,
    });
  }
};

const saveMovieToWishlist = async (req, res) => {
  const { movieId } = req.body;
  if (!movieId)
    return res.status(400).json({ message: "Movie ID is required." });

  try {
    await addToWishlist(movieId);
    return res.status(201).json({
      message: "Movie added to wishlist successfully.",
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      message: error.customMessage || "Internal Server Error",
      error: error.message,
    });
  }
};

const saveMovieToCuratedlist = async (req, res) => {
  const { movieId, curatedListId } = req.body;
  if (!movieId || !curatedListId)
    return res
      .status(400)
      .json({ message: "Both movieId and curatedListId are required." });

  try {
    await addToCuratedlist(movieId, curatedListId);
    return res.status(201).json({
      message: "Movie added to curated list successfully.",
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      message: error.customMessage || "Internal Server Error",
      error: error.message,
    });
  }
};

const addReviewsAndRatings = async (req, res) => {
  const { movieId } = req.params;
  const { rating, reviewText } = req.body;

  if (
    !movieId ||
    !rating ||
    typeof rating !== "number" ||
    isNaN(rating) ||
    rating < 0 ||
    rating > 10 ||
    !reviewText ||
    typeof reviewText !== "string" ||
    reviewText.length > 500
  ) {
    return res.status(400).json({
      message:
        "Valid movieId, rating (0-10), and reviewText (max 500 characters) are required.",
    });
  }

  try {
    await storeReviewsAndRatings(movieId, rating, reviewText);
    return res.status(201).json({ message: "Review added successfully." });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      message: error.customMessage || "Internal Server Error",
      error: error.message,
    });
  }
};

const searchMoviesByGenreAndActor = async (req, res) => {
  const genre = req.query.genre?.trim();
  const actor = req.query.actor?.trim();

  if (!genre || !actor) {
    return res.status(400).json({ message: "Genre and actor are required." });
  }

  try {
    const movies = await getMoviesByGenreAndActor(genre, actor);

    if (movies.length === 0) {
      return res.status(404).json({ message: "No movies found." });
    }

    return res.status(200).json({ movies });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      message: error.customMessage || "Internal Server Error",
      error: error.message,
    });
  }
};

const sortMoviesByRatingOrYearOfRelease = async (req, res) => {
  const { list, sortBy, order = "ASC" } = req.query;
  if (!list || !sortBy || !["rating", "releaseYear"].includes(sortBy)) {
    return res.status(400).json({
      message:
        'Query params "list" and valid "sortBy" (rating, releaseYear) are required.',
    });
  }

  try {
    const movies = await sortMovies(list, sortBy, order);
    if (movies.length === 0) {
      return res.status(404).json({ message: `No movie found in ${list}` });
    }

    return res.status(200).json({ movies });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      message: error.customMessage || "Internal Server Error",
      error: error.message,
    });
  }
};

const getTopFiveMovies = async (req, res) => {
  try {
    const movies = await fetchTopFiveMoviesByRating();
    if (movies.length === 0) {
      return res.status(404).json({ message: "No movies found." });
    }

    return res.status(200).json(movies);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      message: error.customMessage || "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  searchMovies,
  saveMovieToWatchlist,
  saveMovieToWishlist,
  saveMovieToCuratedlist,
  addReviewsAndRatings,
  searchMoviesByGenreAndActor,
  sortMoviesByRatingOrYearOfRelease,
  getTopFiveMovies,
};
