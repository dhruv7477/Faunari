// Expo config plugin: limit packaged CPU architectures via the ANDROID_ABIS env var.
//
// The RN Gradle plugin copies gradle.properties' `reactNativeArchitectures` into
// defaultConfig.ndk.abiFilters, which decides which native libs (RN + ONNX Runtime + Expo)
// end up in the APK. All four ABIs ≈ 4x the native payload; a dev/preview APK for a physical
// phone only needs arm64-v8a. Production stays an AAB with all ABIs — Play Store delivers each
// device only its own. Set per build profile in eas.json (env.ANDROID_ABIS); unset = RN default.
const { withGradleProperties } = require("expo/config-plugins");

module.exports = function withAndroidAbis(config) {
  const abis = process.env.ANDROID_ABIS;
  if (!abis) return config;
  return withGradleProperties(config, (cfg) => {
    const props = cfg.modResults.filter(
      (p) => !(p.type === "property" && p.key === "reactNativeArchitectures"),
    );
    props.push({ type: "property", key: "reactNativeArchitectures", value: abis });
    cfg.modResults = props;
    return cfg;
  });
};
