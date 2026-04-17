import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowRight, Loader2, Building2, Warehouse, Truck, Sprout, Globe2 } from "lucide-react";
import logoSrc from "@/assets/logo_agroconnect.png";

type Mode = "login" | "signup" | "forgot";

const SLIDES = [
  { icon: Building2, title: "Siège AgroConnect — Douala", desc: "Une équipe agile au cœur du Cameroun, pilotant la chaîne agroalimentaire." },
  { icon: Warehouse, title: "Entrepôts & tri intelligent", desc: "Réception, contrôle qualité et stockage optimisé des produits frais." },
  { icon: Truck, title: "Livraisons en supermarché", desc: "Distribution fiable vers les enseignes de Douala et Yaoundé." },
  { icon: Sprout, title: "Recensement agricole rural", desc: "Connecter les producteurs locaux à un réseau structuré et équitable." },
  { icon: Globe2, title: "Salon international de l'agriculture", desc: "AgroConnect rayonne à l'international, portant l'innovation africaine." },
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
  const [slide, setSlide] = useState(0);
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 4000);
    return () => clearInterval(id);
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
    login: { title: "Bon retour", description: "Connectez-vous à votre espace AgroConnect" },
    signup: { title: "Créer un compte", description: "Inscrivez-vous pour accéder à AgroConnect ERP" },
    forgot: { title: "Mot de passe oublié", description: "Entrez votre email pour recevoir un lien" },
  };

  const handleSubmit = mode === "login" ? handleLogin : mode === "signup" ? handleSignUp : handleForgotPassword;

  return (
    <div className="min-h-screen grid lg:grid-cols-[55fr_45fr]">
      {/* Left - Storytelling carousel */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-primary via-[hsl(124_50%_18%)] to-secondary">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-warning rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
              <img src={logoSrc} alt="" className="h-8 w-8 object-contain brightness-0 invert" />
            </div>
            <div>
              <p className="font-heading font-bold text-lg tracking-tight">AgroConnect</p>
              <p className="text-xs opacity-70">Solution ERP d'AgroConnect</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="min-h-[220px]">
              {SLIDES.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className={`transition-all duration-700 ${i === slide ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 absolute pointer-events-none"}`}
                    style={i === slide ? {} : { position: "absolute" }}
                  >
                    <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur flex items-center justify-center mb-5">
                      <Icon className="h-10 w-10 text-warning" strokeWidth={1.5} />
                    </div>
                    <h2 className="font-heading text-3xl font-bold mb-3 tracking-tight max-w-md">{s.title}</h2>
                    <p className="text-sm opacity-80 leading-relaxed max-w-md">{s.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className={`h-1.5 rounded-full transition-all ${i === slide ? "w-10 bg-warning" : "w-2 bg-white/30 hover:bg-white/50"}`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <p className="text-[11px] opacity-50">© 2026 AgroConnect SARL — Douala, Cameroun</p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-[400px] space-y-8 animate-in">
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
              <img src={logoSrc} alt="AgroConnect" className="h-10 w-10 object-contain" />
            </div>
            <p className="text-muted-foreground text-xs tracking-wide uppercase font-medium">Solution ERP d'AgroConnect</p>
          </div>

          <div className="space-y-1.5 text-center">
            <h1 className="font-heading text-2xl font-bold tracking-tight">{titles[mode].title}</h1>
            <p className="text-sm text-muted-foreground">{titles[mode].description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-medium">Nom complet</Label>
                <Input id="fullName" type="text" placeholder="Jean Dupont" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="h-10" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">Adresse email</Label>
              <Input id="email" type="email" placeholder="nom@agroconnect.cm" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-10" />
            </div>
            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium">Mot de passe</Label>
                <div className="relative">
                  <Input id="password" type={showPw ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10 h-10" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-medium">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirmPw ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pr-10 h-10" />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            <Button type="submit" className="w-full h-10 btn-press font-medium" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  {mode === "login" ? "Se connecter" : mode === "signup" ? "Créer mon compte" : "Envoyer le lien"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
            {mode === "login" && (
              <div className="space-y-2">
                <Button type="button" variant="outline" className="w-full h-10" onClick={() => setMode("signup")}>Créer un compte</Button>
                <button type="button" onClick={() => setMode("forgot")} className="w-full text-xs text-muted-foreground hover:text-primary transition-colors">
                  Mot de passe oublié ?
                </button>
              </div>
            )}
            {mode !== "login" && (
              <button type="button" onClick={() => setMode("login")} className="w-full text-xs text-muted-foreground hover:text-primary transition-colors">
                Retour à la connexion
              </button>
            )}
          </form>

          <p className="text-center text-[10px] text-muted-foreground/60">© 2026 AgroConnect SARL — Douala, Cameroun</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
