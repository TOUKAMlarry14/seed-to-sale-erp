# AgroConnect ERP

> Progiciel de gestion intégré (ERP) pour **AgroConnect SARL**, entreprise agroalimentaire basée à Douala, Cameroun.
> Une seule plateforme bilingue (FR/EN) pour piloter le commercial, la logistique, la finance, les ressources humaines et la direction.

---

## Sommaire
1. [Contexte et objectifs](#contexte-et-objectifs)
2. [Fonctionnalités par module](#fonctionnalités-par-module)
3. [Rôles et contrôle d'accès (RBAC)](#rôles-et-contrôle-daccès-rbac)
4. [Stack technique](#stack-technique)
5. [Architecture du projet](#architecture-du-projet)
6. [Base de données et sécurité](#base-de-données-et-sécurité)
7. [Fonctions serveur (Edge Functions)](#fonctions-serveur-edge-functions)
8. [Internationalisation](#internationalisation)
9. [Conventions métier](#conventions-métier)
10. [Installation et démarrage](#installation-et-démarrage)
11. [Comptes de démonstration](#comptes-de-démonstration)
12. [Tests et qualité](#tests-et-qualité)
13. [Documentation complémentaire](#documentation-complémentaire)

---

## Contexte et objectifs

**Problème** : les équipes travaillaient avec des outils dispersés (Excel, papier, WhatsApp), sources d'erreurs, de doublons et de manque de visibilité.

**Solution** : un ERP web temps réel où chaque service dispose de ses outils et où la direction suit l'activité via des indicateurs consolidés.

**Objectifs clés**
- Centraliser clients, produits, stocks, commandes, factures, livraisons et paie.
- Donner à chaque rôle un tableau de bord adapté.
- Garantir la traçabilité (journal d'activité) et la sécurité des données (RLS par rôle).
- Fonctionner dans le contexte local : FCFA, Mobile Money, cotisations CNPS, dates `JJ-MM-AAAA`.

---

## Fonctionnalités par module

| Domaine | Module | Points clés |
|---|---|---|
| Pilotage | **Dashboard** | Tableau de bord spécifique par rôle (Admin, Commercial, Financier, Logistique, RH, Livreur), filtres jour/mois/année, KPIs réels, graphiques Recharts |
| | **Reporting** | CA, dépenses, marges, exports PDF/CSV |
| | **Management** | Attribution de tâches aux chefs de service, statuts, notifications, filtres |
| Commercial | **Clients** | Segmentation, coordonnées, historique |
| | **Catalogue** | Produits, catégories dynamiques (option « Autre »), multi-sélection, suppression confirmée |
| | **Commandes** | Cycle de vie complet, statuts, adresse de livraison |
| | **Factures** | Génération, suivi des paiements, export PDF individuel |
| Logistique | **Inventaire** | Mouvements de stock, alertes seuil bas |
| | **Fournisseurs** | Fiches fournisseurs, contacts |
| | **Livraisons** | Assignation des livreurs, suivi des statuts |
| Finance | **Transactions** | Recettes / dépenses, modes de paiement locaux |
| RH | **Employés** | Fiches détaillées, avatars, statut actif/suspendu, primes avec date d'expiration |
| | **Présences** | Pointage, filtres par période, exports |
| | **Paie** | Bulletins, primes, retenues, cotisation CNPS |
| Système | **Gestion des comptes** | Validation des comptes, attribution des rôles (admin) |
| | **Logs système** | Journal d'audit temps réel |
| | **Paramètres / Information** | Thème clair/sombre, langue, informations entreprise |
| Transverse | **Assistant IA** | Chatbot contextuel bilingue |
| | **Notifications / To-Do** | Alertes en temps réel, liste de tâches personnelle |
| | **Pages légales** | Mentions légales, politique de confidentialité, bandeau cookies |

---

## Rôles et contrôle d'accès (RBAC)

| Rôle | Périmètre principal |
|---|---|
| `admin` | Accès total, gestion des comptes, management |
| `techadmin` | Administration technique, logs, paramètres |
| `commercial` | Clients, catalogue, commandes, factures |
| `logistique` | Inventaire, fournisseurs, livraisons |
| `financier` | Transactions, factures, reporting |
| `rh` | Employés, présences, paie |
| `livreur` | Ses livraisons assignées |

- Les rôles sont stockés dans une table dédiée `user_roles` (jamais dans le profil modifiable).
- Côté interface : `RoleRoute` (routes) et `useHasRole` / `RoleGuard` (composants).
- Côté base : fonctions `has_role` / `has_any_role` utilisées dans les politiques RLS.
- Nouveau compte : inscription → validation par un administrateur → attribution du rôle.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 18, Vite 5, TypeScript 5 |
| UI | Tailwind CSS 3, Shadcn/UI, Lucide React (aucun emoji dans l'UI) |
| Graphiques | Recharts |
| Animations | Framer Motion |
| Données | TanStack React Query |
| Backend | Lovable Cloud (PostgreSQL, Auth, RLS, Storage, Edge Functions) |
| IA | Lovable AI Gateway via Edge Function |
| i18n | Contexte React maison (FR/EN) |
| Tests | Vitest, Playwright |

---

## Architecture du projet

```text
src/
├── assets/               Logos, visuels de connexion
├── components/
│   ├── ui/               Composants Shadcn
│   ├── dashboards/       Un dashboard par rôle
│   ├── AppLayout.tsx     Layout principal + footer légal
│   ├── AppSidebar.tsx    Navigation filtrée par rôle
│   ├── DataTable.tsx     Tableau générique (tri, pagination, sélection)
│   ├── DateRangeFilter.tsx, ExportButtons.tsx, ConfirmDialog.tsx
│   ├── RoleRoute.tsx, ProtectedRoute.tsx
│   └── ChatbotFAB.tsx, NotificationsPopover.tsx, CookieBanner.tsx
├── contexts/             I18nContext, ThemeContext
├── hooks/                Un hook de données par entité (useOrders, useProducts...)
├── i18n/                 fr.ts, en.ts
├── lib/                  constants, navigation, exportUtils, utils
├── pages/
│   ├── Login.tsx, ResetPassword.tsx, Legal.tsx, Dashboard.tsx
│   └── modules/          Une page par module métier
└── integrations/supabase Client et types générés (ne pas modifier)

supabase/
├── functions/            admin-users, chat, seed-users, notify-bonus-expiry
└── migrations/           Schéma SQL versionné
```

Principes :
- **Un hook par entité** pour isoler l'accès aux données.
- **Composants réutilisables** (DataTable, ExportButtons, ConfirmDialog) pour limiter la duplication.
- **Tokens de design** centralisés dans `src/index.css` et `tailwind.config.ts`.

---

## Base de données et sécurité

- ~18 tables métier, toutes avec **Row Level Security** activée et des politiques limitées par rôle.
- Lecture produits/catégories réservée aux rôles admin, techadmin, commercial, logistique, financier.
- Anti-usurpation sur l'insertion de notifications et de tâches.
- Bucket `avatars` privé.
- Protection des mots de passe compromis (HIBP) activée.
- Exports CSV protégés contre l'injection de formules.
- Chatbot : vérification du jeton, validation et limitation des messages.
- **Suppression définitive** (pas d'archivage) pour employés, produits et fournisseurs, toujours avec modale de confirmation.
- Journal d'audit des actions sensibles.

---

## Fonctions serveur (Edge Functions)

| Fonction | Rôle |
|---|---|
| `admin-users` | Gestion des comptes et rôles par l'administrateur |
| `chat` | Assistant IA (authentification requise) |
| `seed-users` | Création des comptes de démonstration (mots de passe générés) |
| `notify-bonus-expiry` | Tâche planifiée quotidienne (07:00) : alerte d'expiration des primes, protégée par secret |

---

## Internationalisation

- Dictionnaires : `src/i18n/fr.ts` et `src/i18n/en.ts`.
- Accès via `useI18n()` → `t("cle.sous_cle")`, bascule instantanée sans rechargement ni perte d'état.
- Repli automatique sur le français si une clé manque.
- **Règle** : toute nouvelle chaîne visible doit être ajoutée dans les deux fichiers.

---

## Conventions métier

| Élément | Règle |
|---|---|
| Devise | FCFA, sans décimales, séparateur de milliers |
| Dates | `JJ-MM-AAAA` |
| Paiements | Espèces, Mobile Money (Orange / MTN), virement, chèque |
| RH | Cotisation CNPS appliquée sur la paie, primes avec date d'expiration |
| Icônes | Lucide React uniquement |

---

## Installation et démarrage

**Prérequis** : Node.js 18+ (ou Bun).

```bash
npm install        # ou bun install
npm run dev        # http://localhost:8080
npm run build      # build de production
npm run preview    # prévisualiser le build
npm run lint       # analyse statique
npm run test       # tests unitaires
```

Les variables d'environnement (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`) sont fournies automatiquement par Lovable Cloud dans `.env`.

---

## Comptes de démonstration

Comptes créés par la fonction `seed-users`. Les mots de passe sont générés à l'exécution et ne sont **pas versionnés** pour des raisons de sécurité.

| Rôle | Email |
|---|---|
| Admin | admin@agroconnect.cm |
| TechAdmin | techadmin@agroconnect.cm |
| Chef Commercial | chef.commercial@agroconnect.cm |
| Chef Logistique | chef.logistique@agroconnect.cm |
| Chef Finance | chef.finance@agroconnect.cm |
| Chef RH | chef.rh@agroconnect.cm |
| Commercial | jean.nkomo@agroconnect.cm, sylvie.mbala@agroconnect.cm |
| Logistique | marie.fotso@agroconnect.cm |
| Financier | diane.mbouda@agroconnect.cm |
| Livreur | fabrice.onana@, herve.kamga@, samuel.ekotto@, eric.tchinda@, patrick.nkwelle@agroconnect.cm |
| RH | rose.biya@agroconnect.cm |

---

## Tests et qualité

- Tests unitaires : `src/test/` (Vitest).
- Tests de bout en bout : configuration Playwright (`playwright.config.ts`).
- ESLint et TypeScript strict pour la cohérence du code.

---

## Documentation complémentaire

| Fichier | Contenu |
|---|---|
| `ARCHITECTURE.md` | Détail technique de l'architecture |
| `FEATURES_IMPLEMENTED.md` | Fonctionnalités livrées |
| `FEATURES_MISSING.md` | Fonctionnalités restantes |
| `ROADMAP.md` | Feuille de route |
| `INSTALL.md` | Guide d'installation détaillé |

---

© AgroConnect SARL — Douala, Cameroun. Tous droits réservés.
