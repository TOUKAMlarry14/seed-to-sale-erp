import { useEffect, useState } from "react";
import logoSrc from "@/assets/logo_AgroConnect.svg";

export function SplashScreen({ onFinished }: { onFinished: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 3200);
    const t2 = setTimeout(onFinished, 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onFinished]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-700 ${fadeOut ? "opacity-0" : "opacity-100"}`}>
      <div className="splash-logo-container">
        <div className="splash-logo-ring" />
        <img src={logoSrc} alt="AgroConnect" className="splash-logo h-20 relative z-10" />
      </div>
      <h1 className="mt-6 text-2xl font-heading font-bold text-foreground splash-text">AgroConnect</h1>
      <p className="mt-2 text-sm text-muted-foreground splash-text-delay">Solution ERP — Distribution Agroalimentaire</p>
      <div className="mt-8 splash-loader">
        <div className="splash-loader-bar" />
      </div>
    </div>
  );
}
