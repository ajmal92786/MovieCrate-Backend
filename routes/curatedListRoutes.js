const { Router } = require("express");
const {
  createCuratedList,
  updateCuratedList,
} = require("../controllers/curatedListController");

const curatedListRoutes = Router();

curatedListRoutes.post("/", createCuratedList);
curatedListRoutes.put("/:curatedListId", updateCuratedList);

module.exports = { curatedListRoutes };
