const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Configurare transport SMTP
      this.transporter = nodemailer.createTransporter({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        secure: true, // Pentru Gmail
        port: 465
      });

      // Verifică conexiunea
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await this.transporter.verify();
        console.log('✅ Serviciul de email a fost configurat cu succes!');
      } else {
        console.log('⚠️  Configurația email nu este completă. Verifică variabilele de mediu EMAIL_USER și EMAIL_PASS');
      }
    } catch (error) {
      console.error('❌ Eroare la configurarea serviciului de email:', error.message);
      this.transporter = null;
    }
  }

  // Template-uri HTML pentru email-uri
  getEmailTemplate(title, content, footer = '') {
    return `
    <!DOCTYPE html>
    <html lang="ro">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #8B5A3C, #D4A574); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .header p { margin: 5px 0 0 0; opacity: 0.9; }
            .content { padding: 30px 20px; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .btn { display: inline-block; background-color: #8B5A3C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 500; margin: 10px 0; }
            .btn:hover { background-color: #7A4D33; }
            .info-box { background-color: #f8f9fa; border-left: 4px solid #D4A574; padding: 15px; margin: 20px 0; border-radius: 0 5px 5px 0; }
            .highlight { color: #8B5A3C; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f8f9fa; font-weight: 600; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏠 Casa Bucuriei</h1>
                <p>Pensiune Tradițională în Inima Transilvaniei</p>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                <p><strong>Casa Bucuriei</strong> - Pensiune Tradițională</p>
                <p>📍 Sat Bucovina, Comuna Tradițională, Județul Mureș</p>
                <p>📞 +40 765 123 456 | ✉️ contact@casabucuriei.ro</p>
                <p>🌐 www.casabucuriei.ro</p>
                ${footer}
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Email de confirmare pentru rezervare
  async sendReservationConfirmation(reservation) {
    if (!this.transporter) {
      throw new Error('Serviciul de email nu este configurat');
    }

    const checkinDate = new Date(reservation.checkinDate).toLocaleDateString('ro-RO');
    const checkoutDate = new Date(reservation.checkoutDate).toLocaleDateString('ro-RO');
    const nights = Math.ceil((new Date(reservation.checkoutDate) - new Date(reservation.checkinDate)) / (1000 * 60 * 60 * 24));

    const content = `
      <h2>Confirmare Rezervare</h2>
      <p>Bună ziua <span class="highlight">${reservation.name}</span>,</p>
      <p>Vă mulțumim pentru rezervarea efectuată la Casa Bucuriei! Rezervarea dvs. a fost înregistrată cu succes și este în curs de procesare.</p>
      
      <div class="info-box">
        <h3>📋 Detaliile Rezervării</h3>
        <table>
          <tr><th>Cod Confirmare:</th><td class="highlight">${reservation.confirmationCode}</td></tr>
          <tr><th>Check-in:</th><td>${checkinDate}</td></tr>
          <tr><th>Check-out:</th><td>${checkoutDate}</td></tr>
          <tr><th>Numărul de nopți:</th><td>${nights}</td></tr>
          <tr><th>Numărul de oaspeți:</th><td>${reservation.guests}</td></tr>
          <tr><th>Preț total estimativ:</th><td class="highlight">${reservation.totalPrice} RON</td></tr>
          <tr><th>Status:</th><td>În așteptare</td></tr>
        </table>
      </div>

      ${reservation.message ? `
        <div class="info-box">
          <h4>💬 Mesajul dvs.:</h4>
          <p><em>"${reservation.message}"</em></p>
        </div>
      ` : ''}

      <div class="info-box">
        <h4>📞 Următorii Pași:</h4>
        <ul>
          <li>Vă vom contacta în maximum 24 de ore pentru confirmarea finală</li>
          <li>Veți primi instrucțiuni detaliate pentru check-in</li>
          <li>Pentru întrebări urgente, ne puteți contacta la: <strong>+40 765 123 456</strong></li>
        </ul>
      </div>

      <p>Vă așteptăm cu drag la Casa Bucuriei pentru o experiență de neuitat în inima Transilvaniei!</p>
      <p>Cu stimă,<br><strong>Echipa Casa Bucuriei</strong></p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Casa Bucuriei" <${process.env.EMAIL_USER}>`,
      to: reservation.email,
      subject: `Confirmare Rezervare #${reservation.confirmationCode} - Casa Bucuriei`,
      html: this.getEmailTemplate('Confirmare Rezervare', content)
    };

    await this.transporter.sendMail(mailOptions);
    console.log(`📧 Email de confirmare trimis către ${reservation.email}`);
  }

  // Email de notificare pentru administratori despre rezervare nouă
  async sendReservationNotification(reservation) {
    if (!this.transporter) {
      throw new Error('Serviciul de email nu este configurat');
    }

    const checkinDate = new Date(reservation.checkinDate).toLocaleDateString('ro-RO');
    const checkoutDate = new Date(reservation.checkoutDate).toLocaleDateString('ro-RO');

    const content = `
      <h2>🆕 Rezervare Nouă Primită</h2>
      <p>A fost înregistrată o rezervare nouă pe website!</p>
      
      <div class="info-box">
        <h3>👤 Informații Client</h3>
        <table>
          <tr><th>Nume:</th><td>${reservation.name}</td></tr>
          <tr><th>Email:</th><td>${reservation.email}</td></tr>
          <tr><th>Telefon:</th><td>${reservation.phone || 'Nu a fost furnizat'}</td></tr>
        </table>
      </div>

      <div class="info-box">
        <h3>📅 Detalii Rezervare</h3>
        <table>
          <tr><th>Cod:</th><td class="highlight">${reservation.confirmationCode}</td></tr>
          <tr><th>Check-in:</th><td>${checkinDate}</td></tr>
          <tr><th>Check-out:</th><td>${checkoutDate}</td></tr>
          <tr><th>Oaspeți:</th><td>${reservation.guests}</td></tr>
          <tr><th>Preț Total:</th><td class="highlight">${reservation.totalPrice} RON</td></tr>
        </table>
      </div>

      ${reservation.message ? `
        <div class="info-box">
          <h4>💬 Mesaj de la client:</h4>
          <p><em>"${reservation.message}"</em></p>
        </div>
      ` : ''}

      <p><strong>Acțiune necesară:</strong> Contactați clientul pentru confirmarea rezervării!</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Casa Bucuriei System" <${process.env.EMAIL_USER}>`,
      to: process.env.RESERVATION_EMAIL || process.env.EMAIL_USER,
      subject: `🆕 Rezervare Nouă #${reservation.confirmationCode}`,
      html: this.getEmailTemplate('Rezervare Nouă', content)
    };

    await this.transporter.sendMail(mailOptions);
    console.log(`📧 Notificare rezervare trimisă către administrator`);
  }

  // Email de confirmare pentru mesaje de contact
  async sendContactConfirmation(contact) {
    if (!this.transporter) {
      throw new Error('Serviciul de email nu este configurat');
    }

    const content = `
      <h2>Confirmare Mesaj Primit</h2>
      <p>Bună ziua <span class="highlight">${contact.name}</span>,</p>
      <p>Vă mulțumim că ne-ați contactat! Mesajul dvs. a fost primit cu succes și va fi procesat în cel mai scurt timp posibil.</p>
      
      <div class="info-box">
        <h3>📝 Detaliile Mesajului</h3>
        <table>
          <tr><th>Nume:</th><td>${contact.name}</td></tr>
          <tr><th>Email:</th><td>${contact.email}</td></tr>
          <tr><th>Subiect:</th><td>${contact.subject}</td></tr>
          <tr><th>Data:</th><td>${new Date(contact.createdAt).toLocaleDateString('ro-RO')}</td></tr>
        </table>
      </div>

      <div class="info-box">
        <h4>💬 Mesajul dvs.:</h4>
        <p><em>"${contact.message}"</em></p>
      </div>

      <div class="info-box">
        <h4>⏰ Timp de Răspuns</h4>
        <p>De obicei răspundem în:</p>
        <ul>
          <li><strong>Întrebări generale:</strong> 24-48 ore</li>
          <li><strong>Rezervări:</strong> 12-24 ore</li>
          <li><strong>Urgențe:</strong> Contactați telefonic la +40 765 123 456</li>
        </ul>
      </div>

      <p>Vă mulțumim pentru interesul manifestat și vă dorim o zi frumoasă!</p>
      <p>Cu stimă,<br><strong>Echipa Casa Bucuriei</strong></p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Casa Bucuriei" <${process.env.EMAIL_USER}>`,
      to: contact.email,
      subject: 'Confirmare - Mesajul dvs. a fost primit - Casa Bucuriei',
      html: this.getEmailTemplate('Mesaj Primit', content)
    };

    await this.transporter.sendMail(mailOptions);
    console.log(`📧 Email de confirmare contact trimis către ${contact.email}`);
  }

  // Email de notificare pentru administratori despre mesaj nou de contact
  async sendContactNotification(contact) {
    if (!this.transporter) {
      throw new Error('Serviciul de email nu este configurat');
    }

    const priorityEmoji = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      urgent: '🔴'
    };

    const content = `
      <h2>📩 Mesaj Nou de Contact</h2>
      <p>A fost primit un mesaj nou pe website!</p>
      
      <div class="info-box">
        <h3>👤 Informații Expeditor</h3>
        <table>
          <tr><th>Nume:</th><td>${contact.name}</td></tr>
          <tr><th>Email:</th><td>${contact.email}</td></tr>
          <tr><th>Telefon:</th><td>${contact.phone || 'Nu a fost furnizat'}</td></tr>
          <tr><th>Prioritate:</th><td>${priorityEmoji[contact.priority]} ${contact.priority.toUpperCase()}</td></tr>
        </table>
      </div>

      <div class="info-box">
        <h3>📝 Detalii Mesaj</h3>
        <table>
          <tr><th>Subiect:</th><td><strong>${contact.subject}</strong></td></tr>
          <tr><th>Data:</th><td>${new Date(contact.createdAt).toLocaleDateString('ro-RO')} la ${new Date(contact.createdAt).toLocaleTimeString('ro-RO')}</td></tr>
        </table>
      </div>

      <div class="info-box">
        <h4>💬 Conținutul mesajului:</h4>
        <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #8B5A3C;">
          <em>"${contact.message}"</em>
        </p>
      </div>

      <p><strong>Acțiune necesară:</strong> Răspundeți clientului conform priorității mesajului!</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Casa Bucuriei System" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
      subject: `📩 ${priorityEmoji[contact.priority]} Contact Nou: ${contact.subject}`,
      html: this.getEmailTemplate('Mesaj Nou', content)
    };

    await this.transporter.sendMail(mailOptions);
    console.log(`📧 Notificare contact trimisă către administrator`);
  }

  // Email de notificare pentru schimbarea statusului rezervării
  async sendStatusUpdateNotification(reservation, newStatus) {
    if (!this.transporter) {
      throw new Error('Serviciul de email nu este configurat');
    }

    const statusMessages = {
      confirmed: {
        title: '✅ Rezervarea Confirmată',
        message: 'Rezervarea dvs. a fost confirmată! Vă așteptăm cu drag.',
        color: '#28a745'
      },
      cancelled: {
        title: '❌ Rezervarea Anulată',
        message: 'Rezervarea dvs. a fost anulată. Ne pare rău pentru inconvenient.',
        color: '#dc3545'
      },
      completed: {
        title: '🎉 Sejur Finalizat',
        message: 'Sperăm că ați avut un sejur minunat! Vă așteptăm din nou.',
        color: '#17a2b8'
      }
    };

    const statusInfo = statusMessages[newStatus];
    if (!statusInfo) return;

    const checkinDate = new Date(reservation.checkinDate).toLocaleDateString('ro-RO');
    const checkoutDate = new Date(reservation.checkoutDate).toLocaleDateString('ro-RO');

    const content = `
      <h2 style="color: ${statusInfo.color};">${statusInfo.title}</h2>
      <p>Bună ziua <span class="highlight">${reservation.name}</span>,</p>
      <p>${statusInfo.message}</p>
      
      <div class="info-box">
        <h3>📋 Detaliile Rezervării</h3>
        <table>
          <tr><th>Cod Confirmare:</th><td class="highlight">${reservation.confirmationCode}</td></tr>
          <tr><th>Check-in:</th><td>${checkinDate}</td></tr>
          <tr><th>Check-out:</th><td>${checkoutDate}</td></tr>
          <tr><th>Numărul de oaspeți:</th><td>${reservation.guests}</td></tr>
          <tr><th>Status:</th><td style="color: ${statusInfo.color}; font-weight: bold;">${newStatus.toUpperCase()}</td></tr>
        </table>
      </div>

      ${newStatus === 'confirmed' ? `
        <div class="info-box">
          <h4>📞 Informații Check-in</h4>
          <ul>
            <li>Check-in se efectuează între orele 14:00 - 22:00</li>
            <li>Vă rugăm să ne anunțați cu 1-2 ore înainte de sosire</li>
            <li>Pentru întrebări: +40 765 123 456</li>
          </ul>
        </div>
      ` : ''}

      ${newStatus === 'completed' ? `
        <div class="info-box">
          <h4>⭐ Lăsați-ne un Review</h4>
          <p>Experiența dvs. este importantă pentru noi! Vă rugăm să ne lăsați un review pe website-ul nostru.</p>
        </div>
      ` : ''}

      <p>Pentru orice întrebări, nu ezitați să ne contactați!</p>
      <p>Cu stimă,<br><strong>Echipa Casa Bucuriei</strong></p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Casa Bucuriei" <${process.env.EMAIL_USER}>`,
      to: reservation.email,
      subject: `${statusInfo.title} - Rezervarea #${reservation.confirmationCode}`,
      html: this.getEmailTemplate(statusInfo.title, content)
    };

    await this.transporter.sendMail(mailOptions);
    console.log(`📧 Email de status update trimis către ${reservation.email}`);
  }

  // Test pentru serviciul de email
  async sendTestEmail(toEmail) {
    if (!this.transporter) {
      throw new Error('Serviciul de email nu este configurat');
    }

    const content = `
      <h2>🧪 Test Email</h2>
      <p>Acest email este un test pentru verificarea funcționării serviciului de email al Casa Bucuriei.</p>
      
      <div class="info-box">
        <h3>✅ Informații Test</h3>
        <table>
          <tr><th>Data trimis:</th><td>${new Date().toLocaleString('ro-RO')}</td></tr>
          <tr><th>Destinatar:</th><td>${toEmail}</td></tr>
          <tr><th>Status:</th><td class="highlight">Funcțional</td></tr>
        </table>
      </div>

      <p>Dacă primiți acest email, înseamnă că serviciul de email funcționează corect!</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Casa Bucuriei Test" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: '🧪 Test Email - Casa Bucuriei',
      html: this.getEmailTemplate('Test Email', content)
    };

    await this.transporter.sendMail(mailOptions);
    console.log(`📧 Email de test trimis către ${toEmail}`);
  }
}

module.exports = new EmailService();