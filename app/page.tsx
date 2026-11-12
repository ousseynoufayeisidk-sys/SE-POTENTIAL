export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-step-4 font-display font-bold text-baobab mb-6">
          SE-POTENTIAL 360°
        </h1>
        <p className="text-step-1 mb-8 text-nuit/80 max-w-measure mx-auto">
          Détecter, évaluer et accompagner les entrepreneurs à fort potentiel au Sénégal
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/candidater"
            className="px-8 py-3 bg-baobab text-white rounded-md hover:bg-baobab/90 transition-colors font-medium"
          >
            Commencer ma candidature
          </a>
          <a
            href="/evaluateur"
            className="px-8 py-3 border-2 border-ocean text-ocean rounded-md hover:bg-ocean/5 transition-colors font-medium"
          >
            Espace évaluateur
          </a>
        </div>
      </div>
    </div>
  );
}
