# Fonctionnalités manquantes ou incomplètes

## CRITIQUE — Non implémenté

### 1. Page Admin RBAC (Gestion des comptes)
**Statut** : Non fait
**Description** : Page admin dédiée pour voir tous les comptes, approuver les nouveaux, assigner des rôles, supprimer des comptes.
**Exigence** : Les nouveaux comptes doivent être en attente jusqu'à validation admin. Suppression = disparition totale de tous les modules.
**Étapes** :
1. Créer migration : ajouter colonne `status` ('pending'/'approved'/'rejected') à `profiles` ou créer table `account_requests`
2. Créer page `/admin/users` avec DataTable listant tous les comptes
3. Ajouter dropdown rôle + bouton approuver/rejeter
4. Implémenter suppression cascade (supprimer user_roles, todos, notifications, activity_logs liés)
5. Modifier `ProtectedRoute` pour bloquer les comptes `pending`
6. Ajouter dans sidebar (admin uniquement)

### 2. Export PDF individuel par facture
**Statut** : Non fait
**Description** : Bouton sur chaque ligne de facture pour exporter en PDF brandé (logo AgroConnect, layout professionnel).
**Étapes** :
1. Installer `jspdf` + `jspdf-autotable`
2. Créer fonction `generateInvoicePDF(invoice, client, items)` dans `exportUtils.ts`
3. Ajouter bouton icône PDF sur chaque ligne du DataTable Factures
4. Inclure : logo, numéro facture, client, lignes produits, totaux, date

### 3. Export PDF/CSV conditionnel (sélection par checkboxes)
**Statut** : Partiellement fait (ExportButtons existe, mais pas de sélection par ligne)
**Description** : Cases à cocher sur chaque ligne des tableaux. Export uniquement des lignes sélectionnées.
**Étapes** :
1. Modifier `DataTable.tsx` : ajouter colonne checkbox avec état sélection
2. Passer les lignes sélectionnées à `ExportButtons`
3. Appliquer à : Inventaire, Catalogue, Clients, Commandes, Factures, Livraisons, Présences, Transactions

### 4. Exports globaux manquants
**Statut** : Incomplet — Export intégré uniquement dans Logs système
**Description** : Chaque module doit avoir ses boutons Export PDF/CSV.
**Modules manquants** : Commandes, Factures, Inventaire, Livraisons, Présences, Transactions, Employés, Catalogue, Clients, Fournisseurs
**Étapes** : Ajouter `<ExportButtons>` dans chaque page module avec les données filtrées

### 5. Calendrier global interactif sur dashboards
**Statut** : Non fait
**Description** : Cliquer sur les KPIs du dashboard ouvre un calendrier (DatePicker) pour filtrer par jour/mois/année. Voir les données historiques.
**Étapes** :
1. Ajouter composant `DashboardDateFilter` avec Popover + Calendar
2. Stocker la période sélectionnée dans un state
3. Filtrer toutes les queries du dashboard par cette période
4. Appliquer à tous les 6 dashboards

### 6. Lignes de tableaux cliquables (pages détail)
**Statut** : Partiellement fait (employés uniquement)
**Description** : Toutes les lignes de tous les DataTable doivent être cliquables → page détail dynamique.
**Modules manquants** : Commandes, Clients, Factures, Produits, Livraisons, Fournisseurs, Transactions
**Étapes** :
1. Créer pages détail pour chaque entité (`/commandes/:id`, `/clients/:id`, etc.)
2. Ajouter `onClick` row dans DataTable avec `useNavigate`
3. Ajouter routes dans `App.tsx`

### 7. Filtres avancés sur Livraisons
**Statut** : Incomplet
**Description** : Tri par jour de livraison, destination. Boutons "Livrée"/"Échec" causent des erreurs.
**Étapes** :
1. Ajouter filtres Select pour destination et date
2. Déboguer les mutations de statut (vérifier payload envoyé à Supabase)
3. Tester avec données réelles

### 8. Reporting automatisé
**Statut** : Incomplet
**Description** : Une commande livrée doit automatiquement créer une transaction "recette". La paie doit créer des transactions "dépense".
**Étapes** :
1. Créer trigger DB ou logique frontend : quand `orders.status` → 'livree', insérer dans `transactions` (type='recette')
2. Quand `payslips.paid` → true, insérer dans `transactions` (type='depense', category='Salaires')
3. Cohérence mathématique dans le reporting

### 9. Données de test massives (seeding 12 mois)
**Statut** : Non fait
**Description** : 12 mois de données réalistes : transactions, commandes, factures, stock, présences, paie.
**Étapes** :
1. Créer Edge Function `seed-data` ou script d'insertion
2. Générer ~500+ lignes cohérentes avec foreign keys valides
3. Couvrir avril 2025 → mars 2026

### 10. Catégorie "Autres" extensible
**Statut** : Non fait
**Description** : Quand on choisit "Autres" dans un formulaire (produit, transaction), un champ texte apparaît pour créer une nouvelle catégorie.
**Étapes** :
1. Modifier les Select de catégorie : si valeur = "Autres", afficher Input texte
2. Sauvegarder la nouvelle catégorie dans `product_categories` ou en constante
3. Appliquer à : Catalogue, Inventaire, Transactions

## IMPORTANT — Incomplet

### 11. Visite guidée améliorée
**Statut** : Basique (react-joyride standard)
**Description** : Doit être plus interactive, avec pointeur animé type présentation PowerPoint.
**Étapes** : Personnaliser les tooltips Joyride avec animations Framer Motion, ajouter un pointeur SVG animé

### 12. Images dynamiques employés
**Statut** : Incomplet — champ `avatar_url` existe mais pas de bucket Storage, pas d'upload
**Description** : Chaque employé doit avoir sa photo (petit cercle avant le nom).
**Étapes** :
1. Créer bucket Storage `avatars` (public)
2. Ajouter input file dans le formulaire employé
3. Upload vers Storage, sauvegarder URL dans `avatar_url`
4. Afficher Avatar dans le DataTable

### 13. Masse salariale filtrable par service + calendrier
**Statut** : Partiellement fait
**Description** : Clic sur stat masse salariale → calendrier pour choisir le mois. Filtre par service.
**Étapes** :
1. Ajouter Popover + Calendar sur le KPI masse salariale
2. Ajouter Select filtre par département
3. Recalculer la somme filtrée

### 14. Présences — bouton Mission
**Statut** : Possiblement buggé
**Description** : Le bouton Mission doit fonctionner comme le bouton Congé (modale avec dates + motif).
**Étapes** : Vérifier que le Dialog s'ouvre bien pour status='mission', tester la soumission

### 15. Bouton i18n — traduction complète
**Statut** : Partiellement fait (300+ clés mais certains modules peuvent avoir des textes hardcodés)
**Description** : TOUS les textes doivent être traduits, y compris dans les formulaires, tooltips, messages d'erreur.
**Étapes** : Audit complet de chaque composant, remplacer tout string hardcodé par `t('clé')`

### 16. Icônes UI à la place des emojis
**Statut** : Fait sur page Information, mais potentiellement des emojis restants ailleurs
**Description** : Aucun emoji dans l'app, uniquement des icônes Lucide React.
**Étapes** : Rechercher tous les emojis dans le code source, remplacer par des icônes Lucide

### 17. Foreign Keys manquantes
**Statut** : Partiellement fait — Les FK ont été droppées pour éviter les erreurs
**Description** : Les relations entre tables (orders→clients, invoices→clients, etc.) n'ont plus de FK constraints actives.
**Étapes** : Recréer les FK avec `ON DELETE SET NULL` ou `ON DELETE CASCADE` selon la logique métier

## OPTIONNEL — Suggestions

### 18. PWA / Mode offline
**Description** : Service worker pour utilisation hors-ligne partielle

### 19. Notifications push
**Description** : Web Push API pour alertes temps réel même app fermée

### 20. Audit trail complet
**Description** : Triggers DB pour logger automatiquement toutes les modifications (pas seulement côté frontend)
