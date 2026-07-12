// Expo config plugin: pin com.microsoft.onnxruntime:* to the installed npm package's version.
//
// Why: onnxruntime-react-native's android/build.gradle asks Gradle for "latest.integration",
// which requires listing all versions from maven-metadata.xml — and that listing step crashes on
// EAS build images (SAXNotRecognizedException). Forcing a concrete version skips the listing
// entirely AND guarantees the native library matches the installed JS binding.
const { withProjectBuildGradle } = require("expo/config-plugins");

const ORT_VERSION = require("onnxruntime-react-native/package.json").version;
const MARKER = "// faunari: onnxruntime version pin";

const SNIPPET = `
${MARKER}
allprojects {
  configurations.all {
    resolutionStrategy.eachDependency { details ->
      if (details.requested.group == "com.microsoft.onnxruntime") {
        details.useVersion "${ORT_VERSION}"
        details.because "pin latest.integration -> installed onnxruntime-react-native version (EAS maven-metadata listing is broken)"
      }
    }
  }
}
`;

module.exports = function withOrtVersionPin(config) {
  return withProjectBuildGradle(config, (cfg) => {
    if (!cfg.modResults.contents.includes(MARKER)) {
      cfg.modResults.contents += SNIPPET;
    }
    return cfg;
  });
};
