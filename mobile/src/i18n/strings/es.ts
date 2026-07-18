// Spanish (Español) — machine-drafted; unreviewed until a native speaker verifies. Placeholders stay.
import { Strings } from "./en";

export const es: Strings = {
  meta: { nativeName: "Español", rtl: false, reviewed: false },

  app: {
    tagline: "Míralo. Conócelo. Mantente a salvo.",
    demoMode: "Modo demo — veredictos de muestra para pruebas",
    machineTranslated: "Traducción automática — los pasos críticos aún no han sido verificados por un hablante nativo",
    language: "Idioma",
  },

  home: {
    emergencyTitle: "¿Alguien fue mordido?",
    emergencySub: "Toca para primeros auxilios de emergencia",
    checkTitle: "Analizar una serpiente",
    hint: "📏 Mantente bien lejos y usa el zoom — nunca te acerques a una serpiente para una mejor foto. Después de disparar, recorta la imagen ajustada a la serpiente para que llene el encuadre.",
    dropZone: "Tu foto aparecerá aquí",
    takePhoto: "📷  Tomar foto",
    upload: "Subir",
    analyzing: "Analizando la foto…",
  },

  verdict: {
    dangerous: {
      label: "Riesgo alto",
      headline: "Trátala como PELIGROSA — probablemente venenosa",
      subtext: "Lo más probable es que sea una serpiente venenosa o peligrosa. Mantente bien alejado y no te acerques.",
    },
    caution: {
      label: "Precaución",
      headline: "Mejor tratarla con precaución — mantén la distancia",
      subtext: "Hay algunos indicios de riesgo, pero sin una coincidencia clara de veneno. Aléjate, no la acorrales ni la toques, y busca ayuda médica de inmediato si hay mordedura.",
    },
    lowRisk: {
      label: "Riesgo menor",
      headline: "Probablemente no venenosa — aun así mantén la distancia",
      subtext: "Baja probabilidad de veneno, pero nunca manipules ni te acerques a ninguna serpiente. Si te muerde, busca atención médica de inmediato.",
    },
    unidentified: {
      label: "No reconocida",
      headline: "No se pudo confirmar una serpiente — asume que es PELIGROSA",
      subtext: "Esta no parece una foto clara de una serpiente reconocible. Vuelve a fotografiar desde una distancia segura (usa el zoom, no te acerques). Ante la duda, mantente lejos y trátala como peligrosa.",
    },
  },

  confidence: {
    dangerous: "Faunari estima una probabilidad alta (~{pct}%) de que sea venenosa.",
    caution: "Faunari estima ~{pct}% de probabilidad de veneno — no es una coincidencia segura, pero tampoco tan baja como para descartar el riesgo. Trátala con precaución.",
    lowRisk: "Faunari estima una probabilidad baja (~{pct}%) de veneno — pero nunca consideres segura a ninguna serpiente.",
    ood: "Faunari no pudo confirmar una serpiente reconocible en esta foto, así que no está adivinando.",
  },

  emergency: {
    headline: "Busca atención médica AHORA",
    steps: [
      "Llama a los servicios de emergencia de inmediato — marca {ambulance} para una ambulancia.",
      "Llega lo antes posible, con seguridad, al hospital más cercano que tenga antiveneno.",
      "Mantén a la persona calmada y lo más quieta posible; tranquilízala.",
      "Anota la hora de la mordedura y cualquier síntoma cambiante para informar al médico.",
    ],
  },

  firstAid: {
    titleNow: "Qué hacer ahora",
    titleIfBitten: "Si hay mordedura",
    emphasisDanger: "Busca atención médica AHORA — llama al {ambulance}.",
    emphasisCaution: "Trata toda mordedura de serpiente como una emergencia — busca atención médica de inmediato ({ambulance}).",
    doLabel: "SÍ",
    dontLabel: "NO",
    do: [
      "Aleja a todos de la serpiente hasta una distancia segura.",
      "Mantén a la persona mordida calmada y quieta — el movimiento propaga el veneno más rápido.",
      "Mantén la extremidad mordida inmóvil y aproximadamente a la altura del corazón; quita anillos, relojes y ropa ajustada.",
      "Ve de inmediato a un hospital con antiveneno; llama al {ambulance}.",
    ],
    dont: [
      "NO cortes, succiones ni intentes drenar la herida.",
      "NO apliques un torniquete ni una banda apretada.",
      "NO apliques hielo, ni des alcohol, comida o sedantes.",
      "NO intentes atrapar ni matar a la serpiente — basta una foto clara desde una distancia segura.",
      "NO pierdas tiempo en remedios caseros.",
    ],
    goodToKnow: "Bueno saberlo",
    lowRiskNote: "Incluso las serpientes de bajo riesgo pueden morder. No la manipules, no la acorrales ni te acerques. Dale espacio y deja que se aleje sola.",
    whatToDo: "Qué hacer",
    oodAdvice: "📷 Vuelve a fotografiar desde una distancia segura — usa el zoom, no te acerques. Si alguien fue mordido, usa el panel de emergencia de arriba.",
  },

  feedback: {
    ask: "¿Te resultó útil?",
    yes: "👍  Parece correcto",
    no: "👎  No del todo",
    disputeQ: "¿Qué era en realidad?",
    harmless: "En realidad era inofensiva",
    dangerous: "En realidad era peligrosa",
    notASnake: "No era una serpiente",
    thanks: "🙏 Gracias — tus comentarios ayudan a mejorar Faunari.",
  },

  disclaimer:
    "Faunari es un prototipo educativo, NO un dispositivo médico. Puede equivocarse (podría pasar por alto serpientes peligrosas). Nunca dependas de él para decisiones médicas o de seguridad.",
};
