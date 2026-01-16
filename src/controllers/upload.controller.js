const CloudinaryService = require('../services/cloudinary.service');
const db = require('../models');
const Product = db.Product;
const Category = db.Category;

const uploadController = {
  // ========== PRODUCTOS ==========
  
  // CREATE: Crear producto con imagen (ya lo tienes bien)
  createProductWithImage: async (req, res) => {
    try {
      const { desc, precio, category_id, stock_total } = req.body;
      
     if (!req.files?.imagen?.[0]) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere al menos la imagen principal'
      });
    }

      const imagenData = {
        ruta_imagen: null,
        imagen_public_id: null,
        ruta_imagen2: null,
        imagen_public_id2: null
      };

      if(req.files && req.files.imagen && req.files.imagen[0]){
        const cloudinaryResult = await CloudinaryService.uploadImage(
          req.files.imagen[0].buffer,
          "productos"
        );
        imagenData.ruta_imagen = cloudinaryResult.secure_url;
        imagenData.imagen_public_id = cloudinaryResult.public_id;
      }

      if(req.files && req.files.imagen2 && req.files.imagen2[0]){
        const cloudinaryResult2 = await CloudinaryService.uploadImage(
          req.files.imagen2[0].buffer,
          "productos"
        );
        imagenData.ruta_imagen2 = cloudinaryResult2.secure_url;
        imagenData.imagen_public_id2 = cloudinaryResult2.public_id;
      }
      
      const nuevoProducto = await Product.create({
        desc,
        precio: parseInt(precio),
        category_id: parseInt(category_id),
        stock_total: stock_total ? parseInt(stock_total) : 0, 
        ...imagenData
      });

      const responseData = nuevoProducto.toJSON();

      if(responseData.imagen_public_id){
        responseData.imagen_optimizada = {
          original: responseData.ruta_imagen,
          thumbnail: CloudinaryService.getThumbnailUrl(responseData.imagen_public_id),
          detail: CloudinaryService.getDetailUrl(responseData.imagen_public_id)
        };
      }

      if(responseData.imagen_public_id2){
        responseData.imagen2_optimizada = {
          original: responseData.ruta_imagen2,
          thumbnail: CloudinaryService.getThumbnailUrl(responseData.imagen_public_id2),
          detail: CloudinaryService.getDetailUrl(responseData.imagen_public_id2)
        };
      }

      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: {
          producto: nuevoProducto,
          imagenes: {
            imagen1: imagenData.ruta_imagen ? {
              url: imagenData.ruta_imagen,
              public_id: imagenData.imagen_public_id
            } : null,
            imagen2: imagenData.ruta_imagen2 ? {
              url: imagenData.ruta_imagen2,
              public_id: imagenData.imagen_public_id2
            } : null
          }
        }
      });
    } catch (error) {
      console.error('❌ Error creando producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error creando producto',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  
  updateProduct: async (req, res) => {
    try {
      const { id, desc, precio, category_id } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere id del producto'
        });
      }

      console.log(`✏️ Actualizando producto ID: ${id}`);

      const product = await Product.findByPk(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      // Preparar datos para actualizar
      const updateData = {};
      
      if (desc !== undefined && desc !== null) {
        updateData.desc = desc.trim();
      }
      
      if (precio !== undefined && precio !== null) {
        updateData.precio = parseInt(precio);
      }
      
      if (category_id !== undefined && category_id !== null) {
        updateData.category_id = parseInt(category_id);
      }
      if (req.files && req.files.imagen && req.files.imagen[0]) {
        if (product.imagen_public_id) {
          try {
            await CloudinaryService.deleteImage(product.imagen_public_id);
            console.log(`🗑️ Imagen anterior borrada: ${product.imagen_public_id}`);
          } catch (deleteError) {
            console.warn('No se pudo borrar imagen anterior:', deleteError.message);
          }
        }
        const cloudinaryResult = await CloudinaryService.uploadImage(
          req.files.imagen[0].buffer,
          'productos'
        );
        
        updateData.ruta_imagen = cloudinaryResult.secure_url;
        updateData.imagen_public_id = cloudinaryResult.public_id;
        console.log(`🖼️ Nueva imagen subida: ${cloudinaryResult.public_id}`);
      }

      if (req.files && req.files.imagen2 && req.files.imagen2[0]) {
        if (product.imagen_public_id2) {
          try {
            await CloudinaryService.deleteImage(product.imagen_public_id2);
            console.log(`🗑️ Imagen secundaria anterior borrada: ${product.imagen_public_id2}`);
          } catch (deleteError) {
            console.warn('No se pudo borrar imagen secundaria anterior:', deleteError.message);
          }
        }
      

      const cloudinaryResult2 = await CloudinaryService.uploadImage(
          req.files.imagen2[0].buffer,
          'productos'
      );

      updateData.ruta_imagen2 = cloudinaryResult2.secure_url;
      updateData.imagen_public_id2 = cloudinaryResult2.public_id;
      console.log(`🖼️ Nueva imagen secundaria subida: ${cloudinaryResult2.public_id}`);

    }
      await product.update(updateData);
      const updatedProduct = await Product.findByPk(id);
      const responseData = updatedProduct.toJSON();
      
      if (responseData.imagen_public_id) {
        responseData.imagen_optimizada = {
          original: responseData.ruta_imagen,
          thumbnail: CloudinaryService.getThumbnailUrl ? 
            CloudinaryService.getThumbnailUrl(responseData.imagen_public_id) : 
            responseData.ruta_imagen,
          detail: CloudinaryService.getDetailUrl ? 
            CloudinaryService.getDetailUrl(responseData.imagen_public_id) : 
            responseData.ruta_imagen,
          catalog: CloudinaryService.getOptimizedUrl ? 
            CloudinaryService.getOptimizedUrl(responseData.imagen_public_id, {
              width: 500,
              height: 500,
              crop: 'fill'
            }) : responseData.ruta_imagen
        };
      }
      if(responseData.imagen_public_id2){
        responseData.imagen2_optimizada = {
          original: responseData.ruta_imagen2,
          thumbnail: CloudinaryService.getThumbnailUrl(responseData.imagen_public_id2),
          detail: CloudinaryService.getDetailUrl(responseData.imagen_public_id2),
          catelog: CloudinaryService.getOptimizedUrl(responseData.imagen_public_id2, {
            width: 500,
            height: 500,
            crop: 'fill'
          })
        }
      }

      console.log(`✅ Producto ${responseData.desc} actualizado`);

      res.status(200).json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: responseData
      });

    } catch (error) {
      console.error('❌ Error actualizando producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error actualizando producto',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // UPDATE solo imagen principal del producto (método específico)
  updateProductImageOnly: async (req, res) => {
    try {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere id del producto'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó imagen'
        });
      }

      // Buscar producto
      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      // Borrar imagen anterior si existe
      if (product.imagen_public_id) {
        try {
          await CloudinaryService.deleteImage(product.imagen_public_id);
        } catch (deleteError) {
          console.warn('No se pudo borrar imagen anterior:', deleteError);
        }
      }

      // Subir nueva imagen
      const result = await CloudinaryService.uploadImage(
        req.file.buffer,
        'productos'
      );

      // Actualizar solo imagen
      await product.update({
        ruta_imagen: result.secure_url,
        imagen_public_id: result.public_id,
      });

      res.status(200).json({
        success: true,
        message: 'Imagen del producto actualizada',
        data: {
          producto: {
            id: product.id,
            desc: product.desc
          },
          imagen: {
            url: result.secure_url,
            public_id: result.public_id,
            thumbnail: CloudinaryService.getThumbnailUrl ? 
              CloudinaryService.getThumbnailUrl(result.public_id) : 
              result.secure_url
          }
        }
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar imagen del producto'
      });
    }
  },
updateProductImage2Only: async (req, res) => {
    try {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere id del producto'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó imagen secundaria'
        });
      }

      // Buscar producto
      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      // Borrar imagen secundaria anterior si existe
      if (product.imagen_public_id2) {
        try {
          await CloudinaryService.deleteImage(product.imagen_public_id2);
        } catch (deleteError) {
          console.warn('No se pudo borrar imagen secundaria anterior:', deleteError);
        }
      }

      // Subir nueva imagen secundaria
      const result = await CloudinaryService.uploadImage(
        req.file.buffer,
        'productos'
      );

      // Actualizar solo imagen secundaria
      await product.update({
        ruta_imagen2: result.secure_url,
        imagen_public_id2: result.public_id,
      });

      res.status(200).json({
        success: true,
        message: 'Imagen secundaria del producto actualizada',
        data: {
          producto: {
            id: product.id,
            desc: product.desc
          },
          imagen2: {
            url: result.secure_url,
            public_id: result.public_id,
            thumbnail: CloudinaryService.getThumbnailUrl(result.public_id),
            detail: CloudinaryService.getDetailUrl(result.public_id)
          }
        }
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar imagen secundaria del producto'
      });
    }
  },

  deletePrincipalProductImage: async (req, res) => {
    try {
      const { id } = req.body; 
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere id del producto'
        });
      }

      const producto = await Product.findByPk(id);
      
      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      if (!producto.imagen_public_id) {
        return res.status(400).json({
          success: false,
          message: 'Este producto no tiene imagen en Cloudinary'
        });
      }

      // Borrar de Cloudinary
      await CloudinaryService.deleteImage(producto.imagen_public_id);

      // Actualizar producto
      await producto.update({
        ruta_imagen: null,
        imagen_public_id: null
      });

      res.status(200).json({
        success: true,
        message: 'Imagen eliminada exitosamente',
        data: {
          producto: {
            id: producto.id,
            desc: producto.desc
          }
        }
      });
    } catch (error) {
      console.error('❌ Error eliminando imagen:', error);
      res.status(500).json({
        success: false,
        message: 'Error eliminando imagen',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  deleteProductImage2: async (req, res) => {
    try {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere id del producto'
        });
      }

      const producto = await Product.findByPk(id);
      
      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      if (!producto.imagen_public_id2) {
        return res.status(400).json({
          success: false,
          message: 'Este producto no tiene imagen secundaria en Cloudinary'
        });
      }
      await CloudinaryService.deleteImage(producto.imagen_public_id2);
      await producto.update({
        ruta_imagen2: null,
        imagen_public_id2: null
      });

      res.status(200).json({
        success: true,
        message: 'Imagen secundaria eliminada exitosamente',
        data: {
          producto: {
            id: producto.id,
            desc: producto.desc,
          }
        }
      });
    } catch (error) {
      console.error('❌ Error eliminando imagen secundaria:', error);
      res.status(500).json({
        success: false,
        message: 'Error eliminando imagen secundaria',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  // DELETE: Eliminar AMBAS imágenes del producto (versión simple)
deleteAllProductImages: async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere id del producto'
      });
    }

    const producto = await Product.findByPk(id);
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    if (producto.imagen_public_id) {
      try {
        await CloudinaryService.deleteImage(producto.imagen_public_id);
      } catch (error) {
        console.warn('No se pudo eliminar imagen principal:', error.message);
      }
    }
    
    if (producto.imagen_public_id2) {
      try {
        await CloudinaryService.deleteImage(producto.imagen_public_id2);
      } catch (error) {
        console.warn('No se pudo eliminar imagen secundaria:', error.message);
      }
    }

    await producto.update({
      ruta_imagen: null,
      imagen_public_id: null,
      ruta_imagen2: null,
      imagen_public_id2: null
    });

    res.status(200).json({
      success: true,
      message: 'Imágenes eliminadas del sistema',
      data: {
        producto: {
          id: producto.id,
          desc: producto.desc
        }
      }
    });

  } catch (error) {
    console.error('❌ Error eliminando imágenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando imágenes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
},

  // ========== CATEGORÍAS ==========

  createCategoryWithImage: async (req, res) => {
    try {
      const { desc, parent } = req.body;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere imagen para la categoría'
        });
      }

      
      const cloudinaryResult = await CloudinaryService.uploadImage(
        req.file.buffer,
        'categorias'
      );

      
      const nuevaCategoria = await Category.create({
        desc,
        parent: parent || -1,
        ruta_imagen: cloudinaryResult.secure_url,
        imagen_public_id: cloudinaryResult.public_id
      });

      res.status(201).json({
        success: true,
        message: 'Categoría creada exitosamente',
        data: {
          categoria: nuevaCategoria,
          imagen: {
            url: cloudinaryResult.secure_url,
            public_id: cloudinaryResult.public_id
          }
        }
      });
    } catch (error) {
      console.error('❌ Error creando categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error creando categoría',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const { id, desc, parent } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere id de la categoría'
        });
      }

      console.log(`✏️ Actualizando categoría ID: ${id}`);

      const category = await Category.findByPk(id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }

      const updateData = {};
      
      if (desc !== undefined && desc !== null) {
        updateData.desc = desc.trim();
      }
      
      if (parent !== undefined && parent !== null) {
        updateData.parent = parseInt(parent);
      }

      if (req.file) {
        if (category.imagen_public_id) {
          try {
            await CloudinaryService.deleteImage(category.imagen_public_id);
            console.log(`🗑️ Imagen anterior borrada: ${category.imagen_public_id}`);
          } catch (deleteError) {
            console.warn('No se pudo borrar imagen anterior:', deleteError.message);
          }
        }

        const cloudinaryResult = await CloudinaryService.uploadImage(
          req.file.buffer,
          'categorias'
        );
        
        updateData.ruta_imagen = cloudinaryResult.secure_url;
        updateData.imagen_public_id = cloudinaryResult.public_id;
        console.log(`🖼️ Nueva imagen subida: ${cloudinaryResult.public_id}`);
      }

      await category.update(updateData);
      
      const updatedCategory = await Category.findByPk(id);

      const responseData = updatedCategory.toJSON();
      
      if (responseData.imagen_public_id) {
        responseData.imagen_optimizada = {
          original: responseData.ruta_imagen,
          thumbnail: CloudinaryService.getThumbnailUrl ? 
            CloudinaryService.getThumbnailUrl(responseData.imagen_public_id) : 
            responseData.ruta_imagen,
          medium: CloudinaryService.getOptimizedUrl ? 
            CloudinaryService.getOptimizedUrl(responseData.imagen_public_id, {
              width: 500,
              height: 500,
              crop: 'fill',
              quality: 85
            }) : responseData.ruta_imagen
        };
      }

      console.log(`✅ Categoría ${responseData.desc} actualizada`);

      res.status(200).json({
        success: true,
        message: 'Categoría actualizada exitosamente',
        data: responseData
      });

    } catch (error) {
      console.error('❌ Error actualizando categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error actualizando categoría',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  deleteCategoryImage: async (req, res) => {
    try {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere id de la categoría'
        });
      }

      const category = await Category.findByPk(id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }

      if (!category.imagen_public_id) {
        return res.status(400).json({
          success: false,
          message: 'Esta categoría no tiene imagen en Cloudinary'
        });
      }

      await CloudinaryService.deleteImage(category.imagen_public_id);

      await category.update({
        ruta_imagen: null,
        imagen_public_id: null
      });

      res.status(200).json({
        success: true,
        message: 'Imagen de categoría eliminada',
        data: {
          categoria: {
            id: category.id,
            desc: category.desc
          }
        }
      });
    } catch (error) {
      console.error('❌ Error eliminando imagen de categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error eliminando imagen de categoría'
      });
    }
  },
  
  // Subir imagen sin asociar (para pruebas)
  uploadImage: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ninguna imagen'
        });
      }

      const result = await CloudinaryService.uploadImage(
        req.file.buffer,
        req.body.folder || 'general'
      );

      res.status(200).json({
        success: true,
        message: 'Imagen subida exitosamente',
        data: {
          public_id: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes
        }
      });
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      res.status(500).json({
        success: false,
        message: 'Error al subir la imagen',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = uploadController;