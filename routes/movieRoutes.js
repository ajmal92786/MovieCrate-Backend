const { Router } = require("express");
const {
  searchMovies,
  saveMovieToWatchlist,
  saveMovieToWishlist,
  saveMovieToCuratedlist,
  addReviewsAndRatings,
} = require("../controllers/movieController");

const movieRoutes = Router();

movieRoutes.get("/search", searchMovies);
movieRoutes.post("/watchlist", saveMovieToWatchlist); // add movie to watchlist
movieRoutes.post("/wishlist", saveMovieToWishlist); // add movie to wishlist
movieRoutes.post("/curated-list", saveMovieToCuratedlist); // add movie to curatedlist
movieRoutes.post("/:movieId/reviews", addReviewsAndRatings); // add reviews and ratings to a movie

module.exports = { movieRoutes };
