# Casa Bucuriei - Configurare Rapidă

## 🚀 Start Rapid (5 minute)

### 1. Instalare
```bash
npm install
```

### 2. Configurare Email (optional pentru test)
```bash
cp .env.example .env
# Editează .env cu datele tale de email
```

### 3. Pornire
```bash
npm run dev
```

### 4. Accesare
- Website: http://localhost:3000
- API Test: http://localhost:3000/api/health

## 📝 Configurare Email Gmail

1. Activează autentificarea cu 2 factori în Gmail
2. Generează parolă de aplicație: https://myaccount.google.com/apppasswords
3. Adaugă în `.env`:
```env
EMAIL_USER=ecryecry17@gmail.com
EMAIL_PASS=your-16-character-app-password
```

## 🧪 Testare Funcționalități

### Test Rezervare
1. Accesează http://localhost:3000
2. Scroll la secțiunea "Contact"
3. Completează formularul de rezervare
4. Verifică console pentru confirmarea API

### Test Contact
1. Click pe "Doar o întrebare? Trimiteți un mesaj general"
2. Completează formularul de contact
3. Verifică dacă mesajul este trimis

### Test API Direct
```bash
# Test health
curl http://localhost:3000/api/health

# Test rezervare
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com", 
    "checkinDate": "2025-10-01",
    "checkoutDate": "2025-10-03",
    "guests": 2
  }'
```

## 🔧 Comenzi Utile

```bash
npm run dev          # Dezvoltare cu auto-restart
npm start            # Producție
npm run init-db      # Inițializează baza de date
npm run init-db -- --reset  # Resetează baza de date
```

## 📱 Funcționalități Incluse

✅ **Rezervări online** cu validare
✅ **Contact form** cu email automat  
✅ **Design responsive** mobile/desktop
✅ **Calculare preț** automată
✅ **Validare în timp real**
✅ **Email-uri de confirmare**
✅ **API REST complet**
✅ **Bază de date SQLite**
✅ **Rate limiting & securitate**

## 🎯 Pentru Producție

1. Schimbă `NODE_ENV=production` în `.env`
2. Configurează email de producție
3. Actualizează `ALLOWED_ORIGINS` cu domeniul tău
4. Deploy pe VPS/Heroku/Railway

## 💡 Probleme Comune

**Email nu funcționează?**
- Verifică `EMAIL_USER` și `EMAIL_PASS` în `.env`
- Folosește parola de aplicație, nu parola Gmail normală

**Formular nu trimite?**
- Verifică console browser pentru erori JavaScript
- Testează API direct cu curl

**Port ocupat?**
- Schimbă `PORT=3001` în `.env`

---

**Gata! Aplicația funcționează complet! 🎉**