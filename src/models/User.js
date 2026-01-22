module.exports =(sequelize, dataTypes) => {
    let alias = "User";
    let cols = {
        id:{
            type:dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username:{
            type: dataTypes.STRING
        },
        password:{
            type: dataTypes.STRING
        }
    }
    let config = {
        tableName: "users",
        timestamps: false
    };

    const User = sequelize.define(alias, cols, config);

    return User;
}