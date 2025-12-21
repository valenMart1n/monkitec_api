const cloudinary = require('cloudinary').v2;

// Verificar que las variables existen
if (!process.env.CLOUDINARY_CLOUD_NAME || 
    !process.env.CLOUDINARY_API_KEY || 
    !process.env.CLOUDINARY_API_SECRET) {
  console.warn('⚠️  Variables de Cloudinary no configuradas en .env');
  console.warn('   Crea un archivo .env con:');
  console.warn('   CLOUDINARY_CLOUD_NAME=tu_nombre');
  console.warn('   CLOUDINARY_API_KEY=tu_key');
  console.warn('   CLOUDINARY_API_SECRET=tu_secret');
  
  // Exportar cloudinary sin configurar (modo desarrollo)
  module.exports = cloudinary;
} else {
  // Configurar con variables de entorno
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  console.log('✅ Cloudinary configurado correctamente');
  console.log(`   Cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  
  module.exports = cloudinary;
}