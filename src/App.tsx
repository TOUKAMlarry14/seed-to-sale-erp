import { useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleRoute } from "@/components/RoleRoute";
import { AppLayout } from "@/components/AppLayout";
import { SplashScreen } from "@/components/SplashScreen";
import Login from "@/pages/Login";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import {
  Catalogue, Clients, Commandes, Factures, Inventaire, Fournisseurs,
  Livraisons, Transactions, Reporting, Employes, Presences, Paie, Management,
} from "@/pages/modules";
import { Parametres } from "@/pages/modules/Parametres";
import { Information } from "@/pages/modules/Information";
import { LogsSysteme } from "@/pages/modules/LogsSysteme";
import { EmployeDetail } from "@/pages/modules/EmployeDetail";
import { GestionComptes } from "@/pages/modules/GestionComptes";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const onSplashFinished = useCallback(() => setShowSplash(false), []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {showSplash && <SplashScreen onFinished={onSplashFinished} />}
            <BrowserRouter>
              <AuthProvider>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route
                    element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/catalogue" element={<RoleRoute roles={["commercial"]}><Catalogue /></RoleRoute>} />
                    <Route path="/clients" element={<RoleRoute roles={["commercial"]}><Clients /></RoleRoute>} />
                    <Route path="/commandes" element={<RoleRoute roles={["commercial"]}><Commandes /></RoleRoute>} />
                    <Route path="/factures" element={<RoleRoute roles={["commercial", "financier"]}><Factures /></RoleRoute>} />
                    <Route path="/inventaire" element={<RoleRoute roles={["logistique"]}><Inventaire /></RoleRoute>} />
                    <Route path="/fournisseurs" element={<RoleRoute roles={["logistique"]}><Fournisseurs /></RoleRoute>} />
                    <Route path="/livraisons" element={<RoleRoute roles={["logistique", "livreur"]}><Livraisons /></RoleRoute>} />
                    <Route path="/transactions" element={<RoleRoute roles={["financier"]}><Transactions /></RoleRoute>} />
                    <Route path="/reporting" element={<RoleRoute roles={["financier"]}><Reporting /></RoleRoute>} />
                    <Route path="/employes" element={<RoleRoute roles={["rh"]}><Employes /></RoleRoute>} />
                    <Route path="/employes/:id" element={<RoleRoute roles={["rh"]}><EmployeDetail /></RoleRoute>} />
                    <Route path="/presences" element={<RoleRoute roles={["rh"]}><Presences /></RoleRoute>} />
                    <Route path="/paie" element={<RoleRoute roles={["rh"]}><Paie /></RoleRoute>} />
                    <Route path="/management" element={<RoleRoute roles={[]}><Management /></RoleRoute>} />
                    <Route path="/parametres" element={<RoleRoute roles={[]}><Parametres /></RoleRoute>} />
                    <Route path="/gestion-comptes" element={<RoleRoute roles={[]}><GestionComptes /></RoleRoute>} />
                    <Route path="/information" element={<Information />} />
                    <Route path="/logs" element={<RoleRoute roles={["techadmin" as any]} adminOnly={false}><LogsSysteme /></RoleRoute>} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
