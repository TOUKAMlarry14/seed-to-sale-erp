export { Catalogue } from "./Catalogue";
export { Clients } from "./Clients";
export { Commandes } from "./Commandes";
export { Factures } from "./Factures";
export { Inventaire } from "./Inventaire";
export { Fournisseurs } from "./Fournisseurs";
export { Livraisons } from "./Livraisons";
export { Transactions } from "./Transactions";
export { Reporting } from "./Reporting";
export { Employes } from "./Employes";
export { Presences } from "./Presences";
export { Paie } from "./Paie";

const Parametres = () => (
  <div className="space-y-4">
    <div>
      <h1 className="text-2xl font-heading font-bold">Paramètres</h1>
      <p className="text-sm text-muted-foreground">Configuration du système AgroConnect</p>
    </div>
    <div className="flex items-center justify-center h-64 rounded-lg border-2 border-dashed border-border">
      <p className="text-muted-foreground text-sm">Module en cours de développement</p>
    </div>
  </div>
);

export { Parametres };
