import { MFPlusCard } from "@/components/my-fit-ui/cards";
import MFStackEditSubtitle from "@/components/my-fit-ui/stackEditSubtitle";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { User } from "@/model/user";
import { getMyData } from "@/service/user";
import { trainingStyles } from "@/styles/training";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export default function FoodScreen() {
  const { theme } = useTheme(),
    themeColors = Colors[`${theme}`];

  const [isLoading, setIsLoading] = useState<boolean>(false),
    [user, setUser] = useState<User>();

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
            client: {
              document: data?.user?.client?.document,
              cref: data?.user?.client?.cref,
              name: data?.user?.client?.name,
              nick: data?.user?.client?.nick,
              description: data?.user?.client?.description,
              phone: data?.user?.client?.phone,
              photo: data?.user?.client?.photo,
              backgroundImage: data?.user?.client?.backgroundImage,
              objective: data?.user?.client?.objective,
              instagram: data?.user?.client?.instagram,
              gender: data?.user?.client?.gender,
              birthDate: data?.user?.client?.birthDate,
            },
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

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: themeColors.background,
      }}
    >
      {isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size={40} color={themeColors.primary} />
        </View>
      ) : (
        <View style={trainingStyles.container}>
          <MFStackEditSubtitle
            themeColors={themeColors}
            title="Alimentação"
            align="left"
          ></MFStackEditSubtitle>
          <View style={{ height: 30 }}></View>
          <View style={trainingStyles.noTrainingBox}>
            <Text style={{ color: themeColors.text }}>
              Você não possui, pressione para adicionar.
            </Text>
          </View>
          <TouchableOpacity onPress={() => console.log("add")}>
            <MFPlusCard themeColors={themeColors}>
              <AntDesign
                name="pluscircleo"
                size={24}
                color={themeColors.themeGrey}
              />
            </MFPlusCard>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
