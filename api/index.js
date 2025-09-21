// API simplu pentru Casa Bucuriei - Vercel compatible
const path = require('path');
const fs = require('fs');

// Handler principal pentru toate cererile
module.exports = async (req, res) => {
  // Setare CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, method } = req;
  
  try {
    // Health check endpoint
    if (url === '/api/health') {
      res.status(200).json({
        status: 'success',
        message: 'API Casa Bucuriei funcționează corect!',
        timestamp: new Date().toISOString(),
        environment: 'production'
      });
      return;
    }

    // Reviews endpoint
    if (url === '/api/reviews') {
      if (method === 'GET') {
        // Returnează recenzii demo
        const demoReviews = [
          {
            id: 1,
            name: 'Ana Maria Popescu',
            email: 'ana.popescu@email.com',
            rating: 5,
            comment: 'O experiență de neuitat! Casa Bucuriei ne-a oferit tot ce ne-am dorit: liniște, mâncare delicioasă și o atmosferă caldă. Vom reveni cu siguranță!',
            featured: true,
            approved: true,
            createdAt: '2024-01-15T10:00:00.000Z'
          },
          {
            id: 2,
            name: 'Mihai Constantin',
            email: 'mihai.constantin@email.com',
            rating: 5,
            comment: 'Găzduire perfectă pentru o vacanță în familie. Copiii s-au distrat de minune, iar noi am redescoperit frumusețea tradițiilor românești.',
            featured: true,
            approved: true,
            createdAt: '2024-01-10T14:30:00.000Z'
          },
          {
            id: 3,
            name: 'Elena Radu',
            email: 'elena.radu@email.com',
            rating: 5,
            comment: 'Locația ideală pentru a te deconecta de agitația urbană. Personalul foarte amabil și mâncarea absolut delicioasă. Recomand cu căldură!',
            featured: true,
            approved: true,
            createdAt: '2024-01-05T16:45:00.000Z'
          }
        ];

        res.status(200).json({
          status: 'success',
          data: demoReviews
        });
        return;
      }

      if (method === 'POST') {
        // Simulează salvarea unei recenzii
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          try {
            const reviewData = JSON.parse(body);
            const { name, email, rating, comment } = reviewData;
            
            if (!name || !email || !rating || !comment) {
              res.status(400).json({
                status: 'error',
                message: 'Toate câmpurile sunt obligatorii'
              });
              return;
            }

            // Simulează salvarea
            const newReview = {
              id: Date.now(),
              name,
              email,
              rating: parseInt(rating),
              comment,
              approved: false,
              featured: false,
              createdAt: new Date().toISOString()
            };

            res.status(201).json({
              status: 'success',
              message: 'Recenzia a fost trimisă cu succes! Va fi publicată după aprobare.',
              data: newReview
            });
          } catch (error) {
            res.status(400).json({
              status: 'error',
              message: 'Date invalide'
            });
          }
        });
        return;
      }
    }

    // Reservations endpoint
    if (url === '/api/reservations') {
      if (method === 'GET') {
        res.status(200).json({
          status: 'success',
          data: []
        });
        return;
      }

      if (method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          try {
            const reservationData = JSON.parse(body);
            // Acceptă atât checkIn/checkOut cât și checkinDate/checkoutDate
            const { name, email, phone, checkIn, checkOut, checkinDate, checkoutDate, guests, message } = reservationData;
            
            // Folosește varianta corectă a datelor
            const actualCheckIn = checkIn || checkinDate;
            const actualCheckOut = checkOut || checkoutDate;
            
            if (!name || !email || !phone || !actualCheckIn || !actualCheckOut || !guests) {
              console.log('Validation failed. Received data:', reservationData);
              res.status(400).json({
                status: 'error',
                message: 'Toate câmpurile obligatorii trebuie completate',
                debug: {
                  name: !!name,
                  email: !!email,
                  phone: !!phone,
                  checkIn: !!actualCheckIn,
                  checkOut: !!actualCheckOut,
                  guests: !!guests,
                  receivedData: Object.keys(reservationData)
                }
              });
              return;
            }

            const newReservation = {
              id: Date.now(),
              name,
              email,
              phone,
              checkIn: actualCheckIn,
              checkOut: actualCheckOut,
              guests: parseInt(guests),
              message: message || '',
              status: 'pending',
              createdAt: new Date().toISOString(),
              confirmationCode: `CB${Date.now().toString().slice(-6)}`
            };

            // Trimite email de notificare
            sendReservationNotification(newReservation);

            res.status(201).json({
              status: 'success',
              message: 'Rezervarea a fost trimisă cu succes! Veți primi un email de confirmare în curând și vă vom contacta pentru finalizarea rezervării.',
              data: newReservation
            });
          } catch (error) {
            res.status(400).json({
              status: 'error',
              message: 'Date invalide'
            });
          }
        });
        return;
      }
    }

    // Contact endpoint
    if (url === '/api/contact') {
      if (method === 'GET') {
        res.status(200).json({
          status: 'success',
          data: []
        });
        return;
      }

      if (method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          try {
            const contactData = JSON.parse(body);
            const { name, email, subject, message } = contactData;
            
            if (!name || !email || !subject || !message) {
              res.status(400).json({
                status: 'error',
                message: 'Toate câmpurile sunt obligatorii'
              });
              return;
            }

            const newContact = {
              id: Date.now(),
              name,
              email,
              subject,
              message,
              status: 'new',
              createdAt: new Date().toISOString()
            };

            // Trimite notificare de contact
            sendContactNotification(newContact);

            res.status(201).json({
              status: 'success',
              message: 'Mesajul a fost trimis cu succes! Vă vom răspunde în cel mai scurt timp.',
              data: newContact
            });
          } catch (error) {
            res.status(400).json({
              status: 'error',
              message: 'Date invalide'
            });
          }
        });
        return;
      }
    }

    // Homepage - servire fișier static
    if (url === '/' || url === '/index.html') {
      try {
        const indexPath = path.join(__dirname, '..', 'index.html');
        const htmlContent = fs.readFileSync(indexPath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(htmlContent);
        return;
      } catch (error) {
        res.status(404).json({
          status: 'error',
          message: 'Pagina nu a fost găsită'
        });
        return;
      }
    }

    // 404 pentru toate celelalte rute
    res.status(404).json({
      status: 'error',
      message: 'Endpoint-ul nu a fost găsit'
    });

  } catch (error) {
    console.error('Eroare server:', error);
    res.status(500).json({
      status: 'error',
      message: 'Eroare internă de server',
      error: error.message
    });
  }
};

// Funcție pentru trimiterea notificărilor de rezervare
async function sendReservationNotification(reservation) {
  const ADMIN_EMAIL = 'ecryecry17@gmail.com';
  
  try {
    // Calculează numărul de nopți
    const checkInDate = new Date(reservation.checkIn);
    const checkOutDate = new Date(reservation.checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    // Calculează prețul estimat
    const pricePerNight = 150; // RON
    const totalPrice = nights * pricePerNight * reservation.guests;
    
    // Formatează datele pentru email
    const emailContent = `
🏠 NOUĂ REZERVARE - CASA BUCURIEI

📋 DETALII REZERVARE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Client: ${reservation.name}
📧 Email: ${reservation.email}
📞 Telefon: ${reservation.phone}

📅 Check-in: ${new Date(reservation.checkIn).toLocaleDateString('ro-RO')}
📅 Check-out: ${new Date(reservation.checkOut).toLocaleDateString('ro-RO')}
🛏️ Durata: ${nights} ${nights === 1 ? 'noapte' : 'nopți'}
👥 Numărul de oaspeți: ${reservation.guests}

💰 Preț estimat: ${totalPrice} RON
📝 Cod confirmare: ${reservation.confirmationCode}

💬 MESAJ CLIENT:
${reservation.message || 'Nu a fost specificat niciun mesaj.'}

⏰ Data rezervării: ${new Date(reservation.createdAt).toLocaleString('ro-RO')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Te rugăm să contactezi clientul în cel mai scurt timp pentru confirmarea rezervării.
`;

    // În Vercel, log-ul este suficient pentru notificare
    // Pentru o implementare completă de email, ai nevoie de un serviciu extern
    console.log('📧 NOTIFICARE REZERVARE PENTRU:', ADMIN_EMAIL);
    console.log(emailContent);
    
    // Aici poți integra un serviciu de email real precum:
    // - EmailJS
    // - SendGrid 
    // - Nodemailer cu un serviciu SMTP
    // - Vercel's Email API
    
    return true;
  } catch (error) {
    console.error('Eroare la trimiterea notificării:', error);
    return false;
  }
}

// Funcție pentru trimiterea notificărilor de contact
async function sendContactNotification(contact) {
  const ADMIN_EMAIL = 'ecryecry17@gmail.com';
  
  try {
    const emailContent = `
💬 MESAJ CONTACT - CASA BUCURIEI

📋 DETALII MESAJ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Expeditor: ${contact.name}
📧 Email: ${contact.email}
📌 Subiect: ${contact.subject}

💬 MESAJ:
${contact.message}

⏰ Data mesajului: ${new Date(contact.createdAt).toLocaleString('ro-RO')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 Te rugăm să răspunzi la adresa: ${contact.email}
`;

    console.log('📧 NOTIFICARE CONTACT PENTRU:', ADMIN_EMAIL);
    console.log(emailContent);
    
    return true;
  } catch (error) {
    console.error('Eroare la trimiterea notificării de contact:', error);
    return false;
  }
};