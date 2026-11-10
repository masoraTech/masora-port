# Portfolio Masora Technologies

Portfolio réalisé avec Next.js, Prisma et PostgreSQL : galerie de projets, filtres par catégorie, fiches projet, formulaire de contact et espace `/admin` protégé par mot de passe pour gérer les projets et consulter les messages. La page d’accueil synchronise également son carrousel de projets avec Neon Realtime.

## Lancer en local

1. Utiliser une base PostgreSQL nommée `portfolio` ou le projet Neon lié dans `.neon`.
2. Copier `.env.example` vers `.env` et renseigner `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (au moins 12 caractères) et un `AUTH_SECRET` aléatoire. Pour Neon, `DATABASE_URL` est l’URL poolée de l’application et `DATABASE_URL_UNPOOLED` l’URL directe des migrations Prisma.
3. Installer les dépendances avec `npm install`.
4. Appliquer les migrations et créer les catégories par défaut :

   ```sh
   npx prisma migrate deploy
   npm run db:seed
   ```

5. Démarrer l’application avec `npm run dev`, puis ouvrir `http://localhost:3000`. L’administration est accessible sur `http://localhost:3000/admin`.

Les fichiers générés en développement sont isolés dans `.next-dev`, séparément du build de production dans `.next`. Après une mise à jour de `next.config.mjs`, redémarrer le serveur de développement.

Le seed crée cinq catégories et le compte admin configuré dans `.env`, mais aucun projet ni message de contact. Le mot de passe est stocké sous forme hachée.

Les images téléversées sont stockées dans Netlify Blobs (store `uploads`). En local, lancer le site avec `netlify dev` pour bénéficier de l’émulation de Blobs. La base contient les projets, les catégories et les messages de contact.

La configuration `neon.ts` active Realtime sur la branche liée. Après `neon deploy`, définissez `NEXT_PUBLIC_NEON_REALTIME_URL` avec la valeur de `NEON_REALTIME_URL` dans `.env.local` et dans l’environnement d’hébergement. Gardez `NEON_REALTIME_SECRET` côté serveur uniquement.
