import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";

export function NotificationsPopover() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();

  const handleClick = (notif: any) => {
    markAsRead(notif.id);
    if (notif.route) navigate(notif.route);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-destructive rounded-full text-[9px] text-destructive-foreground flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b flex items-center justify-between">
          <p className="text-sm font-heading font-semibold">Notifications</p>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-6" onClick={markAllRead}>
              <CheckCheck className="h-3 w-3 mr-1" />Tout lire
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">Aucune notification</p>
          ) : (
            notifications.slice(0, 20).map(notif => (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`w-full flex items-start gap-2 p-3 hover:bg-muted/50 transition-colors text-left border-b last:border-0 ${!notif.read ? "bg-primary/5" : ""}`}
              >
                <div className="flex-1">
                  <p className={`text-xs font-medium ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>{notif.title}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{notif.message}</p>
                  <p className="text-[9px] text-muted-foreground mt-1">
                    {new Date(notif.created_at).toLocaleDateString("fr-FR")} {new Date(notif.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {!notif.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
