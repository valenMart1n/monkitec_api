const express = require("express");
const router = express.Router();

const products = require("../../controllers/productsController");
const uploadMiddleware = require("../middleware/upload.middleware");

router.get("/", products.list);
router.post("/byCategory", products.listByCategory);
router.post("/byId", products.getById);
router.post("/create", 
  uploadMiddleware.handleUpload('fields', { field: [
    {name: "imagen", maxCount:1},
    {name: "imagen2", maxCount: 1}
  ] }),
  products.create  
);
router.post("/update", 
  uploadMiddleware.handleUpload('fields', { 
    fields: [
      {name: "imagen", maxCount:1},
      {name: "imagen2", maxCount: 1}
    ] 
  }),
  products.update  
);
router.delete("/delete", products.delete);

router.get("/featured", products.last5);

module.exports = router;