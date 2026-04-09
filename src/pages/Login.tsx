import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Leaf, Truck, Users, BarChart3 } from "lucide-react";
import logoSrc from "@/assets/logo_agroconnect.png";

type Mode = "login" | "signup" | "forgot";

const slides = [
  {
    title: "Notre équipe à Douala",
    desc: "Des professionnels dévoués au siège social, mêlant expertise technique et connaissance du terrain agroalimentaire camerounais.",
    gradient: "from-emerald-900/80 to-emerald-700/60",
    icon: Users,
  },
  {
    title: "Excellence logistique",
    desc: "Notre entrepôt de Bonabéri assure le stockage optimal et le conditionnement de milliers de produits agroalimentaires.",
    gradient: "from-blue-900/80 to-blue-700/60",
    icon: BarChart3,
  },
  {
    title: "Livraison de confiance",
    desc: "Nos livreurs assurent un service rapide et fiable auprès des supermarchés, restaurants et grossistes de Douala.",
    gradient: "from-amber-900/80 to-amber-700/60",
    icon: Truck,
  },
  {
    title: "Partenariat agricole",
    desc: "Nos équipes terrain collaborent directement avec les agriculteurs en zone rurale pour garantir la qualité et la traçabilité.",
    gradient: "from-green-900/80 to-green-700/60",
    icon: Leaf,
  },
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => setSlideIndex(i => (i + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      toast({ title: "Erreur de connexion", description: "Email ou mot de passe incorrect.", variant: "destructive" });
    } else {
      navigate("/");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const { error } = await signUp(email, password, fullName);
    setIsLoading(false);
    if (error) {
      toast({ title: "Erreur d'inscription", description: error.message || "Impossible de créer le compte.", variant: "destructive" });
    } else {
      toast({ title: "Compte créé !", description: "Votre compte est en attente de validation par un administrateur." });
      setMode("login");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await resetPassword(email);
    setIsLoading(false);
    if (error) {
      toast({ title: "Erreur", description: "Impossible d'envoyer le lien de réinitialisation.", variant: "destructive" });
    } else {
      toast({ title: "Email envoyé", description: "Vérifiez votre boîte mail." });
      setMode("login");
    }
  };

  const titles: Record<Mode, { title: string; description: string }> = {
    login: { title: "Connexion", description: "Connectez-vous à votre espace AgroConnect" },
    signup: { title: "Créer un compte", description: "Inscrivez-vous pour accéder à AgroConnect ERP" },
    forgot: { title: "Mot de passe oublié", description: "Entrez votre email pour recevoir un lien" },
  };

  const handleSubmit = mode === "login" ? handleLogin : mode === "signup" ? handleSignUp : handleForgotPassword;
  const slide = slides[slideIndex];

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left - Form */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center overflow-hidden">
              <img src={logoSrc} alt="AgroConnect" className="h-12 w-12 object-contain" />
            </div>
            <p className="text-muted-foreground text-sm text-center">Solution ERP pour la distribution agroalimentaire</p>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-heading text-xl">{titles[mode].title}</CardTitle>
              <CardDescription>{titles[mode].description}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nom complet</Label>
                    <Input id="fullName" type="text" placeholder="Jean Dupont" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <Input id="email" type="email" placeholder="nom@agroconnect.cm" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                {mode !== "forgot" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Input id="password" type={showPw ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10" />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Input id="confirmPassword" type={showConfirmPw ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pr-10" />
                      <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Chargement..." : mode === "login" ? "Se connecter" : mode === "signup" ? "Créer mon compte" : "Envoyer le lien"}
                </Button>
                {mode === "login" && (
                  <>
                    <Button type="button" variant="outline" className="w-full" onClick={() => setMode("signup")}>Créer un compte</Button>
                    <button type="button" onClick={() => setMode("forgot")} className="w-full text-sm text-primary hover:underline">Mot de passe oublié ?</button>
                  </>
                )}
                {mode !== "login" && (
                  <button type="button" onClick={() => setMode("login")} className="w-full text-sm text-primary hover:underline">Retour à la connexion</button>
                )}
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">© 2026 AgroConnect SARL — Douala, Cameroun</p>
        </div>
      </div>

      {/* Right - Slideshow */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-success/90 to-success/60">
        <div className={`absolute inset-0 bg-gradient-to-t ${slide.gradient} transition-all duration-700`} />
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white text-center">
          <slide.icon className="h-16 w-16 mb-6 opacity-80" />
          <h2 className="text-3xl font-heading font-bold mb-4">{slide.title}</h2>
          <p className="text-sm opacity-90 leading-relaxed max-w-md mb-8">{slide.desc}</p>
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setSlideIndex(i)} className={`w-2 h-2 rounded-full transition-all ${i === slideIndex ? "bg-white w-6" : "bg-white/40"}`} />
            ))}
          </div>
        </div>
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-white/70 text-xs">AgroConnect SARL — Connecter les producteurs aux marchés</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
