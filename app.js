require('dotenv').config();
const express = require("express");
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cloudinary = require('./src/config/cloudinary.config');
const uploadRoutes = require('./src/router/upload');
const methodOverride = require('method-override');

const app = express();

// Determinar si estamos en desarrollo
const isDevelopment = process.env.NODE_ENV === 'development';

// 1. CONFIGURACIÓN CORS ESPECÍFICA
const corsOptions = {
  origin: function (origin, callback) {
    // Lista de orígenes PERMITIDOS en PRODUCCIÓN
    const productionOrigins = [
      'https://monkitec.vercel.app'
    ];
    
    // Lista de orígenes PERMITIDOS en DESARROLLO
    const developmentOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://monkitec.vercel.app'
    ];
    
    // Permitir requests sin origen
    if (!origin) {
      return callback(null, true);
    }
    
    // Verificar según el entorno
    if (isDevelopment) {
      // EN DESARROLLO
      if (developmentOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
    } else {
      // EN PRODUCCIÓN
      if (productionOrigins.includes(origin)) {
        return callback(null, true);
      }
    }
    
    // Si llegamos aquí, el origen NO está permitido
    const errorMsg = isDevelopment 
      ? `Origen no permitido. Permitidos: ${developmentOrigins.join(', ')}`
      : `Origen no permitido en producción. Solo: ${productionOrigins.join(', ')}`;
    
    return callback(new Error(errorMsg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With',
    'X-CSRF-Token',
    'Set-Cookie',
    'Cookie'
  ],
  exposedHeaders: ['Set-Cookie', 'Cookie', 'Authorization'],
  maxAge: 86400
};

// 2. APLICAR CORS GLOBALMENTE (¡IMPORTANTE!)
app.use(cors(corsOptions));

// 3. Manejar preflight OPTIONS con regex (para Express 5)
app.options(/\//, cors(corsOptions)); // ← Regex que funciona en Express 5

// 4. Configuración de cookies y sesión
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'monkitec-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: !isDevelopment,
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    sameSite: isDevelopment ? 'lax' : 'none',
  },
  name: 'monkitec.session',
  proxy: !isDevelopment
}));

// 5. Middlewares restantes
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(methodOverride('_method'));
app.use(express.static("public"));

// 6. Rutas de API
app.use('/api/upload', require('./src/router/upload'));

let categories = require("./src/router/categories");
let products = require("./src/router/products");
let variations = require("./src/router/variations");
let product_variation = require("./src/router/product-variation");
let cart = require("./src/router/cart");

// 7. Endpoints de salud (públicos)
app.get('/api/test-cloudinary', (req, res) => {
  res.json({
    message: 'API Monkitec',
    environment: isDevelopment ? 'development' : 'production',
    cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
    cors: {
      allowedOrigins: isDevelopment 
        ? ['localhost:3000', 'localhost:3001', 'monkitec.vercel.app']
        : ['monkitec.vercel.app']
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: isDevelopment ? 'development' : 'production',
    session: req.sessionID ? 'active' : 'none',
    origin: req.headers.origin || 'none'
  });
});

app.get('/api/ping', (req, res) => {
  res.json({ 
    status: 'pong', 
    timestamp: new Date().toISOString(),
    cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME
  });
});

// 8. Rutas principales (SIN cors() individual)
app.use("/cart", cart);
app.use("/variations", variations);
app.use("/categories", categories);
app.use("/products", products);
app.use("/product-variation", product_variation);

// 9. Middleware para errores CORS
app.use((err, req, res, next) => {
  if (err.message.includes('CORS') || err.message.includes('Origen')) {
    return res.status(403).json({
      error: 'Acceso no permitido',
      message: err.message,
      yourOrigin: req.headers.origin,
      allowedOrigins: isDevelopment 
        ? ['http://localhost:3000', 'http://localhost:3001', 'https://monkitec.vercel.app']
        : ['https://monkitec.vercel.app'],
      environment: isDevelopment ? 'development' : 'production'
    });
  }
  next(err);
});

const port = process.env.PORT || 3030;
app.listen(port, () => {
    console.log(`🚀 Servidor iniciado en puerto: ${port}`);
    console.log(`📌 Entorno: ${isDevelopment ? 'DESARROLLO 🔧' : 'PRODUCCIÓN 🚀'}`);
    console.log(`🌐 CORS configurado para:`);
    console.log(`   - Desarrollo: localhost:3000, localhost:3001, monkitec.vercel.app`);
    console.log(`   - Producción: monkitec.vercel.app`);
    console.log(`🔐 Cookies: secure=${!isDevelopment ? 'true (HTTPS)' : 'false (HTTP)'}`);
    console.log("")
    console.log(`📁 Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configurado' : '❌ No configurado'}`);
});