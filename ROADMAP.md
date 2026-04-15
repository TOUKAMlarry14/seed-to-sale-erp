# Roadmap d'implémentation — AgroConnect ERP

## Phase 1 — CRITIQUE (Semaine 1-2)

### 1.1 Page Admin RBAC ⚠️
- Créer page `/admin/users`
- Gestion des comptes (approve/reject/delete)
- Assignation de rôles
- Impact : sécurité et gouvernance

### 1.2 Exports globaux PDF/CSV 📄
- Ajouter ExportButtons à TOUS les modules
- Export conditionnel par sélection (checkboxes dans DataTable)
- Export PDF individuel par facture (jspdf)

### 1.3 Fix bugs critiques 🐛
- Boutons Livrée/Échec sur Livraisons
- Bouton Mission sur Présences
- Foreign keys manquantes
- Textes non traduits restants

### 1.4 Seeding données massives 🌱
- Script seed-data (12 mois, 500+ lignes)
- Données cohérentes et réalistes

---

## Phase 2 — IMPORTANT (Semaine 3-4)

### 2.1 Calendrier interactif dashboards 📅
- DatePicker global sur chaque dashboard
- Filtrage historique des KPIs
- Drill-down par période

### 2.2 Pages détail pour toutes les entités 📋
- `/commandes/:id`, `/clients/:id`, `/factures/:id`, etc.
- Lignes cliquables dans tous les DataTable

### 2.3 Reporting automatisé 📊
- Commande livrée → transaction recette auto
- Paie versée → transaction dépense auto
- Cohérence financière complète

### 2.4 Employés — images et storage 🖼️
- Bucket Storage `avatars`
- Upload dans formulaire
- Avatars dans les tableaux

---

## Phase 3 — AMÉLIORATION (Semaine 5-6)

### 3.1 Catégorie "Autres" extensible
- Input dynamique quand "Autres" sélectionné
- Sauvegarde nouvelle catégorie

### 3.2 Filtres avancés
- Livraisons : tri par destination, jour
- Paie : masse salariale par service + calendrier
- Transactions : calendrier global + graphiques enrichis

### 3.3 Visite guidée premium
- Pointeur animé style PowerPoint
- Tooltips avec animations Framer Motion

### 3.4 Audit i18n complet
- Vérifier chaque composant
- Zéro texte hardcodé

---

## Phase 4 — POLISH (Semaine 7-8)

### 4.1 UX premium
- Micro-interactions sur tous les boutons
- Transitions de page fluides
- Loading skeletons partout

### 4.2 Sécurité renforcée
- Recréer toutes les Foreign Keys
- Audit OWASP complet
- Rate limiting sur Edge Functions

### 4.3 Tests
- Tests unitaires hooks
- Tests d'intégration modules
- Tests E2E avec Playwright

### 4.4 Documentation
- Guide utilisateur complet
- Documentation API Edge Functions
- Vidéos tutoriels

---

## Suggestions d'amélioration futures
1. **PWA** — Mode offline avec service worker
2. **Notifications push** — Web Push API
3. **Audit trail DB** — Triggers PostgreSQL automatiques
4. **Multi-tenancy** — Support plusieurs entreprises
5. **API REST publique** — Pour intégrations tierces
6. **Mobile app** — React Native avec même backend
7. **BI avancé** — Tableau de bord exécutif avec prédictions ML
8. **Workflow automation** — Règles métier configurable (ex: commande > 1M FCFA → approbation directeur)
