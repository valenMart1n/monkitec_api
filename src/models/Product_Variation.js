module.exports =(sequelize, dataTypes) => {
    let alias = "Product_Variation";
    let cols = {
        id:{
            type:dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_producto:{
            type: dataTypes.INTEGER
        },
        id_variacion:{
            type: dataTypes.INTEGER
        },
        stock:{
            type: dataTypes.INTEGER
        }
    }
    let config = {
        tableName: "producto-variacion",
        timestamps: false
    };

    const Product_Variation = sequelize.define(alias, cols, config);

     Product_Variation.associate = function(models) {
        Product_Variation.belongsTo(models.Product, {
            foreignKey: 'id_producto'
        });
        Product_Variation.belongsTo(models.Variation, {
            foreignKey: 'id_variacion'
        });
    };
    
    return Product_Variation;
}