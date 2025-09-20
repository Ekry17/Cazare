// Sistem simplu de email pentru Casa Bucuriei
// Trimite rezervările direct la ecryecry17@gmail.com

async function sendDirectEmail(reservationData, confirmationCode) {
    try {
        // Calculează detaliile
        const checkInDate = new Date(reservationData.checkinDate);
        const checkOutDate = new Date(reservationData.checkoutDate);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const totalPrice = nights * 150 * reservationData.guests;

        console.log('🚀 Trimitere email direct către ecryecry17@gmail.com...');
        
        // Creez un form ascuns pentru Formsubmit.co
        const form = document.createElement('form');
        form.action = 'https://formsubmit.co/ecryecry17@gmail.com';
        form.method = 'POST';
        form.style.display = 'none';
        
        // Adaug câmpurile necesare
        const fields = {
            '_subject': `🏡 Rezervare Casa Bucuriei - ${reservationData.name}`,
            '_replyto': reservationData.email,
            '_template': 'table',
            '_captcha': 'false',
            '_next': window.location.href,
            'Nume Client': reservationData.name,
            'Email Client': reservationData.email,
            'Telefon': reservationData.phone || 'Nu a fost specificat',
            'Check-in': checkInDate.toLocaleDateString('ro-RO'),
            'Check-out': checkOutDate.toLocaleDateString('ro-RO'),
            'Numărul de nopți': nights,
            'Numărul de oaspeți': reservationData.guests,
            'Preț total': `${totalPrice} RON`,
            'Cod rezervare': confirmationCode,
            'Data rezervării': new Date().toLocaleString('ro-RO'),
            'Mesaj client': reservationData.message || 'Niciun mesaj'
        };

        for (const [name, value] of Object.entries(fields)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = value;
            form.appendChild(input);
        }

        // Adaugă form-ul la pagină și trimite-l
        document.body.appendChild(form);
        form.submit();
        
        console.log('✅ Email trimis cu succes la ecryecry17@gmail.com prin Formsubmit');
        console.log('📧 Reply-to configurat pe:', reservationData.email);
        console.log('📝 Cod rezervare:', confirmationCode);
        
        // Șterge form-ul după 1 secundă
        setTimeout(() => {
            if (document.body.contains(form)) {
                document.body.removeChild(form);
            }
        }, 1000);
        
        return true;

    } catch (error) {
        console.log('❌ Eroare la trimiterea emailului:', error);
        
        // Afișez detaliile pentru backup manual
        console.log('📧 BACKUP - Detalii rezervare:');
        console.log('═══════════════════════════════');
        console.log('👤 Client:', reservationData.name);
        console.log('📧 Email:', reservationData.email);
        console.log('📞 Telefon:', reservationData.phone || 'N/A');
        console.log('📅 Check-in:', new Date(reservationData.checkinDate).toLocaleDateString('ro-RO'));
        console.log('📅 Check-out:', new Date(reservationData.checkoutDate).toLocaleDateString('ro-RO'));
        console.log('👥 Oaspeți:', reservationData.guests);
        console.log('💰 Preț:', Math.ceil((new Date(reservationData.checkoutDate) - new Date(reservationData.checkinDate)) / (1000 * 60 * 60 * 24)) * 150 * reservationData.guests, 'RON');
        console.log('📝 Cod:', confirmationCode);
        console.log('💬 Mesaj:', reservationData.message || 'Niciun mesaj');
        console.log('═══════════════════════════════');
        
        return false;
    }
}

// Export pentru utilizare
window.sendDirectEmail = sendDirectEmail;