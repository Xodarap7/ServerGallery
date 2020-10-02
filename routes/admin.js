const { Router } = require("express");
const router = Router();

const async = require("async");
const fs = require("fs");

const multer = require("multer");

const Image = require("../models/Image");
const Category = require("../models/Category");
const { db } = require("../models/Image");

const diskConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
router.use(
  multer({ storage: diskConfig, fileFilter: fileFilter }).single("images")
);

router.get("/", (req, res) => {
  const title = "Меню администратора";
  res.render("pages/admin-menu", {
    title: title,
  });
});
//ADD IMAGE
router.get("/add-image", async (req, res) => {
  const title = "Добавление картинки";
  let category = await Category.find().lean();
  res.render("pages/add-image", {
    title: title,
    category: category,
  });
});

router.post("/add-image", async (req, res) => {
  const { categories } = req.body;
  const imagesName = req.file.filename;

  try {
    let image = await Image.findOne({ imagesName });

    if (image) {
      return res.render("pages/add-image", {
        error_msg: [{ msg: "Картинка с таким именем уже добавлена" }],
      });
    }

    image = new Image({
      categories,
      imagesName,
    });

    await image.save();
    await res.render("pages/admin-menu", {
      success_msg: [{ msg: "Картинка успешно добавлена" }],
    });
  } catch (err) {}
});

//REMOVE Image
router.get("/remove-image", async (req, res) => {
  const title = "Удаление картинок";
  let image = await Image.find().lean();
  res.render("pages/remove-image", {
    title: title,
    image: image,
  });
});

router.delete("/remove-image/:imagesName", async (req, res) => {
  let deleteImg = req.params.imagesName;
  const deleteImagePath = `./public/uploads/${deleteImg}`;
  fs.unlinkSync(deleteImagePath);
  await Image.deleteOne({ imagesName: deleteImg });
  await res.render("pages/admin-menu", {
    success_msg: [{ msg: "Картинка успешно удалена" }],
  });
});

//ADD CATEGORY

router.get("/add-category", (req, res) => {
  const title = "Добавление категории";
  res.render("pages/add-category", {
    title: title,
  });
});

router.post("/add-category", async (req, res) => {
  const { categoryName } = req.body;

  try {
    let categories = await Category.findOne({ categoryName });

    if (categories) {
      return res.render("pages/add-category", {
        error_msg: [{ msg: "This category has already been added" }],
      });
    }

    categories = new Category({
      categoryName,
    });

    await categories.save();
    await res.render("pages/admin-menu", {
      success_msg: [{ msg: "Категория успешно добавлена" }],
    });
  } catch (err) {}
});

//remove category
router.get("/remove-category", async (req, res) => {
  const title = "Удаление категорий";
  let category = await Category.find().lean();
  res.render("pages/remove-category", {
    title: title,
    category: category,
  });
});

router.delete("/remove-category/:categoryName", async (req, res) => {
  await Category.deleteOne({ categoryName: req.params.categoryName });
  await res.render("pages/admin-menu", {
    success_msg: [{ msg: "Категория успешно удалена" }],
  });
});

module.exports = router;
