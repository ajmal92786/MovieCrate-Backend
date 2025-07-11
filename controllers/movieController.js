const { fetchMovies } = require("../services/movieService");

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

module.exports = { searchMovies };
