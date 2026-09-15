export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Erreur 404</p>
      <h1 className="mt-3 text-2xl font-medium tracking-tight">Page introuvable</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        La page demandée n'existe pas ou a été déplacée.
      </p>
      <a href="/" className="mt-6 text-sm underline underline-offset-4 hover:text-foreground">
        Retour au menu principal
      </a>
    </main>
  );
}
