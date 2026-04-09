export const APP_NAME = "AgroConnect";
export const COMPANY_NAME = "AgroConnect SARL";
export const CURRENCY = "FCFA";

export const ROLES = {
  ADMIN: "admin",
  COMMERCIAL: "commercial",
  LOGISTIQUE: "logistique",
  FINANCIER: "financier",
  RH: "rh",
  LIVREUR: "livreur",
  TECHADMIN: "techadmin",
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  commercial: "Commercial",
  logistique: "Logistique",
  financier: "Financier",
  rh: "Ressources Humaines",
  livreur: "Livreur",
  techadmin: "Tech Admin",
};

export const ORDER_STATUS = {
  EN_ATTENTE: "en_attente",
  CONFIRMEE: "confirmee",
  EN_PREPARATION: "en_preparation",
  LIVREE: "livree",
  ANNULEE: "annulee",
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  en_preparation: "En préparation",
  livree: "Livrée",
  annulee: "Annulée",
};

export const INVOICE_STATUS = {
  PAYE: "paye",
  IMPAYE: "impaye",
  PARTIEL: "partiel",
} as const;

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  paye: "Payée",
  impaye: "Impayée",
  partiel: "Partielle",
};

export const STOCK_MOVEMENT_TYPES = {
  ENTREE: "entree",
  SORTIE: "sortie",
} as const;

export const DELIVERY_STATUS = {
  EN_ATTENTE: "en_attente",
  EN_COURS: "en_cours",
  LIVREE: "livree",
  ECHOUEE: "echouee",
} as const;

export const DELIVERY_STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  en_cours: "En cours",
  livree: "Livrée",
  echouee: "Échouée",
};

export const TRANSACTION_TYPES = {
  RECETTE: "recette",
  DEPENSE: "depense",
} as const;

export const CLIENT_TYPES = {
  PRO: "pro",
  PARTICULIER: "particulier",
} as const;

export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
  CONGE: "conge",
  MISSION: "mission",
} as const;

export const PRODUCT_CATEGORIES = [
  "Céréales",
  "Huiles",
  "Conserves",
  "Boissons",
  "Produits laitiers",
  "Sucre & Confiserie",
  "Épices & Condiments",
  "Farines",
  "Riz & Pâtes",
  "Autres",
] as const;

export const PRODUCT_UNITS = [
  "kg",
  "L",
  "unité",
  "carton",
  "sac",
  "bidon",
  "paquet",
  "bouteille",
] as const;

export const TRANSACTION_CATEGORIES = [
  "Ventes",
  "Achats fournisseurs",
  "Salaires",
  "Loyer",
  "Transport",
  "Électricité",
  "Eau",
  "Téléphone",
  "Maintenance",
  "Taxes",
  "Autres",
] as const;

export const CNPS_RATE = 0.028;
