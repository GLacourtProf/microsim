import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { Input } from "@/components/ui/input";
import Micrometer, { formatMm, randomMeasurement } from "@/components/Micrometer";
import ScoreSheet, { computeScore } from "@/components/ScoreSheet";
import {
  RefreshCw,
  Home,
  Lightbulb,
  CheckCircle2,
  XCircle,
  FileText,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

// ── Stockage local (aucun serveur) ────────────────────────────────
const PROFILE_KEY = "micromeasure_profile";
const ATTEMPTS_KEY = "micromeasure_attempts";

type Profile = { nom: string; prenom: string; classe: string };
type Attempt = {
  at: number;
  trueValue: number;
  givenValue: number;
  correct: boolean;
  usedAide: boolean;
};

function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

function loadAttempts(): Attempt[] {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    return raw ? (JSON.parse(raw) as Attempt[]) : [];
  } catch {
    return [];
  }
}

function saveAttempt(a: Attempt) {
  const attempts = loadAttempts();
  attempts.push(a);
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
}

export default function Exercise() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(() => loadProfile());
  const [attempts, setAttempts] = useState<Attempt[]>(() => loadAttempts());
  const [started, setStarted] = useState<boolean>(() => loadProfile() !== null);

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [classe, setClasse] = useState("");

  const [value, setValue] = useState<number>(() => randomMeasurement());
  const [answer, setAnswer] = useState<string>("");
  const [result, setResult] = useState<null | "juste" | "faux">(null);
  const [expected, setExpected] = useState<number | null>(null);
  const [usedAide, setUsedAide] = useState(false);
  const [showAide, setShowAide] = useState(false);
  const [lock, setLock] = useState(false);
  const [showSheet, setShowSheet] = useState(false);

  const stats = useMemo(() => {
    const correct = attempts.filter((a) => a.correct).length;
    return { count: attempts.length, correct };
  }, [attempts]);

  const { percent } = useMemo(() => computeScore(attempts), [attempts]);

  // ── Formulaire de démarrage ──
  if (!started) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-lg font-medium tracking-tight">Mesures au micromètre</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Indiquez vos nom, prénom et classe pour commencer.
          </p>
          <div className="mt-8 space-y-3">
            <Input placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} />
            <Input placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
            <Input
              placeholder="Classe"
              value={classe}
              onChange={(e) => setClasse(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const p = { nom, prenom, classe };
                  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
                  setProfile(p);
                  setStarted(true);
                }
              }}
            />
            <Button
              className="w-full"
              onClick={() => {
                const p = { nom, prenom, classe };
                localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
                setProfile(p);
                setStarted(true);
              }}
            >
              Commencer
            </Button>
            <p className="pt-2 text-center text-xs text-muted-foreground">
              Aucune connexion requise. Rien n'est envoyé sur internet.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ── Vérification de la réponse ─────────────────────────────────
  function check() {
    if (lock) return;
    const given = Number(answer.trim().replace(",", "."));
    if (Number.isNaN(given)) return;
    const ok = Math.round(given * 100) === Math.round(value * 100);
    setResult(ok ? "juste" : "faux");
    setExpected(value);
    setLock(true);

    const attempt: Attempt = {
      at: Date.now(),
      trueValue: value,
      givenValue: given,
      correct: ok,
      usedAide,
    };
    saveAttempt(attempt);
    setAttempts((prev) => [...prev, attempt]);
  }

  const displayName = profile
    ? [profile.prenom, profile.nom].filter(Boolean).join(" ") +
      (profile.classe ? ` · ${profile.classe}` : "")
    : "Invité";

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="text-sm font-medium tracking-tight">Exerciceur · Micromètre 0–25 mm</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{displayName}</span>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <Home className="mr-1 h-3.5 w-3.5" />
              Accueil
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <Micrometer value={value} showAide={showAide} />

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Input
            className="w-40"
            placeholder="ex. 12,34"
            value={answer}
            inputMode="decimal"
            disabled={lock}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") check();
            }}
          />
          <span className="text-sm text-muted-foreground">mm</span>
          <Button onClick={check} disabled={lock || answer.trim() === ""}>
            Vérifier
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowAide((v) => !v);
              setUsedAide(true);
            }}
          >
            <Lightbulb className="mr-1 h-4 w-4" />
            {showAide ? "Masquer l'aide" : "Aide"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setValue(randomMeasurement());
              setAnswer("");
              setResult(null);
              setExpected(null);
              setLock(false);
              setShowAide(false);
              setUsedAide(false);
            }}
          >
            <RefreshCw className="mr-1 h-4 w-4" />
            Nouvelle mesure
          </Button>
          {result === "juste" && (
            <span className="ml-auto flex items-center gap-1.5 text-sm text-foreground">
              <CheckCircle2 className="h-4 w-4" /> Juste
            </span>
          )}
          {result === "faux" && (
            <span className="ml-auto flex items-center gap-1.5 text-sm text-destructive">
              <XCircle className="h-4 w-4" /> Faux
            </span>
          )}
        </div>

        {result && expected !== null && (
          <div className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
            Valeur mesurée : {formatMm(expected)} mm
          </div>
        )}

        {stats.count > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              Depuis le début : {stats.correct}/{stats.count} mesures justes — Score : {percent}%
            </p>
            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSheet(true)}
              >
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                Générer fiche
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm("Effacer l'historique enregistré sur cet appareil ?")) {
                    localStorage.removeItem(ATTEMPTS_KEY);
                    setAttempts([]);
                  }
                }}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Effacer l'historique
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Fiche de résultats */}
      {showSheet && profile && (
        <ScoreSheet
          profile={profile}
          attempts={attempts}
          scorePercent={percent}
        />
      )}
    </main>
  );
}
