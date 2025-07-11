const { curatedList } = require("../models");

const createNewCuratedList = async (data) => {
  try {
    console.log(Object.keys(require("../models")));
    return await curatedList.create(data);
  } catch (error) {
    throw new Error(`Error in creating the list: ${error.message}`);
  }
};

module.exports = { createNewCuratedList };
