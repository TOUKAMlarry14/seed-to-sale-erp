import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Login from "@/pages/Login";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import {
  Catalogue,
  Clients,
  Commandes,
  Factures,
  Inventaire,
  Fournisseurs,
  Livraisons,
  Transactions,
  Reporting,
  Employes,
  Presences,
  Paie,
  Parametres,
} from "@/pages/modules";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
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
              <Route path="/presences" element={<Presences />} />
              <Route path="/paie" element={<Paie />} />
              <Route path="/parametres" element={<Parametres />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
