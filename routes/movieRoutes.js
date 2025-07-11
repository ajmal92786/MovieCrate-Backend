const { Router } = require("express");
const { searchMovies } = require("../controllers/movieController");

const movieRoutes = Router();

movieRoutes.get("/search", searchMovies);

module.exports = { movieRoutes };
