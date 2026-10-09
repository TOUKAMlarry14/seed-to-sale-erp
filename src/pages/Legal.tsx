import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { reopenCookieBanner } from "@/components/CookieBanner";

/** Champs à compléter : remplacez chaque valeur entre crochets. */
const LEGAL = {
  editorType: "[Entreprise / Particulier]",
  editorName: "[Raison sociale ou Nom Prénom]",
  editorForm: "[Forme juridique et capital social — si entreprise]",
  editorAddress: "[Adresse du siège ou du domicile]",
  editorPhone: "[Téléphone]",
  editorEmail: "[Email de contact]",
  editorRegistry: "[N° RCS / RCCM / SIREN — si entreprise]",
  editorVat: "[N° TVA intracommunautaire — si applicable]",
  director: "[Nom du directeur de la publication]",
  hostName: "Lovable Labs Incorporated (hébergement applicatif) — [à confirmer]",
  hostAddress: "[Adresse de l'hébergeur]",
  hostPhone: "[Téléphone de l'hébergeur]",
  dpoEmail: "[Email du responsable des données / DPO]",
};

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <h1 className="text-3xl font-heading font-bold">{title}</h1>
        <Card><CardContent className="prose prose-sm dark:prose-invert max-w-none p-6 space-y-4 text-safe">{children}</CardContent></Card>
        <LegalFooter />
      </div>
    </div>
  );
}

const H = ({ children }: { children: React.ReactNode }) => <h2 className="text-lg font-semibold mt-4">{children}</h2>;

export function MentionsLegales() {
  return (
    <Shell title="Mentions légales">
      <p>Conformément à l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN), les informations suivantes sont portées à la connaissance des utilisateurs.</p>
      <H>1. Éditeur du site</H>
      <ul>
        <li>Statut : {LEGAL.editorType}</li>
        <li>Nom / Raison sociale : {LEGAL.editorName}</li>
        <li>Forme juridique et capital : {LEGAL.editorForm}</li>
        <li>Adresse : {LEGAL.editorAddress}</li>
        <li>Téléphone : {LEGAL.editorPhone}</li>
        <li>Email : {LEGAL.editorEmail}</li>
        <li>Immatriculation : {LEGAL.editorRegistry}</li>
        <li>TVA : {LEGAL.editorVat}</li>
      </ul>
      <p className="text-xs text-muted-foreground">Un particulier éditant à titre non professionnel peut préserver son anonymat en ne communiquant que les coordonnées de son hébergeur (art. 6-III-2 LCEN).</p>
      <H>2. Directeur de la publication</H>
      <p>{LEGAL.director}</p>
      <H>3. Hébergeur</H>
      <ul>
        <li>Nom : {LEGAL.hostName}</li>
        <li>Adresse : {LEGAL.hostAddress}</li>
        <li>Téléphone : {LEGAL.hostPhone}</li>
      </ul>
      <H>4. Propriété intellectuelle</H>
      <p>L'ensemble des contenus (textes, logos, interfaces) est la propriété de l'éditeur. Toute reproduction sans autorisation est interdite.</p>
      <H>5. Données personnelles</H>
      <p>Voir la <Link to="/confidentialite" className="underline">politique de confidentialité</Link>.</p>
    </Shell>
  );
}

export function Confidentialite() {
  return (
    <Shell title="Politique de confidentialité">
      <p>Responsable du traitement : {LEGAL.editorName}, {LEGAL.editorAddress}. Contact : {LEGAL.dpoEmail}.</p>
      <H>1. Données collectées</H>
      <ul>
        <li><b>Comptes utilisateurs</b> : nom complet, email, mot de passe (chiffré), rôles, dates de connexion.</li>
        <li><b>Employés</b> : nom, email, téléphone, poste, département, photo, salaire, primes, retenues, date d'embauche, motif de départ.</li>
        <li><b>Présences et paie</b> : absences, congés et motifs, bulletins (brut, CNPS, impôt, net).</li>
        <li><b>Clients et fournisseurs</b> : nom, téléphone, email, adresse, notes, solde.</li>
        <li><b>Commandes, factures, livraisons</b> : adresses de livraison, montants, mode de paiement.</li>
        <li><b>Journal d'activité</b> : actions effectuées, identifiant et nom de l'utilisateur.</li>
        <li><b>Assistant IA</b> : questions saisies, transmises au fournisseur d'IA pour générer la réponse, non conservées.</li>
      </ul>
      <H>2. Finalités et bases légales</H>
      <ul>
        <li>Gestion commerciale, logistique et facturation — exécution du contrat.</li>
        <li>Gestion RH et paie — obligation légale et contrat de travail.</li>
        <li>Sécurité, contrôle d'accès et traçabilité — intérêt légitime.</li>
      </ul>
      <H>3. Durées de conservation</H>
      <ul>
        <li>Comptes : durée d'activité, puis suppression.</li>
        <li>Données RH et bulletins : 5 ans après le départ de l'employé.</li>
        <li>Factures et pièces comptables : 10 ans.</li>
        <li>Clients/fournisseurs : 3 ans après le dernier contact.</li>
        <li>Journaux d'activité : 1 an.</li>
      </ul>
      <H>4. Cookies et stockage local</H>
      <p>Aucun cookie publicitaire ni de mesure d'audience. Seuls des éléments strictement nécessaires sont stockés dans votre navigateur :</p>
      <ul>
        <li><code>sb-…-auth-token</code> — session de connexion (nécessaire, durée de la session).</li>
        <li><code>agroconnect-theme</code>, <code>agroconnect-lang</code> — vos préférences d'affichage (nécessaires).</li>
        <li><code>agroconnect-tour-completed</code> — mémorise la visite guidée (fonctionnel, soumis à consentement).</li>
        <li><code>agroconnect-cookie-consent</code> — mémorise votre choix (nécessaire, 6 mois).</li>
      </ul>
      <p><button onClick={reopenCookieBanner} className="underline">Modifier mes choix de cookies</button></p>
      <H>5. Destinataires</H>
      <p>Personnel habilité selon son rôle ; sous-traitants techniques (hébergement, base de données, IA). Aucune revente.</p>
      <H>6. Vos droits</H>
      <p>Accès, rectification, effacement, limitation, opposition, portabilité, et directives post-mortem. Écrivez à {LEGAL.dpoEmail}. Vous pouvez saisir la CNIL (www.cnil.fr) ou l'autorité locale compétente.</p>
    </Shell>
  );
}

export function LegalFooter() {
  return (
    <footer className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 justify-center py-3">
      <span>© {new Date().getFullYear()} AgroConnect</span>
      <Link to="/mentions-legales" className="hover:text-foreground underline-offset-2 hover:underline">Mentions légales</Link>
      <Link to="/confidentialite" className="hover:text-foreground underline-offset-2 hover:underline">Confidentialité</Link>
      <button onClick={reopenCookieBanner} className="hover:text-foreground hover:underline">Cookies</button>
    </footer>
  );
}
