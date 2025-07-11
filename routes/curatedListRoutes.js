const { Router } = require("express");
const { createCuratedList } = require("../controllers/curatedListController");

const curatedListRoutes = Router();

curatedListRoutes.post("/", createCuratedList);

module.exports = { curatedListRoutes };
