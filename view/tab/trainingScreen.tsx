import { MFPlusCard, MFTrainingCard } from "@/components/my-fit-ui/cards";
import MFSeparator from "@/components/my-fit-ui/separator";
import MFStackEditSubtitle from "@/components/my-fit-ui/stackEditSubtitle";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { User } from "@/model/user";
import { getTrainingsByToken } from "@/service/training";
import { getMyData } from "@/service/user";
import { trainingStyles } from "@/styles/training";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export default function TrainingScreen() {
  const { theme } = useTheme(),
    themeColors = Colors[`${theme}`],
    router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false),
    [user, setUser] = useState<User>(),
    [assign, setAssign] = useState<any>();

  async function getUserData() {
    setIsLoading(true);
    try {
      const y = await SecureStore.getItemAsync("userId");
      const z = await SecureStore.getItemAsync("userToken");

      if (y && z) {
        const data: any = await getMyData({ token: z });
        const myTrainings = await getTrainingsByToken({ token: z });

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

          if (!!myTrainings) {
            setAssign(myTrainings);
          }
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
            title="Treinamento"
            align="left"
          ></MFStackEditSubtitle>
          <View style={{ height: 30 }}></View>
          {assign ? (
            assign?.map((e: any, y: number) => {
              return (
                <TouchableOpacity
                  key={y}
                  onPress={() => router.push(`/training/${(e?.id).toString()}`)}
                  style={{
                    position: "relative",
                  }}
                >
                  <MFTrainingCard
                    themeColors={themeColors}
                    data={e}
                  ></MFTrainingCard>
                  <View style={{ width: "100%", padding: 30 }}>
                    <MFSeparator
                      width={220}
                      height={1}
                      color={themeColors.themeGrey}
                    ></MFSeparator>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={trainingStyles.noTrainingBox}>
              <Text style={{ color: themeColors.text }}>
                Você não possui, pressione para adicionar.
              </Text>
            </View>
          )}
          <TouchableOpacity onPress={() => router.push("/(stack)/training")}>
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
