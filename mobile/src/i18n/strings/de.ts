// German (Deutsch) — machine-drafted; unreviewed until a native speaker verifies. Placeholders stay.
import { Strings } from "./en";

export const de: Strings = {
  meta: { nativeName: "Deutsch", rtl: false, reviewed: false },

  app: {
    tagline: "Sieh sie. Erkenne sie. Bleib sicher.",
    demoMode: "Demo-Modus — Beispielergebnisse zum Testen",
    machineTranslated: "Maschinell übersetzt — kritische Schritte wurden noch nicht von Muttersprachlern geprüft",
    language: "Sprache",
  },

  home: {
    emergencyTitle: "Wurde jemand gebissen?",
    emergencySub: "Tippen für Notfall-Erste-Hilfe",
    checkTitle: "Schlange prüfen",
    hint: "📏 Halte großen Abstand und zoome heran — nähere dich niemals einer Schlange für ein besseres Foto. Schneide das Bild danach eng um die Schlange zu, sodass sie den Rahmen ausfüllt.",
    dropZone: "Dein Foto erscheint hier",
    takePhoto: "📷  Foto aufnehmen",
    upload: "Hochladen",
    analyzing: "Foto wird geprüft…",
  },

  verdict: {
    dangerous: {
      label: "Hohes Risiko",
      headline: "Als GEFÄHRLICH behandeln — wahrscheinlich giftig",
      subtext: "Dies ist höchstwahrscheinlich eine giftige oder gefährliche Schlange. Halte großen Abstand und nähere dich nicht.",
    },
    caution: {
      label: "Vorsicht",
      headline: "Mit Vorsicht behandeln — Abstand halten",
      subtext: "Es gibt einige Risikoanzeichen, aber keine sichere Gift-Übereinstimmung. Bleib fern, bedränge und berühre sie nicht; bei einem Biss sofort ärztliche Hilfe suchen.",
    },
    lowRisk: {
      label: "Geringeres Risiko",
      headline: "Wahrscheinlich ungiftig — trotzdem Abstand halten",
      subtext: "Geringe Giftwahrscheinlichkeit, aber fasse niemals eine Schlange an und nähere dich ihr nicht. Bei einem Biss sofort ärztliche Hilfe suchen.",
    },
    unidentified: {
      label: "Nicht erkannt",
      headline: "Keine Schlange bestätigt — als GEFÄHRLICH annehmen",
      subtext: "Dies scheint kein klares Foto einer erkennbaren Schlange zu sein. Fotografiere erneut aus sicherer Entfernung (zoomen, nicht nähern). Im Zweifel fernbleiben und als gefährlich behandeln.",
    },
  },

  confidence: {
    dangerous: "Faunari schätzt eine hohe Wahrscheinlichkeit (~{pct}%), dass sie giftig ist.",
    caution: "Faunari schätzt ~{pct}% Giftwahrscheinlichkeit — keine sichere Übereinstimmung, aber nicht niedrig genug, um das Risiko auszuschließen. Sei vorsichtig.",
    lowRisk: "Faunari schätzt eine geringe Giftwahrscheinlichkeit (~{pct}%) — aber betrachte niemals eine Schlange als sicher.",
    ood: "Faunari konnte auf diesem Foto keine erkennbare Schlange bestätigen und rät daher nicht.",
  },

  emergency: {
    headline: "JETZT ärztliche Hilfe suchen",
    steps: [
      "Rufe sofort den Notruf — wähle {ambulance} für einen Rettungswagen.",
      "Erreiche so schnell wie sicher möglich das nächste Krankenhaus mit Antivenin.",
      "Halte die Person ruhig und so bewegungslos wie möglich; beruhige sie.",
      "Notiere die Uhrzeit des Bisses und sich verändernde Symptome für die Ärzte.",
    ],
  },

  firstAid: {
    titleNow: "Was jetzt zu tun ist",
    titleIfBitten: "Bei einem Biss",
    emphasisDanger: "JETZT ärztliche Hilfe suchen — rufe {ambulance}.",
    emphasisCaution: "Behandle jeden Schlangenbiss als Notfall — sofort ärztliche Hilfe suchen ({ambulance}).",
    doLabel: "TUN",
    dontLabel: "NICHT TUN",
    do: [
      "Bringe alle in sicheren Abstand zur Schlange.",
      "Halte die gebissene Person ruhig und still — Bewegung verteilt das Gift schneller.",
      "Halte die gebissene Gliedmaße ruhig, etwa auf Herzhöhe; entferne Ringe, Uhren und enge Kleidung.",
      "Fahre sofort in ein Krankenhaus mit Antivenin; rufe {ambulance}.",
    ],
    dont: [
      "NICHT die Wunde einschneiden, aussaugen oder ausdrücken.",
      "KEIN Abbinden (Tourniquet) und keine engen Bandagen.",
      "KEIN Eis auflegen; keinen Alkohol, kein Essen, keine Beruhigungsmittel geben.",
      "NICHT versuchen, die Schlange zu fangen oder zu töten — ein klares Foto aus sicherer Entfernung genügt.",
      "KEINE Zeit mit Hausmitteln verlieren.",
    ],
    goodToKnow: "Gut zu wissen",
    lowRiskNote: "Auch Schlangen mit geringem Risiko können beißen. Nicht anfassen, nicht bedrängen, nicht nähern. Gib ihr Raum und lass sie von selbst verschwinden.",
    whatToDo: "Was zu tun ist",
    oodAdvice: "📷 Fotografiere erneut aus sicherer Entfernung — zoomen, nicht nähern. Wurde jemand gebissen, nutze das Notfall-Panel oben.",
  },

  feedback: {
    ask: "War das hilfreich?",
    yes: "👍  Wirkt richtig",
    no: "👎  Nicht ganz",
    disputeQ: "Was war es wirklich?",
    harmless: "Sie war in Wirklichkeit harmlos",
    dangerous: "Sie war in Wirklichkeit gefährlich",
    notASnake: "Es war keine Schlange",
    thanks: "🙏 Danke — dein Feedback macht Faunari besser.",
  },

  disclaimer:
    "Faunari ist ein Lernprototyp, KEIN Medizinprodukt. Es kann sich irren (und gefährliche Schlangen übersehen). Verlasse dich niemals darauf bei medizinischen oder Sicherheitsentscheidungen.",
};
