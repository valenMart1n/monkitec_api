const express = require("express");
const router = express.Router();

const product_variation = require("../../controllers/product_variationController");

router.post("/", product_variation.getById);
router.post("/create", product_variation.addNewAssociate);
router.post("/update", product_variation.update);
router.post("/delete", product_variation.delete);
router.post("/deleteByProduct", product_variation.deleteAll);
module.exports = router;