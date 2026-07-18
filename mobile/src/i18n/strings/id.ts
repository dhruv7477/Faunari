// Indonesian (Bahasa Indonesia) — machine-drafted; unreviewed until a native speaker verifies.
import { Strings } from "./en";

export const id: Strings = {
  meta: { nativeName: "Bahasa Indonesia", rtl: false, reviewed: false },

  app: {
    tagline: "Lihat. Kenali. Tetap aman.",
    demoMode: "Mode demo — hasil contoh untuk pengujian",
    machineTranslated: "Terjemahan mesin — langkah-langkah penting belum diverifikasi penutur asli",
    language: "Bahasa",
  },

  home: {
    emergencyTitle: "Ada yang digigit ular?",
    emergencySub: "Ketuk untuk pertolongan pertama darurat",
    checkTitle: "Periksa ular",
    hint: "📏 Jaga jarak dan gunakan zoom — jangan pernah mendekati ular demi foto yang lebih baik. Setelah memotret, pangkas gambar rapat di sekitar ular agar memenuhi bingkai.",
    dropZone: "Foto Anda akan muncul di sini",
    takePhoto: "📷  Ambil foto",
    upload: "Unggah",
    analyzing: "Memeriksa foto…",
  },

  verdict: {
    dangerous: {
      label: "Risiko tinggi",
      headline: "Perlakukan sebagai BERBAHAYA — kemungkinan berbisa",
      subtext: "Kemungkinan besar ini ular berbisa atau berbahaya. Jaga jarak jauh dan jangan mendekat.",
    },
    caution: {
      label: "Waspada",
      headline: "Perlakukan dengan hati-hati — jaga jarak",
      subtext: "Ada beberapa tanda risiko, tetapi tidak ada kecocokan bisa yang meyakinkan. Menjauhlah, jangan memojokkan atau menyentuhnya, dan segera cari pertolongan medis jika tergigit.",
    },
    lowRisk: {
      label: "Risiko lebih rendah",
      headline: "Kemungkinan tidak berbisa — tetap jaga jarak",
      subtext: "Kemungkinan berbisa rendah, tetapi jangan pernah memegang atau mendekati ular apa pun. Jika tergigit, segera cari pertolongan medis.",
    },
    unidentified: {
      label: "Tidak dikenali",
      headline: "Ular tidak dapat dipastikan — anggap BERBAHAYA",
      subtext: "Ini tampaknya bukan foto ular yang jelas. Foto ulang dari jarak aman (gunakan zoom, jangan mendekat). Jika ragu, menjauhlah dan anggap berbahaya.",
    },
  },

  confidence: {
    dangerous: "Faunari memperkirakan kemungkinan tinggi (~{pct}%) ular ini berbisa.",
    caution: "Faunari memperkirakan ~{pct}% kemungkinan berbisa — bukan kecocokan pasti, tetapi tidak cukup rendah untuk mengabaikan risiko. Tetap waspada.",
    lowRisk: "Faunari memperkirakan kemungkinan berbisa rendah (~{pct}%) — tetapi jangan pernah menganggap ular mana pun aman.",
    ood: "Faunari tidak dapat memastikan ular yang jelas pada foto ini, jadi ia tidak menebak.",
  },

  emergency: {
    headline: "Cari pertolongan medis SEKARANG",
    steps: [
      "Segera hubungi layanan darurat — tekan {ambulance} untuk ambulans.",
      "Secepat dan seaman mungkin, pergi ke rumah sakit terdekat yang memiliki antibisa.",
      "Jaga korban tetap tenang dan sediam mungkin; tenangkan dia.",
      "Catat waktu gigitan dan gejala yang berubah untuk disampaikan ke dokter.",
    ],
  },

  firstAid: {
    titleNow: "Yang harus dilakukan sekarang",
    titleIfBitten: "Jika tergigit",
    emphasisDanger: "Cari pertolongan medis SEKARANG — hubungi {ambulance}.",
    emphasisCaution: "Perlakukan setiap gigitan ular sebagai darurat — segera cari pertolongan medis ({ambulance}).",
    doLabel: "LAKUKAN",
    dontLabel: "JANGAN",
    do: [
      "Jauhkan semua orang dari ular ke jarak yang aman.",
      "Jaga korban tetap tenang dan diam — gerakan mempercepat penyebaran bisa.",
      "Jaga anggota tubuh yang tergigit tetap diam dan kira-kira setinggi jantung; lepaskan cincin, jam tangan, pakaian ketat.",
      "Segera ke rumah sakit yang memiliki antibisa; hubungi {ambulance}.",
    ],
    dont: [
      "JANGAN menyayat, mengisap, atau mencoba mengeluarkan bisa dari luka.",
      "JANGAN memasang torniket atau ikatan ketat.",
      "JANGAN mengompres es, atau memberi alkohol, makanan, atau obat penenang.",
      "JANGAN mencoba menangkap atau membunuh ular — foto jelas dari jarak aman sudah cukup.",
      "JANGAN membuang waktu dengan pengobatan tradisional.",
    ],
    goodToKnow: "Perlu diketahui",
    lowRiskNote: "Ular berisiko rendah pun bisa menggigit. Jangan pegang, pojokkan, atau dekati. Beri ruang dan biarkan ia pergi sendiri.",
    whatToDo: "Yang harus dilakukan",
    oodAdvice: "📷 Foto ulang dari jarak aman — gunakan zoom, jangan mendekat. Jika ada yang tergigit, gunakan panel darurat di atas.",
  },

  feedback: {
    ask: "Apakah ini membantu?",
    yes: "👍  Tampak benar",
    no: "👎  Kurang tepat",
    disputeQ: "Sebenarnya itu apa?",
    harmless: "Sebenarnya tidak berbahaya",
    dangerous: "Sebenarnya berbahaya",
    notASnake: "Itu bukan ular",
    thanks: "🙏 Terima kasih — masukan Anda membantu Faunari menjadi lebih baik.",
  },

  disclaimer:
    "Faunari adalah purwarupa edukasi, BUKAN alat medis. Ia bisa salah (bisa melewatkan ular berbahaya). Jangan pernah mengandalkannya untuk keputusan medis atau keselamatan.",
};
