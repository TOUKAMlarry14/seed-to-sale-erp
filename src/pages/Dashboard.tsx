import { useAuth } from "@/hooks/useAuth";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import CommercialDashboard from "@/components/dashboards/CommercialDashboard";
import LogistiqueDashboard from "@/components/dashboards/LogistiqueDashboard";
import FinancierDashboard from "@/components/dashboards/FinancierDashboard";
import RHDashboard from "@/components/dashboards/RHDashboard";
import LivreurDashboard from "@/components/dashboards/LivreurDashboard";

const Dashboard = () => {
  const { roles } = useAuth();

  if (roles.includes("admin")) return <AdminDashboard />;
  if (roles.includes("commercial")) return <CommercialDashboard />;
  if (roles.includes("logistique")) return <LogistiqueDashboard />;
  if (roles.includes("financier")) return <FinancierDashboard />;
  if (roles.includes("rh")) return <RHDashboard />;
  if (roles.includes("livreur")) return <LivreurDashboard />;

  return <AdminDashboard />;
};

export default Dashboard;
