const sequelize = require('../config/database');
const Reservation = require('./Reservation');
const Contact = require('./Contact');
const Review = require('./Review');

// Definirea relațiilor între modele (dacă este necesar în viitor)

// Exemplu de relații posibile:
// Un contact poate fi legat de o rezervare
// Reservation.hasMany(Contact, { foreignKey: 'reservationId', as: 'contacts' });
// Contact.belongsTo(Reservation, { foreignKey: 'reservationId', as: 'reservation' });

// Un review poate fi legat de o rezervare
// Reservation.hasOne(Review, { foreignKey: 'reservationId', as: 'review' });
// Review.belongsTo(Reservation, { foreignKey: 'reservationId', as: 'reservation' });

// Exportarea modelelor și conexiunii
module.exports = {
  sequelize,
  Reservation,
  Contact,
  Review
};

// Funcție pentru inițializarea bazei de date
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexiunea la baza de date a fost stabilită cu succes!');
    
    await sequelize.sync({ force: false });
    console.log('📊 Toate modelele au fost sincronizate cu succes!');
    
    return true;
  } catch (error) {
    console.error('❌ Eroare la inițializarea bazei de date:', error);
    return false;
  }
}

// Funcție pentru resetarea bazei de date (dezvoltare)
async function resetDatabase() {
  try {
    await sequelize.sync({ force: true });
    console.log('🔄 Baza de date a fost resetată cu succes!');
    return true;
  } catch (error) {
    console.error('❌ Eroare la resetarea bazei de date:', error);
    return false;
  }
}

module.exports.initializeDatabase = initializeDatabase;
module.exports.resetDatabase = resetDatabase;