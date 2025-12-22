// ELIMINA ESTA LÍNEA → 'use strict';
process.env.MYSQL2_FORCE_PURE_JS = '1';

const mysql2 = require('mysql2'); // OK

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
// ELIMINA ESTA LÍNEA → const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;

console.log(`🔧 Entorno: ${env}`);
console.log(`🔧 Conectando a: ${config.host}`);

if (config.use_env_variable) {
  // Con variable de entorno
  sequelize = new Sequelize(process.env[config.use_env_variable], {
    dialect: "mysql",
    dialectModule: mysql2,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
  });
} else {
  // CONEXIÓN DIRECTA - CORREGIDA
  const { database, username, password, ...options } = config;
  
  sequelize = new Sequelize(
    database,
    username, 
    password, 
    {
      host: options.host,
      port: options.port || 3306,
      dialect: options.dialect || 'mysql',
      dialectModule: mysql2, // ← AÑADE ESTO AQUÍ TAMBIÉN
      // ✅ CORRECCIÓN: Combinar SSL con config existente
      dialectOptions: env === 'production' ? {
        ...options.dialectOptions,
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : options.dialectOptions,
      logging: options.logging,
      pool: options.pool
    }
  );
}

// Verificación inmediata
sequelize.authenticate()
  .then(() => {
    console.log(`✅✅✅ CONEXIÓN EXITOSA a ${config.host}`);
  })
  .catch(err => {
    console.error('❌❌❌ FALLA DE CONEXIÓN:');
    console.error('Mensaje:', err.message);
    console.error('Código:', err.code);
    console.error('SSL config:', config.dialectOptions);
  });

// Carga de modelos (ASSOCIATES INTACTOS)
fs.readdirSync(__dirname)
  .filter(file => (
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js' &&
    file.indexOf('.test.js') === -1
  ))
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) db[modelName].associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;