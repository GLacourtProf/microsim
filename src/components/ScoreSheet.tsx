import { formatMm } from "@/components/Micrometer";

type Profile = { nom: string; prenom: string; classe: string };
type Attempt = {
  at: number;
  trueValue: number;
  givenValue: number;
  correct: boolean;
  usedAide: boolean;
};

type ScoreSheetProps = {
  profile: Profile;
  attempts: Attempt[];
  scorePercent: number;
};

export function computeScore(attempts: Attempt[]): {
  totalPoints: number;
  maxPoints: number;
  percent: number;
} {
  if (attempts.length === 0) return { totalPoints: 0, maxPoints: 0, percent: 0 };

  let totalPoints = 0;
  for (const a of attempts) {
    const diff = Math.abs(a.givenValue - a.trueValue);
    if (diff < 0.005) {
      // Exact (±0.01mm) → 100 points
      totalPoints += 100;
    } else if (diff < 0.105) {
      // Within 0.1mm → 50 points
      totalPoints += 50;
    } else if (diff < 1.005) {
      // Within 1mm → 25 points
      totalPoints += 25;
    }
    // >1mm → 0 points
  }

  const maxPoints = attempts.length * 100;
  const percent = Math.round((totalPoints / maxPoints) * 100);
  return { totalPoints, maxPoints, percent };
}

export default function ScoreSheet({ profile, attempts, scorePercent }: ScoreSheetProps) {
  const correctExact = attempts.filter(
    (a) => Math.abs(a.givenValue - a.trueValue) < 0.005
  ).length;
  const correctDeci = attempts.filter(
    (a) => Math.abs(a.givenValue - a.trueValue) >= 0.005 && Math.abs(a.givenValue - a.trueValue) < 0.105
  ).length;
  const correctMm = attempts.filter(
    (a) => Math.abs(a.givenValue - a.trueValue) >= 0.105 && Math.abs(a.givenValue - a.trueValue) < 1.005
  ).length;
  const wrong = attempts.filter(
    (a) => Math.abs(a.givenValue - a.trueValue) >= 1.005
  ).length;
  const usedAide = attempts.filter((a) => a.usedAide).length;

  return (
    <div
      id="score-sheet"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 print:static print:bg-white print:z-auto"
    >
      <div className="w-full max-w-lg bg-background p-8 shadow-lg print:shadow-none print:p-0 print:w-full print:max-w-none">
        {/* En-tête */}
        <div className="text-center border-b border-border pb-4 mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Métrologie</p>
          <h2 className="mt-2 text-lg font-semibold">Fiche de résultats — Micromètre</h2>
          <p className="text-xs text-muted-foreground mt-1">0 à 25 mm · au 1/100</p>
        </div>

        {/* Informations élève */}
        <div className="grid grid-cols-3 gap-4 text-sm border-b border-border pb-4 mb-4">
          <div>
            <span className="text-muted-foreground text-xs">Nom</span>
            <p className="font-medium">{profile.nom || "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Prénom</span>
            <p className="font-medium">{profile.prenom || "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Classe</span>
            <p className="font-medium">{profile.classe || "—"}</p>
          </div>
        </div>

        {/* Score global */}
        <div className="text-center py-6 border-b border-border mb-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Score</p>
          <p className="mt-1 text-4xl font-bold tabular-nums">{scorePercent}%</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {attempts.length} tentative{attempts.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Détail */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Exact (±0,01 mm)</span>
            <span className="font-medium tabular-nums">{correctExact}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">±0,1 mm</span>
            <span className="font-medium tabular-nums">{correctDeci}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">±1 mm</span>
            <span className="font-medium tabular-nums">{correctMm}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Faux (&gt;1 mm)</span>
            <span className="font-medium tabular-nums">{wrong}</span>
          </div>
          <div className="flex justify-between col-span-2 border-t border-border pt-2">
            <span className="text-muted-foreground">Aide utilisée</span>
            <span className="font-medium tabular-nums">{usedAide} fois</span>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-2 mt-6 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex-1 px-4 py-2 bg-foreground text-background text-sm font-medium hover:opacity-90"
          >
            Imprimer / PDF
          </button>
          <button
            onClick={() => {
              const el = document.getElementById("score-sheet");
              if (el) el.remove();
            }}
            className="px-4 py-2 border border-border text-sm font-medium hover:bg-muted"
          >
            Fermer
          </button>
        </div>

        {/* Date */}
        <p className="text-xs text-muted-foreground text-center mt-4 print:mt-2">
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
