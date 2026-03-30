import {
  LayoutDashboard, ShoppingCart, Package, Users, FileText, Warehouse,
  Truck, DollarSign, BarChart3, UserCog, CalendarCheck, Receipt,
  Settings, Building2, Info, ScrollText,
  type LucideIcon,
} from "lucide-react";
import type { AppRole } from "@/lib/constants";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  roles?: AppRole[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    label: "Général",
    items: [
      { title: "Tableau de bord", url: "/", icon: LayoutDashboard },
      { title: "Information", url: "/information", icon: Info },
    ],
  },
  {
    label: "Ventes (M1)",
    items: [
      { title: "Catalogue", url: "/catalogue", icon: Package, roles: ["admin", "commercial", "techadmin"] },
      { title: "Clients", url: "/clients", icon: Users, roles: ["admin", "commercial", "techadmin"] },
      { title: "Commandes", url: "/commandes", icon: ShoppingCart, roles: ["admin", "commercial", "techadmin"] },
      { title: "Factures", url: "/factures", icon: FileText, roles: ["admin", "commercial", "financier", "techadmin"] },
    ],
  },
  {
    label: "Stocks & Logistique (M2)",
    items: [
      { title: "Inventaire", url: "/inventaire", icon: Warehouse, roles: ["admin", "logistique", "techadmin"] },
      { title: "Fournisseurs", url: "/fournisseurs", icon: Building2, roles: ["admin", "logistique", "techadmin"] },
      { title: "Livraisons", url: "/livraisons", icon: Truck, roles: ["admin", "logistique", "livreur", "techadmin"] },
    ],
  },
  {
    label: "Finance (M3)",
    items: [
      { title: "Transactions", url: "/transactions", icon: DollarSign, roles: ["admin", "financier", "techadmin"] },
      { title: "Reporting", url: "/reporting", icon: BarChart3, roles: ["admin", "financier", "techadmin"] },
    ],
  },
  {
    label: "Ressources Humaines (M4)",
    items: [
      { title: "Employés", url: "/employes", icon: UserCog, roles: ["admin", "rh", "techadmin"] },
      { title: "Présences", url: "/presences", icon: CalendarCheck, roles: ["admin", "rh", "techadmin"] },
      { title: "Paie", url: "/paie", icon: Receipt, roles: ["admin", "rh", "techadmin"] },
    ],
  },
  {
    label: "Système",
    items: [
      { title: "Paramètres", url: "/parametres", icon: Settings, roles: ["admin", "techadmin"] },
      { title: "Logs Système", url: "/logs", icon: ScrollText, roles: ["techadmin"] },
    ],
  },
];

export function getFilteredNavigation(userRoles: AppRole[]): NavSection[] {
  if (userRoles.includes("admin") || userRoles.includes("techadmin" as AppRole)) return navigation;

  return navigation
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.roles || item.roles.some((r) => userRoles.includes(r))
      ),
    }))
    .filter((section) => section.items.length > 0);
}
