import { MFPrimaryButton } from "@/components/my-fit-ui/buttons";
import { MFTrainingExecutionCard } from "@/components/my-fit-ui/cards";
import { MFLogoutModal } from "@/components/my-fit-ui/modal";
import MFSeparator from "@/components/my-fit-ui/separator";
import MFStackEditSubtitle from "@/components/my-fit-ui/stackEditSubtitle";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { User } from "@/model/user";
import {
  FinishTraining,
  getTrainingsByToken,
  TrainingExecute,
  UnassignTraining,
} from "@/service/training";
import { getMyData } from "@/service/user";
import { globalStyles } from "@/styles/global";
import { trainingStyles } from "@/styles/training";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import Toast from "react-native-toast-message";

export default function TrainingScreen() {
  const { theme } = useTheme(),
    themeColors = Colors[`${theme}`],
    router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false),
    [isExecutionLoading, setIsExecutionLoading] = useState<boolean>(false),
    [user, setUser] = useState<User>(),
    [modalType, setModalType] = useState<number>(1),
    [actualId, setActualId] = useState<number | null>(null),
    [confirmodalOpen, setConfirmodalOpen] = useState<boolean>(false),
    [executionItem, setExecutionItem] = useState<any | null>(null),
    [token, setToken] = useState<string | null>(),
    [tempDel, setTempDel] = useState<number[]>([]),
    [assign, setAssign] = useState<any>();

  async function getUserData() {
    setIsLoading(true);
    try {
      const y = await SecureStore.getItemAsync("userId");
      const z = await SecureStore.getItemAsync("userToken");

      setToken(z);
      setExecutionItem(null);
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
            const y = [...(myTrainings || [])].filter(
              (e) =>
                !!e.training?.trainingExecution[0]?.startAt &&
                !e.training?.trainingExecution[0]?.endAt
            );
            if (!!y && y.length > 0) {
              setExecutionItem(y[0]?.id);
            }
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

  function GoToExecution(id: number) {
    if (id) router.push(`/execution/${id.toString()}`);
    setConfirmodalOpen(false);
  }

  async function CreateAndGoToExecution() {
    if (actualId && token) {
      setIsLoading(true);
      const x = await TrainingExecute({
        trainingId: +actualId,
        token: token,
      });

      setIsLoading(false);
      setConfirmodalOpen(false);

      if (x?.status === 200 && x.data?.execution?.id) {
        Toast.show({
          type: "success",
          text1: `✅ Treino iniciado.`,
        });
        router.push(`/execution/${x.data?.execution?.id.toString()}`);
      } else {
        Toast.show({
          type: "error",
          text1: `❌ Erro ao iniciar o treino.`,
        });
      }
    }
  }

  async function FinishExecution() {
    if (actualId && token) {
      setIsLoading(true);

      const x = await FinishTraining({
        evaluation: 999,
        executionId: +actualId,
        observation: "Finalizado sem avaliação",
        token: token,
      });

      setIsLoading(false);
      setConfirmodalOpen(false);
      if (x?.status === 200) {
        Toast.show({
          type: "success",
          text1: `✅ Treino finalizado.`,
        });
        setAssign([]);
        getUserData();
      } else {
        Toast.show({
          type: "error",
          text1: `❌ Erro ao finalizar o treino.`,
        });
      }
    }
  }

  function OpenModal(id: number, type: number) {
    if (id) {
      setModalType(type);
      setActualId(id);
      setConfirmodalOpen(true);
    }
  }

  async function Unassign(id: number) {
    if (id && token) {
      setIsExecutionLoading(true);
      const x = await UnassignTraining({
        id: id,
        token: token,
      });

      if (x?.status === 200) {
        setTempDel([...tempDel, id]);
        Toast.show({
          type: "success",
          text1: `✅ Treino removido.`,
        });
      } else {
        Toast.show({
          type: "error",
          text1: `❌ Erro ao remover o treino.`,
        });
      }
      setIsExecutionLoading(false);
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
      {confirmodalOpen && (
        <MFLogoutModal
          warningVisible={confirmodalOpen}
          themeColors={themeColors}
          text={modalType === 1 ? "Iniciar o treino?" : "Finalizar o treino?"}
          onPress={
            modalType === 1
              ? () => CreateAndGoToExecution()
              : () => FinishExecution()
          }
          close={() => setConfirmodalOpen(false)}
          isLoading={isLoading}
        ></MFLogoutModal>
      )}

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
          <ScrollView style={{ paddingHorizontal: 10, paddingTop: 30 }}>
            <MFStackEditSubtitle
              themeColors={themeColors}
              title="Meus Treinos"
              info="Lista de terinos que ja estão atribuidos e prontos para executar."
            ></MFStackEditSubtitle>
            <View style={{ height: 30 }}></View>
            {assign && Array.isArray(assign) && assign.length > 0 ? (
              assign?.map((e: any, y: number) => {
                const isNew =
                  !e.training?.trainingExecution ||
                  (e.training?.trainingExecution &&
                    e.training?.trainingExecution.length === 0);

                if (tempDel.includes(e.id)) {
                  return null;
                }
                return (
                  <View
                    key={y}
                    style={{
                      position: "relative",
                    }}
                  >
                    <MFTrainingExecutionCard
                      isNew={isNew}
                      isExecutionLoading={isExecutionLoading}
                      GoToExecution={GoToExecution}
                      OpenModal={OpenModal}
                      isInExecution={executionItem}
                      themeColors={themeColors}
                      data={e}
                      Unassign={Unassign}
                    ></MFTrainingExecutionCard>
                    <View style={{ width: "100%", padding: 30 }}>
                      <MFSeparator
                        width={220}
                        height={1}
                        color={themeColors.themeGrey}
                      ></MFSeparator>
                    </View>
                  </View>
                );
              })
            ) : (
              <View
                style={[
                  trainingStyles.noTrainingBox,
                  {
                    shadowColor: themeColors.text,
                    backgroundColor: themeColors.backgroundSecondary,
                  },
                ]}
              >
                <Image
                  style={trainingStyles.fitinhoImage}
                  source={
                    user?.client.gender === 2
                      ? require(`@/assets/images/my-fit/fitinho_fem.png`)
                      : require(`@/assets/images/my-fit/fitinho_masc.png`)
                  }
                />
                <View style={[globalStyles.flexc, { width: "55%", gap: 20 }]}>
                  <Text
                    style={{
                      color: themeColors.text,
                      textAlign: "center",
                      fontSize: 20,
                    }}
                  >
                    Você não possui nenhum programa de treinamento.
                  </Text>
                  <MFPrimaryButton
                    themeColors={themeColors}
                    onPress={() => router.push("/(tabs)/shop")}
                    title="Adicionar"
                    isWhiteDetails={true}
                  ></MFPrimaryButton>
                </View>
              </View>
            )}
            {assign && Array.isArray(assign) && assign.length > 0 && (
              <>
                <View style={[globalStyles.flexr, { height: 100 }]}>
                  <Text style={{ color: themeColors.text }}>
                    Você não possui mais treinos.
                  </Text>
                </View>
                <View style={{ marginBottom: 70, paddingHorizontal: "10%" }}>
                  <MFPrimaryButton
                    themeColors={themeColors}
                    onPress={() => router.push("/(tabs)/shop")}
                    title="Adicionar"
                    isWhiteDetails={true}
                  ></MFPrimaryButton>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
