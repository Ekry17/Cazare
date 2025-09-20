const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import rutelor
const reservationRoutes = require('./routes/reservations');
const contactRoutes = require('./routes/contact');
const reviewRoutes = require('./routes/reviews');

// Import baza de date
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limiteaza fiecare IP la 100 request-uri per windowMs
  message: {
    error: 'Prea multe cereri de la această adresă IP, încercați din nou mai târziu.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware de securitate
app.use(helmet({
  contentSecurityPolicy: false, // Dezactivez pentru TailwindCSS CDN
}));

// Rate limiting
app.use('/api/', limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:3000', 
      'http://127.0.0.1:3000',
      'https://1-roan-eight-32.vercel.app',
      'https://*.vercel.app'
    ];

app.use(cors({
  origin: function (origin, callback) {
    // Permit cereri fără origin (ex: aplicații mobile, Postman)
    if (!origin) return callback(null, true);
    
    // Permit toate domeniile Vercel în producție
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      if (origin.includes('vercel.app') || origin.includes('localhost')) {
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Nu este permis de politica CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Middleware pentru parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servire fișiere statice (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Rutele API
app.use('/api/reservations', reservationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reviews', reviewRoutes);

// Ruta pentru pagina principală
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta pentru testarea API-ului
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'API Casa Bucuriei funcționează corect!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware pentru gestionarea erorilor 404
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint-ul nu a fost găsit'
  });
});

// Middleware global pentru gestionarea erorilor
app.use((error, req, res, next) => {
  console.error('Eroare server:', error);
  
  // Eroare de validare
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Date invalide',
      errors: error.errors
    });
  }
  
  // Eroare de bază de date
  if (error.name === 'SequelizeError') {
    return res.status(500).json({
      status: 'error',
      message: 'Eroare de bază de date'
    });
  }
  
  // Eroare generică
  res.status(error.status || 500).json({
    status: 'error',
    message: error.message || 'Eroare internă de server',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Inițializarea bazei de date și pornirea serverului
async function startServer() {
  try {
    // Sincronizarea bazei de date
    await db.sync();
    console.log('📊 Baza de date sincronizată cu succes!');
    
    // Pentru Vercel/producție, populează baza de date în memorie cu date de test
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      console.log('🌱 Populează baza de date cu date de demonstrație...');
      await seedDatabaseForDemo();
    }
    
    // Pornirea serverului
    app.listen(PORT, () => {
      console.log(`🚀 Serverul Casa Bucuriei rulează pe portul ${PORT}`);
      console.log(`🌐 Accesează aplicația la: http://localhost:${PORT}`);
      console.log(`📊 API Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🛠️  Mediu: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Eroare la pornirea serverului:', error);
    process.exit(1);
  }
}

// Funcție pentru popularea bazei de date cu date de demonstrație
async function seedDatabaseForDemo() {
  try {
    const { Review } = require('./models');
    
    // Adaugă câteva recenzii de demonstrație
    const demoReviews = [
      {
        name: 'Ana Maria Popescu',
        email: 'ana.popescu@email.com',
        rating: 5,
        comment: 'O experiență de neuitat! Casa Bucuriei ne-a oferit tot ce ne-am dorit: liniște, mâncare delicioasă și o atmosferă caldă. Vom reveni cu siguranță!',
        featured: true,
        approved: true
      },
      {
        name: 'Mihai Constantin',
        email: 'mihai.constantin@email.com',
        rating: 5,
        comment: 'Găzduire perfectă pentru o vacanță în familie. Copiii s-au distrat de minune, iar noi am redescoperit frumusețea tradițiilor românești.',
        featured: true,
        approved: true
      },
      {
        name: 'Elena Radu',
        email: 'elena.radu@email.com',
        rating: 5,
        comment: 'Locația ideală pentru a te deconecta de agitația urbană. Personalul foarte amabil și mâncarea absolut delicioasă. Recomand cu căldură!',
        featured: true,
        approved: true
      }
    ];
    
    for (const review of demoReviews) {
      await Review.findOrCreate({
        where: { email: review.email },
        defaults: review
      });
    }
    
    console.log('✅ Date de demonstrație adăugate cu succes!');
  } catch (error) {
    console.warn('⚠️ Eroare la popularea datelor de demonstrație:', error.message);
    // Nu oprim serverul pentru această eroare
  }
}

// Gestionarea opririlor graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Oprire server în curs...');
  try {
    await db.close();
    console.log('📊 Conexiunea la baza de date închisă');
    process.exit(0);
  } catch (error) {
    console.error('❌ Eroare la închiderea bazei de date:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM primit, oprire server...');
  try {
    await db.close();
    console.log('📊 Conexiunea la baza de date închisă');
    process.exit(0);
  } catch (error) {
    console.error('❌ Eroare la închiderea bazei de date:', error);
    process.exit(1);
  }
});

// Pornirea serverului
startServer();

module.exports = app;