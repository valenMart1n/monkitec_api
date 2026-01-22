const express = require("express");
const router = express.Router();
const user = require("../../controllers/userController");
const auth = require("../../controllers/authController");
const authenticate = require("../middleware/auth");

router.get("/", user.list);
router.post("/create", user.create);
//router.post("/delete", user.delete);
router.patch("/update", authenticate, user.update);
router.post("/login", auth.login);

module.exports = router;