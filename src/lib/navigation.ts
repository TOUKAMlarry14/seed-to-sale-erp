import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
  Warehouse,
  Truck,
  DollarSign,
  BarChart3,
  UserCog,
  CalendarCheck,
  Receipt,
  Settings,
  Building2,
  type LucideIcon,
} from "lucide-react";
import type { AppRole } from "@/lib/constants";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  roles?: AppRole[]; // undefined = all roles
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
    ],
  },
  {
    label: "Ventes (M1)",
    items: [
      { title: "Catalogue", url: "/catalogue", icon: Package, roles: ["admin", "commercial"] },
      { title: "Clients", url: "/clients", icon: Users, roles: ["admin", "commercial"] },
      { title: "Commandes", url: "/commandes", icon: ShoppingCart, roles: ["admin", "commercial"] },
      { title: "Factures", url: "/factures", icon: FileText, roles: ["admin", "commercial", "financier"] },
    ],
  },
  {
    label: "Stocks & Logistique (M2)",
    items: [
      { title: "Inventaire", url: "/inventaire", icon: Warehouse, roles: ["admin", "logistique"] },
      { title: "Fournisseurs", url: "/fournisseurs", icon: Building2, roles: ["admin", "logistique"] },
      { title: "Livraisons", url: "/livraisons", icon: Truck, roles: ["admin", "logistique", "livreur"] },
    ],
  },
  {
    label: "Finance (M3)",
    items: [
      { title: "Transactions", url: "/transactions", icon: DollarSign, roles: ["admin", "financier"] },
      { title: "Reporting", url: "/reporting", icon: BarChart3, roles: ["admin", "financier"] },
    ],
  },
  {
    label: "Ressources Humaines (M4)",
    items: [
      { title: "Employés", url: "/employes", icon: UserCog, roles: ["admin", "rh"] },
      { title: "Présences", url: "/presences", icon: CalendarCheck, roles: ["admin", "rh"] },
      { title: "Paie", url: "/paie", icon: Receipt, roles: ["admin", "rh"] },
    ],
  },
  {
    label: "Système",
    items: [
      { title: "Paramètres", url: "/parametres", icon: Settings, roles: ["admin"] },
    ],
  },
];

export function getFilteredNavigation(userRoles: AppRole[]): NavSection[] {
  if (userRoles.includes("admin")) return navigation;

  return navigation
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.roles || item.roles.some((r) => userRoles.includes(r))
      ),
    }))
    .filter((section) => section.items.length > 0);
}
