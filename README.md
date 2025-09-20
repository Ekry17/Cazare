# Casa Bucuriei - Backend & Frontend

Backend complet pentru pensiunea Casa Bucuriei cu funcționalități de rezervări, contact și management review-uri.

## 🚀 Funcționalități

### Backend (Node.js + Express)
- **API REST complet** pentru rezervări, contact și review-uri
- **Bază de date SQLite** cu Sequelize ORM
- **Sistem de email** cu Nodemailer (confirmări, notificări)
- **Validare completă** server-side cu express-validator
- **Rate limiting** și securitate cu Helmet
- **CORS configurabil** pentru domenii multiple
- **Logging** cu Morgan

### Frontend (HTML + TailwindCSS + JavaScript)
- **Design responsiv** modern cu TailwindCSS
- **Integrare API completă** cu fetch
- **Validare în timp real** pentru formulare
- **Calculare automată preț** pentru rezervări
- **Mesaje de succes/eroare** interactive
- **Loading states** pentru toate formularele

### Funcționalități Business
- **Rezervări online** cu verificare disponibilitate
- **Sistem de contact** cu prioritizare mesaje
- **Review-uri** cu moderare și featured
- **Email-uri automate** pentru confirmări
- **Dashboard admin** (prin API endpoints)

## 📁 Structura Proiectului

```
Casa-Bucuriei/
├── server.js                 # Server principal Express
├── package.json              # Dependențe și scripturi
├── .env.example              # Template variabile mediu
├── .gitignore               # Fișiere ignorate
├── index.html               # Frontend complet
├── config/
│   └── database.js          # Configurare Sequelize
├── models/
│   ├── index.js             # Export modele
│   ├── Reservation.js       # Model rezervări
│   ├── Contact.js           # Model contact
│   └── Review.js            # Model review-uri
├── routes/
│   ├── reservations.js      # API rezervări
│   ├── contact.js           # API contact
│   └── reviews.js           # API review-uri
├── services/
│   └── emailService.js      # Serviciu email Nodemailer
├── database/                # Bază de date SQLite (auto-created)
└── scripts/                 # Scripturi utilități
```

## 🛠️ Instalare și Configurare

### 1. Instalare Dependențe

```bash
# Instalează Node.js dependencies
npm install
```

### 2. Configurare Variabile de Mediu

```bash
# Copiază și editează fișierul de configurare
cp .env.example .env
```

Editează `.env` cu setările tale:

```env
# Port server
PORT=3000

# Email (Gmail recomandatFusionAccurate pentru test)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Casa Bucuriei <noreply@casabucuriei.ro>

# Email-uri destinație
RESERVATION_EMAIL=rezervari@casabucuriei.ro
CONTACT_EMAIL=contact@casabucuriei.ro

# Securitate
SECRET_KEY=your-secret-key-here
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 3. Configurare Email Gmail

Pentru Gmail, trebuie să:
1. Activezi autentificarea cu 2 factori
2. Generezi o parolă de aplicație în contul Google
3. Folosești parola de aplicație în `EMAIL_PASS`

### 4. Pornire Server

```bash
# Dezvoltare (cu auto-restart)
npm run dev

# Producție
npm start

# Inițializare bază de date (optional)
npm run init-db
```

## 📊 API Endpoints

### Rezervări

| Method | Endpoint | Descriere |
|--------|----------|-----------|
| POST | `/api/reservations` | Creează rezervare nouă |
| GET | `/api/reservations` | Listează rezervări (admin) |
| GET | `/api/reservations/:id` | Obține rezervare specifică |
| GET | `/api/reservations/code/:code` | Obține rezervare după cod |
| PUT | `/api/reservations/:id/status` | Actualizează status |
| GET | `/api/reservations/availability/:date` | Verifică disponibilitate |

### Contact

| Method | Endpoint | Descriere |
|--------|----------|-----------|
| POST | `/api/contact` | Trimite mesaj contact |
| GET | `/api/contact` | Listează mesaje (admin) |
| GET | `/api/contact/:id` | Obține mesaj specific |
| PUT | `/api/contact/:id/status` | Actualizează status |
| GET | `/api/contact/stats/overview` | Statistici contact |

### Review-uri

| Method | Endpoint | Descriere |
|--------|----------|-----------|
| POST | `/api/reviews` | Adaugă review nou |
| GET | `/api/reviews` | Review-uri publice aprobate |
| GET | `/api/reviews/admin` | Toate review-urile (admin) |
| PUT | `/api/reviews/:id/status` | Moderare review |
| PUT | `/api/reviews/:id/featured` | Marchează ca featured |
| POST | `/api/reviews/:id/helpful` | Marchează ca util |

### Utilități

| Method | Endpoint | Descriere |
|--------|----------|-----------|
| GET | `/api/health` | Status API |

## 💻 Utilizare Frontend

### Formularul de Rezervare

- **Validare în timp real** pentru toate câmpurile
- **Calculare automată preț** bazată pe nopți și oaspeți
- **Verificare disponibilitate** în backend
- **Email de confirmare** automat
- **Cod de rezervare** generat automat

### Formularul de Contact

- **Mesaje generale** separate de rezervări
- **Prioritizare automată** a mesajelor
- **Confirmări email** pentru client
- **Notificări** pentru administratori

### Integrare API

JavaScript-ul include:
- **Fetch API** pentru toate cererile
- **Error handling** complet
- **Loading states** vizuale
- **Validare frontend** sincronizată cu backend
- **Retry logic** pentru cereri eșuate

## 🔧 Funcționalități Admin

Pentru administrare, folosește endpoint-urile API direct sau construiește un dashboard custom:

### Exemplu: Listare Rezervări

```javascript
fetch('/api/reservations?status=pending')
  .then(response => response.json())
  .then(data => console.log(data.data.reservations));
```

### Exemplu: Aprobare Review

```javascript
fetch('/api/reviews/123/status', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'approved' })
});
```

## 📧 Sistemul de Email

### Email-uri Automate Incluse

1. **Confirmare rezervare** → client
2. **Notificare rezervare nouă** → admin
3. **Confirmare mesaj contact** → client  
4. **Notificare mesaj nou** → admin
5. **Update status rezervare** → client

### Template-uri Email

Toate email-urile folosesc template-uri HTML responsive cu:
- **Design modern** consistent cu brandul
- **Informații complete** despre rezervare/mesaj
- **Call-to-action** buttons
- **Footer complet** cu contact info

## 🔒 Securitate

- **Rate limiting** 100 requests/15 min per IP
- **Helmet.js** pentru securitate headers
- **Input validation** cu express-validator
- **SQL injection protection** cu Sequelize
- **CORS configurabil** pentru domenii specifice
- **Error handling** fără expunere stack traces

## 🚀 Deployment

### Variabile de Mediu Producție

```env
NODE_ENV=production
PORT=80
ALLOWED_ORIGINS=https://yourdomain.com
EMAIL_USER=your-production-email@domain.com
# ... alte configurări
```

### Recomandări Hosting

- **VPS** (DigitalOcean, Linode, AWS)
- **Platform-as-a-Service** (Heroku, Railway)
- **Shared hosting** cu suport Node.js

### Bază de Date

- **Dezvoltare**: SQLite (inclus)
- **Producție**: PostgreSQL sau MySQL (ușor de migrat cu Sequelize)

## 🔍 Testare

### Test API Health

```bash
curl http://localhost:3000/api/health
```

### Test Rezervare

```bash
curl -X POST http://localhost:3000/api/reservations \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "checkinDate": "2025-10-01",
    "checkoutDate": "2025-10-03",
    "guests": 2
  }'
```

## 📝 Log-uri și Monitoring

- **Console logging** pentru evenimente importante
- **Morgan logging** pentru HTTP requests
- **Error logging** cu stack traces în development
- **Email errors** nu opresc execuția (fail-safe)

## 🎯 Următorii Pași Recomandați

1. **Dashboard Admin** - interfață web pentru management
2. **Autentificare** - sistem login pentru administratori
3. **Notificări push** - alerts în timp real
4. **Analytics** - tracking vizite și conversii
5. **Multi-language** - suport română/engleză
6. **Payment integration** - Stripe/PayPal pentru plăți online
7. **Calendar integration** - sincronizare cu Google Calendar
8. **SMS notifications** - confirmări prin SMS

## 💡 Customizare

### Modificare Preț

Editează `PRICE_PER_NIGHT` în `index.html` și logica de calcul în `routes/reservations.js`.

### Adăugare Câmpuri

1. Modifică modelele din `models/`
2. Actualizează validatorii din `routes/`
3. Adaugă câmpurile în formularul HTML
4. Actualizează JavaScript-ul frontend

### Template-uri Email

Modifică `services/emailService.js` pentru a customiza design-ul email-urilor.

---

**Aplicația este gata de utilizare!** 

Pornește serverul cu `npm run dev` și accesează `http://localhost:3000` pentru a testa toate funcționalitățile.