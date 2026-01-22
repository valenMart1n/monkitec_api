const db = require("../models");
const jwt = require("jsonwebtoken");

const authenticate = async (req, res, next) => {
    try{
        const token = req.headers.authorization?.split(" ")[1];

        if(!token){
            return res.status(401).json({message: "No autorizado"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await db.User.findByPk(decoded.userId);

        if(!user){
            return res.status(401).json({message: "Usuario no encontrado"});
        }

        req.user = user;
        next();

    }catch(error){
        res.status(401).json({ message: 'Token inválido' });
    }
}

module.exports = authenticate;