const db = require("../src/models");

let variations = {
    list: async(req, res) => {
        try{
            const result = await db.Variation.findAll();
            const variationsArray = result.map(function (data){
                return{
                    id: data.id,
                    descripcion: data.descripcion
                }
            });
            res.json(variationsArray);
        }catch(error){
            console.error('Error:', error);
            res.status(500).json({ error: error.message });
        }

    },
    getById: async(req, res) =>{
        try{
            const result = await db.Variation.findOne({
                where:{
                    id: req.body.id
                }
            });
            if(!result){
                return res.status(404).json({ 
                error: "Variacion no encontrada",
                code: "CATEGORY_NOT_FOUND" 
            });
            }
            res.json(result);
        
        }catch(error){
            console.error('Error:', error);
            res.status(500).json({ error: error.message });
        }
    },
    create: async(req, res) => {
        try{
            const Variation_Data = {
                descripcion: req.body.descripcion
            }
            await db.Variation.create(Variation_Data);
            
            res.status(201).json({
            success: true,
            message: 'Variante creada exitosamente'
        });
        }catch(error){
            res.status(500).json({error: error.message});
        }
    }
}
module.exports = variations;