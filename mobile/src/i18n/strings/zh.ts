// Chinese, Simplified (简体中文) — machine-drafted; unreviewed until a native speaker verifies.
import { Strings } from "./en";

export const zh: Strings = {
  meta: { nativeName: "简体中文", rtl: false, reviewed: false },

  app: {
    tagline: "看见它。认识它。保持安全。",
    demoMode: "演示模式 — 用于测试的示例判定",
    machineTranslated: "机器翻译 — 关键步骤尚未经母语者核实",
    language: "语言",
  },

  home: {
    emergencyTitle: "有人被咬了吗？",
    emergencySub: "点击查看紧急急救",
    checkTitle: "检查蛇类",
    hint: "📏 保持距离并使用变焦 — 千万不要为了拍得更清楚而靠近蛇。拍摄后请紧贴蛇裁剪，让它充满整个画面。",
    dropZone: "你的照片将显示在这里",
    takePhoto: "📷  拍照",
    upload: "上传",
    analyzing: "正在检查照片…",
  },

  verdict: {
    dangerous: {
      label: "高风险",
      headline: "按危险处理 — 很可能有毒",
      subtext: "这很可能是有毒或危险的蛇。请保持足够距离，不要靠近。",
    },
    caution: {
      label: "谨慎",
      headline: "最好谨慎对待 — 保持距离",
      subtext: "存在一些风险迹象，但无法确定是否有毒。请远离，不要围堵或触碰它；若被咬伤，请立即就医。",
    },
    lowRisk: {
      label: "较低风险",
      headline: "可能无毒 — 仍请保持距离",
      subtext: "有毒的可能性较低，但绝不要触碰或靠近任何蛇。若被咬伤，请立即就医。",
    },
    unidentified: {
      label: "无法识别",
      headline: "无法确认是蛇 — 请按危险处理",
      subtext: "这看起来不像一张清晰可识别的蛇类照片。请在安全距离重新拍摄（使用变焦，不要靠近）。拿不准时，请远离并按危险对待。",
    },
  },

  confidence: {
    dangerous: "Faunari 估计它有毒的可能性较高（约{pct}%）。",
    caution: "Faunari 估计有毒的可能性约为{pct}% — 并非确定匹配，但也不低到可以排除风险。请谨慎对待。",
    lowRisk: "Faunari 估计有毒的可能性较低（约{pct}%）— 但绝不要把任何蛇当作安全的。",
    ood: "Faunari 无法在这张照片中确认可识别的蛇，因此不作猜测。",
  },

  emergency: {
    headline: "立即就医",
    steps: [
      "立即拨打急救电话 — 呼叫救护车请拨 {ambulance}。",
      "在确保安全的前提下，尽快前往最近的备有抗蛇毒血清的医院。",
      "让伤者保持冷静、尽量不动；安抚情绪。",
      "记录被咬时间和不断变化的症状，以便告知医生。",
    ],
  },

  firstAid: {
    titleNow: "现在该怎么做",
    titleIfBitten: "若被咬伤",
    emphasisDanger: "立即就医 — 拨打 {ambulance}。",
    emphasisCaution: "把任何蛇咬伤都当作紧急情况 — 立即就医（{ambulance}）。",
    doLabel: "应做",
    dontLabel: "不要做",
    do: [
      "让所有人远离蛇，撤到安全距离。",
      "让伤者保持冷静、静止 — 活动会加速毒液扩散。",
      "让被咬肢体保持不动，大致与心脏同高；摘下戒指、手表，脱去紧身衣物。",
      "立即前往备有抗蛇毒血清的医院；拨打 {ambulance}。",
    ],
    dont: [
      "不要切开、吸吮或试图排出伤口毒液。",
      "不要使用止血带或紧束带。",
      "不要冰敷，不要给酒精、食物或镇静药物。",
      "不要试图捕捉或打死蛇 — 在安全距离拍一张清晰照片就足够了。",
      "不要在土方偏方上浪费时间。",
    ],
    goodToKnow: "须知",
    lowRiskNote: "即使低风险的蛇也可能咬人。不要触碰、围堵或靠近它。给它空间，让它自行离开。",
    whatToDo: "该怎么做",
    oodAdvice: "📷 请在安全距离重新拍摄 — 使用变焦，不要靠近。若有人被咬伤，请使用上方的紧急面板。",
  },

  feedback: {
    ask: "这有帮助吗？",
    yes: "👍  看起来对",
    no: "👎  不太对",
    disputeQ: "它实际上是什么？",
    harmless: "它其实无害",
    dangerous: "它其实危险",
    notASnake: "它不是蛇",
    thanks: "🙏 谢谢 — 你的反馈会帮助 Faunari 变得更好。",
  },

  disclaimer:
    "Faunari 是教育原型，不是医疗器械。它可能出错（可能漏判危险蛇类）。切勿依赖它做出医疗或安全决定。",
};
