# AgroConnect ERP

## Objectif
AgroConnect ERP est un système de gestion intégré (ERP) conçu pour **AgroConnect SARL**, une entreprise agroalimentaire basée à Douala, Cameroun. Il centralise la gestion commerciale, logistique, financière, RH et opérationnelle.

## Problème résolu
Remplacer les outils disparates (Excel, papier, WhatsApp) par une plateforme unifiée et temps réel permettant à chaque service de l'entreprise de collaborer efficacement.

## Stack technique
| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + Vite 5 + TypeScript 5 |
| UI | Tailwind CSS 3 + Shadcn/UI + Lucide React |
| Graphiques | Recharts |
| Animations | Framer Motion |
| State | TanStack React Query |
| Auth & DB | Supabase (PostgreSQL, Auth, RLS, Edge Functions) |
| i18n | Contexte React custom (FR/EN) |
| Chatbot IA | Edge Function → Lovable AI Gateway (Gemini) |

## Fonctionnement global
1. **Authentification** : Login/Register avec vérification email, RBAC (admin, commercial, logistique, financier, rh, livreur, techadmin)
2. **Dashboard adaptatif** : Chaque rôle voit un tableau de bord spécialisé
3. **Modules métier** : Catalogue, Commandes, Clients, Factures, Inventaire, Fournisseurs, Livraisons, Transactions, Reporting, Employés, Présences, Paie
4. **Modules système** : Logs temps réel, Paramètres, Information, To-Do
5. **Chatbot IA** : Assistant contextuel AgroConnect (FR/EN)

## Devise
Tous les montants sont en **FCFA** (Franc CFA).

## Comptes de test
| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@agroconnect.cm | Admin2026! |
| TechAdmin | techadmin@agroconnect.cm | AdminTech2026! |
| Commercial (chef) | chef.commercial@agroconnect.cm | Chef2026! |
| Logistique (chef) | chef.logistique@agroconnect.cm | Chef2026! |
| Finance (chef) | chef.finance@agroconnect.cm | Chef2026! |
| RH (chef) | chef.rh@agroconnect.cm | Chef2026! |
| Commercial | jean.nkomo@agroconnect.cm | Employe2026! |
| Commercial | sylvie.mbala@agroconnect.cm | Employe2026! |
| Logistique | marie.fotso@agroconnect.cm | Employe2026! |
| Financier | diane.mbouda@agroconnect.cm | Employe2026! |
| Livreur | fabrice.onana@agroconnect.cm | Employe2026! |
| Livreur | herve.kamga@agroconnect.cm | Employe2026! |
| Livreur | samuel.ekotto@agroconnect.cm | Employe2026! |
| Livreur | eric.tchinda@agroconnect.cm | Employe2026! |
| Livreur | patrick.nkwelle@agroconnect.cm | Employe2026! |
| RH | rose.biya@agroconnect.cm | Employe2026! |

## Démarrage rapide
```bash
npm install
npm run dev
```
L'app démarre sur `http://localhost:8080`.
