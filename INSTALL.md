# Guide d'import sur un nouveau compte Lovable

## Prérequis
- Un compte Lovable actif
- Lovable Cloud activé (pour le backend Supabase)

## Étapes d'import

### 1. Créer un nouveau projet Lovable
- Cliquer sur "New Project" dans Lovable
- Choisir "Import from GitHub" ou créer un projet vide

### 2. Importer le code source
- Si GitHub : pusher le contenu du dossier `/project` vers un repo GitHub, puis connecter
- Si projet vide : copier-coller les fichiers via l'éditeur Lovable ou utiliser le remix

### 3. Activer Lovable Cloud
- Aller dans Connectors → Lovable Cloud → Activer
- Cela crée automatiquement le backend Supabase

### 4. Exécuter les migrations DB
Les migrations SQL sont dans `supabase/migrations/`. Elles seront appliquées automatiquement par Lovable Cloud.

Si besoin de les appliquer manuellement, copiez le contenu SQL de chaque fichier de migration et exécutez-les via l'outil de migration Lovable.

### 5. Configurer les secrets
Dans Lovable Cloud → Secrets, vérifier que ces secrets existent :
- `SUPABASE_URL` (auto)
- `SUPABASE_ANON_KEY` (auto)
- `SUPABASE_SERVICE_ROLE_KEY` (auto)
- `LOVABLE_API_KEY` (auto si Lovable AI activé)

### 6. Créer les comptes utilisateurs
Invoquer l'Edge Function `seed-users` pour créer les comptes de test :
```
POST /functions/v1/seed-users
```
Ou recréer manuellement via l'interface d'auth.

### 7. Configurer l'authentification
- Via l'outil `configure_auth` : activer auto-confirm si souhaité pour le dev
- Configurer Google OAuth si nécessaire

### 8. Déployer les Edge Functions
Les Edge Functions dans `supabase/functions/` sont déployées automatiquement par Lovable.

### 9. Vérifier
- Accéder à l'app
- Se connecter avec admin@agroconnect.cm / Admin2026!
- Tester les modules

## Structure des fichiers clés
```
.env                          → Variables auto-générées (NE PAS MODIFIER)
src/integrations/supabase/    → Client et types auto-générés (NE PAS MODIFIER)
supabase/migrations/          → Migrations DB (NE PAS MODIFIER directement)
supabase/functions/            → Edge Functions (chat, seed-users)
supabase/config.toml          → Config projet Supabase
```

## Notes importantes
- Les fichiers `.env`, `client.ts`, `types.ts` sont auto-générés par Lovable Cloud
- Le `project_id` dans `config.toml` changera sur le nouveau projet
- Les données de test doivent être re-insérées après migration
