const placeholderPage = (title: string, description: string) => {
  return () => (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-heading font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center justify-center h-64 rounded-lg border-2 border-dashed border-border">
        <p className="text-muted-foreground text-sm">Module en cours de développement</p>
      </div>
    </div>
  );
};

export const Catalogue = placeholderPage("Catalogue produits", "Gérez votre catalogue de produits agroalimentaires");
export const Clients = placeholderPage("Gestion des clients", "Répertoire et suivi de vos clients professionnels et particuliers");
export const Commandes = placeholderPage("Commandes", "Créez et suivez les commandes clients");
export const Factures = placeholderPage("Factures", "Générez et gérez les factures");
export const Inventaire = placeholderPage("Inventaire", "Suivi des stocks et mouvements d'entrée/sortie");
export const Fournisseurs = placeholderPage("Fournisseurs", "Gérez vos fournisseurs et approvisionnements");
export const Livraisons = placeholderPage("Livraisons", "Planifiez et suivez les livraisons");
export const Transactions = placeholderPage("Journal des transactions", "Suivi des recettes et dépenses");
export const Reporting = placeholderPage("Reporting financier", "Tableaux de bord et analyses financières");
export const Employes = placeholderPage("Gestion des employés", "Répertoire et gestion du personnel");
export const Presences = placeholderPage("Pointage des présences", "Suivi quotidien des présences du personnel");
export const Paie = placeholderPage("Gestion de la paie", "Calcul et suivi des salaires");
export const Parametres = placeholderPage("Paramètres", "Configuration du système AgroConnect");
