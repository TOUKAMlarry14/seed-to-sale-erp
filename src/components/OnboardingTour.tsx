import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const TOUR_KEY = "agroconnect-tour-completed";

const steps = [
  {
    title: "Bienvenue sur AgroConnect ! 🎉",
    description: "AgroConnect est votre solution ERP complète pour la gestion de votre activité de distribution agroalimentaire. Découvrons ensemble les fonctionnalités principales.",
  },
  {
    title: "📊 Tableau de bord",
    description: "Votre tableau de bord s'adapte automatiquement à votre rôle. Les administrateurs voient une vue globale, tandis que chaque département voit ses propres KPIs et indicateurs.",
  },
  {
    title: "🛒 Module Ventes",
    description: "Gérez votre catalogue produits, vos clients, vos commandes et vos factures. Créez des commandes rapidement et suivez leur état en temps réel.",
  },
  {
    title: "📦 Stocks & Logistique",
    description: "Suivez votre inventaire en temps réel, gérez vos fournisseurs et planifiez les livraisons. Recevez des alertes automatiques quand le stock est bas.",
  },
  {
    title: "💰 Finance & RH",
    description: "Enregistrez vos transactions, consultez vos rapports financiers, gérez vos employés et générez les fiches de paie automatiquement.",
  },
  {
    title: "🤖 Assistant IA",
    description: "Cliquez sur le bouton vert en bas à droite pour accéder à votre assistant IA. Il peut répondre à vos questions sur l'utilisation de l'ERP et sur AgroConnect.",
  },
];

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const finish = () => {
    setIsOpen(false);
    localStorage.setItem(TOUR_KEY, "true");
  };

  const next = () => step < steps.length - 1 ? setStep(step + 1) : finish();
  const prev = () => step > 0 && setStep(step - 1);

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { if (!v) finish(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">{steps[step].title}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed pt-2">{steps[step].description}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-muted-foreground">{step + 1} / {steps.length}</p>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={prev}>
                <ChevronLeft className="h-4 w-4 mr-1" />Précédent
              </Button>
            )}
            <Button size="sm" onClick={next}>
              {step < steps.length - 1 ? (
                <>Suivant<ChevronRight className="h-4 w-4 ml-1" /></>
              ) : "Terminer ✓"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function resetOnboardingTour() {
  localStorage.removeItem(TOUR_KEY);
  window.location.reload();
}
