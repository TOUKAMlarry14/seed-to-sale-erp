import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import logoSrc from "@/assets/logo_AgroConnect.svg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { signIn, resetPassword } = useAuth();
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
      setIsForgotPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4">
          <img src={logoSrc} alt="AgroConnect" className="h-16" />
          <p className="text-muted-foreground text-sm">Solution ERP pour la distribution agroalimentaire</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-xl">
              {isForgotPassword ? "Mot de passe oublié" : "Connexion"}
            </CardTitle>
            <CardDescription>
              {isForgotPassword
                ? "Entrez votre email pour recevoir un lien de réinitialisation"
                : "Connectez-vous à votre espace AgroConnect"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isForgotPassword ? handleForgotPassword : handleLogin} className="space-y-4">
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

              {!isForgotPassword && (
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? "Chargement..."
                  : isForgotPassword
                  ? "Envoyer le lien"
                  : "Se connecter"}
              </Button>

              <button
                type="button"
                onClick={() => setIsForgotPassword(!isForgotPassword)}
                className="w-full text-sm text-primary hover:underline"
              >
                {isForgotPassword ? "Retour à la connexion" : "Mot de passe oublié ?"}
              </button>
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
