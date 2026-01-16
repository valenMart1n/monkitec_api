const express = require("express");
const router = express.Router();
const uploadMiddleware = require("../middleware/upload.middleware");
const categories = require("../../controllers/categoriesController");

router.get("/", categories.list);
router.get("/listAll", categories.listAll);
router.post("/subcategories", categories.getByParent);
router.post("/byId", categories.getById);
router.post("/create", uploadMiddleware.handleUpload('single', { fieldName: 'imagen' }),categories.create);
router.post("/update", uploadMiddleware.handleUpload('single', { fieldName: 'imagen' }), categories.update);
router.post("/delete", categories.delete);
module.exports = router;