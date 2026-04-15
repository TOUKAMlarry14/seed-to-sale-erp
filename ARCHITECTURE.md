# Architecture technique — AgroConnect ERP

## Vue d'ensemble
```
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│  React 18 + Vite + TypeScript + Tailwind    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │  Pages   │ │Components│ │  Hooks   │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│         ↓           ↓           ↓           │
│  ┌──────────────────────────────────────┐   │
│  │   Supabase Client (@supabase/js)    │   │
│  └──────────────────────────────────────┘   │
└─────────────────────┬───────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────┐
│              Supabase Backend               │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌───────────┐  │
│  │ Auth │ │  DB  │ │ RLS  │ │Edge Funcs │  │
│  └──────┘ └──────┘ └──────┘ └───────────┘  │
└─────────────────────────────────────────────┘
```

## Organisation du code

### `/src/pages/`
- `Login.tsx` — Split-screen login/register avec carousel d'images
- `Dashboard.tsx` — Routeur vers le dashboard spécifique au rôle
- `ResetPassword.tsx` — Réinitialisation mot de passe
- `NotFound.tsx` — Page 404
- `modules/` — Tous les modules métier (Catalogue, Clients, Commandes, etc.)

### `/src/components/`
- `AppLayout.tsx` — Layout principal (sidebar + header + outlet)
- `AppSidebar.tsx` — Navigation latérale avec sections par rôle
- `ChatbotFAB.tsx` — Bouton flottant chatbot IA
- `OnboardingTour.tsx` — Visite guidée (react-joyride)
- `NotificationsPopover.tsx` — Popover notifications
- `ConfirmDialog.tsx` — Modale de confirmation (actions destructives)
- `DataTable.tsx` — Tableau de données réutilisable
- `ExportButtons.tsx` — Boutons export PDF/CSV
- `StatusBadge.tsx` — Badge de statut traduit
- `SplashScreen.tsx` — Écran de chargement animé
- `TodoWidget.tsx` — Widget tâches sur le dashboard
- `dashboards/` — 6 dashboards spécialisés par rôle

### `/src/hooks/`
Chaque entité métier a son hook dédié (CRUD + React Query) :
- `useAuth.tsx` — Authentification, profil, rôles
- `useClients.ts`, `useOrders.ts`, `useProducts.ts`, etc.
- `useActivityLog.ts` — Logging des actions utilisateur
- `useNotifications.ts` — Notifications temps réel

### `/src/contexts/`
- `ThemeContext.tsx` — Dark/Light mode (classe `.dark` sur `<html>`)
- `I18nContext.tsx` — Internationalisation FR/EN

### `/src/i18n/`
- `fr.ts` — Dictionnaire français (300+ clés)
- `en.ts` — Dictionnaire anglais (300+ clés)

### `/src/lib/`
- `constants.ts` — Constantes métier (rôles, statuts, catégories)
- `navigation.ts` — Configuration navigation sidebar
- `exportUtils.ts` — Utilitaires d'export PDF/CSV
- `utils.ts` — Utilitaires Tailwind (cn)

### `/supabase/functions/`
- `chat/index.ts` — Proxy chatbot IA → Lovable AI Gateway
- `seed-users/index.ts` — Création batch des comptes utilisateurs

## Flux de données
1. L'utilisateur se connecte via Supabase Auth
2. `useAuth` récupère le profil + rôles depuis `profiles` et `user_roles`
3. Le dashboard adaptatif charge les données via les hooks métier
4. Chaque hook utilise `supabase.from('table')` avec les types auto-générés
5. Les RLS policies filtrent côté serveur selon le rôle
6. Les mutations invalident le cache React Query pour refresh automatique
7. Les actions sont loguées dans `activity_logs` via `useActivityLog`

## Sécurité
- **RLS** sur toutes les tables (Row Level Security)
- **RBAC** via `user_roles` + fonctions `has_role()` / `has_any_role()`
- **SECURITY DEFINER** sur les fonctions de vérification de rôle
- **Edge Functions** avec `SUPABASE_SERVICE_ROLE_KEY` côté serveur uniquement
- Aucune clé privée dans le code frontend

## Base de données
20+ tables normalisées avec index de performance :
- `profiles`, `user_roles` — Identité et permissions
- `products`, `product_categories`, `stock_movements` — Inventaire
- `clients`, `orders`, `order_items`, `invoices` — Commercial
- `suppliers` — Approvisionnement
- `deliveries` — Logistique
- `transactions` — Finance
- `employees`, `attendances`, `payslips` — RH
- `todos`, `notifications`, `activity_logs` — Système
