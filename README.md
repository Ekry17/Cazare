# 🏠 CASA BUCURIEI - SITE REZERVĂRI
## Site web complet pentru pensiuni și case de vacanță

### 🚀 FEATURES
- ✅ **Sistem de rezervări** cu email-uri automate
- ✅ **Formulare de contact** cu confirmări
- ✅ **Design responsive** (mobile + desktop)
- ✅ **Galerie foto** cu lightbox
- ✅ **Secțiunea recenzii**
- ✅ **Configurare centralizată**

### ⚡ SETUP RAPID

#### 1. Pentru un nou proprietar:
```javascript
// Editează config.js
OWNER_EMAIL: 'noul_email@exemplo.com'
```

#### 2. Pentru personalizare completă:
Vezi fișierul `TRANSFER_GUIDE.md` pentru instrucțiuni detaliate.

#### 3. Deploy:
```bash
vercel --prod
```

### 📁 STRUCTURA PROIECTULUI
```
📦 Casa Bucuriei
├── 📄 index.html          # Pagina principală
├── ⚙️ config.js           # Configurația centralizată
├── 📂 api/
│   └── index.js           # API pentru rezervări
├── 📄 vercel.json         # Configurația Vercel
├── 📖 TRANSFER_GUIDE.md   # Ghid complet de transfer
└── 📄 README.md           # Acest fișier
```

### 🔧 PERSONALIZARE

**Schimbă email-ul proprietarului:**
```javascript
// În config.js
OWNER_EMAIL: 'noul_email@exemplo.com'
```

**Actualizează prețurile:**
```javascript
// În config.js
PROPERTY_DETAILS: {
    pricePerNight: 200,  // RON pe noapte
    maxGuests: 8
}
```

**Modifică numele afacerii:**
```javascript
// În config.js
BUSINESS_INFO: {
    name: 'Numele Nou',
    description: 'Descrierea nouă'
}
```

### 📧 SISTEMUL DE EMAIL

Site-ul trimite automat email-uri către:
- **Proprietar** - notificare cu detaliile rezervării
- **Client** - confirmare de rezervare

**Reply-to** este configurat automat pentru răspuns direct din Gmail.

### 🎨 PERSONALIZARE AVANSATĂ

Pentru schimbări de design sau conținut:
1. **Textele** - editează direct în `index.html`
2. **Imaginile** - înlocuiește fișierele din galerie
3. **Culorile** - folosește clasele TailwindCSS
4. **Layout-ul** - modifică structura HTML

### 🚀 DEPLOYMENT

Site-ul este optimizat pentru **Vercel**:
```bash
# Deploy în producție
vercel --prod

# Link-ul va fi generat automat
# Exemplu: https://cazare-xyz.vercel.app
```

### 🛠️ TEHNOLOGII FOLOSITE

- **Frontend:** HTML5, TailwindCSS, JavaScript
- **Backend:** Node.js (Vercel Serverless)
- **Email:** Formsubmit.co (fără configurare)
- **Hosting:** Vercel
- **Database:** În memorie (pentru demo)

### � SUPPORT

Pentru probleme tehnice:
1. Verifică Developer Tools (F12) pentru erori
2. Testează formularul cu email-ul tău
3. Verifică că `config.js` se încarcă corect

### 🎯 READY-TO-SELL

Acest site este **gata pentru vânzare**:
- ✅ Configurare centralizată în `config.js`
- ✅ Documentație completă în `TRANSFER_GUIDE.md`
- ✅ Cod curat și comentat
- ✅ Design profesional
- ✅ Funcționalitate completă

**Timpul de transfer: 5 minute** (doar editare `config.js` + deploy)!