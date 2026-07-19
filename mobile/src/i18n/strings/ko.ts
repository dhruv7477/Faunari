// Korean (한국어) — machine-drafted; unreviewed until a native speaker verifies. Placeholders stay.
import { Strings } from "./en";

export const ko: Strings = {
  meta: { nativeName: "한국어", rtl: false, reviewed: false },

  app: {
    tagline: "발견하고, 알아보고, 안전하게.",
    demoMode: "데모 모드 — 테스트용 샘플 판정",
    machineTranslated: "기계 번역 — 중요한 단계는 아직 원어민의 검증을 받지 않았습니다",
    language: "언어",
  },

  home: {
    emergencyTitle: "누군가 물렸나요?",
    emergencySub: "응급 처치를 보려면 탭하세요",
    checkTitle: "뱀 확인하기",
    hint: "📏 멀리 떨어져 줌을 사용하세요 — 더 좋은 사진을 위해 뱀에게 다가가지 마세요. 촬영 후에는 뱀이 화면을 가득 채우도록 바짝 잘라내세요.",
    dropZone: "사진이 여기에 표시됩니다",
    takePhoto: "📷  사진 촬영",
    upload: "업로드",
    analyzing: "사진 확인 중…",
  },

  verdict: {
    dangerous: {
      label: "고위험",
      headline: "위험한 뱀으로 간주하세요 — 독사일 가능성이 높음",
      subtext: "독사이거나 위험한 뱀일 가능성이 매우 높습니다. 충분히 떨어져 있고 절대 다가가지 마세요.",
    },
    caution: {
      label: "주의",
      headline: "조심해서 대하세요 — 거리를 유지하세요",
      subtext: "위험 징후가 일부 있지만 독사로 확정할 수는 없습니다. 떨어져 있고, 몰아붙이거나 만지지 마세요. 물렸다면 즉시 의료 도움을 받으세요.",
    },
    lowRisk: {
      label: "저위험",
      headline: "독이 없을 가능성이 높음 — 그래도 거리를 유지하세요",
      subtext: "독 가능성은 낮지만, 어떤 뱀도 절대 만지거나 다가가지 마세요. 물렸다면 즉시 진료를 받으세요.",
    },
    unidentified: {
      label: "식별 불가",
      headline: "뱀을 확인할 수 없음 — 위험한 것으로 간주하세요",
      subtext: "식별 가능한 뱀의 선명한 사진이 아닌 것 같습니다. 안전한 거리에서 다시 촬영하세요(줌 사용, 접근 금지). 확실하지 않으면 멀리 떨어져 위험한 것으로 간주하세요.",
    },
  },

  confidence: {
    dangerous: "Faunari는 독사일 가능성이 높다고(약 {pct}%) 추정합니다.",
    caution: "Faunari는 독 가능성을 약 {pct}%로 추정합니다 — 확실하진 않지만 위험을 배제할 만큼 낮지도 않습니다. 주의하세요.",
    lowRisk: "Faunari는 독 가능성이 낮다고(약 {pct}%) 추정합니다 — 그래도 어떤 뱀도 안전하다고 여기지 마세요.",
    ood: "Faunari는 이 사진에서 식별 가능한 뱀을 확인하지 못해 추측하지 않습니다.",
  },

  emergency: {
    headline: "지금 즉시 병원으로",
    steps: [
      "즉시 응급 서비스에 전화하세요 — 구급차는 {ambulance}.",
      "해독제(항사독소)가 있는 가장 가까운 병원으로 안전하게 최대한 빨리 이동하세요.",
      "환자를 진정시키고 최대한 움직이지 않게 하세요. 안심시켜 주세요.",
      "물린 시각과 변하는 증상을 기록해 의사에게 알려주세요.",
    ],
  },

  firstAid: {
    titleNow: "지금 해야 할 일",
    titleIfBitten: "물렸다면",
    emphasisDanger: "지금 즉시 병원으로 — {ambulance}에 전화하세요.",
    emphasisCaution: "모든 뱀물림은 응급 상황입니다 — 즉시 진료를 받으세요({ambulance}).",
    doLabel: "해야 할 것",
    dontLabel: "하지 말 것",
    do: [
      "모두를 뱀에게서 안전한 거리로 이동시키세요.",
      "물린 사람을 진정시키고 움직이지 않게 하세요 — 움직이면 독이 더 빨리 퍼집니다.",
      "물린 부위를 움직이지 않게 하고 심장 높이 정도로 유지하세요. 반지, 시계, 꽉 끼는 옷을 제거하세요.",
      "항사독소가 있는 병원으로 즉시 가세요. {ambulance}에 전화하세요.",
    ],
    dont: [
      "상처를 절개하거나 빨거나 독을 짜내려 하지 마세요.",
      "지혈대나 꽉 조이는 붕대를 사용하지 마세요.",
      "얼음을 대거나 술·음식·진정제를 주지 마세요.",
      "뱀을 잡거나 죽이려 하지 마세요 — 안전한 거리에서 찍은 선명한 사진이면 충분합니다.",
      "민간요법에 시간을 낭비하지 마세요.",
    ],
    goodToKnow: "알아두면 좋아요",
    lowRiskNote: "저위험 뱀도 물 수 있습니다. 만지거나 몰아붙이거나 다가가지 마세요. 공간을 주고 스스로 떠나게 두세요.",
    whatToDo: "어떻게 해야 하나요",
    oodAdvice: "📷 안전한 거리에서 다시 촬영하세요 — 줌을 사용하고 다가가지 마세요. 물린 사람이 있다면 위의 응급 패널을 이용하세요.",
  },

  feedback: {
    ask: "도움이 되었나요?",
    yes: "👍  맞는 것 같아요",
    no: "👎  좀 아니에요",
    disputeQ: "실제로는 무엇이었나요?",
    harmless: "실제로는 무해했어요",
    dangerous: "실제로는 위험했어요",
    notASnake: "뱀이 아니었어요",
    thanks: "🙏 감사합니다 — 의견은 Faunari 개선에 도움이 됩니다.",
  },

  disclaimer:
    "Faunari는 교육용 프로토타입이며 의료기기가 아닙니다. 오류가 있을 수 있습니다(위험한 뱀을 놓칠 수 있음). 의료·안전 결정에 절대 의존하지 마세요.",
};
