/**
 * CONFIGURARE CASA BUCURIEI
 * ========================
 * 
 * Pentru a transfera site-ul unui nou proprietar:
 * 1. Schimbă OWNER_EMAIL cu email-ul noului proprietar
 * 2. Personalizează BUSINESS_INFO cu datele noii afaceri
 * 3. Actualizează PROPERTY_DETAILS cu informațiile corecte
 */

// ===========================================
// CONFIGURARE EMAIL PROPRIETAR
// ===========================================
const CONFIG = {
    // Email-ul proprietarului care primește rezervările și mesajele
    OWNER_EMAIL: 'ecryecry17@gmail.com',
    
    // Informații despre afacere
    BUSINESS_INFO: {
        name: 'Casa Bucuriei',
        description: 'Pensiune în inima naturii',
        phone: '+40 XXX XXX XXX', // Actualizează cu numărul real
        address: 'Adresa completă aici', // Actualizează cu adresa reală
    },
    
    // Detalii despre proprietate
    PROPERTY_DETAILS: {
        pricePerNight: 150, // RON pe noapte
        maxGuests: 8,
        checkInTime: '15:00',
        checkOutTime: '11:00',
        currency: 'RON'
    },
    
    // ===========================================
    // CONFIGURARE PLĂȚI ONLINE (STRIPE)
    // ===========================================
    PAYMENTS: {
        enabled: false, // false = doar rezervări, true = plăți activate
        provider: 'stripe', // Furnizor de plăți
        
        // Chei Stripe (IMPORTANTE!)
        stripe: {
            // ATENȚIE: Pentru plăți reale, înlocuiește cu cheile tale!
            publishableKey: 'pk_test_REPLACE_WITH_YOUR_REAL_KEY',
            // Cheia secretă se configurează pe server (nu aici!)
        },
        
        // Configurare plăți
        advancePayment: {
            enabled: true, // true = doar avans, false = plată completă
            percentage: 30 // Procent avans (30% din total)
        },
        
        // Monezi acceptate
        supportedCurrencies: ['RON', 'EUR', 'USD']
    },
    
    // Configurare email-uri
    EMAIL_CONFIG: {
        subjectReservation: '🏠 NOUĂ REZERVARE - Casa Bucuriei',
        subjectContact: '💬 MESAJ CONTACT - Casa Bucuriei',
        subjectConfirmation: '✅ Confirmare rezervare - Casa Bucuriei',
        subjectContactConfirmation: '✅ Am primit mesajul tău - Casa Bucuriei'
    }
};

// ===========================================
// FUNCȚII HELPER
// ===========================================

// Generează cod de confirmare unic
function generateConfirmationCode() {
    return 'CB' + Date.now().toString().slice(-6) + Math.random().toString(36).substring(2, 4).toUpperCase();
}

// Calculează prețul total
function calculateTotalPrice(checkIn, checkOut, guests) {
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    return nights * CONFIG.PROPERTY_DETAILS.pricePerNight * guests;
}

// Calculează suma de plată (avans sau total)
function calculatePaymentAmount(totalPrice) {
    if (CONFIG.PAYMENTS.advancePayment.enabled) {
        return Math.round(totalPrice * CONFIG.PAYMENTS.advancePayment.percentage / 100);
    }
    return totalPrice;
}

// Convertește RON în centi pentru Stripe
function convertToStripeAmount(amount) {
    return Math.round(amount * 100); // Stripe folosește centi
}

// Export pentru folosire în HTML
if (typeof window !== 'undefined') {
    window.CASA_BUCURIEI_CONFIG = CONFIG;
    window.generateConfirmationCode = generateConfirmationCode;
    window.calculateTotalPrice = calculateTotalPrice;
    window.calculatePaymentAmount = calculatePaymentAmount;
    window.convertToStripeAmount = convertToStripeAmount;
}