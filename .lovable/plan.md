

# ERP AgroConnect — Phase 1 : Fondation

## 1. Configuration & Assets
- Copier les logos SVG (normal + blanc) dans `src/assets/`
- Configurer la palette de couleurs dans `index.css` : Bleu primaire `#0D47A1`, Vert succès `#1B6B3A`, Rouge alerte `#C62828`, Gris neutre `#F5F5F5`
- Créer `src/lib/constants.ts` avec les enums de rôles, statuts de commande, catégories produits, etc.

## 2. Base de Données Supabase (Lovable Cloud)
- Activer Supabase via Lovable Cloud
- Créer les tables principales : `profiles`, `user_roles`, `products`, `clients`, `orders`, `order_items`, `invoices`, `suppliers`, `stock_movements`, `deliveries`, `transactions`, `employees`, `attendances`, `payslips`
- Configurer les rôles (`admin`, `commercial`, `logistique`, `financier`, `rh`, `livreur`) via une table `user_roles` avec enum `app_role`
- Implémenter les politiques RLS : données financières/RH restreintes aux rôles autorisés
- Fonction `has_role()` en `SECURITY DEFINER` pour éviter la récursion RLS

## 3. Authentification
- Page de connexion en français avec logo AgroConnect, email + mot de passe
- Connexion via Supabase Auth
- Redirection post-login vers le dashboard selon le rôle
- Gestion mot de passe oublié
- Protection des routes (redirect si non connecté)

## 4. Navigation — Sidebar
- Sidebar fixe à gauche avec les sections : Tableau de bord, Ventes (M1), Stocks & Logistique (M2), Finance (M3), Ressources Humaines (M4), Paramètres
- Icônes Lucide React pour chaque section
- Menu adaptatif selon le rôle utilisateur (ex: livreur ne voit que Livraisons)
- Sidebar collapsible avec trigger toujours visible
- Logo AgroConnect en haut de la sidebar

## 5. Dashboard Global (Vue Admin)
- **6 KPI Cards** en haut : CA du mois, Commandes du jour, Solde trésorerie, Produits en rupture, Livraisons du jour, Employés présents
- **3 Graphiques Recharts** : Évolution CA 6 mois (ligne), Commandes par semaine (barres), Répartition dépenses (camembert)
- **Section Alertes** : Stocks bas, Factures impayées >7j, Livraisons en retard, Congés en attente
- Données mockées initialement (les tables seront vides), avec la structure prête pour les données réelles

## 6. Pages placeholder pour les modules
- Pages vides avec titre pour chaque sous-section (Catalogue, Clients, Commandes, Factures, Inventaire, Fournisseurs, Livraisons, Transactions, Reporting, Employés, Présences, Paie)
- Routing complet configuré

## Interface
- 100% en français
- Design professionnel et épuré
- Composants Shadcn/UI exclusivement
- Devise : FCFA

