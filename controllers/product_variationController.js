const db = require("../src/models");

let product_variation = {
    getById: async(req, res) => { 
        try{  
            const result = await db.Product_Variation.findAll({
                where:{
                    id_producto: req.body.id
                },
                include: [
                    {
                        model: db.Category,
                        as: "Category"
                    },
                    {
                        model: db.Variation,
                        as: "Variation",
                        through: {
                            attributes: ['stock']
                        }
                    }
                ]
            });

        res.json(result);
      
        }catch(error){
            console.error('Error:', error);
            res.status(500).json({ error: error.message });
        }
    },
    addNewAssociate: async(req, res) => {
    try{
       const { id_producto, id_variacion, stock } = req.body;
       const product = await db.Product.findByPk(id_producto);
       const variation = await db.Variation.findByPk(id_variacion);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
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
}

}
module.exports = product_variation;