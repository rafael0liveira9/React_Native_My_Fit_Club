import { getMyData } from "@/service/user";
import { globalStyles } from "@/styles/global";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import HeaderPopUp from "./headerInfoPop";
import { MFLogoutModal } from "./modal";

export default function MFMainHeader({
  themeColors,
  theme,
  toggleTheme,
}: {
  themeColors: any;
  theme: string;
  toggleTheme: () => void;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false),
    [user, setUser] = useState<any>(),
    [warningVisible, setWarningVisible] = useState<boolean>(false),
    [isOpen, setIsOpen] = useState<boolean>(false);

  async function getUserData() {
    setIsLoading(true);
    try {
      const y = await SecureStore.getItemAsync("userId");
      const z = await SecureStore.getItemAsync("userToken");

      if (y && z) {
        const data: any = await getMyData({ token: z });

        if (!!data) {
          setUser({
            id: data?.user?.id,
            type: data?.typeId,
            email: data?.user?.email,
            name: data?.user?.client?.name,
            nick: data?.user?.client?.nick,
            photo: data?.user?.client?.photo,
          });
        } else {
          console.log("Nenhum usuário para recuperar");
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erro ao recuperar usuário:", error);
      setIsLoading(false);
      return null;
    }
  }

  async function Logout() {
    try {
      setIsLoading(true);
      const keysToDelete = ["userToken", "userName", "userType", "userId"];
      await Promise.all(
        keysToDelete.map((key) => SecureStore.deleteItemAsync(key))
      );
      console.log("SecureStore limpo!");
      setIsLoading(false);
      router.replace("/(auth)");
    } catch (error) {
      console.error("Erro ao limpar SecureStore:", error);
      setIsLoading(false);
    }
  }

  function onOpenChange() {
    setIsOpen(!isOpen);
  }

  function onOpenWarning() {
    setWarningVisible(true);
  }
  function getIcon() {
    switch (isOpen) {
      case true:
        return (
          <AntDesign name="closecircle" size={45} color={themeColors.white} />
        );

      default:
        return (
          <AntDesign name="infocirlce" size={28} color={themeColors.white} />
        );
    }
  }

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <View
      style={[globalStyles.header, { backgroundColor: themeColors.primary }]}
    >
      {warningVisible && (
        <MFLogoutModal
          warningVisible={warningVisible}
          themeColors={themeColors}
          text={"Deseja sair da conta?"}
          onPress={() => Logout()}
          close={() => setWarningVisible(false)}
          isLoading={isLoading}
        ></MFLogoutModal>
      )}
      <View style={globalStyles.headerImageBox}>
        <Image
          style={globalStyles.headerLogo}
          source={require("@/assets/images/my-fit/logo-fundo-vermelho.png")}
        />
      </View>
      {isOpen && (
        <HeaderPopUp
          globalStyles={globalStyles}
          themeColors={themeColors}
          theme={theme}
          toggleTheme={toggleTheme}
          user={user}
          isLoading={isLoading}
          onOpenChange={onOpenWarning}
          onOpenWarning={onOpenWarning}
        ></HeaderPopUp>
      )}
      <TouchableOpacity
        onPress={onOpenChange}
        style={[globalStyles.headerThemeBtn, { zIndex: 10 }]}
      >
        {getIcon()}
      </TouchableOpacity>
    </View>
  );
}
