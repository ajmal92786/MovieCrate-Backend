const { Router } = require("express");
const {
  searchMovies,
  saveMovieToWatchlist,
  saveMovieToWishlist,
} = require("../controllers/movieController");

const movieRoutes = Router();

movieRoutes.get("/search", searchMovies);
movieRoutes.post("/watchlist", saveMovieToWatchlist); // add movie to watchlist
movieRoutes.post("/wishlist", saveMovieToWishlist); // add movie to wishlist

module.exports = { movieRoutes };
