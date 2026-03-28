import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import logoSrc from "@/assets/logo_AgroConnect.svg";

type Mode = "login" | "signup" | "forgot";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Erreur de connexion",
        description: "Email ou mot de passe incorrect.",
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    const { error } = await signUp(email, password, fullName);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Impossible de créer le compte.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Compte créé !",
        description: "Vérifiez votre email pour confirmer votre inscription, puis connectez-vous.",
      });
      setMode("login");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await resetPassword(email);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le lien de réinitialisation.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe.",
      });
      setMode("login");
    }
  };

  const titles: Record<Mode, { title: string; description: string }> = {
    login: { title: "Connexion", description: "Connectez-vous à votre espace AgroConnect" },
    signup: { title: "Créer un compte", description: "Inscrivez-vous pour accéder à AgroConnect" },
    forgot: { title: "Mot de passe oublié", description: "Entrez votre email pour recevoir un lien de réinitialisation" },
  };

  const handleSubmit = mode === "login" ? handleLogin : mode === "signup" ? handleSignUp : handleForgotPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4">
          <img src={logoSrc} alt="AgroConnect" className="h-16" />
          <p className="text-muted-foreground text-sm">Solution ERP pour la distribution agroalimentaire</p>
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
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Jean Dupont"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@agroconnect.cm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {mode !== "forgot" && (
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? "Chargement..."
                  : mode === "login"
                  ? "Se connecter"
                  : mode === "signup"
                  ? "Créer mon compte"
                  : "Envoyer le lien"}
              </Button>

              {mode === "login" && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setMode("signup")}
                  >
                    Créer un compte
                  </Button>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="w-full text-sm text-primary hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </>
              )}

              {mode !== "login" && (
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="w-full text-sm text-primary hover:underline"
                >
                  Retour à la connexion
                </button>
              )}
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          © 2026 AgroConnect SARL — Douala, Cameroun
        </p>
      </div>
    </div>
  );
};

export default Login;
