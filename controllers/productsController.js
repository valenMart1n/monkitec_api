const db = require("../src/models");
const Product = db.Product;
const CloudinaryService = require("../src/services/cloudinary.service");
const uploadMiddleware = require("../src/middleware/upload.middleware");

let products = {
  create: 
    async (req, res) => {
      try {
        const { desc, precio, category_id, stock_total } = req.body;
        
        if (!desc || !precio || !category_id || !stock_total) {
          return res.status(400).json({
            success: false,
            message: 'Faltan campos requeridos: desc, precio, category_id'
          });
        }

        let imagenData = {
          ruta_imagen:null,
          imagen_public_id: null,
          ruta_imagen2:null,
          imagen_public_id2: null,
        }
        //Primera Imagen
        if (req.files && req.files.imagen && req.files.imagen[0]) {
          const cloudinaryResult = await CloudinaryService.uploadImage(
            req.files.imagen[0].buffer,
            'productos'
          );
        
          imagenData.ruta_imagen = cloudinaryResult.secure_url;
          imagenData.imagen_public_id = cloudinaryResult.public_id;
        }
        //Segunda Imagen
        if(req.files && req.files.imagen2 && req.files.imagen2[0]){
          const cloudinaryResult2 = await CloudinaryService.uploadImage(
            req.files.imagen2[0].buffer,
            "productos"
          );
          imagenData.ruta_imagen2 = cloudinaryResult2.secure_url;
          imagenData.imagen_public_id2 = cloudinaryResult2.public_id;
        }

        const productData = {

          desc: desc,
          precio: parseInt(precio),
          category_id: parseInt(category_id),
          stock_total: parseInt(stock_total),
          ...imagenData 
        };

        const newProduct = await Product.create(productData);

        res.status(201).json({
          success: true,
          data: newProduct.id,
          message: 'Producto creado exitosamente'
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
  
  update: async (req, res) => {
  try {
    let id, desc, precio, category_id, stock_total;
    
    if (req.body && typeof req.body === 'object') {
      ({ id, desc, precio, category_id, stock_total } = req.body);
    }
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere id del producto'
      });
    }
    
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    const updateData = {};
    
    if (desc !== undefined && desc !== null && desc !== '') {
      updateData.desc = desc;
    }
    
    if (precio !== undefined && precio !== null && precio !== '') {
      updateData.precio = parseInt(precio);
    }
    
    if (category_id !== undefined && category_id !== null && category_id !== '') {
      updateData.category_id = parseInt(category_id);
    }
    
    if (stock_total !== undefined && stock_total !== null && stock_total !== '') {
      updateData.stock_total = parseInt(stock_total);
    }
    
    if (req.files && req.files.imagen && req.files.imagen[0]) {
      if (product.imagen_public_id) {
        try {
          await CloudinaryService.deleteImage(product.imagen_public_id);
        } catch (deleteError) {
          console.warn('No se pudo borrar foto anterior:', deleteError.message);
        }
      }
      
      const cloudinaryResult = await CloudinaryService.uploadImage(
        req.files.imagen[0].buffer,
        'productos'
      );
      
      updateData.ruta_imagen = cloudinaryResult.secure_url;
      updateData.imagen_public_id = cloudinaryResult.public_id;
    }

    if(req.files && req.files.imagen2 && req.files.imagen2[0]){
      if(product.imagen_public_id2){
        try{
          await CloudinaryService.deleteImage(product.imagen_public_id2);
        } catch(deleteError){
          console.warn(deleteError);
        }
      }
      const cloudinaryResult = await CloudinaryService.uploadImage(
        req.files.imagen2[0].buffer,
        "productos"
      );
      updateData.ruta_imagen2 = cloudinaryResult.secure_url;
      updateData.imagen_public_id2 = cloudinaryResult.public_id;
    }
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron datos para actualizar'
      });
    }
    
    await product.update(updateData);
    
    res.status(200).json({
      success: true,
      message: 'Producto actualizado exitosamente',
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error actualizando producto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
},
  delete: async (req, res) => {
    try {
     let id;
    
    if (req.body) {
      id = parseInt(req.body.id);
    }
      
      const product = await Product.findByPk(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

     
      if (product.imagen_public_id) {
        try {
          await CloudinaryService.deleteImage(product.imagen_public_id);
        } catch (deleteError) {
          console.warn('No se pudo borrar imagen de Cloudinary:', deleteError.message);
        }
      }
      if (product.imagen_public_id2) {
        try {
          await CloudinaryService.deleteImage(product.imagen_public_id2);
        } catch (deleteError) {
          console.warn('No se pudo borrar imagen de Cloudinary:', deleteError.message);
        }
      }

      await product.destroy();

      res.status(200).json({
        success: true,
        message: 'Producto eliminado exitosamente'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error eliminando producto'
      });
    }
  },

  list: async (req, res) => {
    try {
      const products = await Product.findAll({
        include: [
          { model: db.Category, as: 'Category' },
          { model: db.Variation, as: 'Variations' }
        ],
        order: [['id', 'DESC']]
      });
      //Transformar URLs de imágenes para optimización
      const productsWithOptimizedImages = products.map(product => {
        const productJson = product.toJSON();
        
        if (productJson.imagen_public_id) {
          // Agregar URLs optimizadas
          productJson.imagen_optimizada = {
            thumbnail: CloudinaryService.getThumbnailUrl(productJson.imagen_public_id),
            detail: CloudinaryService.getDetailUrl(productJson.imagen_public_id),
            original: productJson.ruta_imagen
          };
        }
        
        if (productJson.imagen_public_id2) {
          // Agregar URLs optimizadas
          productJson.imagen2_optimizada = {
            thumbnail: CloudinaryService.getThumbnailUrl(productJson.imagen_public_id2),
            detail: CloudinaryService.getDetailUrl(productJson.imagen_public_id2),
            original: productJson.ruta_imagen2
          };
        }
        
        return productJson;
      });

      res.status(200).json({
        success: true,
        count: products.length,
        data: productsWithOptimizedImages
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error obteniendo productos'
      });
    }
  },
 
  listByCategory: async (req, res) => {
    try {
      const { category_id } = req.body;
      
  
      if (!category_id) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere category_id en el cuerpo de la solicitud'
        });
      }
       // Buscar productos de la categoría
      const products = await Product.findAll({
        where: {
          category_id: category_id
        },
        include: [
          {
            model: db.Category,
            as: "Category",
            attributes: ['id', 'desc'] 
          },
          {
            model: db.Variation,
            as: "Variations",
            attributes: ['id', 'descripcion'],
            through: { 
              attributes: ['stock'],
              as: 'stock_info' 
            }
          }
        ],
        order: [['id', 'DESC']]
      });

      // Transformar productos para incluir URLs optimizadas de Cloudinary
      const productsWithOptimizedImages = products.map(product => {
        const productJson = product.toJSON();
        
       //Generar URLs optimizadas
        if (productJson.imagen_public_id) {
          productJson.imagen_optimizada = {
            original: productJson.ruta_imagen,
            thumbnail: CloudinaryService.getThumbnailUrl(productJson.imagen_public_id),
            medium: CloudinaryService.getOptimizedUrl(productJson.imagen_public_id, {
              width: 500,
              height: 500,
              crop: 'fill',
              quality: 85
            }),
            large: CloudinaryService.getDetailUrl(productJson.imagen_public_id)
          };
          productJson.has_image = true;
        } else {
          productJson.has_image = false;
        };
               
        if (productJson.imagen_public_id2) {
          productJson.imagen2_optimizada = {
            original: productJson.ruta_imagen2,
            thumbnail: CloudinaryService.getThumbnailUrl(productJson.imagen_public_id2),
            medium: CloudinaryService.getOptimizedUrl(productJson.imagen_public_id2, {
              width: 500,
              height: 500,
              crop: 'fill',
              quality: 85
            }),
            large: CloudinaryService.getDetailUrl(productJson.imagen_public_id2)
          };
          productJson.has_image2 = true;
        } else {
          productJson.has_image2 = false;
        };
        productJson.disponible = productJson.stock_total > 0;
        
        delete productJson.createdAt;
        delete productJson.updatedAt;
        
        return productJson;
      });
      const category = await db.Category.findByPk(category_id, {
        attributes: ['id', 'desc']
      });
    
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada',
          category_id: category_id
        });
      }

      res.status(200).json({
        success: true,
        message: `Productos de la categoría "${category.desc}"`,
        data: {
          category: category,
          products: productsWithOptimizedImages,
          count: products.length,
          stats: {
            con_imagen: products.filter(p => p.ruta_imagen).length,
            con_imagen2: products.filter(p => p.ruta_imagen2).length,
            sin_imagen: products.filter(p => !p.ruta_imagen).length,
            disponibles: productsWithOptimizedImages.filter(p => p.disponible).length,
            agotados: productsWithOptimizedImages.filter(p => !p.disponible).length
          }
        }
      });

    } catch (error) {
      console.error('❌ Error listando productos por categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo productos de la categoría',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        request_body: req.body // Para debugging
      });
    }
  },
   getById: async (req, res) => {
  try {
    const { id } = req.body;
    
    // Validar que se proporcione id en el body
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere id en el cuerpo de la solicitud'
      });
    }

    console.log(`🔍 Buscando producto con ID: ${id} (tipo: ${typeof id})`);

    const product = await Product.findByPk(id, {
      include: [
        { model: db.Category, as: 'Category' },
        { model: db.Variation, as: 'Variations' }
      ]
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
        requested_id: id
      });
    }

    const productJson = product.toJSON();
    
    // Agregar URLs optimizadas si tiene imagen
    if (productJson.imagen_public_id) {
      productJson.imagen_optimizada = {
        original: productJson.ruta_imagen,
        thumbnail: CloudinaryService.getThumbnailUrl(productJson.imagen_public_id),
        detail: CloudinaryService.getDetailUrl(productJson.imagen_public_id),
        catalog: CloudinaryService.getOptimizedUrl(productJson.imagen_public_id, {
          width: 500,
          height: 500,
          crop: 'fill'
        }),
        zoom: CloudinaryService.getOptimizedUrl(productJson.imagen_public_id, {
          width: 1200,
          height: 1200,
          crop: 'limit',
          quality: 90
        })
      };
    }
    
    if (productJson.imagen_public_id2) {
      productJson.imagen2_optimizada = {
        original: productJson.ruta_imagen2,
        thumbnail: CloudinaryService.getThumbnailUrl(productJson.imagen_public_id2),
        detail: CloudinaryService.getDetailUrl(productJson.imagen_public_id2),
        catalog: CloudinaryService.getOptimizedUrl(productJson.imagen_public_id2, {
          width: 500,
          height: 500,
          crop: 'fill'
        }),
        zoom: CloudinaryService.getOptimizedUrl(productJson.imagen_public_id2, {
          width: 1200,
          height: 1200,
          crop: 'limit',
          quality: 90
        })
      };
    }
    productJson.disponible = productJson.stock_total > 0;

    res.status(200).json({
      success: true,
      message: 'Producto encontrado',
      data: productJson
    });

  } catch (error) {
    console.error('❌ Error obteniendo producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo producto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      request_body: req.body
    });
  }
},
last5: async(req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  
  try {
    const result = await db.Product.findAll({
      limit: limit,
      order: [['id', 'DESC']], 
      include: [
        {
          model: db.Category,
          as: "Category",
          attributes: ['id', 'desc'] 
        },
        {
          model: db.Variation,
          as: "Variations",
          attributes: ['id', 'descripcion']
        }
      ],
      attributes: ['id', 'desc', 'precio', 'stock_total', 'ruta_imagen', 'imagen_public_id', 'ruta_imagen2', 'imagen_public_id2']
    });
    
    res.json({
      success: true,
      data: result,
      count: result.length
    });
    
  } catch(error) {
    console.log(error);
  }
}
}

module.exports = products;