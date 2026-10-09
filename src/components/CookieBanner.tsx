import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const KEY = "agroconnect-cookie-consent";
const EVT = "agroconnect-cookie-open";

export function hasConsent(): boolean {
  try { return JSON.parse(localStorage.getItem(KEY) || "null")?.value === "accepted"; } catch { return false; }
}
export function reopenCookieBanner() { window.dispatchEvent(new Event(EVT)); }

export function CookieBanner() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "null");
      const expired = !raw || Date.now() - raw.at > 182 * 864e5;
      setOpen(expired);
    } catch { setOpen(true); }
    const h = () => setOpen(true);
    window.addEventListener(EVT, h);
    return () => window.removeEventListener(EVT, h);
  }, []);

  const choose = (value: "accepted" | "refused") => {
    localStorage.setItem(KEY, JSON.stringify({ value, at: Date.now() }));
    if (value === "refused") localStorage.removeItem("agroconnect-tour-completed");
    setOpen(false);
  };

  if (!open) return null;
  return (
    <div role="dialog" aria-label="Cookies" className="fixed bottom-4 inset-x-4 md:left-auto md:right-4 md:max-w-md z-[100] rounded-xl border bg-card text-card-foreground shadow-lg p-4 space-y-3">
      <p className="text-sm">
        Nous utilisons uniquement des traceurs nécessaires au fonctionnement (connexion, préférences). Avec votre accord, nous mémorisons aussi la visite guidée.{" "}
        <Link to="/confidentialite" className="underline">En savoir plus</Link>
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => choose("refused")}>Tout refuser</Button>
        <Button variant="outline" onClick={() => choose("accepted")}>Tout accepter</Button>
      </div>
    </div>
  );
}
