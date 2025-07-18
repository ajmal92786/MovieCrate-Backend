const request = require("supertest");
const { app } = require("../../index");
const {
  sequelize,
  watchlist: watchlistModel,
  wishlist: wishlistModel,
  curatedListItem: curatedlistItemModel,
} = require("../../models");

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
});
