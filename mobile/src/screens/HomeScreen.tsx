import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { DangerLevel, ScreenResult, Verdict } from "../safety/types";
import { createScreener } from "../screener/createScreener";
import { MockScreener, Screener } from "../screener/screener";
import { buildFeedbackRecord } from "../feedback/record";
import { createFeedbackStore, syncFeedback } from "../feedback/createFeedback";
import { FeedbackSink, UserClaim } from "../feedback/types";
import { availableLocales, fmt, isReviewed, s } from "../i18n";
import { ambulanceNumber, countryOptions, flagEmoji } from "../i18n/emergency";
import { useLocale } from "../i18n/LocaleContext";

const APP_VERSION = "0.1.0";

const PALETTE = {
  forest: "#123524",
  forestDeep: "#0C2419",
  leaf: "#2E7D52",
  sand: "#F2F5F0",
  card: "#FFFFFF",
  ink: "#1C2B22",
  muted: "#5F6E64",
  line: "#E3E9E2",
  red: "#C0392B",
  redSoft: "#FDECEA",
  amber: "#B26A00",
  amberSoft: "#FFF4E0",
  green: "#2E7D52",
  greenSoft: "#E9F4EE",
};

function bandFor(level: DangerLevel): { fg: string; soft: string; label: string } {
  const v = s().verdict;
  switch (level) {
    case DangerLevel.DANGEROUS:
      return { fg: PALETTE.red, soft: PALETTE.redSoft, label: v.dangerous.label };
    case DangerLevel.CAUTION:
      return { fg: PALETTE.amber, soft: PALETTE.amberSoft, label: v.caution.label };
    case DangerLevel.UNIDENTIFIED:
      return { fg: PALETTE.amber, soft: PALETTE.amberSoft, label: v.unidentified.label };
    case DangerLevel.LOW_RISK:
      return { fg: PALETTE.green, soft: PALETTE.greenSoft, label: v.lowRisk.label };
  }
}

export default function HomeScreen() {
  // Start with the mock so the UI is instantly usable; swap in the on-device screener once loaded.
  const screenerRef = useRef<Screener>(new MockScreener());
  const feedbackRef = useRef<FeedbackSink>(createFeedbackStore());
  const { locale, changeLocale, country, changeCountry, locateCountry, needsRestart } = useLocale();
  const [locating, setLocating] = useState(false);
  const [mode, setMode] = useState<"onnx" | "mock">("mock");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<ScreenResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    createScreener().then(({ screener, mode: m }) => {
      if (!cancelled) {
        screenerRef.current = screener;
        setMode(m);
      }
    });
    // Drain any feedback queued offline in a previous session.
    syncFeedback(feedbackRef.current).catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const analyze = async (uri: string) => {
    setLoading(true);
    setResult(null);
    try {
      setResult(await screenerRef.current.screen(uri));
    } finally {
      setLoading(false);
    }
  };

  const pick = async (useCamera: boolean) => {
    const perm = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    // allowsEditing: after capture the user drags a crop box around the snake — so a photo taken
    // from a safe distance still fills the frame with snake (matches training framing; keeps the
    // OOD gate from rejecting distant shots). Square crop mirrors the model's own center-crop.
    const opts = { quality: 0.7, allowsEditing: true, aspect: [1, 1] as [number, number] };
    const res = useCamera
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync({ ...opts, mediaTypes: ["images"] });
    if (!res.canceled) {
      setImageUri(res.assets[0].uri);
      analyze(res.assets[0].uri);
    }
  };

  const t = s();
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} bounces={false}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Image source={require("../../assets/logo.png")} style={styles.logo} />
          <Text style={styles.brand}>Faunari</Text>
          <Pressable style={styles.langBtn} onPress={() => setPickerOpen(true)}>
            <Text style={styles.langBtnText}>🌐</Text>
          </Pressable>
        </View>
        <Text style={styles.tagline}>{t.app.tagline}</Text>
        {mode === "mock" && (
          <View style={styles.demoPill}>
            <Text style={styles.demoPillText}>{t.app.demoMode}</Text>
          </View>
        )}
        {locale !== "en" && !isReviewed(locale) && (
          <View style={styles.demoPill}>
            <Text style={styles.demoPillText}>⚠︎ {t.app.machineTranslated}</Text>
          </View>
        )}
        {needsRestart && (
          <View style={styles.demoPill}>
            <Text style={styles.demoPillText}>↻ Close and reopen the app to apply the layout direction</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Pressable
          style={[styles.emergencyBar, emergencyOpen && styles.emergencyBarOpen]}
          onPress={() => setEmergencyOpen((v) => !v)}
        >
          <Text style={styles.emergencyIcon}>🚑</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.emergencyTitle}>{t.home.emergencyTitle}</Text>
            <Text style={styles.emergencySub}>{t.home.emergencySub}</Text>
          </View>
          <Text style={styles.emergencyChevron}>{emergencyOpen ? "▴" : "▾"}</Text>
        </Pressable>

        {emergencyOpen && (
          <View style={[styles.card, { borderColor: PALETTE.red, borderWidth: 1 }]}>
            <Text style={[styles.cardTitle, { color: PALETTE.red }]}>{t.emergency.headline}</Text>
            {t.emergency.steps.map((step, i) => (
              <Text key={i} style={styles.bullet}>
                <Text style={{ color: PALETTE.red }}>●</Text>  {fmt(step, { ambulance: ambulanceNumber() })}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.home.checkTitle}</Text>
          <View style={styles.hintChip}>
            <Text style={styles.hintChipText}>{t.home.hint}</Text>
          </View>

          {imageUri ? (
            <View>
              <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
              {loading && (
                <View style={styles.previewOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.previewOverlayText}>{t.home.analyzing}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.dropZone}>
              <Text style={styles.dropZoneEmoji}>📷</Text>
              <Text style={styles.dropZoneText}>{t.home.dropZone}</Text>
            </View>
          )}

          <View style={styles.row}>
            <Pressable
              style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
              onPress={() => pick(true)}
            >
              <Text style={styles.btnPrimaryText}>{t.home.takePhoto}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}
              onPress={() => pick(false)}
            >
              <Text style={styles.btnSecondaryText}>{t.home.upload}</Text>
            </Pressable>
          </View>
        </View>

        {result && !loading && imageUri && (
          <Result result={result} imageUri={imageUri} sink={feedbackRef.current} />
        )}

        <Text style={[styles.disclaimer, { marginTop: "auto" }]}>{t.disclaimer}</Text>
      </View>

      <Modal visible={pickerOpen} animationType="slide" transparent>
        <View style={styles.pickerBackdrop}>
          <View style={styles.pickerSheet}>
            <Text style={styles.cardTitle}>🌐 {t.app.language}</Text>
            {availableLocales().map((l) => (
              <Pressable
                key={l.code}
                style={({ pressed }) => [
                  styles.langRow,
                  locale === l.code && styles.langRowActive,
                  pressed && styles.pressed,
                ]}
                onPress={async () => {
                  await changeLocale(l.code);
                }}
              >
                <Text style={styles.langRowText}>{l.nativeName}</Text>
                {locale === l.code && <Text style={{ color: PALETTE.green }}>✓</Text>}
              </Pressable>
            ))}

            <Text style={[styles.cardTitle, { marginTop: 16 }]}>
              🚑 {flagEmoji(country ?? "")} {ambulanceNumber()}
            </Text>
            <Pressable
              style={({ pressed }) => [styles.langRow, pressed && styles.pressed]}
              onPress={async () => {
                setLocating(true);
                try {
                  await locateCountry();
                } finally {
                  setLocating(false);
                }
              }}
            >
              <Text style={styles.langRowText}>📍 {locating ? "…" : "Use my current location"}</Text>
            </Pressable>
            <ScrollView style={styles.countryList} nestedScrollEnabled>
              {countryOptions().map((c) => (
                <Pressable
                  key={c.iso}
                  style={({ pressed }) => [
                    styles.langRow,
                    country === c.iso && styles.langRowActive,
                    pressed && styles.pressed,
                  ]}
                  onPress={async () => {
                    await changeCountry(c.iso);
                  }}
                >
                  <Text style={styles.langRowText}>
                    {flagEmoji(c.iso)}  {c.name}
                  </Text>
                  <Text style={{ color: PALETTE.muted }}>{c.ambulance}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable
              style={({ pressed }) => [styles.btnPrimary, { marginTop: 12 }, pressed && styles.pressed]}
              onPress={() => setPickerOpen(false)}
            >
              <Text style={styles.btnPrimaryText}>✓</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function Result({
  result,
  imageUri,
  sink,
}: {
  result: ScreenResult;
  imageUri: string;
  sink: FeedbackSink;
}) {
  const v = result.verdict;
  const band = bandFor(v.level);
  return (
    <View>
      <View style={[styles.verdict, { backgroundColor: band.soft }]}>
        <View style={styles.verdictHead}>
          <View style={[styles.verdictBadge, { backgroundColor: band.fg }]}>
            <Text style={styles.verdictBadgeText}>{v.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.verdictLabel, { color: band.fg }]}>{band.label}</Text>
            <Text style={styles.verdictHeadline}>{v.headline}</Text>
          </View>
        </View>
        <Text style={styles.verdictSub}>{v.subtext}</Text>
        <Confidence result={result} color={band.fg} />
      </View>
      <FeedbackPrompt result={result} imageUri={imageUri} sink={sink} />
      <Actions verdict={v} />
    </View>
  );
}

function Confidence({ result, color }: { result: ScreenResult; color: string }) {
  const c = s().confidence;
  if (result.prediction === null) {
    return <Text style={styles.confidenceCaption}>{c.ood}</Text>;
  }
  const p = result.verdict.venomProbability ?? 0;
  const pct = Math.round(p * 100);
  const lvl = result.verdict.level;
  const text =
    lvl === DangerLevel.DANGEROUS
      ? fmt(c.dangerous, { pct })
      : lvl === DangerLevel.CAUTION
        ? fmt(c.caution, { pct })
        : fmt(c.lowRisk, { pct });
  return (
    <View style={{ marginTop: 12 }}>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width: `${Math.max(pct, 4)}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.confidenceCaption}>{text}</Text>
    </View>
  );
}

function FeedbackPrompt({
  result,
  imageUri,
  sink,
}: {
  result: ScreenResult;
  imageUri: string;
  sink: FeedbackSink;
}) {
  const [step, setStep] = useState<"ask" | "dispute" | "done">("ask");
  const f = s().feedback;

  const send = async (claim: UserClaim) => {
    setStep("done"); // optimistic — a dropped feedback should never block the user
    try {
      await sink.submit(buildFeedbackRecord(imageUri, result, claim, APP_VERSION));
      syncFeedback(sink).catch(() => undefined); // best-effort upload; queue retries otherwise
    } catch {
      // stored best-effort; nothing user-facing to do
    }
  };

  if (step === "done") {
    return (
      <View style={styles.feedbackCard}>
        <Text style={styles.feedbackThanks}>{f.thanks}</Text>
      </View>
    );
  }

  if (step === "dispute") {
    return (
      <View style={styles.feedbackCard}>
        <Text style={styles.feedbackQ}>{f.disputeQ}</Text>
        <FeedbackBtn label={f.harmless} onPress={() => send("actually_harmless")} />
        <FeedbackBtn label={f.dangerous} onPress={() => send("actually_dangerous")} />
        <FeedbackBtn label={f.notASnake} onPress={() => send("not_a_snake")} />
      </View>
    );
  }

  return (
    <View style={styles.feedbackCard}>
      <Text style={styles.feedbackQ}>{f.ask}</Text>
      <View style={styles.feedbackRow}>
        <FeedbackBtn label={f.yes} onPress={() => send("agree")} grow />
        <FeedbackBtn label={f.no} onPress={() => setStep("dispute")} grow />
      </View>
    </View>
  );
}

function FeedbackBtn({
  label,
  onPress,
  grow,
}: {
  label: string;
  onPress: () => void;
  grow?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.feedbackBtn, grow && { flex: 1 }, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.feedbackBtnText}>{label}</Text>
    </Pressable>
  );
}

function Actions({ verdict }: { verdict: Verdict }) {
  const fa = s().firstAid;
  if (verdict.level === DangerLevel.UNIDENTIFIED) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{fa.whatToDo}</Text>
        <Text style={styles.bullet}>{fa.oodAdvice}</Text>
      </View>
    );
  }
  if (!verdict.treatAsDangerous) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{fa.goodToKnow}</Text>
        <Text style={styles.bullet}>ℹ️ {fa.lowRiskNote}</Text>
      </View>
    );
  }
  const isDanger = verdict.level === DangerLevel.DANGEROUS;
  const amb = { ambulance: ambulanceNumber() };
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>🩹 {isDanger ? fa.titleNow : fa.titleIfBitten}</Text>
      <Text style={styles.emphasis}>{fmt(isDanger ? fa.emphasisDanger : fa.emphasisCaution, amb)}</Text>
      <Text style={[styles.listHead, { color: PALETTE.green }]}>{fa.doLabel}</Text>
      {fa.do.map((step, i) => (
        <Text key={i} style={styles.bullet}>
          <Text style={{ color: PALETTE.green }}>✓</Text>  {fmt(step, amb)}
        </Text>
      ))}
      <Text style={[styles.listHead, { color: PALETTE.red }]}>{fa.dontLabel}</Text>
      {fa.dont.map((step, i) => (
        <Text key={i} style={styles.bullet}>
          <Text style={{ color: PALETTE.red }}>✗</Text>  {step}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: PALETTE.forest },
  content: { flexGrow: 1 },

  header: {
    backgroundColor: PALETTE.forest,
    paddingTop: 18,
    paddingBottom: 26,
    paddingHorizontal: 22,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 44, height: 44 },
  brand: { fontSize: 32, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.3, flex: 1 },
  langBtn: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 999,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  langBtnText: { fontSize: 20 },
  tagline: { color: "#BCD3C3", marginTop: 3, fontSize: 14.5 },
  demoPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 12,
  },
  demoPillText: { color: "#E8F1EA", fontSize: 12.5, fontWeight: "600" },

  body: {
    flex: 1, // stretch the light panel to the bottom so no dark gap shows below short content
    backgroundColor: PALETTE.sand,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -14,
    padding: 18,
    paddingBottom: 28,
    gap: 14,
  },

  emergencyBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: PALETTE.card,
    borderRadius: 16,
    borderStartWidth: 5,
    borderStartColor: PALETTE.red,
    padding: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  emergencyBarOpen: { borderBottomLeftRadius: 6, borderBottomRightRadius: 6 },
  emergencyIcon: { fontSize: 24 },
  emergencyTitle: { fontWeight: "800", color: PALETTE.ink, fontSize: 15.5 },
  emergencySub: { color: PALETTE.muted, fontSize: 13, marginTop: 1 },
  emergencyChevron: { color: PALETTE.muted, fontSize: 16 },

  card: {
    backgroundColor: PALETTE.card,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardTitle: { fontSize: 17, fontWeight: "800", color: PALETTE.ink, marginBottom: 10 },

  hintChip: {
    backgroundColor: PALETTE.greenSoft,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  hintChipText: { color: "#33523F", fontSize: 13.5, lineHeight: 19 },

  dropZone: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: PALETTE.line,
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 34,
    marginBottom: 14,
    backgroundColor: "#FAFCFA",
  },
  dropZoneEmoji: { fontSize: 34, marginBottom: 6 },
  dropZoneText: { color: PALETTE.muted, fontSize: 13.5 },

  preview: { width: "100%", height: 250, borderRadius: 14, marginBottom: 14 },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: "rgba(12,36,25,0.55)",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  previewOverlayText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  row: { flexDirection: "row", gap: 12 },
  btnPrimary: {
    flex: 1.6,
    backgroundColor: PALETTE.forest,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  btnPrimaryText: { color: "#fff", fontWeight: "800", fontSize: 15.5 },
  btnSecondary: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: PALETTE.forest,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: PALETTE.card,
  },
  btnSecondaryText: { color: PALETTE.forest, fontWeight: "800", fontSize: 15.5 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },

  verdict: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  verdictHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  verdictBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  verdictBadgeText: { fontSize: 22 },
  verdictLabel: {
    fontSize: 12.5,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  verdictHeadline: { fontSize: 17.5, fontWeight: "800", color: PALETTE.ink, marginTop: 1 },
  verdictSub: { color: "#3C4A41", marginTop: 10, lineHeight: 21, fontSize: 14.5 },

  meterTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  meterFill: { height: "100%", borderRadius: 4 },
  confidenceCaption: { color: PALETTE.muted, fontSize: 13, marginTop: 8, lineHeight: 18 },

  emphasis: { fontWeight: "700", color: PALETTE.red, marginBottom: 10, lineHeight: 20 },
  listHead: { fontWeight: "800", fontSize: 13, letterSpacing: 0.6, marginTop: 8, marginBottom: 4 },
  bullet: { color: "#333F38", lineHeight: 22, marginBottom: 4, fontSize: 14.5 },

  disclaimer: { color: PALETTE.muted, fontSize: 12.5, lineHeight: 18, paddingHorizontal: 4 },

  feedbackCard: {
    backgroundColor: PALETTE.card,
    borderRadius: 14,
    padding: 14,
    marginTop: 2,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: PALETTE.line,
  },
  feedbackQ: { fontSize: 14.5, fontWeight: "700", color: PALETTE.ink, marginBottom: 10 },
  feedbackRow: { flexDirection: "row", gap: 10 },
  feedbackBtn: {
    borderWidth: 1.5,
    borderColor: PALETTE.line,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#FAFCFA",
  },
  feedbackBtnText: { color: PALETTE.ink, fontWeight: "600", fontSize: 14 },
  feedbackThanks: { color: PALETTE.green, fontWeight: "600", fontSize: 14 },

  pickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: PALETTE.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 34,
  },
  langRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  langRowActive: { backgroundColor: PALETTE.greenSoft },
  langRowText: { fontSize: 16, color: PALETTE.ink, fontWeight: "600" },
  countryList: { maxHeight: 260 },
});
