const express = require("express");
const router = express.Router();

const variations = require("../../controllers/variationsController");

router.get("/", variations.list);
router.post("/byId", variations.getById);
router.post("/create", variations.create);
router.post("/update", variations.update);
router.post("/delete", variations.delete);
module.exports = router;