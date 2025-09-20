const { initializeDatabase, resetDatabase } = require('../models');

async function main() {
  const args = process.argv.slice(2);
  const shouldReset = args.includes('--reset') || args.includes('-r');
  
  console.log('🚀 Inițializare bază de date Casa Bucuriei...\n');
  
  try {
    if (shouldReset) {
      console.log('⚠️  ATENȚIE: Se va reseta complet baza de date!');
      console.log('Toate datele existente vor fi șterse!\n');
      
      // În dezvoltare, resetează automat. În producție, cere confirmare.
      if (process.env.NODE_ENV === 'production') {
        console.log('❌ Reset-ul nu este permis în producție!');
        process.exit(1);
      }
      
      await resetDatabase();
      console.log('✅ Baza de date a fost resetată cu succes!\n');
    } else {
      await initializeDatabase();
      console.log('✅ Baza de date a fost inițializată cu succes!\n');
    }
    
    console.log('📊 Tabele create:');
    console.log('   - reservations (rezervări)');
    console.log('   - contacts (mesaje contact)');
    console.log('   - reviews (evaluări clienți)');
    
    console.log('\n🎯 Următorii pași:');
    console.log('   1. Configurează variabilele de mediu în .env');
    console.log('   2. Pornește serverul cu: npm run dev');
    console.log('   3. Accesează aplicația la: http://localhost:3000');
    console.log('   4. Testează API la: http://localhost:3000/api/health');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Eroare la inițializarea bazei de date:', error);
    process.exit(1);
  }
}

// Afișează ajutor dacă este cerut
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
📊 Script de Inițializare Bază de Date - Casa Bucuriei

Utilizare:
  node scripts/initDatabase.js [opțiuni]

Opțiuni:
  --reset, -r    Resetează complet baza de date (doar în development)
  --help, -h     Afișează acest mesaj de ajutor

Exemple:
  node scripts/initDatabase.js              # Inițializează baza de date
  node scripts/initDatabase.js --reset      # Resetează și recreează toate tabelele
  npm run init-db                          # Folosind npm script
`);
  process.exit(0);
}

main();