const express = require("express");
const router = express.Router();
const uploadMiddleware = require("../middleware/upload.middleware");
const categories = require("../../controllers/categoriesController");

router.get("/", categories.list);
router.post("/subcategories", categories.getByParent);
router.post("/byId", categories.getById);
router.post("/update", uploadMiddleware.handleUpload('single', { fieldName: 'imagen' }), categories.update);
module.exports = router;