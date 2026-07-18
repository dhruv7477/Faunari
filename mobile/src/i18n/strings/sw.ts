// Swahili (Kiswahili) — machine-drafted; unreviewed until a native speaker verifies. Placeholders stay.
import { Strings } from "./en";

export const sw: Strings = {
  meta: { nativeName: "Kiswahili", rtl: false, reviewed: false },

  app: {
    tagline: "Mwone. Mjue. Uwe salama.",
    demoMode: "Hali ya majaribio — matokeo ya mfano kwa ajili ya kupima",
    machineTranslated: "Tafsiri ya mashine — hatua muhimu bado hazijathibitishwa na mzungumzaji asili",
    language: "Lugha",
  },

  home: {
    emergencyTitle: "Kuna aliyeumwa na nyoka?",
    emergencySub: "Gusa kwa huduma ya kwanza ya dharura",
    checkTitle: "Kagua nyoka",
    hint: "📏 Kaa mbali na tumia kukuza (zoom) — usimkaribie nyoka kamwe kwa ajili ya picha bora. Baada ya kupiga picha, kata picha karibu na nyoka ili ajaze fremu nzima.",
    dropZone: "Picha yako itaonekana hapa",
    takePhoto: "📷  Piga picha",
    upload: "Pakia",
    analyzing: "Inakagua picha…",
  },

  verdict: {
    dangerous: {
      label: "Hatari kubwa",
      headline: "Mchukulie kuwa HATARI — huenda ana sumu",
      subtext: "Kuna uwezekano mkubwa huyu ni nyoka mwenye sumu au hatari. Kaa mbali kabisa na usimkaribie.",
    },
    caution: {
      label: "Tahadhari",
      headline: "Afadhali kuwa makini — kaa mbali",
      subtext: "Kuna dalili kadhaa za hatari, lakini hakuna uthibitisho wa sumu. Kaa mbali, usimzingire wala kumgusa; ukiumwa, tafuta msaada wa matibabu mara moja.",
    },
    lowRisk: {
      label: "Hatari ndogo",
      headline: "Huenda hana sumu — hata hivyo weka umbali",
      subtext: "Uwezekano wa sumu ni mdogo, lakini usimshike wala kumkaribia nyoka yeyote kamwe. Ukiumwa, tafuta matibabu mara moja.",
    },
    unidentified: {
      label: "Hakutambuliwa",
      headline: "Nyoka hakuthibitishwa — mchukulie kuwa HATARI",
      subtext: "Hii haionekani kuwa picha wazi ya nyoka anayetambulika. Piga picha tena ukiwa umbali salama (tumia zoom, usikaribie). Ukiwa na shaka, kaa mbali na umchukulie kuwa hatari.",
    },
  },

  confidence: {
    dangerous: "Faunari inakadiria uwezekano mkubwa (~{pct}%) kwamba ana sumu.",
    caution: "Faunari inakadiria uwezekano wa sumu ~{pct}% — si uthibitisho, lakini si mdogo kiasi cha kupuuza hatari. Kuwa makini.",
    lowRisk: "Faunari inakadiria uwezekano mdogo (~{pct}%) wa sumu — lakini usimchukulie nyoka yeyote kuwa salama kamwe.",
    ood: "Faunari haikuweza kuthibitisha nyoka wazi katika picha hii, kwa hivyo haibahatishi.",
  },

  emergency: {
    headline: "Tafuta matibabu SASA",
    steps: [
      "Piga simu ya dharura mara moja — piga {ambulance} kupata gari la wagonjwa.",
      "Fika haraka iwezekanavyo, kwa usalama, hospitali ya karibu yenye dawa ya kupambana na sumu (antivenom).",
      "Mtulize mgonjwa na akae bila kujongea kadri inavyowezekana; mpe moyo.",
      "Andika muda wa kuumwa na dalili zinazobadilika ili kumweleza daktari.",
    ],
  },

  firstAid: {
    titleNow: "Cha kufanya sasa",
    titleIfBitten: "Ukiumwa",
    emphasisDanger: "Tafuta matibabu SASA — piga {ambulance}.",
    emphasisCaution: "Chukulia kila kuumwa na nyoka kuwa dharura — tafuta matibabu mara moja ({ambulance}).",
    doLabel: "FANYA",
    dontLabel: "USIFANYE",
    do: [
      "Waondoe watu wote mbali na nyoka hadi umbali salama.",
      "Mtulize aliyeumwa na akae bila kujongea — mwendo husambaza sumu haraka zaidi.",
      "Weka kiungo kilichoumwa bila kujongea, takriban usawa wa moyo; vua pete, saa na nguo za kubana.",
      "Fika hospitali yenye antivenom mara moja; piga {ambulance}.",
    ],
    dont: [
      "USIKATE, kunyonya wala kujaribu kutoa sumu kwenye jeraha.",
      "USIFUNGE kamba ya kubana (tourniquet) wala bendi ya kukaza.",
      "USIWEKE barafu, wala kumpa pombe, chakula au dawa za usingizi.",
      "USIJARIBU kumkamata au kumuua nyoka — picha wazi kutoka umbali salama inatosha.",
      "USIPOTEZE muda kwa tiba za kienyeji.",
    ],
    goodToKnow: "Vizuri kujua",
    lowRiskNote: "Hata nyoka wa hatari ndogo wanaweza kuuma. Usimshike, usimzingire wala kumkaribia. Mpe nafasi aondoke mwenyewe.",
    whatToDo: "Cha kufanya",
    oodAdvice: "📷 Piga picha tena kutoka umbali salama — tumia zoom, usikaribie. Ikiwa kuna aliyeumwa, tumia paneli ya dharura hapo juu.",
  },

  feedback: {
    ask: "Je, hii ilisaidia?",
    yes: "👍  Inaonekana sahihi",
    no: "👎  Si sahihi kabisa",
    disputeQ: "Kwa kweli alikuwa nini?",
    harmless: "Kwa kweli hakuwa na madhara",
    dangerous: "Kwa kweli alikuwa hatari",
    notASnake: "Hakuwa nyoka",
    thanks: "🙏 Asante — maoni yako yanasaidia Faunari kuboreka.",
  },

  disclaimer:
    "Faunari ni kielelezo cha kielimu, SIYO kifaa cha matibabu. Inaweza kukosea (inaweza kumkosa nyoka hatari). Usiitegemee kamwe kwa maamuzi ya matibabu au usalama.",
};
