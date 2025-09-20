const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Reservation = require('../models/Reservation');
const emailService = require('../services/emailService');
const router = express.Router();

// Validatori pentru rezervări
const reservationValidators = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Numele trebuie să aibă între 2 și 100 de caractere')
    .matches(/^[a-zA-ZăâîșțĂÂÎȘȚ\s]+$/)
    .withMessage('Numele poate conține doar litere și spații'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Adresa de email nu este validă'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[0-9\s\-\(\)]+$/)
    .withMessage('Numărul de telefon nu este valid'),
  
  body('checkinDate')
    .isISO8601()
    .toDate()
    .custom((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (value < today) {
        throw new Error('Data de check-in nu poate fi în trecut');
      }
      return true;
    }),
  
  body('checkoutDate')
    .isISO8601()
    .toDate()
    .custom((value, { req }) => {
      if (value <= new Date(req.body.checkinDate)) {
        throw new Error('Data de check-out trebuie să fie după data de check-in');
      }
      return true;
    }),
  
  body('guests')
    .isInt({ min: 1, max: 10 })
    .withMessage('Numărul de oaspeți trebuie să fie între 1 și 10'),
  
  body('message')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Mesajul nu poate depăși 1000 de caractere')
];

// POST /api/reservations - Creează o rezervare nouă
router.post('/', reservationValidators, async (req, res) => {
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
      phone,
      checkinDate,
      checkoutDate,
      guests,
      message
    } = req.body;

    // Verifică disponibilitatea pentru datele selectate
    const existingReservation = await Reservation.findOne({
      where: {
        status: ['confirmed', 'pending'],
        [require('sequelize').Op.or]: [
          {
            checkinDate: {
              [require('sequelize').Op.between]: [checkinDate, checkoutDate]
            }
          },
          {
            checkoutDate: {
              [require('sequelize').Op.between]: [checkinDate, checkoutDate]
            }
          },
          {
            [require('sequelize').Op.and]: [
              {
                checkinDate: {
                  [require('sequelize').Op.lte]: checkinDate
                }
              },
              {
                checkoutDate: {
                  [require('sequelize').Op.gte]: checkoutDate
                }
              }
            ]
          }
        ]
      }
    });

    if (existingReservation) {
      return res.status(409).json({
        status: 'error',
        message: 'Ne pare rău, dar pentru perioada selectată există deja o rezervare. Te rugăm să alegi alte date.',
        conflictingReservation: {
          checkin: existingReservation.checkinDate,
          checkout: existingReservation.checkoutDate
        }
      });
    }

    // Calculează prețul total (exemplu: 150 RON/noapte)
    const nights = Math.ceil((new Date(checkoutDate) - new Date(checkinDate)) / (1000 * 60 * 60 * 24));
    const pricePerNight = 150;
    const totalPrice = nights * pricePerNight * guests;

    // Creează rezervarea
    const reservation = await Reservation.create({
      name,
      email,
      phone,
      checkinDate,
      checkoutDate,
      guests,
      message: message || null,
      totalPrice,
      specialRequests: message,
      status: 'pending'
    });

    // Trimite email de confirmare
    try {
      await emailService.sendReservationConfirmation(reservation);
      await emailService.sendReservationNotification(reservation);
    } catch (emailError) {
      console.error('Eroare la trimiterea email-ului:', emailError);
      // Nu oprește procesul, doar loghează eroarea
    }

    res.status(201).json({
      status: 'success',
      message: 'Rezervarea a fost înregistrată cu succes! Veți primi un email de confirmare în curând.',
      data: {
        id: reservation.id,
        confirmationCode: reservation.confirmationCode,
        name: reservation.name,
        checkinDate: reservation.checkinDate,
        checkoutDate: reservation.checkoutDate,
        guests: reservation.guests,
        totalPrice: reservation.totalPrice,
        status: reservation.status
      }
    });

  } catch (error) {
    console.error('Eroare la crearea rezervării:', error);
    res.status(500).json({
      status: 'error',
      message: 'Eroare internă de server. Te rugăm să încerci din nou.'
    });
  }
});

// GET /api/reservations - Listează rezervările (pentru administrare)
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Pagina trebuie să fie un număr pozitiv'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limita trebuie să fie între 1 și 100'),
  query('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed']),
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
    const search = req.query.search;

    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.like]: `%${search}%` } },
        { email: { [require('sequelize').Op.like]: `%${search}%` } },
        { confirmationCode: { [require('sequelize').Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Reservation.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      status: 'success',
      data: {
        reservations: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Eroare la listarea rezervărilor:', error);
    res.status(500).json({
      status: 'error',
      message: 'Eroare internă de server'
    });
  }
});

// GET /api/reservations/:id - Obține o rezervare specifică
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findByPk(id);

    if (!reservation) {
      return res.status(404).json({
        status: 'error',
        message: 'Rezervarea nu a fost găsită'
      });
    }

    res.json({
      status: 'success',
      data: reservation
    });

  } catch (error) {
    console.error('Eroare la obținerea rezervării:', error);
    res.status(500).json({
      status: 'error',
      message: 'Eroare internă de server'
    });
  }
});

// GET /api/reservations/code/:confirmationCode - Obține rezervare după codul de confirmare
router.get('/code/:confirmationCode', async (req, res) => {
  try {
    const { confirmationCode } = req.params;

    const reservation = await Reservation.findOne({
      where: { confirmationCode }
    });

    if (!reservation) {
      return res.status(404).json({
        status: 'error',
        message: 'Rezervarea cu acest cod de confirmare nu a fost găsită'
      });
    }

    res.json({
      status: 'success',
      data: {
        id: reservation.id,
        confirmationCode: reservation.confirmationCode,
        name: reservation.name,
        checkinDate: reservation.checkinDate,
        checkoutDate: reservation.checkoutDate,
        guests: reservation.guests,
        status: reservation.status,
        totalPrice: reservation.totalPrice,
        createdAt: reservation.createdAt
      }
    });

  } catch (error) {
    console.error('Eroare la obținerea rezervării după cod:', error);
    res.status(500).json({
      status: 'error',
      message: 'Eroare internă de server'
    });
  }
});

// PUT /api/reservations/:id/status - Actualizează statusul unei rezervări
router.put('/:id/status', [
  body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed']).withMessage('Status invalid')
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
    const { status } = req.body;

    const reservation = await Reservation.findByPk(id);

    if (!reservation) {
      return res.status(404).json({
        status: 'error',
        message: 'Rezervarea nu a fost găsită'
      });
    }

    await reservation.update({ status });

    // Trimite email de notificare pentru schimbarea statusului
    try {
      await emailService.sendStatusUpdateNotification(reservation, status);
    } catch (emailError) {
      console.error('Eroare la trimiterea email-ului de notificare:', emailError);
    }

    res.json({
      status: 'success',
      message: 'Statusul rezervării a fost actualizat cu succes',
      data: reservation
    });

  } catch (error) {
    console.error('Eroare la actualizarea statusului:', error);
    res.status(500).json({
      status: 'error',
      message: 'Eroare internă de server'
    });
  }
});

// GET /api/reservations/availability/:date - Verifică disponibilitatea pentru o dată
router.get('/availability/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    if (!date || !Date.parse(date)) {
      return res.status(400).json({
        status: 'error',
        message: 'Data nu este validă'
      });
    }

    const reservations = await Reservation.findAll({
      where: {
        status: ['confirmed', 'pending'],
        checkinDate: { [require('sequelize').Op.lte]: date },
        checkoutDate: { [require('sequelize').Op.gt]: date }
      }
    });

    const isAvailable = reservations.length === 0;

    res.json({
      status: 'success',
      data: {
        date,
        available: isAvailable,
        reservations: reservations.length
      }
    });

  } catch (error) {
    console.error('Eroare la verificarea disponibilității:', error);
    res.status(500).json({
      status: 'error',
      message: 'Eroare internă de server'
    });
  }
});

module.exports = router;