import { getFaq } from "@/service/general";
import { getMyData } from "@/service/user";
import { globalStyles } from "@/styles/global";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import HeaderPopUp from "./headerInfoPop";
import { MFDefaultModal, MFLogoutModal } from "./modal";

export default function MFMainHeader({
  themeColors,
  theme,
  toggleTheme,
  isOpen,
  setIsOpen,
}: {
  themeColors: any;
  theme: string;
  toggleTheme: () => void;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false),
    [user, setUser] = useState<any>(),
    [faq, setFaq] = useState<any>(),
    [warningVisible, setWarningVisible] = useState<boolean>(false);

  async function getUserData() {
    setIsLoading(true);
    try {
      const y = await SecureStore.getItemAsync("userId");
      const z = await SecureStore.getItemAsync("userToken");

      if (y && z) {
        const data: any = await getMyData({ token: z });
        const gettheFaq: any = await getFaq();

        setFaq(gettheFaq);

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
      <TouchableOpacity
        onPress={(e: any) => {
          e.stopPropagation();
          onOpenChange();
        }}
      >
        {isOpen ? (
          <AntDesign name="menu-unfold" size={28} color={themeColors?.white} />
        ) : (
          <AntDesign name="menu-fold" size={28} color={themeColors?.white} />
        )}
      </TouchableOpacity>
      <View style={globalStyles.headerImageBox}>
        <Image
          style={globalStyles.headerLogo}
          source={require("@/assets/images/my-fit/logo/my_fit_club_h_b.png")}
        />
      </View>
      {isOpen && (
        <MFDefaultModal
          themeColors={themeColors}
          close={() => setIsOpen(false)}
          warningVisible={isOpen}
        >
          <HeaderPopUp
            globalStyles={globalStyles}
            themeColors={themeColors}
            theme={theme}
            toggleTheme={toggleTheme}
            user={user}
            isLoading={isLoading}
            onOpenChange={onOpenWarning}
            onOpenWarning={onOpenWarning}
            faq={faq}
          ></HeaderPopUp>
        </MFDefaultModal>
      )}
      <TouchableOpacity
        onPress={() => router.push("/(stack)/profile/page")}
        style={[globalStyles.headerThemeBtn, { zIndex: 10 }]}
      >
        {user?.photo ? (
          <Image
            style={
              (globalStyles.flexr,
              {
                width: 40,
                height: 40,
                borderRadius: 40,
                borderWidth: 1,
                borderColor: themeColors.white,
              })
            }
            source={{ uri: user?.photo }}
          />
        ) : (
          <View
            style={[
              globalStyles.flexr,
              {
                width: 40,
                height: 40,
                borderRadius: 40,
                borderWidth: 2,
                borderColor: themeColors.white,
                backgroundColor: themeColors.white,
              },
            ]}
          >
            {isLoading ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size={20} color={themeColors.white} />
              </View>
            ) : (
              <Text
                style={{
                  fontSize: 17,
                  color: themeColors.themeGrey,
                  fontWeight: 900,
                }}
              >
                {user?.name?.charAt(0).toUpperCase() ?? "?"}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
