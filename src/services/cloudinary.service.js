// src/services/cloudinary.service.js
const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary (si no lo has hecho)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const CloudinaryService = {
  uploadImage: async (buffer, folder) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          folder: folder,
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });
  },
  
  deleteImage: async (publicId) => {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      throw error;
    }
  },
  
  getThumbnailUrl: (publicId) => {
    return cloudinary.url(publicId, {
      width: 300,
      height: 300,
      crop: 'fill',
      quality: 'auto:good'
    });
  },
  
  getDetailUrl: (publicId) => {
    return cloudinary.url(publicId, {
      width: 800,
      height: 800,
      crop: 'limit',
      quality: 'auto:best'
    });
  },
  
  getOptimizedUrl: (publicId, options = {}) => {
    const defaultOptions = {
      quality: 'auto:good',
      fetch_format: 'auto'
    };
    
    return cloudinary.url(publicId, { ...defaultOptions, ...options });
  }
};

module.exports = CloudinaryService;