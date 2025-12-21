// routes/upload.js
const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/upload.controller");
const uploadMiddleware = require("../middleware/upload.middleware");

// ========== PRODUCTOS ==========
// Crear producto con imagen
router.post(
  "/products/create",
  uploadMiddleware.handleUpload('fields', { fields: [
    {name: "imagen", maxCount: 1},
    {name: "imagen2", maxCount: 1},
  ] }),
  uploadController.createProductWithImage
);

// Actualizar producto completo
router.post(
  "/products/update",
  uploadMiddleware.handleUpload('fields', { fields: [
    {name: "imagen", maxCount:1},
    {name: "imagen2", maxCount:1}
  ] }),
  uploadController.updateProduct
);

// Actualizar solo imagen del producto
router.post(
  "/products/update-image",
  uploadMiddleware.handleUpload('single', { fieldName: 'imagen' }),
  uploadController.updateProductImageOnly
);  

router.post(
  "/products/update-image2",
  uploadMiddleware.handleUpload('single', { fieldName: 'imagen2' }),
  uploadController.updateProductImage2Only
);

router.post(
  "/products/delete-image",
  uploadController.deletePrincipalProductImage
);

router.post(
  "/products/delete-image2",
  uploadController.deleteProductImage2
);

router.post(
  "/products/delete-all-images",
  uploadController.deleteAllProductImages
)
// ========== CATEGORÍAS ==========
router.post(
  "/categories/create",
  uploadMiddleware.handleUpload('single', { fieldName: 'imagen' }),
  uploadController.createCategoryWithImage
);

router.post(
  "/categories/update",
  uploadMiddleware.handleUpload('single', { fieldName: 'imagen' }),
  uploadController.updateCategory
);

router.post(
  "/categories/delete-image",
  uploadController.deleteCategoryImage
);

// ========== GENERAL ==========
// Subir imagen sin asociar
router.post(
  "/upload",
  uploadMiddleware.handleUpload('single', { fieldName: 'imagen' }),
  uploadController.uploadImage
);

module.exports = router;