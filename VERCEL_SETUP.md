# Deployment pe Vercel - Casa Bucuriei

## Configurare completă pentru deployment pe Vercel

### Fișiere adăugate/modificate:

1. **vercel.json** - Configurarea principală pentru Vercel
2. **package.json** - Actualizat cu script-urile necesare
3. **config/database.js** - Adaptat pentru mediul serverless
4. **server.js** - Modificat pentru CORS și popularea bazei de date
5. **.vercelignore** - Exclude fișierele nenecesare

### Funcționalități:

- ✅ Servire fișiere statice (index.html)
- ✅ API-uri funcționale (/api/*)
- ✅ Bază de date în memorie pentru demo
- ✅ CORS configurat pentru Vercel
- ✅ Date de demonstrație populate automat
- ✅ Gestionarea erorilor optimizată

### Pentru a face deploy:

1. Commit toate modificările în Git
2. Push pe GitHub
3. Redeploy pe Vercel

### Limitări în mediul Vercel:

- Baza de date SQLite este înlocuită cu una în memorie
- Datele se resetează la fiecare deploy/restart
- Pentru producție reală, recomand PostgreSQL/MySQL extern

### URLs importante:

- Pagina principală: https://your-app.vercel.app/
- Health check: https://your-app.vercel.app/api/health
- API rezervări: https://your-app.vercel.app/api/reservations
- API contact: https://your-app.vercel.app/api/contact
- API reviews: https://your-app.vercel.app/api/reviews