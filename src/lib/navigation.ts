import {
  LayoutDashboard, ShoppingCart, Package, Users, FileText, Warehouse,
  Truck, DollarSign, BarChart3, UserCog, CalendarCheck, Receipt,
  Settings, Building2, Info, ScrollText, ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { AppRole } from "@/lib/constants";

export interface NavItem {
  titleKey: string;
  url: string;
  icon: LucideIcon;
  roles?: AppRole[];
}

export interface NavSection {
  labelKey: string;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    labelKey: "section.general",
    items: [
      { titleKey: "nav.dashboard", url: "/", icon: LayoutDashboard },
      { titleKey: "nav.information", url: "/information", icon: Info },
    ],
  },
  {
    labelKey: "section.sales",
    items: [
      { titleKey: "nav.catalogue", url: "/catalogue", icon: Package, roles: ["admin", "commercial", "techadmin"] },
      { titleKey: "nav.clients", url: "/clients", icon: Users, roles: ["admin", "commercial", "techadmin"] },
      { titleKey: "nav.orders", url: "/commandes", icon: ShoppingCart, roles: ["admin", "commercial", "techadmin"] },
      { titleKey: "nav.invoices", url: "/factures", icon: FileText, roles: ["admin", "commercial", "financier", "techadmin"] },
    ],
  },
  {
    labelKey: "section.stock",
    items: [
      { titleKey: "nav.inventory", url: "/inventaire", icon: Warehouse, roles: ["admin", "logistique", "techadmin"] },
      { titleKey: "nav.suppliers", url: "/fournisseurs", icon: Building2, roles: ["admin", "logistique", "techadmin"] },
      { titleKey: "nav.deliveries", url: "/livraisons", icon: Truck, roles: ["admin", "logistique", "livreur", "techadmin"] },
    ],
  },
  {
    labelKey: "section.finance",
    items: [
      { titleKey: "nav.transactions", url: "/transactions", icon: DollarSign, roles: ["admin", "financier", "techadmin"] },
      { titleKey: "nav.reporting", url: "/reporting", icon: BarChart3, roles: ["admin", "financier", "techadmin"] },
    ],
  },
  {
    labelKey: "section.hr",
    items: [
      { titleKey: "nav.employees", url: "/employes", icon: UserCog, roles: ["admin", "rh", "techadmin"] },
      { titleKey: "nav.attendance", url: "/presences", icon: CalendarCheck, roles: ["admin", "rh", "techadmin"] },
      { titleKey: "nav.payroll", url: "/paie", icon: Receipt, roles: ["admin", "rh", "techadmin"] },
    ],
  },
  {
    labelKey: "section.system",
    items: [
      { titleKey: "nav.accounts", url: "/gestion-comptes", icon: ShieldCheck, roles: ["admin", "techadmin"] },
      { titleKey: "nav.settings", url: "/parametres", icon: Settings, roles: ["admin", "techadmin"] },
      { titleKey: "nav.logs", url: "/logs", icon: ScrollText, roles: ["techadmin"] },
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
