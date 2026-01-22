const db = require("../src/models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

let auth = {
    login: async(req, res) => {
        try{
            const {username, password} = req.body;

            if(!username || !password){
                return res.status(400).json({
                    success: false,
                    message: "Usuario y contraseña son necesarios"
                });
            }

            const user = await db.User.findOne({
                where: {username: username.trim()}
            });

            console.log("Usuario encontrado: ", user ? "SI" : "NO");

            if(!user){
                return res.status(401).json({
                    success: false,
                    message: "Usuario o contraseña incorrectos"
                });
            }

            const validPassword = await bcrypt.compare(password, user.password);
            console.log("Password válida:", validPassword);

            if(!validPassword){
                return res.status(401).json({
                    success: false,
                    message: "Usuario o contraseña incorrectos"
                })
            }

            const token = jwt.sign({
                userId: user.id,
                username: user.username
            },
            process.env.JWT_SECRET || "monkey",
            {expiresIn: "24h"}
            );

            console.log("Token generado: ", user.id);

            res.json({
                success: true,
                message: "Login exitoso",
                token: token,
                user: {
                    id: user.id,
                    username: user.username
                }
            });

        }catch(error){
            res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
        }
    }
}

module.exports = auth;