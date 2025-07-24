import { HelloWave } from "@/components/HelloWave";
import {
  MFInfoButton,
  MFPrimaryButton,
  MFPrimaryOutlinedButton,
} from "@/components/my-fit-ui/buttons";
import { MFDefaultCard } from "@/components/my-fit-ui/cards";
import { MFPasswordInput, MFTextInput } from "@/components/my-fit-ui/inputs";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { login } from "@/service/user";
import { authStyles } from "@/styles/auth";
import { globalStyles } from "@/styles/global";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function LoginScreen() {
  const { theme } = useTheme(),
    [isLoading, setIsLoading] = useState<boolean>(false),
    [email, setEmail] = useState<string>(""),
    [password, setPassword] = useState<string>("");

  const themeColors = Colors[`${theme}`];

  async function handleLogin() {
    if (email.length == 0 || password.length == 0) {
      Toast.show({
        type: "error",
        text1: "❌ Atenção, preencha todos os campos.",
      });
      return null;
    }

    setIsLoading(true);
    Keyboard.dismiss();
    const res = await login({ email, password });

    if (res?.user) {
      try {
        await SecureStore.setItemAsync("userId", res?.user?.id.toString());
        await SecureStore.setItemAsync("userToken", res?.user?.token);
        await SecureStore.setItemAsync("userEmail", res?.user?.email);
        await SecureStore.setItemAsync("userName", res?.user?.name);
        await SecureStore.setItemAsync("userType", res?.user?.type.toString());

        Toast.show({
          type: "success",
          text1: "✅ Seja bem-vindo.",
        });

        router.replace("/(tabs)");
      } catch (error) {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      Toast.show({
        type: "error",
        text1: `❌ ${res?.message}.`,
      });
    }
    setIsLoading(false);
  }

  function handleRegister() {
    router.push("./register");
  }

  function forgotPassword() {
    Toast.show({
      type: "success",
      text1: "🔄 Função não disponivel ainda.",
    });
  }

  return (
    <KeyboardAvoidingView
      style={[
        authStyles.container,
        { backgroundColor: themeColors.background },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <MFDefaultCard themeColors={themeColors}>
        <View
          style={[
            authStyles.imageBox,
            {
              paddingBottom: 10,
            },
          ]}
        >
          <Image
            style={authStyles.mflogo}
            source={
              theme === "dark"
                ? require(`@/assets/images/my-fit/logo/my_fit_club_v_r.png`)
                : require(`@/assets/images/my-fit/logo/my_fit_club_v_br.png`)
            }
          />
        </View>
        <View
          style={[
            globalStyles.flexc,
            {
              width: "100%",
              justifyContent: "center",
              alignItems: "flex-start",
            },
          ]}
        >
          <Text style={[authStyles.title, { color: themeColors.text }]}>
            Bem-vindo 👋<HelloWave></HelloWave>
          </Text>
          <Text
            style={[authStyles.subtitle, { color: themeColors.textSecondary }]}
          >
            Entre com sua conta!
          </Text>
        </View>

        <MFTextInput
          themeColors={themeColors}
          placeholder="E-mail..."
          value={email}
          onChangeText={setEmail}
          error=""
        ></MFTextInput>

        <MFPasswordInput
          themeColors={themeColors}
          placeholder="Senha..."
          value={password}
          onChangeText={setPassword}
          error=""
        ></MFPasswordInput>
        <View style={{ width: "80%", paddingTop: 10 }}>
          <MFPrimaryButton
            title="Entrar"
            onPress={handleLogin}
            isLoading={isLoading}
            isDisabled={isLoading}
            themeColors={themeColors}
          />
        </View>
        {!isLoading && (
          <View style={{ width: "80%" }}>
            <MFPrimaryOutlinedButton
              title="Cadastrar"
              onPress={handleRegister}
              isLoading={isLoading}
              isDisabled={isLoading}
              themeColors={themeColors}
            />
          </View>
        )}
        <View style={{ marginTop: 20 }}>
          <MFInfoButton
            title=""
            themeColors={themeColors}
            text="Esqueci minha senha"
            onPress={forgotPassword}
            isDisabled={isLoading}
          ></MFInfoButton>
        </View>
      </MFDefaultCard>
    </KeyboardAvoidingView>
  );
}
