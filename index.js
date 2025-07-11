const express = require("express");
const { movieRoutes } = require("./routes/movieRoutes");
const { curatedListRoutes } = require("./routes/curatedListRoutes");
require("dotenv").config();

const app = express();
app.use(express.json());

app.use("/api/movies", movieRoutes);
app.use("/api/curated-lists", curatedListRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the MovieCraft App");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
