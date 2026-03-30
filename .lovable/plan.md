

# AgroConnect ERP — Refonte Majeure (14 Chantiers)

Ce plan couvre l'ensemble des 14 points du cahier des charges. L'implémentation sera séquencée en phases prioritaires.

---

## Phase 1 — Authentification, Splash Screen & Login Refonte

### 1A. Splash Screen (4s animation)
- Nouveau composant `src/components/SplashScreen.tsx` avec animation CSS (logo pulsant/3D rotate + fade)
- Intégré dans `App.tsx` : affiché 4s avant de monter le reste de l'app
- Animation keyframes dans `index.css`

### 1B. Login Split-Screen
- Refonte `src/pages/Login.tsx` : layout `grid grid-cols-2`
- Gauche : formulaire login/register/forgot (existant, recentré)
- Droite : hero image plein cadre (image AI-generated d'un bureau camerounais avec ~9 collaborateurs, stockée dans `src/assets/`)
- Responsive : sur mobile, hero masqué

### 1C. Onboarding Tour (Product Tour)
- Installer `react-joyride` (ou implémentation custom avec Dialog)
- Composant `src/components/OnboardingTour.tsx` : 5-6 étapes guidées (dashboard, sidebar modules, chatbot)
- Déclenché au premier login via flag `localStorage` ou profil Supabase
- Bouton "Relancer la visite" dans Paramètres

---

## Phase 2 — Chatbot IA (FAB Global)

### 2A. Edge Function backend
- `supabase/functions/chat/index.ts` : proxy vers Lovable AI Gateway
- System prompt contextualisé AgroConnect (présentation entreprise + aide ERP)
- Streaming SSE

### 2B. Frontend
- `src/components/ChatbotFAB.tsx` : bouton flottant vert (bas-droite, z-50)
- Icône : Headphones/HeadsetMic blanc
- Au clic : slide-over panel avec interface chat (messages, input, markdown rendering via `react-markdown`)
- Intégré dans `AppLayout.tsx` (persistant sur toutes les pages)

---

## Phase 3 — Notifications Bell & Confirmation Modals

### 3A. Notifications Popover
- Modifier `AppLayout.tsx` : remplacer le bouton Bell statique par un Popover Shadcn
- Contenu : liste d'alertes dynamiques (stocks bas, factures impayées >7j, livraisons en retard)
- Chaque alerte cliquable → navigation React Router vers la page concernée
- Suppression d'alerte au clic (state local ou table `notifications`)

### 3B. Confirmation Modals
- Composant `src/components/ConfirmDialog.tsx` (AlertDialog Shadcn)
- Wrapper toutes les actions destructives : suppression, annulation commande, archivage
- Appliqué à : Employés, Commandes, Catalogue, Fournisseurs, Inventaire, Factures

---

## Phase 4 — i18n & Dark/Light Mode

### 4A. Dark Mode
- Déjà préparé dans `index.css` (`.dark` existe)
- `src/contexts/ThemeContext.tsx` : ThemeProvider avec toggle `dark` class sur `<html>`
- Toggle dans le header (AppLayout) et dans Paramètres

### 4B. i18n (FR/EN)
- `src/contexts/I18nContext.tsx` avec dictionnaire FR/EN
- Fichiers `src/i18n/fr.ts` et `src/i18n/en.ts` couvrant labels, boutons, messages
- Hook `useTranslation()` retournant `t(key)`
- Toggle langue dans header et Paramètres

---

## Phase 5 — Module Présences (Corrections)

### 5A. Modales Mission/Congé
- Clic sur "Mission" ou "Congé" → ouvre Dialog avec DatePicker (début/fin) + champ motif
- Migration DB : ajouter colonnes `start_date`, `end_date`, `reason` à `attendances`

### 5B. Toggle annulation
- Second clic sur statut actif → supprime l'entrée attendance (rollback)
- Bouton revient à état neutre

### 5C. Filtres par service + Export
- Ajout filtre multicritères par département
- Bouton "Imprimer Fiche" : génère PDF/CSV structuré (Présents, Absents, Congés, Missions) groupé par service

---

## Phase 6 — Module Employés (Refonte)

### 6A. Hard Delete
- Remplacer "Archiver" par "Supprimer" avec ConfirmDialog
- Suppression définitive en DB

### 6B. Formulaire enrichi
- Ajouter champ Email (obligatoire à la création)
- Ajouter input file pour photo/avatar (Supabase Storage bucket `avatars`)
- Migration DB : ajouter `email` text et `avatar_url` text à `employees`

### 6C. Bonus salariaux
- Migration DB : ajouter `bonus_amount` numeric et `bonus_reason` text à `employees` (ou table séparée)
- UI : icône "+" badge jaune à côté du salaire, Tooltip au survol
- Intégré dans calcul paie

### 6D. Export PDF/CSV + filtre service
- Barre filtre par département
- Bouton export avec filtres actifs

---

## Phase 7 — Reporting Financier (Enrichissement)

- Ajouter KPIs : flux trésorerie, historique paies, dates versement
- Bouton export global PDF/CSV en haut à droite
- Graphiques avancés supplémentaires (Recharts)

---

## Phase 8 — Transactions, Livraisons, Fournisseurs

### 8A. Transactions éditables
- Ajouter action "Modifier" avec Dialog de mise à jour
- Hook `useUpdateTransaction`

### 8B. Livraisons (Bug Fix)
- Déboguer le formulaire de validation (inspecter payload et foreign keys)
- S'assurer que `driver_id` est un `user_id` valide ou un `employee_id`

### 8C. Fournisseurs enrichi
- Filtre par ville/adresse
- Action suppression (Hard Delete avec ConfirmDialog)

---

## Phase 9 — Inventaire & Catalogue

### 9A. Inventaire
- Suppression de produit (via `is_active = false` ou hard delete)
- Filtres par catégorie

### 9B. Catalogue
- Bouton suppression par ligne
- Fonctionnalité "Ajouter une catégorie" (stockée dans une table ou constantes dynamiques)

### 9C. Export ciblé (Inventaire, Catalogue, Clients)
- Ajouter checkboxes au DataTable (modification du composant `DataTable.tsx`)
- Export PDF/CSV : soit toute la liste filtrée, soit les lignes sélectionnées

---

## Phase 10 — Facturation

### 10A. Générateur de facture
- Bouton "Générer Facture" → formulaire détaillé
- À la soumission : génération PDF brandé (logo AgroConnect, layout standard)
- Téléchargement automatique

### 10B. Bug Fix commande "Préparer"
- Déboguer l'erreur de soumission lors du passage confirme → en_preparation

### 10C. CRUD factures
- Actions : modifier, supprimer, réimprimer dans le DataTable

---

## Phase 11 — Page Information (Landing interne)

- Nouvelle route `/information`
- Page de présentation AgroConnect : histoire, mission, fonctionnement
- UI : animations scroll (CSS animations ou framer-motion si installé), Bento Grid, Cards interactives
- Ajout dans la navigation sidebar

---

## Phase 12 — Page Paramètres (Refonte complète)

- Tabs Shadcn : Profil & Sécurité, Préférences, Notifications, Support
- **Profil** : modification mot de passe, infos personnelles
- **Préférences** : toggles Dark Mode + Langue
- **Notifications** : activer/désactiver alertes par type
- **Support** : FAQ (Accordions), bouton relancer Product Tour, contact support

---

## Phase 13 — Vue détaillée employé + TechAdmin

### 13A. Profil employé
- Route `/employes/:id`
- Dashboard individuel : infos, KPIs (taux présence, congés, historique salaires)
- Bouton "Imprimer le dossier" → PDF A4 avec logo

### 13B. Rôle TechAdmin
- Ajouter `techadmin` à l'enum `app_role`
- Créer compte `techadmin@agroconnect.cm` / `AdminTech2026!`
- Migration DB : table `activity_logs` (user_id, action, entity_type, entity_id, details, created_at)

### 13C. Module Logs Système
- Route `/logs` (visible uniquement pour techadmin)
- DataTable avec filtres date/type action/utilisateur
- Export PDF/CSV par employé

---

## Phase 14 — Seeding massif (1 an de données)

- Script d'insertion massive via l'outil insert Supabase
- 12 mois de transactions, commandes, factures, mouvements stock, présences, fiches de paie
- Données cohérentes (foreign keys valides, pas de null sur colonnes requises)
- ~500+ lignes de données réalistes camerounaises
- Création des 30 comptes utilisateurs si pas encore fait

---

## Migrations DB nécessaires

1. `employees` : ajouter `email` text, `avatar_url` text, `bonus_amount` numeric default 0, `bonus_reason` text
2. `attendances` : ajouter `start_date` date, `end_date` date, `reason` text
3. `activity_logs` : nouvelle table (id, user_id, action text, entity_type text, entity_id uuid, details jsonb, created_at)
4. `app_role` enum : ajouter valeur `techadmin`
5. Storage bucket `avatars` (public)

## Ordre d'implémentation recommandé

1. Migrations DB + Splash/Login (Phases 1, 6B migrations)
2. Dark Mode + i18n (Phase 4)
3. Chatbot IA (Phase 2)
4. Notifications + Confirm Dialogs (Phase 3)
5. Modules métier corrections (Phases 5-10)
6. Paramètres + Information (Phases 11-12)
7. TechAdmin + Logs (Phase 13)
8. Seeding massif (Phase 14)
9. Onboarding Tour (Phase 1C — après tout le reste)

