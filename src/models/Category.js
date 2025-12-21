module.exports = (sequelize, dataTypes) => {
    let alias = 'Category';
    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        desc: {
            type: dataTypes.STRING
        },
        parent:{
            type:dataTypes.INTEGER
        },
        ruta_imagen:{
            type: dataTypes.STRING
        },
        imagen_public_id: {
            type: dataTypes.STRING,
            allowNull: true
  }
    };
    let config = {
        tableName: 'categorias',
        timestamps: false
    };
    const Category = sequelize.define(alias, cols, config)

    Category.associate = function(models){
        Category.hasMany(models.Product, {
            foreignKey: "category_id",
            as: "Products"
        });
    };

    return Category;
}