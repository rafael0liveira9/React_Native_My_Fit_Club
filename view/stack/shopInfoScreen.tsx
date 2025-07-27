import { MFLogoutModal } from "@/components/my-fit-ui/modal";
import MFStackHeader from "@/components/my-fit-ui/stackHeader";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { getLevel } from "@/controllers/utils";
import {
  AssignTraining,
  getExercises,
  getGroups,
  getTrainingShopById,
} from "@/service/training";
import { getMyData } from "@/service/user";
import { globalStyles } from "@/styles/global";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function ShopInfoScreen() {
  const { width } = useWindowDimensions();
  const { theme } = useTheme(),
    themeColors = Colors[`${theme}`],
    params = useLocalSearchParams(),
    { type, id } = useLocalSearchParams(),
    router = useRouter();

  const [muscleGroups, setMuscleGroups] = useState<any>([]),
    [exercisesList, setExercisesList] = useState<any>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false),
    [isFreeModalOpen, setIsFreeModalOpen] = useState<boolean>(false);

  const [token, setToken] = useState<string>(""),
    [data, setData] = useState<any>([]),
    [user, setUser] = useState<any>([]);

  async function getUserData() {
    setIsLoading(true);
    try {
      const z = await SecureStore.getItemAsync("userToken");

      if (z) {
        const x = await getTrainingShopById({ token: z, id: +id });
        const y = await getGroups({ token: z });
        const w = await getExercises({ token: z, isFull: false });
        const a: any = await getMyData({ token: z });

        const muscleCopy =
          y && y.length > 0
            ? y.map((e: any) => ({ value: e.id.toString(), label: e?.name }))
            : [];

        const exercisesCopy = w.map((e: any) => ({
          ...e,
          value: e.value ? e.value.toString() : "",
        }));

        setToken(z);
        setData(x);
        setUser(a);
        setMuscleGroups(muscleCopy && muscleCopy.length > 0 ? muscleCopy : []);
        setExercisesList(
          exercisesCopy && exercisesCopy.length > 0 ? exercisesCopy : []
        );
      } else {
        console.log("Nenhum treino para recuperar");
      }
    } catch (error) {
      console.error("Erro ao recuperar treino:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function done() {
    setIsLoading(true);
    try {
      const x = await AssignTraining({
        trainingId: data.training.id,
        clientId: user?.user?.clientId,
        token: token,
      });
      setIsLoading(false);
      if (!x?.message) {
        Toast.show({
          text1: "Treino cadastrado com sucesso",
          type: "success",
        });
        router.push("/(tabs)/training");
      } else {
        Toast.show({
          text1: `${x?.message}`,
          type: "error",
        });
        router.back();
      }
    } catch (error) {
      setIsLoading(false);
      Toast.show({
        text1: `${error}`,
        type: "error",
      });
    }
  }

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: themeColors.background,
        position: "relative",
      }}
    >
      {isFreeModalOpen && (
        <MFLogoutModal
          warningVisible={isFreeModalOpen}
          themeColors={themeColors}
          text={"Treino gratuito, deseja atribuir a sua programação?"}
          onPress={done}
          close={() => setIsFreeModalOpen(false)}
          isLoading={isLoading}
        ></MFLogoutModal>
      )}
      <MFStackHeader
        title={"Adquirir Treino"}
        isLoading={isLoading}
        // titleBtn={!isSaveLoading ? "Salvar" : "Salvando"}
        // onPress={handleEdit}
      ></MFStackHeader>
      {isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            minHeight: 300,
          }}
        >
          <ActivityIndicator size={40} color={themeColors.primary} />
        </View>
      ) : !!data?.training ? (
        <View style={styles.container}>
          <View style={styles.bannerContainer}>
            <View style={styles.bannerImageWrapper}>
              {data.training?.photo && (
                <Image
                  source={{ uri: data.training?.photo }}
                  style={styles.bannerImage}
                />
              )}
            </View>
          </View>
          <View style={{ width: "100%", paddingHorizontal: 25 }}>
            <View style={styles.bannerOverlay}>
              <Text style={[styles.title, { color: themeColors.text }]}>
                {data.training?.name}
              </Text>
            </View>

            <View style={styles.authorBox}>
              {data.training.user?.photo && (
                <Image
                  source={{ uri: data.training.user?.photo }}
                  style={styles.authorAvatar}
                />
              )}
              <View style={globalStyles.flexc}>
                <View style={[globalStyles.flexr, { gap: 10 }]}>
                  <Text
                    style={[styles.authorName, { color: themeColors.text }]}
                  >
                    <Text style={{ color: themeColors.text, fontWeight: 400 }}>
                      Autor:{" "}
                    </Text>{" "}
                    {data.training.user?.name}
                  </Text>
                  {data.training.user?.cref && (
                    <View
                      style={[
                        globalStyles.flexr,
                        {
                          backgroundColor: themeColors.white,
                          borderColor: themeColors.grey,
                          borderWidth: 1,
                          alignItems: "center",
                          paddingHorizontal: 7,
                          borderRadius: 5,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "900",
                          color: "#105661",
                        }}
                      >
                        Cr
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "900",
                          color: "#3F9933",
                        }}
                      >
                        ef
                      </Text>
                      <FontAwesome
                        style={{ marginLeft: 5 }}
                        name="check-circle"
                        size={14}
                        color={themeColors.success}
                      />
                    </View>
                  )}
                </View>

                <Text style={styles.authorDesc}>
                  {data.training.user.description}
                </Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={[styles.rating, { color: themeColors.warning }]}>
                <Text style={{ color: themeColors.text }}>Avaliação:</Text> ⭐{" "}
                {data.training?.evaluation
                  ? data.training?.evaluation.toFixed(1)
                  : "N/A"}{" "}
                / 5.0
              </Text>
              <Text
                style={[styles.description, { color: themeColors.themeGrey }]}
              >
                <Text style={{ color: themeColors.text, fontWeight: "bold" }}>
                  Descrição:{" "}
                </Text>
                {data.training.description}
              </Text>
            </View>

            <View
              style={[
                globalStyles.flexr,
                {
                  width: "100%",
                  justifyContent: "flex-end",
                  paddingVertical: 30,
                },
              ]}
            >
              <View
                style={{
                  width: "70%",
                  height: 1,
                  backgroundColor: themeColors.text,
                }}
              ></View>
            </View>

            <View
              style={[
                styles.detailsBox,
                { backgroundColor: themeColors.secondary },
              ]}
            >
              <Text style={[styles.detailsText, { color: themeColors.text }]}>
                <AntDesign
                  name="checkcircle"
                  size={16}
                  color={themeColors.success}
                />
                {"  "}
                {data.training.series.length} exercícios
              </Text>
              <Text style={[styles.detailsText, { color: themeColors.text }]}>
                <AntDesign
                  name="checkcircle"
                  size={16}
                  color={themeColors.success}
                />
                {"  "}
                Duração média: {Math.round(
                  data.training.executionTime / 60
                )}{" "}
                min
              </Text>
              <Text style={[styles.detailsText, { color: themeColors.text }]}>
                <AntDesign
                  name="checkcircle"
                  size={16}
                  color={themeColors.success}
                />
                {"  "}
                Nível: {getLevel({ level: data.training.level })?.name}
              </Text>
              {data.training?.evaluation === null ? (
                <Text style={[styles.detailsText, { color: themeColors.text }]}>
                  <AntDesign
                    name="closecircle"
                    size={16}
                    color={themeColors.orange}
                  />
                  {"  "}
                  Treino ainda não tem avaliações
                </Text>
              ) : data.training?.evaluation > 4 ? (
                <Text style={[styles.detailsText, { color: themeColors.text }]}>
                  <AntDesign
                    name="checkcircle"
                    size={16}
                    color={themeColors.success}
                  />
                  {"  "}
                  Melhores avaliações da comunidade
                </Text>
              ) : data.training?.evaluation > 3 &&
                data.training?.evaluation <= 4 ? (
                <Text style={[styles.detailsText, { color: themeColors.text }]}>
                  <AntDesign
                    name="checkcircle"
                    size={16}
                    color={themeColors.orange}
                  />
                  {"  "}
                  Avaliações medianas da comunidade
                </Text>
              ) : (
                data.training?.evaluation < 3 &&
                data.training?.evaluation >= 0 && (
                  <Text
                    style={[styles.detailsText, { color: themeColors.text }]}
                  >
                    <AntDesign
                      name="closecircle"
                      size={16}
                      color={themeColors.danger}
                    />
                    {"  "}
                    Piores avaliações da comunidade
                  </Text>
                )
              )}

              {!!data.training?.user?.cref ? (
                <Text style={[styles.detailsText, { color: themeColors.text }]}>
                  <AntDesign
                    name="checkcircle"
                    size={16}
                    color={themeColors.success}
                  />
                  {"  "}
                  Personal verificado
                </Text>
              ) : data.training?.user?.userType === 4 ||
                data.training?.user?.userType === 5 ? (
                <Text style={[styles.detailsText, { color: themeColors.text }]}>
                  <AntDesign
                    name="closecircle"
                    size={16}
                    color={themeColors.orange}
                  />
                  {"  "}
                  Personal não verificado
                </Text>
              ) : (
                <Text style={[styles.detailsText, { color: themeColors.text }]}>
                  <AntDesign
                    name="closecircle"
                    size={16}
                    color={themeColors.orange}
                  />
                  {"  "}
                  Usuario da comunidade
                </Text>
              )}
            </View>
            <View
              style={{
                width: "100%",
                padding: 16,
                borderRadius: 12,
                backgroundColor: themeColors.secondary,
                marginTop: 24,
              }}
            >
              <View
                style={{
                  alignItems: "flex-end",
                  marginBottom: 12,
                  marginRight: 20,
                }}
              >
                {data?.value === 0 || !data?.value ? (
                  // Gratuito
                  <View
                    style={{
                      paddingHorizontal: 15,
                      paddingVertical: 5,
                      backgroundColor: themeColors.success,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "900",
                        paddingHorizontal: 15,
                        color: themeColors.white,
                      }}
                    >
                      GRÁTIS
                    </Text>
                  </View>
                ) : (
                  <>
                    {/* Preço original com desconto aplicado */}
                    {data?.discount > 0 && (
                      <Text
                        style={{
                          color: themeColors.themeGrey,
                          textDecorationLine: "line-through",
                          fontSize: 14,
                        }}
                      >
                        R$ {data.value.toFixed(2).replace(".", ",")}
                      </Text>
                    )}
                    {/* Preço com desconto ou valor cheio */}
                    <Text
                      style={{
                        color: themeColors.success,
                        fontSize: 22,
                        fontWeight: "900",
                      }}
                    >
                      R${" "}
                      {(data.value - (data.discount || 0))
                        .toFixed(2)
                        .replace(".", ",")}
                    </Text>
                  </>
                )}
              </View>

              <TouchableOpacity
                onPress={
                  data.value - (data.discount || 0) > 0
                    ? () => alert("Comprar treino (não esta disponivel ainda)")
                    : () => setIsFreeModalOpen(true)
                }
                style={{
                  backgroundColor: themeColors.primary,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: themeColors.white,
                    fontSize: 16,
                    fontWeight: "900",
                  }}
                >
                  Adquirir Treino
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View>
          <Text style={{ fontSize: 20, color: themeColors.text }}>
            Nenhum item encontrado 😢
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  bannerContainer: {
    position: "relative",
    overflow: "hidden",
    height: 200,
    marginBottom: 16,
  },
  bannerImageWrapper: {
    width: "100%",
    height: "100%",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  bannerOverlay: {
    width: "100%",
    paddingVertical: 12,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
  },
  infoBox: {
    gap: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
  },
  detailsBox: {
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  detailsText: {
    fontSize: 15,
    color: "#333",
  },
  authorBox: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingLeft: 30,
    marginBottom: 20,
  },
  authorAvatar: {
    width: 35,
    height: 35,
    borderRadius: 40,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  authorDesc: {
    fontSize: 14,
    color: "#777",
  },
  buttonContainer: {
    marginTop: 16,
    alignItems: "center",
    gap: 12,
  },
  priceText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  buyButton: {
    backgroundColor: "#0f9d58",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
