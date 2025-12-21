const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp'
    ];

    if(allowedMimes.includes(file.mimetype)){
        cb(null, true);
    }else{
        cb(new Error("Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP)"), false);
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10
    },
    fileFilter
});

const uploadMiddleware = {
    single: (fieldName = "imagen") => upload.single(fieldName),
    array: (fieldName = "imagenes", maxCount = 10) => upload.array(fieldName, maxCount),
    fields: (fields) => upload.fields(fields),
    handleUpload: (type = "single", config = {}) => {
        return (req, res, next) => {
            let middleware;

            switch(type){
                case "single":
                middleware = upload.single(config.fieldName || "imagen");
                break;
                case 'array':
                middleware = upload.array(config.fieldName || 'imagenes', config.maxCount || 10);
                break;
                case 'fields':
                middleware = upload.fields(config.fields || []);
                break;
                default:
                middleware = upload.single('imagen');
            }
            middleware(req, res, (err)=> {
                if(err){
                    if(err.code == "LIMIT_FILE_SIZE"){
                        return res.status(400).json({
                            error: "Archivo demasiado pesado",
                            maxSize: "5MB"
                        });
                    }
                    if (err.code === 'LIMIT_FILE_COUNT') {
                        return res.status(400).json({
                        error: 'Demasiados archivos',
                        maxFiles: config.maxCount || 10
                        });
                    }
                    if (err.message.includes('Tipo de archivo no válido')) {
                        return res.status(400).json({
                        error: 'Tipo de archivo no permitido',
                        allowed: 'JPEG, PNG, GIF, WebP'
                        });
                    }
                    return res.status(400).json({error: err.message});
                }
                next();
            });
        }
    }
};
module.exports = uploadMiddleware;