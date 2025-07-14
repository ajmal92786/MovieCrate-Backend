const {
  createNewCuratedList,
  updateCuratedListById,
} = require("../services/curatedListService");
const { generateSlug } = require("../utils/utils");

const createCuratedList = async (req, res) => {
  const { name, description, slug } = req.body;

  if (!name || name.trim() === "" || !slug || slug.trim() === "") {
    return res.status(400).json({ message: "Name and slug are required." });
  }

  try {
    await createNewCuratedList({
      name,
      description,
      slug,
    });

    return res
      .status(201)
      .json({ message: "Curated list created successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const updateCuratedList = async (req, res) => {
  const { curatedListId } = req.params;
  const { name, description } = req.body;

  if (!name || typeof name !== "string") {
    return res
      .status(400)
      .json({ message: "Name is required and should be a string" });
  }

  try {
    const slug = generateSlug(name);
    const updatedCuratedList = await updateCuratedListById(curatedListId, {
      name,
      description,
      slug,
    });

    return res.status(200).json({
      message: "Curated list updated successfully.",
      curatedList: updatedCuratedList,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res
      .status(status)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = { createCuratedList, updateCuratedList };
