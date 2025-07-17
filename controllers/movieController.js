const {
  fetchMovies,
  movieExistsInDB,
  addToWatchlist,
  addToWishlist,
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
    const watchlistEntry = await addToWatchlist(movieId);
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
    const wishlistEntry = await addToWishlist(movieId);
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

module.exports = { searchMovies, saveMovieToWatchlist, saveMovieToWishlist };
