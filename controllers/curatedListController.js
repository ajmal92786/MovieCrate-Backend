const { createNewCuratedList } = require("../services/curatedListService");

const createCuratedList = async (req, res) => {
  const { name, description, slug } = req.body;

  if (!name || name.trim() === "" || !slug || slug.trim() === "") {
    return res.status(400).json({ message: "Name and slug are required." });
  }

  try {
    const newCuratedList = await createNewCuratedList({
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

module.exports = { createCuratedList };
