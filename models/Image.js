const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  categories: {
    type: String,
    required: true,
  },

  imagesName: {
    type: String,
  },
});

module.exports = mongoose.model("Image", ImageSchema);
