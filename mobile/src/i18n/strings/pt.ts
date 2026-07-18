// Portuguese (Português, Brazil-leaning) — machine-drafted; unreviewed until a native speaker verifies.
import { Strings } from "./en";

export const pt: Strings = {
  meta: { nativeName: "Português", rtl: false, reviewed: false },

  app: {
    tagline: "Veja. Conheça. Fique em segurança.",
    demoMode: "Modo demo — veredictos de amostra para testes",
    machineTranslated: "Tradução automática — os passos críticos ainda não foram verificados por um falante nativo",
    language: "Idioma",
  },

  home: {
    emergencyTitle: "Alguém foi picado?",
    emergencySub: "Toque para primeiros socorros de emergência",
    checkTitle: "Verificar uma cobra",
    hint: "📏 Fique bem afastado e use o zoom — nunca se aproxime de uma cobra para uma foto melhor. Depois de fotografar, recorte bem junto à cobra para que ela preencha o quadro.",
    dropZone: "Sua foto aparecerá aqui",
    takePhoto: "📷  Tirar foto",
    upload: "Enviar",
    analyzing: "Verificando a foto…",
  },

  verdict: {
    dangerous: {
      label: "Risco alto",
      headline: "Trate como PERIGOSA — provavelmente venenosa",
      subtext: "Muito provavelmente é uma cobra venenosa ou perigosa. Mantenha bastante distância e não se aproxime.",
    },
    caution: {
      label: "Cautela",
      headline: "Melhor tratar com cautela — mantenha distância",
      subtext: "Há alguns sinais de risco, mas sem correspondência confiável de veneno. Afaste-se, não encurrale nem toque na cobra, e procure ajuda médica imediatamente em caso de picada.",
    },
    lowRisk: {
      label: "Risco menor",
      headline: "Provavelmente não venenosa — ainda assim mantenha distância",
      subtext: "Baixa probabilidade de veneno, mas nunca manuseie nem se aproxime de nenhuma cobra. Se for picado, procure atendimento médico imediatamente.",
    },
    unidentified: {
      label: "Não reconhecida",
      headline: "Não foi possível confirmar uma cobra — considere PERIGOSA",
      subtext: "Esta não parece uma foto clara de uma cobra reconhecível. Fotografe novamente de uma distância segura (use o zoom, não se aproxime). Na dúvida, fique longe e trate como perigosa.",
    },
  },

  confidence: {
    dangerous: "O Faunari estima uma chance alta (~{pct}%) de ser venenosa.",
    caution: "O Faunari estima ~{pct}% de chance de veneno — não é uma correspondência confiável, mas também não é baixa o bastante para descartar o risco. Trate com cautela.",
    lowRisk: "O Faunari estima uma chance baixa (~{pct}%) de veneno — mas nunca considere nenhuma cobra segura.",
    ood: "O Faunari não conseguiu confirmar uma cobra reconhecível nesta foto, então não está adivinhando.",
  },

  emergency: {
    headline: "Procure atendimento médico AGORA",
    steps: [
      "Ligue imediatamente para os serviços de emergência — disque {ambulance} para uma ambulância.",
      "Chegue o mais rápido e com segurança ao hospital mais próximo que tenha soro antiofídico.",
      "Mantenha a pessoa calma e o mais imóvel possível; tranquilize-a.",
      "Anote o horário da picada e quaisquer sintomas que mudem, para informar o médico.",
    ],
  },

  firstAid: {
    titleNow: "O que fazer agora",
    titleIfBitten: "Em caso de picada",
    emphasisDanger: "Procure atendimento médico AGORA — ligue {ambulance}.",
    emphasisCaution: "Trate toda picada de cobra como emergência — procure atendimento médico imediatamente ({ambulance}).",
    doLabel: "FAÇA",
    dontLabel: "NÃO FAÇA",
    do: [
      "Afaste todos da cobra até uma distância segura.",
      "Mantenha a pessoa picada calma e imóvel — o movimento espalha o veneno mais rápido.",
      "Mantenha o membro picado imóvel e aproximadamente na altura do coração; retire anéis, relógios e roupas apertadas.",
      "Vá imediatamente a um hospital com soro antiofídico; ligue {ambulance}.",
    ],
    dont: [
      "NÃO corte, sugue nem tente drenar o ferimento.",
      "NÃO aplique torniquete nem faixa apertada.",
      "NÃO aplique gelo, nem dê álcool, comida ou sedativos.",
      "NÃO tente capturar ou matar a cobra — uma foto nítida de distância segura é suficiente.",
      "NÃO perca tempo com remédios caseiros.",
    ],
    goodToKnow: "Bom saber",
    lowRiskNote: "Mesmo cobras de baixo risco podem picar. Não manuseie, não encurrale nem se aproxime. Dê espaço e deixe que ela se afaste sozinha.",
    whatToDo: "O que fazer",
    oodAdvice: "📷 Fotografe novamente de uma distância segura — use o zoom, não se aproxime. Se alguém foi picado, use o painel de emergência acima.",
  },

  feedback: {
    ask: "Isso foi útil?",
    yes: "👍  Parece certo",
    no: "👎  Não exatamente",
    disputeQ: "O que era, na verdade?",
    harmless: "Na verdade era inofensiva",
    dangerous: "Na verdade era perigosa",
    notASnake: "Não era uma cobra",
    thanks: "🙏 Obrigado — seu feedback ajuda o Faunari a melhorar.",
  },

  disclaimer:
    "O Faunari é um protótipo educacional, NÃO um dispositivo médico. Ele pode errar (pode deixar passar cobras perigosas). Nunca dependa dele para decisões médicas ou de segurança.",
};
