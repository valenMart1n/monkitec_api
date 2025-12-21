const express = require("express");
const router = express.Router();
const cart = require("../../controllers/cartController");

router.get("/", cart.list);
router.post("/save", cart.save);
router.post("/clear", cart.clear);

module.exports = router;