# Portfolio Masora Technologies

Portfolio réalisé avec Next.js, Prisma et PostgreSQL : galerie de projets, filtres par catégorie, fiches projet, formulaire de contact et espace `/admin` protégé par mot de passe pour gérer les projets et consulter les messages.

## Lancer en local

1. Créer une base PostgreSQL nommée `portfolio`.
2. Copier `.env.example` vers `.env` et renseigner `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (au moins 12 caractères) et un `AUTH_SECRET` aléatoire.
3. Installer les dépendances avec `npm install`.
4. Appliquer les migrations et créer les catégories par défaut :

   ```sh
   npx prisma migrate deploy
   npm run db:seed
   ```

5. Démarrer l’application avec `npm run dev`, puis ouvrir `http://localhost:3000`. L’administration est accessible sur `http://localhost:3000/admin`.

Les fichiers générés en développement sont isolés dans `.next-dev`, séparément du build de production dans `.next`. Après une mise à jour de `next.config.mjs`, redémarrer le serveur de développement.

Le seed crée cinq catégories et le compte admin configuré dans `.env`, mais aucun projet ni message de contact. Le mot de passe est stocké sous forme hachée.

Les images téléversées sont enregistrées localement dans `uploads` (ou dans le dossier défini par `UPLOAD_DIR`). La base contient les projets, les catégories et les messages de contact ; sauvegarder également `uploads` pour conserver les images.
