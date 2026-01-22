const db = require("../src/models");

let product_variation = {
    getById: async(req, res) => { 
    try{  
        const result = await db.Product_Variation.findAll({
            where: {
                id_producto: req.body.id
            }
        });

        res.json(result);
      
    } catch(error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
},
    addNewAssociate: async(req, res) => {
    try{
       const { id_producto, id_variacion, stock } = req.body;
       const product = await db.Product.findByPk(id_producto);
       const variation = await db.Variation.findByPk(id_variacion);
    
    
    if (!variation) {
      return res.status(404).json({
        success: false,
        message: 'Variación no encontrada'
      });
    }
    const Product_Variation_Data = {
          id_producto: parseInt(id_producto),
          id_variacion: parseInt(id_variacion),
          stock: parseInt(stock),
    };

    await db.Product_Variation.create(Product_Variation_Data);
    

    const associations = await db.Product_Variation.findAll({
      where: { id_producto: id_producto },
      attributes: ['stock']
    });

    const newStockTotal = associations.reduce((total, association) => {
      return total + (association.stock || 0);
    }, 0);
    
    await db.Product.update(
      { stock_total: newStockTotal },
      { where: { id: id_producto } }
    );
    
    res.status(201).json({
      success: true,
      message: 'Asociación creada exitosamente',
    });
    
  }catch(error){
     res.status(500).json({
      success: false,
      message: 'Error creando asociación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
},
  update: async(req, res) => {
    try {
        const { id, stock } = req.body;
        
        // Validar que vengan los datos necesarios
        if (!id || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren id y stock'
            });
        }
        
        const variation = await db.Product_Variation.findByPk(id);
        
        if (!variation) {
            return res.status(404).json({  // 404 es más apropiado
                success: false,
                message: 'Variación no encontrada'
            });
        }
        
        // Convertir stock a número
        const stockNumber = parseInt(stock) || 0;
        
        // Actualizar
        await variation.update({ 
            stock: Math.max(0, stockNumber)  // Evitar números negativos
        });
        
        res.status(200).json({
            success: true,
            message: 'Stock actualizado exitosamente',
            data: {
                id: variation.id,
                stock: stockNumber
            }
        });

    } catch(err) {  // Usar otro nombre para evitar confusión
        console.error('Error en update de product-variation:', err);
        
        res.status(500).json({
            success: false,
            message: 'Error en la actualización',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
},
    delete: async(req, res) => {
        try{
            const variation = await db.Product_Variation.findByPk(req.body.id);
            const stock = variation.stock;

            const product = await db.Product.findByPk(variation.id_producto);
            const stockTotal= product.stock_total - stock;
            
            await product.update({  
              stock_total: stockTotal
            })

            await db.Product_Variation.destroy({
                where:{
                    id: req.body.id
                }
            });

            res.status(201).json({
                success: true,
                message: "Variant"
            })
        }catch(error){
            res.status(500).json({error: error.message});
        }
  },

  deleteAll: async(req, res)  => {
    try{
      await db.Product_Variation.destroy({
        where:{
          id_producto: req.body.id
        }
      });
      res.status(201).json({
                success: true,
                message: "Variants destroyed"
      })
    }catch(error){
      res.status(500).json({error: error.message});
    }
  }
}
module.exports = product_variation;