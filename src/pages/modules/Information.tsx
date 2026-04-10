import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/contexts/I18nContext";
import logoSrc from "@/assets/logo_AgroConnect.svg";
import { Leaf, Truck, Users, BarChart3, ShieldCheck, Globe, Mail, Phone, MapPin } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const features = [
  { icon: Leaf, title: "Approvisionnement direct", titleEn: "Direct Sourcing", desc: "Connexion directe avec les producteurs agricoles du Cameroun pour des produits frais et de qualité.", descEn: "Direct connection with Cameroonian agricultural producers for fresh, quality products." },
  { icon: Truck, title: "Logistique intégrée", titleEn: "Integrated Logistics", desc: "Gestion de la chaîne de livraison de bout en bout, du producteur au point de vente.", descEn: "End-to-end delivery chain management, from producer to point of sale." },
  { icon: Users, title: "Réseau de partenaires", titleEn: "Partner Network", desc: "Plus de 50 producteurs partenaires et 30+ points de distribution à Douala et Yaoundé.", descEn: "Over 50 partner producers and 30+ distribution points in Douala and Yaoundé." },
  { icon: BarChart3, title: "Analyse & Reporting", titleEn: "Analytics & Reporting", desc: "Tableaux de bord en temps réel pour piloter votre activité et prendre les bonnes décisions.", descEn: "Real-time dashboards to drive your business and make the right decisions." },
  { icon: ShieldCheck, title: "Qualité & Traçabilité", titleEn: "Quality & Traceability", desc: "Suivi complet de chaque produit, du champ au consommateur final.", descEn: "Complete tracking of every product, from field to end consumer." },
  { icon: Globe, title: "Impact local", titleEn: "Local Impact", desc: "Soutien à l'économie locale en favorisant les circuits courts et l'agriculture camerounaise.", descEn: "Supporting the local economy by promoting short supply chains and Cameroonian agriculture." },
];

const timeline = [
  { year: "2020", event: "Fondation d'AgroConnect SARL à Douala", eventEn: "AgroConnect SARL founded in Douala" },
  { year: "2021", event: "Ouverture de l'entrepôt relais de Bonabéri", eventEn: "Bonabéri relay warehouse opening" },
  { year: "2022", event: "Partenariat avec 30+ coopératives agricoles", eventEn: "Partnership with 30+ agricultural cooperatives" },
  { year: "2023", event: "Lancement du service livraison express", eventEn: "Express delivery service launch" },
  { year: "2024", event: "Expansion vers Yaoundé et déploiement de l'ERP", eventEn: "Expansion to Yaoundé and ERP deployment" },
  { year: "2025", event: "50+ partenaires producteurs, 12 employés", eventEn: "50+ producer partners, 12 employees" },
];

export function Information() {
  const { t, lang } = useTranslation();
  const isFr = lang === "fr";

  return (
    <div className="space-y-12 pb-12">
      <motion.div {...fadeUp} className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
          <img src={logoSrc} alt="AgroConnect" className="h-12" />
        </div>
        <h1 className="text-4xl font-heading font-bold">{t("info.title")}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("info.subtitle")}</p>
      </motion.div>

      <motion.div {...fadeUp} className="grid lg:grid-cols-2 gap-8">
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="h-6 w-6 text-success" />
              <h2 className="text-2xl font-heading font-bold">{t("info.mission_title")}</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isFr
                ? "AgroConnect a pour mission de révolutionner la distribution agroalimentaire au Cameroun en créant un pont digital entre les producteurs ruraux et les consommateurs urbains. Nous garantissons des produits frais, des prix justes et une traçabilité complète."
                : "AgroConnect's mission is to revolutionize agri-food distribution in Cameroon by creating a digital bridge between rural producers and urban consumers. We guarantee fresh products, fair prices and complete traceability."
              }
            </p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-heading font-bold">{t("info.vision_title")}</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isFr
                ? "Devenir le leader de la distribution agroalimentaire digitale en Afrique Centrale d'ici 2030, en contribuant à la sécurité alimentaire et au développement économique des communautés agricoles."
                : "Become the leader of digital agri-food distribution in Central Africa by 2030, contributing to food security and economic development of agricultural communities."
              }
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div {...fadeUp}>
        <h2 className="text-2xl font-heading font-bold text-center mb-8">{t("info.features_title")}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <f.icon className="h-8 w-8 text-success mb-3" />
                  <h3 className="font-heading font-semibold mb-2">{isFr ? f.title : f.titleEn}</h3>
                  <p className="text-sm text-muted-foreground">{isFr ? f.desc : f.descEn}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div {...fadeUp}>
        <h2 className="text-2xl font-heading font-bold text-center mb-8">{t("info.timeline_title")}</h2>
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />
          <div className="space-y-8">
            {timeline.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-4 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                  <p className="text-xs text-muted-foreground">{item.year}</p>
                  <p className="text-sm font-medium">{isFr ? item.event : item.eventEn}</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-success shrink-0 z-10" />
                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div {...fadeUp}>
        <Card className="text-center">
          <CardContent className="p-8">
            <h2 className="text-2xl font-heading font-bold mb-2">{t("info.contact_title")}</h2>
            <p className="text-muted-foreground text-sm mb-4">AgroConnect SARL — Douala, Cameroun</p>
            <div className="flex justify-center gap-8 text-sm">
              <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> contact@agroconnect.cm</span>
              <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> +237 6XX XXX XXX</span>
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> Bonabéri, Douala</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}