# Fonctionnalités implémentées

## 1. Authentification & Sécurité
- [x] Login / Register avec email + mot de passe
- [x] Toggle visibilité mot de passe sur les formulaires
- [x] Reset password par email
- [x] RBAC complet (7 rôles : admin, commercial, logistique, financier, rh, livreur, techadmin)
- [x] RLS sur toutes les tables
- [x] Fonctions `has_role()` et `has_any_role()` en SECURITY DEFINER
- [x] Protection des routes côté frontend (`ProtectedRoute`)
- [x] Profils auto-créés via trigger `handle_new_user`
- [x] Edge Function `seed-users` pour création batch des comptes

## 2. Interface & UX
- [x] Splash Screen animé (logo pulsant + fade)
- [x] Login split-screen avec carousel d'images AgroConnect
- [x] Dark/Light mode (toggle dans header + paramètres)
- [x] i18n FR/EN (300+ clés, bascule instantanée via bouton Globe)
- [x] Sidebar responsive avec sections par rôle
- [x] Header avec nom utilisateur, rôle, toggles theme/langue
- [x] Visite guidée onboarding (react-joyride)
- [x] Design system cohérent Shadcn/UI + Tailwind tokens

## 3. Dashboards
- [x] Dashboard Admin : vue globale (CA, commandes, employés, stock)
- [x] Dashboard Commercial : ventes, clients, commandes
- [x] Dashboard Financier : trésorerie, recettes/dépenses
- [x] Dashboard Logistique : livraisons, stock
- [x] Dashboard RH : effectifs, présences, paie
- [x] Dashboard Livreur : livraisons assignées
- [x] Widget To-Do sur chaque dashboard
- [x] Graphiques Recharts (barres, lignes, camemberts)

## 4. Modules métier

### Catalogue & Inventaire
- [x] CRUD produits (ajout, modification)
- [x] Gestion catégories dynamiques (table `product_categories`)
- [x] Mouvements de stock (entrées/sorties)
- [x] Filtres par catégorie
- [x] Alerte stock minimum

### Clients
- [x] CRUD clients (pro/particulier)
- [x] Recherche et filtres

### Commandes
- [x] Création commande avec lignes produits
- [x] Workflow de statuts (en_attente → confirmée → en_préparation → livrée / annulée)
- [x] Lien avec clients et produits

### Factures
- [x] CRUD factures
- [x] Statuts (payée, impayée, partielle)
- [x] Lien avec commandes et clients

### Fournisseurs
- [x] CRUD fournisseurs
- [x] Filtres et recherche

### Livraisons
- [x] CRUD livraisons avec champ destination
- [x] Assignation de livreur (référence employees)
- [x] Statuts (en_attente, en_cours, livrée, échouée)
- [x] Lien avec commandes

### Transactions
- [x] CRUD transactions (recettes/dépenses)
- [x] Catégorisation
- [x] Graphiques et statistiques

### Employés
- [x] CRUD employés avec photo, email, téléphone
- [x] Statut actif/suspendu
- [x] Bonus et réductions salariales avec motif
- [x] Date d'embauche et de renvoi
- [x] Filtres par département/service
- [x] Page détail employé (`/employes/:id`)

### Présences
- [x] Pointage quotidien (présent, absent, congé, mission)
- [x] Modale congé/mission avec dates et motif
- [x] Filtres par mois/année

### Paie
- [x] Génération fiches de paie
- [x] Calcul brut → net (CNPS 2.8%)
- [x] Statut payé/non payé

### Reporting
- [x] KPIs financiers (CA, dépenses, bénéfice)
- [x] Graphiques recettes/dépenses
- [x] Vue par période

## 5. Système

### Chatbot IA
- [x] Edge Function `chat` → Lovable AI Gateway (Gemini)
- [x] System prompt RAG contextuel AgroConnect
- [x] Réponse multilingue FR/EN
- [x] Interface slide-over avec markdown rendering
- [x] Bouton flottant repositionné

### Logs système
- [x] Table `activity_logs` avec RLS
- [x] Logging des actions utilisateur
- [x] Filtres par utilisateur/action
- [x] Realtime activé sur la table
- [x] Export PDF/CSV

### Notifications
- [x] Table `notifications` avec RLS par utilisateur
- [x] Popover Bell dans le header
- [x] Mark as read

### Paramètres
- [x] Tabs (Profil, Préférences, Notifications, Support)
- [x] Toggle Dark Mode + Langue
- [x] Relancer visite guidée
- [x] Modification profil

### To-Do
- [x] CRUD tâches avec priorité et deadline
- [x] Assignation à utilisateur
- [x] Widget dashboard

## 6. Exports
- [x] Composant `ExportButtons` réutilisable
- [x] Export CSV générique
- [x] Export PDF générique
- [x] Intégré dans Logs système

## 7. Base de données
- [x] 18 tables normalisées
- [x] 20+ index de performance
- [x] Triggers `update_updated_at_column`
- [x] Trigger `handle_new_user` pour profils
- [x] Enum `app_role` avec 7 valeurs
- [x] Realtime activé sur `activity_logs`
