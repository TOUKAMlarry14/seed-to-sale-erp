import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, AlertTriangle, FileText, Truck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useProducts } from "@/hooks/useProducts";
import { useInvoices } from "@/hooks/useInvoices";
import { useDeliveries } from "@/hooks/useDeliveries";

interface Alert {
  id: string;
  type: "stock" | "invoice" | "delivery";
  message: string;
  route: string;
  icon: typeof AlertTriangle;
}

export function NotificationsPopover() {
  const navigate = useNavigate();
  const { data: products } = useProducts();
  const { data: invoices } = useInvoices();
  const { data: deliveries } = useDeliveries();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const alerts: Alert[] = [];

  // Stock alerts
  products?.filter(p => p.is_active && p.stock_qty <= p.stock_min).forEach(p => {
    alerts.push({
      id: `stock-${p.id}`,
      type: "stock",
      message: `Stock bas : ${p.name} (${p.stock_qty} ${p.unit} restants)`,
      route: "/inventaire",
      icon: Package,
    });
  });

  // Unpaid invoices > 7 days
  invoices?.filter(i => {
    if (i.status === "paye") return false;
    const created = new Date(i.created_at);
    const diff = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 7;
  }).forEach(inv => {
    alerts.push({
      id: `inv-${inv.id}`,
      type: "invoice",
      message: `Facture ${inv.invoice_number} impayée depuis +7 jours`,
      route: "/factures",
      icon: FileText,
    });
  });

  // Late deliveries
  deliveries?.filter(d => {
    if (d.status === "livre" || d.status === "echoue") return false;
    if (!d.scheduled_date) return false;
    return new Date(d.scheduled_date) < new Date();
  }).forEach(d => {
    alerts.push({
      id: `del-${d.id}`,
      type: "delivery",
      message: `Livraison en retard — prévue le ${new Date(d.scheduled_date!).toLocaleDateString("fr-FR")}`,
      route: "/livraisons",
      icon: Truck,
    });
  });

  const visibleAlerts = alerts.filter(a => !dismissed.has(a.id));

  const handleClick = (alert: Alert) => {
    setDismissed(prev => new Set([...prev, alert.id]));
    navigate(alert.route);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {visibleAlerts.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-destructive rounded-full text-[9px] text-destructive-foreground flex items-center justify-center font-medium">
              {visibleAlerts.length > 9 ? "9+" : visibleAlerts.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b">
          <p className="text-sm font-heading font-semibold">Notifications</p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {visibleAlerts.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">Aucune notification</p>
          ) : (
            visibleAlerts.slice(0, 20).map(alert => (
              <button
                key={alert.id}
                onClick={() => handleClick(alert)}
                className="w-full flex items-start gap-2 p-3 hover:bg-muted/50 transition-colors text-left border-b last:border-0"
              >
                <alert.icon className={`h-4 w-4 mt-0.5 shrink-0 ${
                  alert.type === "stock" ? "text-destructive" :
                  alert.type === "invoice" ? "text-warning" : "text-primary"
                }`} />
                <p className="text-xs leading-relaxed">{alert.message}</p>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
