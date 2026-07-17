import { SafeAreaView, StyleSheet } from "react-native";

import { LocaleProvider } from "./src/i18n/LocaleContext";
import HomeScreen from "./src/screens/HomeScreen";

export default function App() {
  return (
    <LocaleProvider>
      <SafeAreaView style={styles.root}>
        <HomeScreen />
      </SafeAreaView>
    </LocaleProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#123524" },
});
