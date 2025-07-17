const { curatedList: curatedListModel } = require("../models");

const createNewCuratedList = async (data) => {
  try {
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

  // if (updatedData.name) curatedList.name = updatedData.name;
  // if (updatedData.slug) curatedList.slug = updatedData.slug;
  // if (updatedData.description) curatedList.description = updatedData.description;

  curatedList.set(updatedData);
  return await curatedList.save();
};

module.exports = { createNewCuratedList, updateCuratedListById };
