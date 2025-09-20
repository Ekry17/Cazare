// Funcție corectă pentru email prin Formspree
async function sendReservationEmail(reservationData, confirmationCode) {
    try {
        const checkInDate = new Date(reservationData.checkinDate);
        const checkOutDate = new Date(reservationData.checkoutDate);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const totalPrice = nights * 150 * reservationData.guests;

        console.log('📧 Trimiterea emailului către ecryecry17@gmail.com...');

        const formData = new FormData();
        formData.append('name', reservationData.name);
        formData.append('email', reservationData.email);
        formData.append('_replyto', reservationData.email);
        formData.append('_subject', `🏡 Rezervare Casa Bucuriei - ${reservationData.name}`);
        
        const message = `🏡 REZERVARE NOUĂ - CASA BUCURIEI

📋 CLIENT: ${reservationData.name}
📧 EMAIL: ${reservationData.email}
📞 TELEFON: ${reservationData.phone || 'Nu a fost specificat'}

📅 CHECK-IN: ${checkInDate.toLocaleDateString('ro-RO')}
📅 CHECK-OUT: ${checkOutDate.toLocaleDateString('ro-RO')}
🛏️ NOPȚI: ${nights}
👥 OASPEȚI: ${reservationData.guests}
💰 PREȚ: ${totalPrice} RON

📝 COD: ${confirmationCode}
⏰ DATA: ${new Date().toLocaleString('ro-RO')}

💬 MESAJ: ${reservationData.message || 'Niciun mesaj'}`;

        formData.append('message', message);

        const response = await fetch('https://formspree.io/f/xrbzjnqg', {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            console.log('✅ Email trimis cu succes către ecryecry17@gmail.com!');
            return true;
        } else {
            throw new Error('Formspree error');
        }

    } catch (error) {
        console.error('❌ Eroare email:', error);
        alert(`⚠️ REZERVARE SALVATĂ LOCAL

Client: ${reservationData.name}
Email: ${reservationData.email}
Check-in: ${new Date(reservationData.checkinDate).toLocaleDateString('ro-RO')}
Cod: ${confirmationCode}

Emailul nu s-a trimis! Contactează clientul manual!`);
        return false;
    }
}