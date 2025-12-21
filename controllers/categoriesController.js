const db = require('../src/models');
const CloudinaryService = require("../src/services/cloudinary.service");

let categories = {
    list: async (req, res) => {   
        try {
            console.log("Buscando categorías principales");
            
            const result = await db.Category.findAll({
                where: {
                    parent: -1
                }
            });
            
            console.log(`Encontradas ${result.length} categorías principales`);
            
            const categoriesArray = result.map(function(data){
                const categoryData = {
                    id: data.id,
                    desc: data.desc,
                    parent: data.parent,
                    ruta_imagen: data.ruta_imagen,
                    imagen_public_id: data.imagen_public_id
                };
                
                // Si tiene imagen en Cloudinary, generar URLs optimizadas
                if (data.imagen_public_id) {
                    categoryData.imagen_optimizada = {
                        original: data.ruta_imagen,
                        thumbnail: CloudinaryService.getThumbnailUrl ? 
                            CloudinaryService.getThumbnailUrl(data.imagen_public_id) : 
                            data.ruta_imagen,
                        medium: CloudinaryService.getOptimizedUrl ? 
                            CloudinaryService.getOptimizedUrl(data.imagen_public_id, {
                                width: 500,
                                height: 500,
                                crop: 'fill',
                                quality: 85
                            }) : data.ruta_imagen
                    };
                } else {
                    categoryData.imagen_optimizada = {
                        original: null,
                        thumbnail: null,
                        medium: null,
                        has_image: false
                    };
                }
                
                return categoryData;
            });
            
            console.log("Datos retornados con imágenes");
            res.json({
                success: true,
                count: categoriesArray.length,
                data: categoriesArray
            });
            
        } catch (error) {
            console.error('Error en list:', error);
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    },
    
    getByParent: async(req, res) => {
        try {
            const { parent_id } = req.body;
            
            if (!parent_id && parent_id !== 0) {
                return res.status(400).json({
                    success: false,
                    error: "parent_id es requerido"
                });
            }
            
            console.log(`Buscando categorías con parent: ${parent_id}`);
            
            const result = await db.Category.findAll({
                where: {
                    parent: parent_id
                }
            });
            
            console.log(`Encontradas ${result.length} categorías hijas`);
            
            const categoriesArray = result.map(function(data){
                const categoryData = {
                    id: data.id,
                    desc: data.desc,
                    parent: data.parent,
                    ruta_imagen: data.ruta_imagen,
                    imagen_public_id: data.imagen_public_id
                };
                
                // Si tiene imagen en Cloudinary, generar URLs optimizadas
                if (data.imagen_public_id) {
                    categoryData.imagen_optimizada = {
                        original: data.ruta_imagen,
                        thumbnail: CloudinaryService.getThumbnailUrl ? 
                            CloudinaryService.getThumbnailUrl(data.imagen_public_id) : 
                            data.ruta_imagen,
                        medium: CloudinaryService.getOptimizedUrl ? 
                            CloudinaryService.getOptimizedUrl(data.imagen_public_id, {
                                width: 400,
                                height: 400,
                                crop: 'fill',
                                quality: 85
                            }) : data.ruta_imagen
                    };
                } else {
                    categoryData.imagen_optimizada = {
                        original: null,
                        thumbnail: null,
                        medium: null,
                        has_image: false
                    };
                }
                
                return categoryData;
            });
            
            res.json({
                success: true,
                parent_id: parent_id,
                count: categoriesArray.length,
                data: categoriesArray
            });
            
        } catch (error) {
            console.error('Error en getByParent:', error);
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    },
    
    getById: async(req, res) => {
        try {
            const { id } = req.body;
            
            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: "id es requerido"
                });
            }
            
            console.log(`Buscando categoría con id: ${id}`);
            
            const result = await db.Category.findOne({
                where: {
                    id: id
                }
            });
            
            if (!result) {
                return res.status(404).json({ 
                    success: false,
                    error: "Categoría no encontrada",
                    code: "CATEGORY_NOT_FOUND" 
                });
            }
            
            const categoryData = {
                id: result.id,
                desc: result.desc,
                parent: result.parent,
                ruta_imagen: result.ruta_imagen,
                imagen_public_id: result.imagen_public_id
            };
            
            // Si tiene imagen en Cloudinary, generar URLs optimizadas
            if (result.imagen_public_id) {
                categoryData.imagen_optimizada = {
                    original: result.ruta_imagen,
                    thumbnail: CloudinaryService.getThumbnailUrl ? 
                        CloudinaryService.getThumbnailUrl(result.imagen_public_id) : 
                        result.ruta_imagen,
                    medium: CloudinaryService.getOptimizedUrl ? 
                        CloudinaryService.getOptimizedUrl(result.imagen_public_id, {
                            width: 600,
                            height: 600,
                            crop: 'fill',
                            quality: 90
                        }) : result.ruta_imagen,
                    large: CloudinaryService.getDetailUrl ? 
                        CloudinaryService.getDetailUrl(result.imagen_public_id) : 
                        result.ruta_imagen
                };
            } else {
                categoryData.imagen_optimizada = {
                    original: null,
                    thumbnail: null,
                    medium: null,
                    large: null,
                    has_image: false
                };
            }
            
            console.log("Categoría encontrada y procesada");
            res.json({
                success: true,
                data: categoryData
            });
            
        } catch(error) {
            console.error("Error en getById: ", error);
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    },
    update: async (req, res) => {
  try {
    const { id, desc, parent } = req.body;
    
    // Validar que se proporcione id
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere id de la categoría'
      });
    }

    console.log(`✏️ Actualizando categoría ID: ${id}`);
    
    // Buscar la categoría
    const category = await db.Category.findByPk(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Preparar datos para actualizar
    const updateData = {};
    
    if (desc !== undefined) {
      updateData.desc = desc.trim();
    }
    
    if (parent !== undefined) {
      updateData.parent = parseInt(parent);
    }

    // Manejo de imagen si se subió
    if (req.file) {
      // Borrar imagen anterior si existe
      if (category.imagen_public_id) {
        try {
          await CloudinaryService.deleteImage(category.imagen_public_id);
          console.log(`🗑️ Imagen anterior borrada: ${category.imagen_public_id}`);
        } catch (error) {
          console.warn('⚠️ No se pudo borrar imagen anterior:', error.message);
        }
      }

      // Subir nueva imagen
      const uploadResult = await CloudinaryService.uploadImage(
        req.file.buffer,
        'categorias'
      );

      updateData.ruta_imagen = uploadResult.secure_url;
      updateData.imagen_public_id = uploadResult.public_id;
      
      console.log(`🖼️ Nueva imagen subida: ${uploadResult.public_id}`);
    }

    // Actualizar la categoría
    await category.update(updateData);
    
    // Obtener la categoría actualizada
    const updatedCategory = await db.Category.findByPk(id);

    // Preparar respuesta con imagen optimizada si existe
    const responseData = {
      id: updatedCategory.id,
      desc: updatedCategory.desc,
      parent: updatedCategory.parent,
      ruta_imagen: updatedCategory.ruta_imagen,
      imagen_public_id: updatedCategory.imagen_public_id
    };

    // Agregar URLs optimizadas si tiene imagen
    if (updatedCategory.imagen_public_id) {
      responseData.imagen_optimizada = {
        original: updatedCategory.ruta_imagen,
        thumbnail: CloudinaryService.getThumbnailUrl ? 
          CloudinaryService.getThumbnailUrl(updatedCategory.imagen_public_id) : 
          updatedCategory.ruta_imagen,
        medium: CloudinaryService.getOptimizedUrl ? 
          CloudinaryService.getOptimizedUrl(updatedCategory.imagen_public_id, {
            width: 500,
            height: 500,
            crop: 'fill',
            quality: 85
          }) : updatedCategory.ruta_imagen
      };
    }

    console.log(`✅ Categoría ${updatedCategory.desc} actualizada`);

    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: responseData
    });

  } catch (error) {
    console.error('❌ Error actualizando categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar categoría',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}   
}

module.exports = categories;