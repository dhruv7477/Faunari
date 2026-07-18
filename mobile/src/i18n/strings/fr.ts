// French (Français) — machine-drafted; unreviewed until a native speaker verifies. Placeholders stay.
import { Strings } from "./en";

export const fr: Strings = {
  meta: { nativeName: "Français", rtl: false, reviewed: false },

  app: {
    tagline: "Voyez-le. Reconnaissez-le. Restez en sécurité.",
    demoMode: "Mode démo — verdicts d'exemple pour les tests",
    machineTranslated: "Traduction automatique — les étapes critiques n'ont pas encore été vérifiées par un locuteur natif",
    language: "Langue",
  },

  home: {
    emergencyTitle: "Quelqu'un a été mordu ?",
    emergencySub: "Touchez pour les premiers secours d'urgence",
    checkTitle: "Vérifier un serpent",
    hint: "📏 Restez bien à distance et zoomez — ne vous approchez jamais d'un serpent pour une meilleure photo. Après la prise, recadrez au plus près du serpent pour qu'il remplisse l'image.",
    dropZone: "Votre photo apparaîtra ici",
    takePhoto: "📷  Prendre une photo",
    upload: "Importer",
    analyzing: "Analyse de la photo…",
  },

  verdict: {
    dangerous: {
      label: "Risque élevé",
      headline: "À traiter comme DANGEREUX — probablement venimeux",
      subtext: "Il s'agit très probablement d'un serpent venimeux ou dangereux. Restez bien à l'écart et ne vous approchez pas.",
    },
    caution: {
      label: "Prudence",
      headline: "À traiter avec prudence — gardez vos distances",
      subtext: "Quelques signes de risque, mais pas de correspondance sûre avec un venin. Restez à l'écart, ne l'acculez pas et ne le touchez pas ; en cas de morsure, consultez immédiatement un médecin.",
    },
    lowRisk: {
      label: "Risque plus faible",
      headline: "Probablement non venimeux — gardez tout de même vos distances",
      subtext: "Faible probabilité de venin, mais ne manipulez jamais un serpent et ne vous en approchez pas. En cas de morsure, consultez immédiatement un médecin.",
    },
    unidentified: {
      label: "Non reconnu",
      headline: "Serpent non confirmé — considérez-le comme DANGEREUX",
      subtext: "Ceci ne ressemble pas à une photo nette d'un serpent reconnaissable. Reprenez la photo à distance de sécurité (zoomez, ne vous approchez pas). Dans le doute, restez à l'écart et considérez-le comme dangereux.",
    },
  },

  confidence: {
    dangerous: "Faunari estime une probabilité élevée (~{pct}%) que ce serpent soit venimeux.",
    caution: "Faunari estime ~{pct}% de probabilité de venin — pas de correspondance sûre, mais pas assez faible pour écarter le risque. Restez prudent.",
    lowRisk: "Faunari estime une faible probabilité (~{pct}%) de venin — mais ne considérez jamais un serpent comme sûr.",
    ood: "Faunari n'a pas pu confirmer un serpent reconnaissable sur cette photo, il ne devine donc pas.",
  },

  emergency: {
    headline: "Consultez un médecin MAINTENANT",
    steps: [
      "Appelez immédiatement les urgences — composez le {ambulance} pour une ambulance.",
      "Rejoignez aussi vite que possible, en sécurité, l'hôpital le plus proche disposant d'antivenin.",
      "Gardez la personne calme et aussi immobile que possible ; rassurez-la.",
      "Notez l'heure de la morsure et tout symptôme évolutif pour en informer le médecin.",
    ],
  },

  firstAid: {
    titleNow: "Que faire maintenant",
    titleIfBitten: "En cas de morsure",
    emphasisDanger: "Consultez un médecin MAINTENANT — appelez le {ambulance}.",
    emphasisCaution: "Traitez toute morsure de serpent comme une urgence — consultez immédiatement ({ambulance}).",
    doLabel: "À FAIRE",
    dontLabel: "À ÉVITER",
    do: [
      "Éloignez tout le monde du serpent, à distance de sécurité.",
      "Gardez la personne mordue calme et immobile — les mouvements accélèrent la diffusion du venin.",
      "Immobilisez le membre mordu, à peu près au niveau du cœur ; retirez bagues, montres et vêtements serrés.",
      "Rendez-vous immédiatement dans un hôpital disposant d'antivenin ; appelez le {ambulance}.",
    ],
    dont: [
      "NE PAS inciser, aspirer ni tenter de drainer la plaie.",
      "NE PAS poser de garrot ni de bande serrée.",
      "NE PAS appliquer de glace, ni donner d'alcool, de nourriture ou de sédatifs.",
      "NE PAS tenter d'attraper ou de tuer le serpent — une photo nette à distance de sécurité suffit.",
      "NE PAS perdre de temps avec des remèdes traditionnels.",
    ],
    goodToKnow: "Bon à savoir",
    lowRiskNote: "Même les serpents à faible risque peuvent mordre. Ne le manipulez pas, ne l'acculez pas, ne vous approchez pas. Laissez-lui de l'espace et laissez-le partir de lui-même.",
    whatToDo: "Que faire",
    oodAdvice: "📷 Reprenez la photo à distance de sécurité — zoomez, ne vous approchez pas. Si quelqu'un a été mordu, utilisez le panneau d'urgence ci-dessus.",
  },

  feedback: {
    ask: "Cela vous a-t-il aidé ?",
    yes: "👍  Ça semble juste",
    no: "👎  Pas vraiment",
    disputeQ: "Qu'était-ce en réalité ?",
    harmless: "C'était en réalité inoffensif",
    dangerous: "C'était en réalité dangereux",
    notASnake: "Ce n'était pas un serpent",
    thanks: "🙏 Merci — vos retours aident Faunari à s'améliorer.",
  },

  disclaimer:
    "Faunari est un prototype éducatif, PAS un dispositif médical. Il peut se tromper (et manquer des serpents dangereux). Ne vous y fiez jamais pour des décisions médicales ou de sécurité.",
};
