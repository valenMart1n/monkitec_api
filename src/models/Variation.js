module.exports =(sequelize, dataTypes) => {
    let alias = "Variation";
    let cols = {
        id:{
            type:dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        descripcion:{
            type: dataTypes.STRING
        }
    }
    let config = {
        tableName: "variaciones",
        timestamps: false
    };

    const Variation = sequelize.define(alias, cols, config);

    Variation.associate = function(models){
        Variation.belongsToMany(models.Product, {
            through: models.Product_Variation,
            foreignKey: "id_variacion",
            otherKey: "id_producto",
            as: "Products"
        })
    }

    return Variation;
}