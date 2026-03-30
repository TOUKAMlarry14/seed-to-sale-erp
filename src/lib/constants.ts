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
  CONFIRME: "confirme",
  EN_PREPARATION: "en_preparation",
  LIVRE: "livre",
  ANNULE: "annule",
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  confirme: "Confirmé",
  en_preparation: "En préparation",
  livre: "Livré",
  annule: "Annulé",
};

export const INVOICE_STATUS = {
  PAYE: "paye",
  IMPAYE: "impaye",
  PARTIEL: "partiel",
} as const;

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  paye: "Payé",
  impaye: "Impayé",
  partiel: "Partiel",
};

export const STOCK_MOVEMENT_TYPES = {
  ENTREE: "entree",
  SORTIE: "sortie",
} as const;

export const DELIVERY_STATUS = {
  EN_ATTENTE: "en_attente",
  EN_COURS: "en_cours",
  LIVRE: "livre",
  ECHOUE: "echoue",
} as const;

export const DELIVERY_STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  en_cours: "En cours",
  livre: "Livré",
  echoue: "Échoué",
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

// CNPS rate in Cameroon
export const CNPS_RATE = 0.028;
