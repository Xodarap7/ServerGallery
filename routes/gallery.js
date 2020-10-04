const { Router } = require("express");
const router = Router();

const Category = require("../models/Category");
const Image = require("../models/Image");
// const User = require("../models/User");
// @route   GET /users/current
// @desc    Return current user
// @access  Private
router.get("/", async (req, res) => {
  try {
    let category = await Category.find().lean();
    let image = await Image.find().lean();
    // let user = await User.find();
    res.render("./pages/gallery", {
      category: category,
      image: image,
      // user: user,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
