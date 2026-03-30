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
import { AppLayout } from "@/components/AppLayout";
import { SplashScreen } from "@/components/SplashScreen";
import Login from "@/pages/Login";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import {
  Catalogue, Clients, Commandes, Factures, Inventaire, Fournisseurs,
  Livraisons, Transactions, Reporting, Employes, Presences, Paie,
} from "@/pages/modules";
import { Parametres } from "@/pages/modules/Parametres";
import { Information } from "@/pages/modules/Information";
import { LogsSysteme } from "@/pages/modules/LogsSysteme";
import { EmployeDetail } from "@/pages/modules/EmployeDetail";

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
                    <Route path="/catalogue" element={<Catalogue />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/commandes" element={<Commandes />} />
                    <Route path="/factures" element={<Factures />} />
                    <Route path="/inventaire" element={<Inventaire />} />
                    <Route path="/fournisseurs" element={<Fournisseurs />} />
                    <Route path="/livraisons" element={<Livraisons />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/reporting" element={<Reporting />} />
                    <Route path="/employes" element={<Employes />} />
                    <Route path="/employes/:id" element={<EmployeDetail />} />
                    <Route path="/presences" element={<Presences />} />
                    <Route path="/paie" element={<Paie />} />
                    <Route path="/parametres" element={<Parametres />} />
                    <Route path="/information" element={<Information />} />
                    <Route path="/logs" element={<LogsSysteme />} />
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
