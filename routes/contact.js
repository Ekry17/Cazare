const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Contact = require('../models/Contact');
const emailService = require('../services/emailService');
const router = express.Router();

// Validatori pentru formularul de contact
const contactValidators = [
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
  
  body('subject')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Subiectul nu poate depăși 200 de caractere'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Mesajul trebuie să aibă între 10 și 2000 de caractere'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Prioritatea nu este validă')
];

// POST /api/contact - Trimite un mesaj de contact
router.post('/', contactValidators, async (req, res) => {
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
      subject,
      message,
      priority = 'medium'
    } = req.body;

    // Obține informații despre request
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Creează mesajul de contact
    const contact = await Contact.create({
      name,
      email,
      phone: phone || null,
      subject: subject || 'Întrebare generală',
      message,
      priority,
      ipAddress,
      userAgent,
      source: 'website'
    });

    // Trimite email-uri de notificare
    try {
      await emailService.sendContactConfirmation(contact);
      await emailService.sendContactNotification(contact);
    } catch (emailError) {
      console.error('Eroare la trimiterea email-ului:', emailError);
      // Nu oprește procesul, doar loghează eroarea
    }

    res.status(201).json({
      status: 'success',
      message: 'Mesajul dvs. a fost trimis cu succes! Vă vom răspunde în cel mai scurt timp posibil.',
      data: {
        id: contact.id,
        name: contact.name,
        subject: contact.subject,
        priority: contact.priority,
        createdAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error('Eroare la trimiterea mesajului de contact:', error);
    res.status(500).json({
      status: 'error',
      message: 'Eroare internă de server. Te rugăm să încerci din nou.'
    });
  }
});

// GET /api/contact - Listează mesajele de contact (pentru administrare)
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Pagina trebuie să fie un număr pozitiv'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limita trebuie să fie între 1 și 100'),
  query('status').optional().isIn(['new', 'read', 'replied', 'archived']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
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
    const priority = req.query.priority;
    const search = req.query.search;

    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.like]: `%${search}%` } },
        { email: { [require('sequelize').Op.like]: `%${search}%` } },
        { subject: { [require('sequelize').Op.like]: `%${search}%` } },
        { message: { [require('sequelize').Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Contact.findAndCountAll({
      where: whereClause,
      order: [
        ['priority', 'DESC'], // Urgent, high, medium, low
        ['createdAt', 'DESC']
      ],
      limit,
      offset
    });

    res.json({
      status: 'success',
      data: {
        contacts: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Eroare la listarea mesajelor de contact:', error);
    res.status(500).json({
      status: 'error',
      message: 'Eroare internă de server'
    });
  }
});

// GET /api/contact/:id - Obține un mesaj de contact specific
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByPk(id);

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Mesajul de contact nu a fost găsit'
      });
    }

    // Marchează ca citit dacă nu a fost deja
    if (contact.status === 'new') {
      await contact.update({ status: 'read' });
    }

    res.json({
      status: 'success',
      data: contact
    });

  } catch (error) {
    console.error('Eroare la obținerea mesajului de contact:', error);
    res.status(500).json({
      status: 'error',
      message: 'Eroare internă de server'
    });
  }
});

// PUT /api/contact/:id/status - Actualizează statusul unui mesaj de contact
router.put('/:id/status', [
  body('status').isIn(['new', 'read', 'replied', 'archived']).withMessage('Status invalid'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notele nu pot depăși 1000 de caractere')
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
    const { status, notes } = req.body;

    const contact = await Contact.findByPk(id);

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Mesajul de contact nu a fost găsit'
      });
    }

    const updateData = { status };
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (status === 'replied') {
      updateData.replied = true;
      updateData.repliedAt = new Date();
    }

    await contact.update(updateData);

    res.json({
      status: 'success',
      message: 'Statusul mesajului a fost actualizat cu succes',
      data: contact
    });

  } catch (error) {
    console.error('Eroare la actualizarea statusului:', error);
    res.status(500).json({
      status: 'error',
      message: 'Eroare internă de server'
    });
  }
});

// PUT /api/contact/:id/priority - Actualizează prioritatea unui mesaj
router.put('/:id/priority', [
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Prioritate invalidă')
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
    const { priority } = req.body;

    const contact = await Contact.findByPk(id);

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Mesajul de contact nu a fost găsit'
      });
    }

    await contact.update({ priority });

    res.json({
      status: 'success',
      message: 'Prioritatea mesajului a fost actualizată cu succes',
      data: contact
    });

  } catch (error) {
    console.error('Eroare la actualizarea priorității:', error);
    res.status(500).json({
      status: 'error',
      message: 'Eroare internă de server'
    });
  }
});

// GET /api/contact/stats/overview - Statistici generale pentru mesajele de contact
router.get('/stats/overview', async (req, res) => {
  try {
    const [
      totalContacts,
      newContacts,
      readContacts,
      repliedContacts,
      archivedContacts,
      urgentContacts,
      todayContacts
    ] = await Promise.all([
      Contact.count(),
      Contact.count({ where: { status: 'new' } }),
      Contact.count({ where: { status: 'read' } }),
      Contact.count({ where: { status: 'replied' } }),
      Contact.count({ where: { status: 'archived' } }),
      Contact.count({ where: { priority: 'urgent' } }),
      Contact.count({ 
        where: {
          createdAt: {
            [require('sequelize').Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    res.json({
      status: 'success',
      data: {
        total: totalContacts,
        byStatus: {
          new: newContacts,
          read: readContacts,
          replied: repliedContacts,
          archived: archivedContacts
        },
        urgent: urgentContacts,
        today: todayContacts
      }
    });

  } catch (error) {
    console.error('Eroare la obținerea statisticilor:', error);
    res.status(500).json({
      status: 'error',
      message: 'Eroare internă de server'
    });
  }
});

// DELETE /api/contact/:id - Șterge un mesaj de contact
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByPk(id);

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Mesajul de contact nu a fost găsit'
      });
    }

    await contact.destroy();

    res.json({
      status: 'success',
      message: 'Mesajul de contact a fost șters cu succes'
    });

  } catch (error) {
    console.error('Eroare la ștergerea mesajului:', error);
    res.status(500).json({
      status: 'error',
      message: 'Eroare internă de server'
    });
  }
});

module.exports = router;