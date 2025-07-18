const request = require("supertest");
const app = require("../index");
const {
  sequelize,
  watchlist: watchlistModel,
  wishlist: wishlistModel,
  curatedListItem: curatedlistItemModel,
} = require("../models");

afterAll(async () => {
  await sequelize.close();
});

describe("Movie API's tests", () => {
  it("should save movie to watchlist", async () => {
    await watchlistModel.destroy({ where: {} });
    const response = await request(app)
      .post("/api/movies/watchlist")
      .send({ movieId: 27210 });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      message: "Movie added to watchlist successfully.",
    });
  });

  it("should save movie to wishlist", async () => {
    await wishlistModel.destroy({ where: {} });
    const response = await request(app)
      .post("/api/movies/wishlist")
      .send({ movieId: 27210 });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      message: "Movie added to wishlist successfully.",
    });
  });

  it("should save movie to curatedlist", async () => {
    await curatedlistItemModel.destroy({ where: {} });
    const response = await request(app)
      .post("/api/movies/curated-list")
      .send({ movieId: 27210, curatedListId: 1 });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      message: "Movie added to curated list successfully.",
    });
  });

  it("should return 201 if curated list has been created!", async () => {
    const response = await request(app).post("/api/curated-lists").send({
      name: "Horror Movies",
      description: "A collection of the best horror films.",
      slug: "horror-movies",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      message: "Curated list created successfully.",
    });
  });

  it("should return 400 if name or slug is missing from body", async () => {
    const response = await request(app).post("/api/curated-lists").send({
      name: "Horror Movies",
      description: "A collection of the best horror films.",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      message: "Name and slug are required.",
    });
  });

  it("should return 200 if the curatedlist has been updated", async () => {
    const response = await request(app).put("/api/curated-lists/2").send({
      name: "Updated List Name",
      description: "Updated description.",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Curated list updated successfully."
    );
  });
});
