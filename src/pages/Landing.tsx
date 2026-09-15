import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

export default function Landing() {
  const navigate = useNavigate();

  const steps = [
    {
      n: "01",
      t: "Règle graduée",
      d: "Les millimètres entiers au-dessus de la ligne, les ½ mm en dessous. Chaque ouverture révèle la règle.",
    },
    {
      n: "02",
      t: "Tambour",
      d: "50 divisions d'un pas de 0,5 mm : chaque division vaut 0,01 mm.",
    },
    {
      n: "03",
      t: "Vérification",
      d: "Indiquez la valeur en mm ; l'exerciceur corrige et affiche votre score.",
    },
  ] as const;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen flex-col bg-background"
    >
      {/* En-tête */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center border border-foreground/20 text-[10px] font-medium">Ø</div>
            <span className="text-sm font-medium tracking-tight">Micromètre · Exerciceur</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 items-center">
        <div className="mx-auto w-full max-w-4xl px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Métrologie · 0 à 25 mm · au 1/100
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
            Savoir lire un micromètre, au centième près.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Une mesure est tirée au hasard sur le tambour. À vous de la lire :
            millimètres sur la règle, centièmes sur le tambour. L'aide met en
            surbrillance la graduation alignée — sans donner la valeur.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => navigate("/exercise")}>
              Commencer l'exercice
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground">
              Saisissez votre nom, prénom et classe — puis commencez.
            </p>
          </div>
        </div>
      </section>

      {/* Lecture expliquée */}
      <section className="border-t border-border">
        <div className="mx-auto grid max-w-4xl gap-10 px-6 py-16 sm:grid-cols-3">
          {steps.map((item) => (
            <div key={item.n}>
              <div className="text-xs text-muted-foreground tabular-nums">{item.n}</div>
              <h3 className="mt-2 text-sm font-medium">{item.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pied de page */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-center px-6 py-5">
          <p className="text-xs text-muted-foreground">BTS / Lycée professionnel · Métrologie</p>
        </div>
      </footer>
    </motion.main>
  );
}
