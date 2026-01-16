module.exports =(sequelize, dataTypes) => {
    let alias = "Product";
    let cols = {
        id:{
            type:dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        desc:{
            type: dataTypes.STRING
        },
        precio:{
            type: dataTypes.INTEGER
        },
        category_id:{
            type: dataTypes.INTEGER
        },
        ruta_imagen:{
            type: dataTypes.STRING
        },
        imagen_public_id: {  
            type: dataTypes.STRING
        },
        ruta_imagen2:{
            type: dataTypes.STRING,
            allowNull: true, 
            defaultValue: null
        },
        imagen_public_id2:{
            type: dataTypes.STRING,
            allowNull: true,  
            defaultValue: null
        },
         stock_total: {
            type: dataTypes.INTEGER
        }
    }
    let config = {
        tableName: "productos",
        timestamps: false
    };

    const Product = sequelize.define(alias, cols, config);

    Product.associate = function(models){
        Product.belongsTo(models.Category, {
            foreignKey: "category_id",
            as: "Category"
        });
        Product.belongsToMany(models.Variation, {
            through: models.Product_Variation, 
            foreignKey: "id_producto",
            otherKey: "id_variacion",
            as: "Variations"
        })
    }

    return Product;
}