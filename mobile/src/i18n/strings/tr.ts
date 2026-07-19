// Turkish (Türkçe) — machine-drafted; unreviewed until a native speaker verifies. Placeholders stay.
import { Strings } from "./en";

export const tr: Strings = {
  meta: { nativeName: "Türkçe", rtl: false, reviewed: false },

  app: {
    tagline: "Gör. Tanı. Güvende kal.",
    demoMode: "Demo modu — test için örnek sonuçlar",
    machineTranslated: "Makine çevirisi — kritik adımlar henüz ana dili konuşan biri tarafından doğrulanmadı",
    language: "Dil",
  },

  home: {
    emergencyTitle: "Birini yılan mı ısırdı?",
    emergencySub: "Acil ilk yardım için dokunun",
    checkTitle: "Yılanı kontrol et",
    hint: "📏 Uzak durun ve yakınlaştırma kullanın — daha iyi fotoğraf için asla yılana yaklaşmayın. Çektikten sonra, yılan kareyi dolduracak şekilde fotoğrafı sıkıca kırpın.",
    dropZone: "Fotoğrafınız burada görünecek",
    takePhoto: "📷  Fotoğraf çek",
    upload: "Yükle",
    analyzing: "Fotoğraf kontrol ediliyor…",
  },

  verdict: {
    dangerous: {
      label: "Yüksek risk",
      headline: "TEHLİKELİ olarak kabul edin — muhtemelen zehirli",
      subtext: "Bu büyük olasılıkla zehirli veya tehlikeli bir yılan. İyice uzak durun ve yaklaşmayın.",
    },
    caution: {
      label: "Dikkat",
      headline: "Dikkatle yaklaşın — mesafenizi koruyun",
      subtext: "Bazı risk belirtileri var, ancak kesin bir zehir eşleşmesi yok. Uzak durun, sıkıştırmayın ve dokunmayın; ısırılma olursa hemen tıbbi yardım alın.",
    },
    lowRisk: {
      label: "Daha düşük risk",
      headline: "Muhtemelen zehirsiz — yine de mesafenizi koruyun",
      subtext: "Zehir olasılığı düşük, ama hiçbir yılana asla dokunmayın ve yaklaşmayın. Isırılırsanız hemen tıbbi yardım alın.",
    },
    unidentified: {
      label: "Tanınamadı",
      headline: "Yılan doğrulanamadı — TEHLİKELİ varsayın",
      subtext: "Bu, tanınabilir bir yılanın net fotoğrafına benzemiyor. Güvenli mesafeden yeniden çekin (yakınlaştırın, yaklaşmayın). Şüphede kalırsanız uzak durun ve tehlikeli kabul edin.",
    },
  },

  confidence: {
    dangerous: "Faunari zehirli olma olasılığını yüksek (~%{pct}) tahmin ediyor.",
    caution: "Faunari zehir olasılığını ~%{pct} tahmin ediyor — kesin değil, ama riski göz ardı edecek kadar düşük de değil. Dikkatli olun.",
    lowRisk: "Faunari zehir olasılığını düşük (~%{pct}) tahmin ediyor — yine de hiçbir yılanı asla güvenli saymayın.",
    ood: "Faunari bu fotoğrafta tanınabilir bir yılan doğrulayamadı, bu yüzden tahmin yürütmüyor.",
  },

  emergency: {
    headline: "HEMEN tıbbi yardım alın",
    steps: [
      "Acil servisi hemen arayın — ambulans için {ambulance} tuşlayın.",
      "Panzehiri (antivenom) olan en yakın hastaneye, güvenli biçimde olabildiğince hızlı ulaşın.",
      "Kişiyi sakin ve olabildiğince hareketsiz tutun; ona güven verin.",
      "Isırılma saatini ve değişen belirtileri not edin; doktora iletin.",
    ],
  },

  firstAid: {
    titleNow: "Şimdi ne yapmalı",
    titleIfBitten: "Isırılma durumunda",
    emphasisDanger: "HEMEN tıbbi yardım alın — {ambulance} numarasını arayın.",
    emphasisCaution: "Her yılan ısırığını acil durum sayın — hemen tıbbi yardım alın ({ambulance}).",
    doLabel: "YAPIN",
    dontLabel: "YAPMAYIN",
    do: [
      "Herkesi yılandan güvenli bir mesafeye uzaklaştırın.",
      "Isırılan kişiyi sakin ve hareketsiz tutun — hareket zehri daha hızlı yayar.",
      "Isırılan uzvu hareketsiz ve yaklaşık kalp hizasında tutun; yüzük, saat ve dar giysileri çıkarın.",
      "Panzehiri olan bir hastaneye hemen gidin; {ambulance} numarasını arayın.",
    ],
    dont: [
      "Yarayı KESMEYİN, emmeyin veya zehri boşaltmaya çalışmayın.",
      "Turnike veya sıkı bandaj UYGULAMAYIN.",
      "Buz koymayın; alkol, yiyecek veya sakinleştirici VERMEYİN.",
      "Yılanı yakalamaya veya öldürmeye ÇALIŞMAYIN — güvenli mesafeden net bir fotoğraf yeterli.",
      "Kocakarı ilaçlarıyla vakit KAYBETMEYİN.",
    ],
    goodToKnow: "Bilmekte fayda var",
    lowRiskNote: "Düşük riskli yılanlar bile ısırabilir. Dokunmayın, sıkıştırmayın, yaklaşmayın. Alan tanıyın ve kendi kendine uzaklaşmasına izin verin.",
    whatToDo: "Ne yapmalı",
    oodAdvice: "📷 Güvenli mesafeden yeniden çekin — yakınlaştırın, yaklaşmayın. Isırılan biri varsa yukarıdaki acil panelini kullanın.",
  },

  feedback: {
    ask: "Bu yardımcı oldu mu?",
    yes: "👍  Doğru görünüyor",
    no: "👎  Pek değil",
    disputeQ: "Gerçekte neydi?",
    harmless: "Aslında zararsızdı",
    dangerous: "Aslında tehlikeliydi",
    notASnake: "Yılan değildi",
    thanks: "🙏 Teşekkürler — geri bildiriminiz Faunari'yi geliştiriyor.",
  },

  disclaimer:
    "Faunari eğitim amaçlı bir prototiptir, tıbbi cihaz DEĞİLDİR. Hata yapabilir (tehlikeli yılanları kaçırabilir). Tıbbi veya güvenlik kararları için asla ona güvenmeyin.",
};
