const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Review = require('../models/Review');
const router = express.Router();

// Validatori pentru review-uri
const reviewValidators = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Numele trebuie să aibă între 2 și 100 de caractere')
    .matches(/^[a-zA-ZăâîșțĂÂÎȘȚ\s]+$/)
    .withMessage('Numele poate conține doar litere și spații'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Adresa de email nu este validă'),
  
  body('city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Numele orașului nu poate depăși 100 de caractere'),
  
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating-ul trebuie să fie între 1 și 5'),
  
  body('title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Titlul nu poate depăși 200 de caractere'),
  
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comentariul trebuie să aibă între 10 și 1000 de caractere'),
  
  body('stayDate')
    .optional()
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value && value > new Date()) {
        throw new Error('Data sejurului nu poate fi în viitor');
      }
      return true;
    })
];

// POST /api/reviews - Adaugă un review nou
router.post('/', reviewValidators, async (req, res) => {
  try {
    // Verifică erorile de validare
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Date invalide',
        errors: errors.array()
      });
    }

    const {
      name,
      email,
      city,
      rating,
      title,
      comment,
      stayDate
    } = req.body;

    // Verifică dacă există deja un review de la același email (pentru a preveni spam-ul)
    if (email) {
      const existingReview = await Review.findOne({
        where: { 
          email,
          createdAt: {
            [require('sequelize').Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // ultimele 24 ore
          }
        }
      });

      if (existingReview) {
        return res.status(429).json({
          status: 'error',
          message: 'Ați trimis deja un review în ultimele 24 de ore. Te rugăm să aștepți înainte de a trimite un altul.'
        });
      }
    }

    // Obține informații despre request
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Creează review-ul
    const review = await Review.create({
      name,
      email: email || null,
      city: city || null,
      rating,
      title: title || null,
      comment,
      stayDate: stayDate || null,
      ipAddress,
      status: 'pending' // Toate review-urile încep ca pending pentru moderare
    });

    res.status(201).json({
      status: 'success',
      message: 'Review-ul dvs. a fost trimis cu succes! Va fi publicat după moderare.',
      data: {
        id: review.id,
        name: review.name,
        rating: review.rating,
        status: review.status,
        createdAt: review.createdAt
      }
    });

  } catch (error) {
    console.error('Eroare la adăugarea review-ului:', error);
    res.status(500).json({
      status: 'error',
      message: 'Eroare internă de server. Te rugăm să încerci din nou.'
    });
  }
});

// GET /api/reviews - Listează review-urile aprobate (public)
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Pagina trebuie să fie un număr pozitiv'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limita trebuie să fie între 1 și 50'),
  query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating-ul trebuie să fie între 1 și 5'),
  query('featured').optional().isBoolean().withMessage('Featured trebuie să fie boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Parametri invalizi',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const rating = req.query.rating;
    const featured = req.query.featured;

    const whereClause = { status: 'approved' };
    
    if (rating) {
      whereClause.rating = rating;
    }

    if (featured !== undefined) {
      whereClause.featured = featured === 'true';
    }

    const { count, rows } = await Review.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'name', 'city', 'rating', 'title', 'comment', 'stayDate', 'featured', 'helpful', 'createdAt'],
      order: [
        ['featured', 'DESC'],
        ['helpful', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit,
      offset
    });

    res.json({
      status: 'success',
      data: {
        reviews: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Eroare la listarea review-urilor:', error);
    res.status(500).json({
      status: 'error',
      message: 'Eroare internă de server'
    });
  }
});

// GET /api/reviews/admin - Listează toate review-urile (pentru administrare)
router.get('/admin', [
  query('page').optional().isInt({ min: 1 }).withMessage('Pagina trebuie să fie un număr pozitiv'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limita trebuie să fie între 1 și 100'),
  query('status').optional().isIn(['pending', 'approved', 'rejected']),
  query('rating').optional().isInt({ min: 1, max: 5 }),
  query('search').optional().isLength({ max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Parametri invalizi',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const rating = req.query.rating;
    const search = req.query.search;

    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }

    if (rating) {
      whereClause.rating = rating;
    }

    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.like]: `%${search}%` } },
        { city: { [require('sequelize').Op.like]: `%${search}%` } },
        { comment: { [require('sequelize').Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Review.findAndCountAll({
      where: whereClause,
      order: [
        ['status', 'ASC'], // pending primul
        ['createdAt', 'DESC']
      ],
      limit,
      offset
    });

    res.json({
      status: 'success',
      data: {
        reviews: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Eroare la listarea review-urilor pentru admin:', error);
    res.status(500).json({
      status: 'error',
      message: 'Eroare internă de server'
    });
  }
});

// PUT /api/reviews/:id/status - Actualizează statusul unui review
router.put('/:id/status', [
  body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Status invalid'),
  body('moderatorNotes').optional().isLength({ max: 500 }).withMessage('Notele moderatorului nu pot depăși 500 de caractere')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Date invalide',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, moderatorNotes } = req.body;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review-ul nu a fost găsit'
      });
    }

    const updateData = { status };
    
    if (moderatorNotes !== undefined) {
      updateData.moderatorNotes = moderatorNotes;
    }

    await review.update(updateData);

    res.json({
      status: 'success',
      message: 'Statusul review-ului a fost actualizat cu succes',
      data: review
    });

  } catch (error) {
    console.error('Eroare la actualizarea statusului review-ului:', error);
    res.status(500).json({
      status: 'error',
      message: 'Eroare internă de server'
    });
  }
});

// PUT /api/reviews/:id/featured - Marchează/demarchează ca featured
router.put('/:id/featured', [
  body('featured').isBoolean().withMessage('Featured trebuie să fie boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Date invalide',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { featured } = req.body;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review-ul nu a fost găsit'
      });
    }

    await review.update({ featured });

    res.json({
      status: 'success',
      message: `Review-ul a fost ${featured ? 'marcat ca featured' : 'demarcat de la featured'}`,
      data: review
    });

  } catch (error) {
    console.error('Eroare la actualizarea featured:', error);
    res.status(500).json({
      status: 'error',
      message: 'Eroare internă de server'
    });
  }
});

// POST /api/reviews/:id/helpful - Marchează review-ul ca util
router.post('/:id/helpful', async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review-ul nu a fost găsit'
      });
    }

    if (review.status !== 'approved') {
      return res.status(403).json({
        status: 'error',
        message: 'Nu puteți marca ca util un review care nu este aprobat'
      });
    }

    await review.increment('helpful');

    res.json({
      status: 'success',
      message: 'Review-ul a fost marcat ca util',
      data: {
        id: review.id,
        helpful: review.helpful + 1
      }
    });

  } catch (error) {
    console.error('Eroare la marcarea ca util:', error);
    res.status(500).json({
      status: 'error',
      message: 'Eroare internă de server'
    });
  }
});

// GET /api/reviews/stats/overview - Statistici generale pentru review-uri
router.get('/stats/overview', async (req, res) => {
  try {
    const [
      totalReviews,
      pendingReviews,
      approvedReviews,
      rejectedReviews,
      featuredReviews,
      averageRating,
      ratingDistribution
    ] = await Promise.all([
      Review.count(),
      Review.count({ where: { status: 'pending' } }),
      Review.count({ where: { status: 'approved' } }),
      Review.count({ where: { status: 'rejected' } }),
      Review.count({ where: { featured: true } }),
      Review.findOne({
        attributes: [
          [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'average']
        ],
        where: { status: 'approved' }
      }),
      Promise.all([1, 2, 3, 4, 5].map(rating => 
        Review.count({ where: { rating, status: 'approved' } })
      ))
    ]);

    res.json({
      status: 'success',
      data: {
        total: totalReviews,
        byStatus: {
          pending: pendingReviews,
          approved: approvedReviews,
          rejected: rejectedReviews
        },
        featured: featuredReviews,
        averageRating: parseFloat(averageRating?.get('average') || 0).toFixed(1),
        ratingDistribution: {
          1: ratingDistribution[0],
          2: ratingDistribution[1],
          3: ratingDistribution[2],
          4: ratingDistribution[3],
          5: ratingDistribution[4]
        }
      }
    });

  } catch (error) {
    console.error('Eroare la obținerea statisticilor review-urilor:', error);
    res.status(500).json({
      status: 'error',
      message: 'Eroare internă de server'
    });
  }
});

module.exports = router;