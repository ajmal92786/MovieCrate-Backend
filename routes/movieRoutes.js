const { Router } = require("express");
const {
  searchMovies,
  saveMovieToWatchlist,
} = require("../controllers/movieController");

const movieRoutes = Router();

movieRoutes.get("/search", searchMovies);
movieRoutes.post("/watchlist", saveMovieToWatchlist);

module.exports = { movieRoutes };
