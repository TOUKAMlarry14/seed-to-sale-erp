import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/contexts/I18nContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Loader2, UserPlus, Trash2, ShieldCheck, ShieldX, Search, Users, ShieldAlert, UserCheck, Clock } from "lucide-react";

const ALL_ROLES = ["admin", "commercial", "logistique", "financier", "rh", "livreur", "techadmin"] as const;

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

export function GestionComptes() {
  const { t, lang } = useTranslation();
  const { session } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [delUser, setDelUser] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const callAdmin = useCallback(async (action: string, method: string, body?: any) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users?action=${action}`;
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error");
    }
    return res.json();
  }, [session]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await callAdmin("list", "GET");
      setUsers(data);
    } catch (e: any) {
      toast({ title: t("error.generic"), description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [callAdmin, t, toast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const addRole = async (userId: string, role: string) => {
    setActionLoading(`add-${userId}-${role}`);
    try {
      await callAdmin("add-role", "POST", { user_id: userId, role });
      toast({ title: t("accounts.role_added") });
      fetchUsers();
    } catch (e: any) {
      toast({ title: t("error.generic"), description: e.message, variant: "destructive" });
    } finally { setActionLoading(null); }
  };

  const removeRole = async (userId: string, role: string) => {
    setActionLoading(`rm-${userId}-${role}`);
    try {
      await callAdmin("remove-role", "POST", { user_id: userId, role });
      toast({ title: t("accounts.role_removed") });
      fetchUsers();
    } catch (e: any) {
      toast({ title: t("error.generic"), description: e.message, variant: "destructive" });
    } finally { setActionLoading(null); }
  };

  const deleteUser = async () => {
    if (!delUser) return;
    setActionLoading(`del-${delUser.id}`);
    try {
      await callAdmin("delete-user", "POST", { user_id: delUser.id });
      toast({ title: t("accounts.user_deleted") });
      setDelUser(null);
      fetchUsers();
    } catch (e: any) {
      toast({ title: t("error.generic"), description: e.message, variant: "destructive" });
    } finally { setActionLoading(null); }
  };

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.email.toLowerCase().includes(search.toLowerCase()) || u.full_name.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.roles.includes(roleFilter);
    return matchSearch && matchRole;
  });

  const stats = {
    total: users.length,
    withRoles: users.filter(u => u.roles.length > 0).length,
    noRoles: users.filter(u => u.roles.length === 0).length,
    recentlyActive: users.filter(u => {
      if (!u.last_sign_in_at) return false;
      const diff = Date.now() - new Date(u.last_sign_in_at).getTime();
      return diff < 7 * 24 * 60 * 60 * 1000;
    }).length,
  };

  const fmtDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const roleColor = (role: string) => {
    const map: Record<string, string> = {
      admin: "bg-destructive/10 text-destructive border-destructive/20",
      techadmin: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
      commercial: "bg-primary/10 text-primary border-primary/20",
      logistique: "bg-warning/10 text-warning border-warning/20",
      financier: "bg-success/10 text-success border-success/20",
      rh: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
      livreur: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
    };
    return map[role] || "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">{t("accounts.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("accounts.subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: t("accounts.total_users"), value: stats.total, color: "text-primary" },
          { icon: UserCheck, label: t("accounts.with_roles"), value: stats.withRoles, color: "text-success" },
          { icon: ShieldAlert, label: t("accounts.no_roles"), value: stats.noRoles, color: "text-destructive" },
          { icon: Clock, label: t("accounts.active_7d"), value: stats.recentlyActive, color: "text-warning" },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-muted ${s.color}`}><s.icon className="h-5 w-5" /></div>
              <div>
                <p className="text-2xl font-heading font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("accounts.user_list")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t("accounts.search_placeholder")} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t("accounts.filter_role")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {ALL_ROLES.map(r => (
                  <SelectItem key={r} value={r}>{t(`role.${r}`)}</SelectItem>
                ))}
                <SelectItem value="__none">{t("accounts.no_role")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-lg border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.name")}</TableHead>
                    <TableHead>{t("common.email")}</TableHead>
                    <TableHead>{t("accounts.roles")}</TableHead>
                    <TableHead>{t("accounts.last_login")}</TableHead>
                    <TableHead className="text-right">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t("common.no_data")}</TableCell></TableRow>
                  ) : filtered.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {u.roles.length === 0 && (
                            <Badge variant="outline" className="text-xs text-muted-foreground">{t("accounts.no_role")}</Badge>
                          )}
                          {u.roles.map(r => (
                            <Badge key={r} variant="outline" className={`text-xs ${roleColor(r)}`}>
                              {t(`role.${r}`)}
                              <button
                                className="ml-1 hover:text-destructive"
                                onClick={() => removeRole(u.id, r)}
                                disabled={actionLoading === `rm-${u.id}-${r}`}
                              >
                                {actionLoading === `rm-${u.id}-${r}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldX className="h-3 w-3" />}
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fmtDate(u.last_sign_in_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Select onValueChange={(role) => addRole(u.id, role)}>
                            <SelectTrigger className="h-8 w-8 p-0 border-0 bg-transparent">
                              <ShieldCheck className="h-4 w-4 text-success" />
                            </SelectTrigger>
                            <SelectContent>
                              {ALL_ROLES.filter(r => !u.roles.includes(r)).map(r => (
                                <SelectItem key={r} value={r}>{t(`role.${r}`)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDelUser(u)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!delUser}
        onOpenChange={(open) => { if (!open) setDelUser(null); }}
        onConfirm={deleteUser}
        title={t("accounts.delete_confirm_title")}
        description={`${t("accounts.delete_confirm_desc")} ${delUser?.email}`}
      />
    </div>
  );
}
