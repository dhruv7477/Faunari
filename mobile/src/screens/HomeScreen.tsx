import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  DANGEROUS_FIRST_AID,
  DISCLAIMER,
  EMERGENCY,
  LOW_RISK_NOTE,
} from "../safety/content";
import { DangerLevel, ScreenResult, Verdict } from "../safety/types";
import { MockScreener } from "../screener/screener";

const BAND = {
  [DangerLevel.DANGEROUS]: { bg: "#FBE9E6", fg: "#B5341F" },
  [DangerLevel.CAUTION]: { bg: "#FCF2E2", fg: "#9A5B14" },
  [DangerLevel.UNIDENTIFIED]: { bg: "#FCF2E2", fg: "#9A5B14" },
  [DangerLevel.LOW_RISK]: { bg: "#E8F3EC", fg: "#2E7D52" },
} as const;

export default function HomeScreen() {
  const screener = useMemo(() => new MockScreener(), []);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<ScreenResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  const analyze = async (uri: string) => {
    setLoading(true);
    setResult(null);
    try {
      setResult(await screener.screen(uri));
    } finally {
      setLoading(false);
    }
  };

  const pick = async (useCamera: boolean) => {
    const perm = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
    if (!res.canceled) {
      setImageUri(res.assets[0].uri);
      analyze(res.assets[0].uri);
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <StatusBar style="dark" />
      <Text style={styles.title}>🐍 Faunari</Text>
      <Text style={styles.tagline}>Spot it. Know it. Stay safe. — prototype</Text>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>{DISCLAIMER}</Text>
      </View>

      <Pressable style={styles.emergencyBar} onPress={() => setEmergencyOpen((v) => !v)}>
        <Text style={styles.emergencyBarText}>🚑 Was someone bitten? — tap for emergency first-aid</Text>
      </Pressable>
      {emergencyOpen && (
        <View style={[styles.card, { backgroundColor: BAND.DANGEROUS.bg }]}>
          <Text style={[styles.cardHead, { color: BAND.DANGEROUS.fg }]}>{EMERGENCY.headline}</Text>
          {EMERGENCY.steps.map((s, i) => (
            <Text key={i} style={styles.bullet}>• {s}</Text>
          ))}
        </View>
      )}

      <Text style={styles.section}>1. Take or upload a photo</Text>
      <Text style={styles.hint}>📏 Shoot from a safe distance and zoom in. Never move closer to a snake for a better photo.</Text>
      <View style={styles.row}>
        <Pressable style={styles.btn} onPress={() => pick(true)}>
          <Text style={styles.btnText}>Camera</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnAlt]} onPress={() => pick(false)}>
          <Text style={styles.btnText}>Upload</Text>
        </Pressable>
      </View>

      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />}
      {loading && <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#15301F" />}

      {result && !loading && <Result result={result} />}
    </ScrollView>
  );
}

function Result({ result }: { result: ScreenResult }) {
  const v = result.verdict;
  const band = BAND[v.level];
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={styles.section}>2. Result</Text>
      <View style={[styles.banner, { backgroundColor: band.bg }]}>
        <Text style={[styles.bannerHead, { color: band.fg }]}>{v.icon}  {v.headline}</Text>
        <Text style={styles.bannerBody}>{v.subtext}</Text>
      </View>
      <Actions verdict={v} />
      <Confidence result={result} />
    </View>
  );
}

function Actions({ verdict }: { verdict: Verdict }) {
  if (verdict.level === DangerLevel.UNIDENTIFIED) {
    return <Text style={styles.note}>📷 Re-shoot the snake from a safe distance (zoom, don't approach). If anyone was bitten, use the emergency panel above.</Text>;
  }
  if (!verdict.treatAsDangerous) {
    return <Text style={styles.note}>ℹ️ {LOW_RISK_NOTE}</Text>;
  }
  const isDanger = verdict.level === DangerLevel.DANGEROUS;
  return (
    <View style={styles.card}>
      <Text style={styles.cardHead}>🩹 {isDanger ? "What to do now" : "If bitten"}</Text>
      <Text style={[styles.emphasis, { color: BAND.DANGEROUS.fg }]}>
        {isDanger ? `${EMERGENCY.headline} — call 102 / 108.` : "Treat any snakebite as an emergency — get medical care immediately (102 / 108)."}
      </Text>
      <Text style={styles.subHead}>DO</Text>
      {DANGEROUS_FIRST_AID.do.map((s, i) => <Text key={i} style={styles.bullet}>• {s}</Text>)}
      <Text style={styles.subHead}>DON'T</Text>
      {DANGEROUS_FIRST_AID.dont.map((s, i) => <Text key={i} style={styles.bullet}>• {s}</Text>)}
    </View>
  );
}

function Confidence({ result }: { result: ScreenResult }) {
  if (result.prediction === null) {
    return <Text style={styles.caption}>Faunari couldn't confirm an in-scope snake in this photo, so it isn't guessing.</Text>;
  }
  const pct = Math.round((result.verdict.venomProbability ?? 0) * 100);
  const lvl = result.verdict.level;
  const text =
    lvl === DangerLevel.DANGEROUS
      ? `Faunari estimates a high (~${pct}%) chance this is venomous.`
      : lvl === DangerLevel.CAUTION
        ? `Faunari estimates ~${pct}% chance of venom — not a confident match, but not low enough to rule out. Treat it with caution.`
        : `Faunari estimates a low (~${pct}%) chance of venom — but never treat any snake as safe.`;
  return <Text style={styles.caption}>{text}</Text>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F7F4EC" },
  content: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 34, fontWeight: "800", color: "#15301F" },
  tagline: { color: "#6b7280", marginBottom: 14 },
  disclaimer: { backgroundColor: "#FCF2E2", borderRadius: 10, padding: 12, marginBottom: 12 },
  disclaimerText: { color: "#5b4a1f" },
  emergencyBar: { borderWidth: 1, borderColor: "#e2ddd0", borderRadius: 10, padding: 12, marginBottom: 8 },
  emergencyBarText: { color: "#15301F", fontWeight: "600" },
  section: { fontSize: 20, fontWeight: "700", color: "#15301F", marginTop: 14, marginBottom: 4 },
  hint: { color: "#6b7280", marginBottom: 10 },
  row: { flexDirection: "row", gap: 12 },
  btn: { flex: 1, backgroundColor: "#15301F", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  btnAlt: { backgroundColor: "#2E7D52" },
  btnText: { color: "white", fontWeight: "700", fontSize: 16 },
  preview: { width: "100%", height: 240, borderRadius: 12, marginTop: 16 },
  banner: { borderRadius: 12, padding: 16, marginBottom: 12 },
  bannerHead: { fontSize: 18, fontWeight: "800" },
  bannerBody: { marginTop: 8, color: "#333", lineHeight: 20 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#ece7db" },
  cardHead: { fontSize: 16, fontWeight: "700", color: "#15301F", marginBottom: 6 },
  emphasis: { fontWeight: "700", marginBottom: 8 },
  subHead: { fontWeight: "700", marginTop: 8, marginBottom: 2, color: "#15301F" },
  bullet: { color: "#333", lineHeight: 21, marginBottom: 2 },
  note: { backgroundColor: "#eef2f0", borderRadius: 10, padding: 12, color: "#333", marginBottom: 10 },
  caption: { color: "#6b7280", fontStyle: "italic", marginTop: 4 },
});
