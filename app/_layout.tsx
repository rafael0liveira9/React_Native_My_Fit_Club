import { ConfettiOverlay } from "@/components/my-fit-ui/animations";
import { ActiveExecutionProvider } from "@/context/ActiveExecutionContext";
import { MFThemeProvider } from "@/context/ThemeContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import SplashScreen from "@/view/splashScreen";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Orbitron: require("../assets/fonts/Orbitron-VariableFont_wght.ttf"),
  });
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(),
    [theme, setTheme] = useState<string | null>(),
    [hasRedirected, setHasRedirected] = useState(false),
    [isReady, setIsReady] = useState(false);

  async function getToken() {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      return token;
    } catch (error) {
      console.error("Erro ao recuperar token:", error);
      return null;
    }
  }

  async function getTheme() {
    try {
      const theme = await SecureStore.getItemAsync("theme");
      return theme;
    } catch (error) {
      console.error("Erro ao recuperar theme:", error);
      return null;
    }
  }

  useEffect(() => {
    const prepare = async () => {
      try {
        const storedToken = await getToken();
        const storedTheme = await getTheme();
        setToken(storedToken);
        setTheme(storedTheme);
      } catch (e) {
        console.error(e);
      } finally {
        setIsReady(true);
      }
    };

    prepare();
  }, []);

  useEffect(() => {
    if (!loaded || !isReady || hasRedirected) return;

    setHasRedirected(true);

    if (token) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)");
    }
  }, [loaded, isReady, token, hasRedirected, router]);

  if (!isReady || !loaded) {
    return <SplashScreen></SplashScreen>;
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        height: "100%",
        backgroundColor: colorScheme === "dark" ? "#111111" : "#dddddd",
      }}
    >
      <MFThemeProvider colorScheme={theme ? theme : colorScheme}>
        <ActiveExecutionProvider>
          <ConfettiOverlay />
          <Stack screenOptions={{ headerShown: false }} />
          <StatusBar style="auto" />
          <Toast />
        </ActiveExecutionProvider>
      </MFThemeProvider>
    </SafeAreaView>
  );
}
