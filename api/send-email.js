const https = require('https');

module.exports = async (req, res) => {
    // Setează CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { reservationData, confirmationCode } = req.body;
        
        // Calculează detaliile rezervării
        const checkInDate = new Date(reservationData.checkinDate);
        const checkOutDate = new Date(reservationData.checkoutDate);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const pricePerNight = 150;
        const totalPrice = nights * pricePerNight * reservationData.guests;

        // Pregătește datele pentru email
        const emailData = {
            to: 'ecryecry17@gmail.com',
            from: reservationData.email,
            subject: '🏠 NOUĂ REZERVARE - Casa Bucuriei',
            text: `🏠 NOUĂ REZERVARE - CASA BUCURIEI

📋 DETALII REZERVARE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Client: ${reservationData.name}
📧 Email: ${reservationData.email}
📞 Telefon: ${reservationData.phone}

📅 Check-in: ${checkInDate.toLocaleDateString('ro-RO')}
📅 Check-out: ${checkOutDate.toLocaleDateString('ro-RO')}
🛏️ Durata: ${nights} ${nights === 1 ? 'noapte' : 'nopți'}
👥 Oaspeți: ${reservationData.guests}

💰 Preț estimat: ${totalPrice} RON
📝 Cod confirmare: ${confirmationCode}

💬 MESAJ CLIENT:
${reservationData.message || 'Nu a fost specificat niciun mesaj.'}

⏰ Data rezervării: ${new Date().toLocaleString('ro-RO')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Pentru răspuns, folosește direct reply la acest email.`
        };

        // Trimite email prin webhook simplu
        const postData = JSON.stringify({
            to: emailData.to,
            from: emailData.from,
            subject: emailData.subject,
            message: emailData.text
        });

        // Folosește webhook pentru trimiterea email-ului
        const options = {
            hostname: 'formcarry.com',
            port: 443,
            path: '/s/IKfhpOe6yzY',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const emailPromise = new Promise((resolve, reject) => {
            const emailReq = https.request(options, (emailRes) => {
                let data = '';
                emailRes.on('data', (chunk) => { data += chunk; });
                emailRes.on('end', () => {
                    if (emailRes.statusCode === 200) {
                        resolve(data);
                    } else {
                        reject(new Error(`Email failed: ${emailRes.statusCode}`));
                    }
                });
            });

            emailReq.on('error', reject);
            emailReq.write(postData);
            emailReq.end();
        });

        await emailPromise;

        res.status(200).json({ 
            success: true, 
            message: 'Email trimis cu succes!',
            confirmationCode 
        });

    } catch (error) {
        console.error('Eroare la trimiterea email-ului:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Eroare la trimiterea email-ului' 
        });
    }
};