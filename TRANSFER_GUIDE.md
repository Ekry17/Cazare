# TRANSFERUL SITE-ULUI CASA BUCURIEI
# ===================================

Acest fișier conține toate instrucțiunile pentru a transfera site-ul către un nou proprietar.

## PAȘII PENTRU TRANSFER

### 1. SCHIMBĂ EMAIL-UL PROPRIETARULUI
Deschide fișierul `config.js` și modifică:
```javascript
OWNER_EMAIL: 'noul_email@exemple.com',  // Înlocuiește cu email-ul nou
```

### 2. ACTUALIZEAZĂ INFORMAȚIILE AFACERII
În același fișier `config.js`, personalizează:
```javascript
BUSINESS_INFO: {
    name: 'Numele Noii Afaceri',
    description: 'Descrierea noii afaceri',
    phone: '+40 XXX XXX XXX',  // Numărul de telefon real
    address: 'Adresa completă',  // Adresa reală
},
```

### 3. CONFIGUREAZĂ PREȚURILE
Modifică prețurile în `config.js`:
```javascript
PROPERTY_DETAILS: {
    pricePerNight: 200,  // Noul preț pe noapte în RON
    maxGuests: 6,        // Numărul maxim de oaspeți
    checkInTime: '16:00', // Ora de check-in
    checkOutTime: '10:00', // Ora de check-out
    currency: 'RON'      // Moneda
}
```

### 4. PERSONALIZEAZĂ CONȚINUTUL SITE-ULUI
Pentru a schimba textele și imaginile:

**Textele principale:**
- Deschide `index.html`
- Caută și înlocuiește "Casa Bucuriei" cu numele nou
- Modifică descrierile și textele în secțiunile: Hero, About, Rooms, etc.

**Imaginile:**
- Înlocuiește imaginile din secțiunile galerie cu fotografiile noii proprietăți
- Păstrează aceleași nume de fișiere sau actualizează și căile în HTML

### 5. DEPLOY PE VERCEL
După modificări:
```powershell
vercel --prod
```

## FIȘIERELE IMPORTANTE

- `config.js` - Configurația centralizată (EMAIL, PREȚURI, CONTACT)
- `index.html` - Interfața principală și logica email-urilor
- `api/index.js` - API-ul pentru rezervări și contact
- `vercel.json` - Configurația pentru deployment

## TESTAREA DUPĂ TRANSFER

1. **Testează formularul de rezervări**
   - Completează o rezervare cu email-ul tău
   - Verifică că primești email-ul la noul email configurat
   - Testează că poți răspunde direct din Gmail

2. **Testează formularul de contact**
   - Trimite un mesaj de contact
   - Verifică ambele email-uri (proprietar și expeditor)

3. **Verifică calcularea prețurilor**
   - Asigură-te că prețurile se calculează corect cu noile valori

## SUPPORT

Dacă întâmpini probleme:
1. Verifică că fișierul `config.js` este încărcat corect în browser
2. Deschide Developer Tools (F12) pentru a vedea eventualele erori
3. Toate email-urile sunt trimise prin Formsubmit.co - nu necesită configurare suplimentară

## FUNCȚII AVANSATE

Site-ul include:
- ✅ **Sistem de rezervări complet** cu email-uri automate
- ✅ **Formulare de contact** cu confirmări
- ✅ **Design responsive** pentru mobile și desktop
- ✅ **Galerie foto** cu lightbox
- ✅ **Secțiune recenzii** pentru feedback
- ✅ **Configurare centralizată** pentru personalizare ușoară

Toate acestea funcționează automat după personalizarea din `config.js`!