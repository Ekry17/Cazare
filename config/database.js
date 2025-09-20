const { Sequelize } = require('sequelize');
const path = require('path');

// Configurarea bazei de date SQLite
const dbPath = process.env.DB_PATH || './database/';
const dbName = process.env.DB_NAME || 'casa_bucuriei.db';

let sequelize;

// Pentru Vercel/producție, folosește o bază de date în memorie
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  console.log('🚀 Rulează în mediul Vercel - folosește baza de date în memorie');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  });
} else {
  // Pentru dezvoltare locală, folosește fișierul SQLite
  const fs = require('fs');
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(dbPath, dbName),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

// Test conexiunea
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexiunea la baza de date a fost stabilită cu succes!');
  } catch (error) {
    console.error('❌ Nu s-a putut conecta la baza de date:', error);
  }
}

// Testează conexiunea când modulul este încărcat
if (process.env.NODE_ENV !== 'test') {
  testConnection();
}

module.exports = sequelize;