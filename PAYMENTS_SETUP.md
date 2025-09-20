# 💳 CONFIGURARE PLĂȚI ONLINE - Casa Bucuriei

## 🚀 Sistem de Plăți Integrat

Sistemul de rezervări include acum **plăți online securizate prin Stripe**, oferind clienților opțiunea de a plăti un avans de 30% direct online.

## 📋 Caracteristici

### ✅ Ce este inclus:
- **Plăți securizate prin Stripe**
- **Avans de 30%** din suma totală
- **Opțiune de rezervare fără plată** (doar confirmare telefonică)
- **Email-uri automate** pentru client și proprietar
- **Interface prietenoasă** cu calculare automată
- **Suport pentru carduri Visa/Mastercard/American Express**

### 💰 Cum funcționează:
1. **Clientul completează rezervarea**
2. **Sistemul calculează suma totală** (nopți × preț × oaspeți)
3. **Se afișează opțiunea de plată** - avans 30% sau doar rezervare
4. **Dacă alege plata online:**
   - Introduce datele cardului
   - Plătește avansul de 30%
   - Primește confirmare instant
5. **Restul de 70%** se plătește la cazare

## ⚙️ Configurare pentru Proprietar Nou

### 1. Cont Stripe (OBLIGATORIU pentru plăți)

```bash
# Pasul 1: Creează cont gratuit
1. Mergi pe https://stripe.com
2. Creează cont de business
3. Completează verificarea KYC
4. Obține cheile API
```

### 2. Actualizează Configurarea

**Fișier: `config.js`**
```javascript
PAYMENTS: {
    enabled: true, // Activează plățile
    stripe: {
        // Înlocuiește cu cheile tale reale!
        publishableKey: 'pk_live_YOUR_REAL_KEY_HERE', // Cheia publică LIVE
    },
    advancePayment: {
        enabled: true, // true = doar avans, false = plată completă
        percentage: 30 // Procent avans (30%)
    }
}
```

### 3. Configurare Server (pentru plăți reale)

Pentru plăți reale, trebuie să adaugi **cheia secretă Stripe** în variabilele de mediu:

```bash
# În panoul Vercel, adaugă:
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
```

## 🔧 Customizare

### Modificare Procent Avans
```javascript
// În config.js
advancePayment: {
    enabled: true,
    percentage: 50 // Schimbă la 50% avans
}
```

### Dezactivare Plăți
```javascript
// În config.js
PAYMENTS: {
    enabled: false, // Doar rezervări, fără plăți
}
```

### Modificare Monedă
```javascript
// În config.js
PROPERTY_DETAILS: {
    currency: 'EUR' // Schimbă la EUR
}
```

## 🛡️ Securitate

- **Stripe PCI DSS Level 1** - cel mai înalt standard de securitate
- **Date carduri criptate** - nu sunt stocate pe serverul tău
- **3D Secure 2.0** - autentificare suplimentară pentru tranzacții mari
- **SSL/TLS encryption** - toate comunicările sunt criptate

## 💼 Comisioane Stripe

- **2.9% + 0.30 RON** per tranzacție reușită
- **Fără costuri lunare** fixe
- **Fără costuri setup**
- **Transfer automat** în contul bancar în 2-7 zile

## 📞 Suport

### Pentru Probleme Tehnice:
1. Verifică **cheile Stripe** în config.js
2. Verifică **variabilele de mediu** în Vercel
3. Testează cu **carduri de test** Stripe

### Carduri de Test Stripe:
```
Visa Success: 4242 4242 4242 4242
Visa Declined: 4000 0000 0000 0002
3D Secure: 4000 0000 0000 3220
```

## 🚀 Launch Checklist

Înainte de a activa plățile în producție:

- [ ] **Cont Stripe verificat** și aprobat
- [ ] **Chei LIVE** configurate în config.js și Vercel
- [ ] **Test cu card real** (sumă mică)
- [ ] **Email-uri** funcționează corect
- [ ] **Termeni și condiții** actualizați cu informații plăți
- [ ] **Politica de returnare** definită
- [ ] **Număr telefon** pentru suport client

## 📈 Beneficii pentru Afacere

### Pentru Proprietar:
- ✅ **Rezervări confirmate instant**
- ✅ **Reducerea no-show-urilor**
- ✅ **Cash flow îmbunătățit**
- ✅ **Automatizare procese**
- ✅ **Tracking financial**

### Pentru Clienți:
- ✅ **Rezervare instant**
- ✅ **Plată securizată**
- ✅ **Confirmare automată**
- ✅ **Receipt digital**
- ✅ **Opțiune plată parțială**

---

**🎯 Rezultat:** Sistem complet de rezervări cu plăți online, gata pentru afaceri serioase!