

# AgroConnect ERP — Implémentation Complète des 4 Modules

Ce plan couvre l'implémentation intégrale des 4 modules, les corrections visuelles demandées, la création de 30 comptes utilisateurs, et le pré-remplissage massif de données.

---

## Phase A — Corrections visuelles immédiates

### A1. Sidebar verte (pas bleue)
Modifier `src/index.css` : remplacer les variables `--sidebar-background`, `--sidebar-accent`, `--sidebar-border`, `--sidebar-ring` par des teintes vertes basées sur `#1B6B3A`.

### A2. Logo en cercle
Modifier `src/components/AppSidebar.tsx` : entourer le logo dans un `div` rond (`rounded-full`, `w-10 h-10`, `bg-white/10`, `overflow-hidden`, centré).

---

## Phase B — Dashboards différenciés par rôle

### B1. Dashboard principal (`/`)
Le composant `Dashboard.tsx` devient un routeur conditionnel basé sur `roles` :
- **admin** → `AdminDashboard` (KPIs globaux des 4 modules, graphiques CA/dépenses/commandes, alertes)
- **commercial** → `CommercialDashboard` (commandes du jour, top produits vendus, top clients, factures impayées)
- **logistique** → `LogistiqueDashboard` (stock en alerte, livraisons du jour, entrées de stock récentes, taux livraison)
- **financier** → `FinancierDashboard` (solde trésorerie, CA vs mois précédent, dépenses par catégorie, factures impayées)
- **rh** → `RHDashboard` (employés présents, congés en cours, masse salariale, taux de présence)
- **livreur** → `LivreurDashboard` (ses livraisons du jour uniquement, statut à mettre à jour)

Chaque dashboard est un composant séparé dans `src/components/dashboards/`.

---

## Phase C — Module 1 : Gestion Commerciale

### C1. Catalogue (`src/pages/modules/Catalogue.tsx`)
- Table avec colonnes : nom, catégorie, unité, prix achat/vente, stock, alerte stock min
- Filtres : catégorie, stock disponible, recherche par nom
- Dialog CRUD (ajouter/modifier) avec formulaire validé
- Badge alerte si `stock_qty < stock_min`
- Archivage (champ `is_active` à ajouter via migration)

### C2. Clients (`src/pages/modules/Clients.tsx`)
- Table : nom, type, téléphone, email, solde/crédit
- Recherche par nom/téléphone
- Dialog CRUD fiche client
- Historique commandes dans un drawer/dialog détail
- Types client étendus : Particulier, Revendeur, Restaurateur, Grossiste

### C3. Commandes (`src/pages/modules/Commandes.tsx`)
- Table filtrée par statut/date/client
- Création en étapes : sélection client → ajout produits/quantités → récapitulatif → validation
- Statuts : en_attente → confirme → en_preparation → livre → annule (migration pour ajouter `en_preparation`)
- Calcul auto total, modification/annulation tant que non expédiée
- Lien vers création livraison automatique

### C4. Factures (`src/pages/modules/Factures.tsx`)
- Table filtrée par statut/client/période
- Génération auto à la validation commande
- Enregistrement paiement (montant, mode : cash/Orange Money/MTN MoMo)
- Paiements partiels, mise à jour solde client
- Alerte visuelle factures impayées > 7 jours

---

## Phase D — Module 2 : Stocks & Logistique

### D1. Inventaire (`src/pages/modules/Inventaire.tsx`)
- Vue stock temps réel par produit avec alertes visuelles
- Formulaire entrée de stock (fournisseur, quantité, date, prix achat)
- Sortie de stock manuelle (pertes, dons, consommation)
- Journal mouvements avec filtres date/type/produit

### D2. Fournisseurs (`src/pages/modules/Fournisseurs.tsx`)
- Table CRUD fournisseurs
- Historique achats par fournisseur

### D3. Livraisons (`src/pages/modules/Livraisons.tsx`)
- Table avec statut, livreur, date prévue
- Assignation livreur (filtré par employés rôle livreur)
- Statuts : en_attente → en_cours → livre → echoue
- Vue livreur : uniquement ses livraisons, bouton confirmer livraison

---

## Phase E — Module 3 : Finance

### E1. Transactions (`src/pages/modules/Transactions.tsx`)
- Journal chronologique recettes/dépenses
- Formulaire ajout avec catégorie, montant, mode paiement, note
- Filtres par type/catégorie/période
- Solde trésorerie temps réel en haut

### E2. Reporting (`src/pages/modules/Reporting.tsx`)
- Compte de résultat simplifié (recettes - dépenses par mois/trimestre)
- Graphique CA mensuel avec tendance
- Graphique dépenses par catégorie (camembert)
- Liste factures impayées avec ancienneté

---

## Phase F — Module 4 : RH

### F1. Employés (`src/pages/modules/Employes.tsx`)
- Table CRUD avec recherche/filtres
- Archivage (is_active) sans suppression
- Formulaire complet : nom, poste, département, téléphone, date embauche, salaire brut

### F2. Présences (`src/pages/modules/Presences.tsx`)
- Pointage quotidien : liste employés actifs avec boutons Présent/Absent/Congé/Mission
- Vue calendrier mensuelle par employé
- Statut `mission` à ajouter via migration

### F3. Paie (`src/pages/modules/Paie.tsx`)
- Calcul auto : Net = Brut - CNPS (2.8%) - Impôt sur salaire
- Génération fiche de paie par employé/mois
- Historique fiches par employé
- Masse salariale totale du mois

---

## Phase G — Migrations DB nécessaires

Une migration SQL pour :
1. Ajouter `is_active` boolean à `products` (défaut `true`)
2. Ajouter `notes` text à `clients`
3. Ajouter statut `en_preparation` aux commandes (colonne text, pas d'enum donc OK)
4. Ajouter `payment_mode` text à `invoices` (cash, orange_money, mtn_momo, virement)
5. Ajouter `amount_paid` numeric à `invoices` (défaut 0, pour paiements partiels)
6. Ajouter `department` text à `employees`
7. Étendre `attendances.status` pour supporter `mission`
8. Ajouter `supplier_id` à `stock_movements` (nullable, ref suppliers)
9. Ajouter `delivery_address` text à `orders`

---

## Phase H — Données de démonstration

Insertion massive via l'outil insert :
- **25 produits** réalistes (riz, huile, sucre, farine, etc.) avec stocks variés
- **15 clients** (restaurants, supermarchés, grossistes, particuliers)
- **8 fournisseurs** camerounais réalistes
- **30+ commandes** avec order_items, statuts variés
- **20+ factures** (payées, impayées, partielles)
- **12 employés** liés aux comptes utilisateurs
- **50+ mouvements de stock**
- **30+ transactions** financières (recettes/dépenses)
- **Présences** sur le mois en cours
- **Fiches de paie** pour les 2 derniers mois

---

## Phase I — Comptes utilisateurs (30 comptes)

5 comptes par rôle, créés via l'API Auth + insertion dans `user_roles` :

| Rôle | Emails | Mot de passe |
|------|--------|-------------|
| admin (×5) | admin1@agroconnect.cm ... admin5@agroconnect.cm | Admin@2026 |
| commercial (×5) | commercial1@agroconnect.cm ... | Commercial@2026 |
| logistique (×5) | logistique1@agroconnect.cm ... | Logistique@2026 |
| financier (×5) | financier1@agroconnect.cm ... | Financier@2026 |
| rh (×5) | rh1@agroconnect.cm ... | RH@2026 |
| livreur (×5) | livreur1@agroconnect.cm ... | Livreur@2026 |

---

## Phase J — Hooks & utilitaires partagés

- `src/hooks/useProducts.ts` — CRUD produits avec React Query
- `src/hooks/useClients.ts` — CRUD clients
- `src/hooks/useOrders.ts` — CRUD commandes + order_items
- `src/hooks/useInvoices.ts` — CRUD factures
- `src/hooks/useStock.ts` — mouvements stock
- `src/hooks/useSuppliers.ts` — CRUD fournisseurs
- `src/hooks/useDeliveries.ts` — CRUD livraisons
- `src/hooks/useTransactions.ts` — CRUD transactions
- `src/hooks/useEmployees.ts` — CRUD employés
- `src/hooks/useAttendances.ts` — présences
- `src/hooks/usePayslips.ts` — fiches de paie

Chaque hook utilise `@tanstack/react-query` avec `useQuery` / `useMutation` et toast de feedback.

---

## Détails techniques

- **Composants réutilisables** : `DataTable` (pagination 20 lignes, tri, recherche), `FormDialog`, `ConfirmDialog`, `StatusBadge`
- **Toasts** en français pour chaque action CRUD
- **Spinners** pendant les chargements Supabase
- **Validation formulaires** avec React Hook Form + Zod
- **Ordre d'implémentation** : G (migrations) → J (hooks) → A-B (visuels/dashboards) → C-D-E-F (modules) → H-I (données/comptes)

