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

// Export pentru folosire în HTML
if (typeof window !== 'undefined') {
    window.CASA_BUCURIEI_CONFIG = CONFIG;
    window.generateConfirmationCode = generateConfirmationCode;
    window.calculateTotalPrice = calculateTotalPrice;
}