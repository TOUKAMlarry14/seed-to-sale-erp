import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import logoSrc from "@/assets/logo_AgroConnect.svg";
import { Leaf, Truck, Users, BarChart3, ShieldCheck, Globe } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const features = [
  { icon: Leaf, title: "Approvisionnement direct", desc: "Connexion directe avec les producteurs agricoles du Cameroun pour des produits frais et de qualité." },
  { icon: Truck, title: "Logistique intégrée", desc: "Gestion de la chaîne de livraison de bout en bout, du producteur au point de vente." },
  { icon: Users, title: "Réseau de partenaires", desc: "Plus de 50 producteurs partenaires et 30+ points de distribution à Douala et Yaoundé." },
  { icon: BarChart3, title: "Analyse & Reporting", desc: "Tableaux de bord en temps réel pour piloter votre activité et prendre les bonnes décisions." },
  { icon: ShieldCheck, title: "Qualité & Traçabilité", desc: "Suivi complet de chaque produit, du champ au consommateur final." },
  { icon: Globe, title: "Impact local", desc: "Soutien à l'économie locale en favorisant les circuits courts et l'agriculture camerounaise." },
];

const timeline = [
  { year: "2020", event: "Fondation d'AgroConnect SARL à Douala" },
  { year: "2021", event: "Ouverture de l'entrepôt relais de Bonabéri" },
  { year: "2022", event: "Partenariat avec 30+ coopératives agricoles" },
  { year: "2023", event: "Lancement du service livraison express" },
  { year: "2024", event: "Expansion vers Yaoundé et déploiement de l'ERP" },
  { year: "2025", event: "50+ partenaires producteurs, 12 employés" },
];

export function Information() {
  return (
    <div className="space-y-12 pb-12">
      {/* Hero */}
      <motion.div {...fadeUp} className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
          <img src={logoSrc} alt="AgroConnect" className="h-12" />
        </div>
        <h1 className="text-4xl font-heading font-bold">AgroConnect SARL</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Connecter les producteurs agricoles camerounais aux marchés urbains grâce à une distribution fiable, traçable et équitable.
        </p>
      </motion.div>

      {/* Mission */}
      <motion.div {...fadeUp} className="grid lg:grid-cols-2 gap-8">
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-8">
            <h2 className="text-2xl font-heading font-bold mb-4">🎯 Notre Mission</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              AgroConnect a pour mission de révolutionner la distribution agroalimentaire au Cameroun en créant un pont digital entre les producteurs ruraux et les consommateurs urbains. Nous garantissons des produits frais, des prix justes et une traçabilité complète.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8">
            <h2 className="text-2xl font-heading font-bold mb-4">👁️ Notre Vision</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Devenir le leader de la distribution agroalimentaire digitale en Afrique Centrale d'ici 2030, en contribuant à la sécurité alimentaire et au développement économique des communautés agricoles.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Features Bento Grid */}
      <motion.div {...fadeUp}>
        <h2 className="text-2xl font-heading font-bold text-center mb-8">Ce que nous offrons</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <f.icon className="h-8 w-8 text-success mb-3" />
                  <h3 className="font-heading font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div {...fadeUp}>
        <h2 className="text-2xl font-heading font-bold text-center mb-8">Notre parcours</h2>
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />
          <div className="space-y-8">
            {timeline.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-4 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                  <p className="text-xs text-muted-foreground">{item.year}</p>
                  <p className="text-sm font-medium">{item.event}</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-success shrink-0 z-10" />
                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Contact */}
      <motion.div {...fadeUp}>
        <Card className="text-center">
          <CardContent className="p-8">
            <h2 className="text-2xl font-heading font-bold mb-2">Contactez-nous</h2>
            <p className="text-muted-foreground text-sm mb-4">AgroConnect SARL — Douala, Cameroun</p>
            <div className="flex justify-center gap-8 text-sm">
              <span>📧 contact@agroconnect.cm</span>
              <span>📞 +237 6XX XXX XXX</span>
              <span>📍 Bonabéri, Douala</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
