const { curatedList: curatedListModel } = require("../models");

const createNewCuratedList = async (data) => {
  try {
    console.log(Object.keys(require("../models")));
    return await curatedListModel.create(data);
  } catch (error) {
    throw new Error(`Error in creating the list: ${error.message}`);
  }
};

const updateCuratedListById = async (id, updatedData) => {
  const curatedList = await curatedListModel.findByPk(id);
  if (!curatedList) {
    const error = new Error("Curated list not found");
    error.statusCode = 404;
    throw error;
  }
  // curatedList.name = data.name;
  // curatedList.slug = data.slug;
  // if (data.description) {
  //   curatedList.description = data.description;
  // }
  curatedList.set(updatedData);
  return await curatedList.save();
};

module.exports = { createNewCuratedList, updateCuratedListById };
