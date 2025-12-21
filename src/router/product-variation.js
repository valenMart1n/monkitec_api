const express = require("express");
const router = express.Router();

const product_variation = require("../../controllers/product_variationController");

router.post("/", product_variation.getById);
router.post("/create", product_variation.addNewAssociate);
module.exports = router;