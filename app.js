process.env.MYSQL2_FORCE_PURE_JS = '1';
console.log('🚀 MYSQL2_FORCE_PURE_JS activado:', process.env.MYSQL2_FORCE_PURE_JS);
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
const isDevelopment = process.env.NODE_ENV !== 'production';

console.log(`📌 Entorno: ${isDevelopment ? 'DESARROLLO 🔧' : 'PRODUCCIÓN 🚀'}`);

// ===================== CONFIGURACIÓN CORS SIMPLIFICADA =====================
// Orígenes permitidos dinámicos según entorno
const allowedOrigins = isDevelopment
  ? [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'https://monkitec.vercel.app',
      "https://monkitec-admin.vercel.app"
    ]
  : ['https://monkitec.vercel.app',
      "https://monkitec-admin.vercel.app"
  ];

// Configuración CORS simple que funciona
const corsOptions = {
  origin: function (origin, callback) {
    console.log(`🌐 CORS Check - Origin recibido: ${origin || 'none'}`);
    
    // Permitir requests sin origen (curl, postman, etc.)
    if (!origin) {
      console.log('✅ CORS: Request sin origin (permitido para pruebas)');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS: Origen ${origin} permitido`);
      return callback(null, true);
    } else {
      console.log(`❌ CORS: Origen ${origin} NO permitido`);
      return callback(new Error(`Origen no permitido por CORS. Permitidos: ${allowedOrigins.join(', ')}`), false);
    }
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
  maxAge: 86400,
  optionsSuccessStatus: 204
};

// ===================== MIDDLEWARE CORS PERSONALIZADO =====================
// ¡SOLUCIÓN AL PROBLEMA! No usar app.options('*', ...)

// Middleware para manejar preflight OPTIONS manualmente
app.use((req, res, next) => {
  // Si es una solicitud OPTIONS, manejar preflight
  if (req.method === 'OPTIONS') {
    console.log(`🔄 Preflight OPTIONS manejado para: ${req.path}`);
    
    // Configurar headers CORS para la respuesta OPTIONS
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With, X-CSRF-Token, Set-Cookie, Cookie');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie, Cookie, Authorization');
    res.header('Access-Control-Max-Age', '86400');
    
    return res.status(204).send(); // No Content para preflight
  }
  
  // Para otras solicitudes, configurar headers CORS y continuar
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Set-Cookie, Cookie, Authorization');
  
  next();
});

// También aplicar el middleware cors estándar para desarrollo
if (isDevelopment) {
  app.use(cors({
    origin: allowedOrigins,
    credentials: true
  }));
}

// ===================== MIDDLEWARES ESENCIALES =====================
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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.static("public"));

// ===================== LOGGING MIDDLEWARE (solo desarrollo) =====================
if (isDevelopment) {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] ${req.method} ${req.originalUrl}`);
    console.log(`  Origin: ${req.headers.origin || 'none'}`);
    console.log(`  User-Agent: ${req.headers['user-agent']?.substring(0, 50) || 'none'}...`);
    next();
  });
}

// ===================== VARIABLE DE ENTORNO GLOBAL =====================
global.isDevelopment = isDevelopment;
global.apiBaseUrl = isDevelopment 
  ? 'http://localhost:3030' 
  : 'https://monkitec-api.vercel.app';

console.log(`🌐 API Base URL: ${global.apiBaseUrl}`);

// ===================== RUTAS =====================
app.use('/api/upload', require('./src/router/upload'));

const categories = require("./src/router/categories");
const products = require("./src/router/products");
const variations = require("./src/router/variations");
const product_variation = require("./src/router/product-variation");
const cart = require("./src/router/cart");

// Endpoints de salud
app.get('/api/test-cloudinary', (req, res) => {
  res.json({
    message: 'API Monkitec',
    environment: isDevelopment ? 'development' : 'production',
    apiBaseUrl: global.apiBaseUrl,
    cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
    cors: {
      allowedOrigins: allowedOrigins,
      currentOrigin: req.headers.origin || 'none'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: isDevelopment ? 'development' : 'production',
    apiBaseUrl: global.apiBaseUrl,
    session: req.sessionID ? 'active' : 'none',
    origin: req.headers.origin || 'none'
  });
});

app.get('/api/ping', (req, res) => {
  res.json({ 
    status: 'pong', 
    timestamp: new Date().toISOString(),
    cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
    apiBaseUrl: global.apiBaseUrl
  });
});

// Rutas principales
app.use("/cart", cart);
app.use("/variations", variations);
app.use("/categories", categories);
app.use("/products", products);
app.use("/product-variation", product_variation);

// ===================== MANEJO DE ERRORES =====================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  
  // Asegurar headers CORS incluso en errores
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (err.message.includes('CORS') || err.message.includes('Origen')) {
    return res.status(403).json({
      error: 'Acceso no permitido',
      message: err.message,
      yourOrigin: req.headers.origin,
      allowedOrigins: allowedOrigins,
      environment: isDevelopment ? 'development' : 'production',
      apiBaseUrl: global.apiBaseUrl
    });
  }
  
  res.status(500).json({
    error: 'Error interno del servidor',
    message: isDevelopment ? err.message : 'Ocurrió un error',
    apiBaseUrl: global.apiBaseUrl
  });
});

const port = process.env.PORT || 3030;
app.listen(port, () => {
  console.log(`\n🚀 Servidor iniciado en: ${global.apiBaseUrl}`);
  console.log(`📌 Entorno: ${isDevelopment ? 'DESARROLLO 🔧' : 'PRODUCCIÓN 🚀'}`);
  console.log(`🌐 CORS configurado para:`);
  allowedOrigins.forEach(origin => {
    console.log(`   - ${origin}`);
  });
  console.log(`🔐 Cookies: secure=${!isDevelopment ? 'true (HTTPS)' : 'false (HTTP)'}`);
  console.log(`📁 Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`\n📡 Endpoints de prueba:`);
  console.log(`   - ${global.apiBaseUrl}/api/health`);
  console.log(`   - ${global.apiBaseUrl}/api/ping`);
  console.log(`   - ${global.apiBaseUrl}/api/test-cloudinary`);
});