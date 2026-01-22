const db = require("../src/models");
const bcrypt = require('bcryptjs');
let user = {
    list: async(req, res) => {
        try{
            const result = await db.User.findAll();
            const usersArray = result.map(function (data){
                return{
                    id: data.id,
                    username: data.username
                }
            })
            res.json(usersArray);
        }catch(error){
            console.error("Error: ", error);
            res.status(500).json({error: error.message})
        }
    },
    create: async(req, res) => {
        try{
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            const UserData = {
                username: req.body.username,
                password: hashedPassword
            }
            await db.User.create(UserData);

            res.status(201).json({
                success: true,
                message: "Usuario creado correctamente"
            })
        }catch(error){
            console.error("Error: ", error);
            res.status(500).json({error: error.message})
        }
    },
    update: async(req, res) => {
        try{
            const user = req.user;
            const {username, password} = req.body;
            const updateData = {};

            if (username != undefined) {
                if(username.trim().length < 1){
                    return res.status(400).json({
                        success: false,
                        message: "El usuario no puede estar vacío"
                    });
                }
                updateData.username = username.trim();
            }

            if(password != undefined && password != ""){
                if(password.length < 1){
                    return res.status(400).json({
                        success: false,
                        message: "La contraseña no puede estar vacía"
                    });
                }
                updateData.password = await bcrypt.hash(password, 10);
            }

            if(Object.keys(updateData).length === 0){
                return res.status(400).json({
                    success: false,
                    message: "No se enviaron datos para actualizar"
                });
            }

            await user.update(updateData);

            res.status(200).json({
                success: true,
                message: "Usuario actualizado correctamente",
                updatedFields: Object.keys(updateData),
                user: {
                    id: user.id,
                    username: user.username
                }
            });
        }catch(error){
            console.error("Error: ", error);
            res.status(500).json({error: error.message});
        }    
    }    
}
module.exports = user;