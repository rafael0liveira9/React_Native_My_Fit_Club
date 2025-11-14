import { MFTrainingExecutionCard } from "@/components/my-fit-ui/cards";
import { FloatingContinueTrainingButtonWrapper } from "@/components/my-fit-ui/floatingButton";
import { MFLogoutModal } from "@/components/my-fit-ui/modal";
import MFSeparator from "@/components/my-fit-ui/separator";
import { TrainingSkeleton } from "@/components/my-fit-ui/skeleton";
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
import { trainingStyles } from "@/styles/training";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
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
    [typePermission, setTypePermission] = useState<any>({
      type: 2,
      count: 0,
    }),
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
        const myTrainings = await getTrainingsByToken({
          token: z,
          personalId: "not",
        });

        if (!!data) {
          setUser({
            id: data?.user?.id,
            type: data?.user?.typeId,
            email: data?.user?.email,
            client: {
              id: data?.user?.client?.id,
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

  function EditTraining(id: number) {
    if (id) {
      router.push(`/(stack)/edit-training/${id}`);
    }
  }

  function myTrainingsCount() {
    if (!!assign && Array.isArray(assign) && assign.length > 0) {
      const count = assign.filter(
        (e: any) => e.training.authorId === user?.client.id
      );

      if (!!count && Array.isArray(count)) {
        setTypePermission({
          type: user?.type,
          count: count.length,
        });
      }
    }
  }

  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    myTrainingsCount();
  }, [assign]);

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
      <View style={trainingStyles.container}>
        <ScrollView style={{ paddingHorizontal: 10, paddingTop: 20 }}>
          {/* Header melhorado */}
          <View
            style={{
              backgroundColor: themeColors.primary,
              marginHorizontal: 10,
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <FontAwesome6
                  name="dumbbell"
                  size={24}
                  color={themeColors.white}
                />
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "700",
                    color: themeColors.white,
                  }}
                >
                  Meus Treinos
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: themeColors.white + "20",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    color: themeColors.white,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {typePermission.type === 2
                    ? `${typePermission.count}/1`
                    : "ILIMITADO"}
                </Text>
              </View>
            </View>
            <Text
              style={{
                color: themeColors.white + "E6",
                fontSize: 14,
                marginBottom: 16,
                lineHeight: 20,
              }}
            >
              Treinos criados por você. Personalize, edite e execute quando
              quiser.
            </Text>

            {/* Botão Criar Novo Treino - Destacado */}
            {!(typePermission.type === 2 && typePermission.count >= 1) && (
              <TouchableOpacity
                onPress={() => router.push("/(stack)/create-training")}
                style={{
                  backgroundColor: themeColors.white,
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name="add-circle"
                  size={22}
                  color={themeColors.primary}
                />
                <Text
                  style={{
                    color: themeColors.primary,
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  Criar Novo Treino
                </Text>
              </TouchableOpacity>
            )}

            {typePermission.type === 2 && typePermission.count >= 1 && (
              <View
                style={{
                  backgroundColor: themeColors.warning + "20",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <MaterialIcons
                  name="info"
                  size={20}
                  color={themeColors.white}
                />
                <Text
                  style={{
                    color: themeColors.white,
                    fontSize: 13,
                    flex: 1,
                  }}
                >
                  Limite atingido. Upgrade para criar mais treinos!
                </Text>
              </View>
            )}
          </View>

          {isLoading ? (
            <View style={{ paddingHorizontal: 10 }}>
              <TrainingSkeleton themeColors={themeColors} />
              <TrainingSkeleton themeColors={themeColors} />
              <TrainingSkeleton themeColors={themeColors} />
              <TrainingSkeleton themeColors={themeColors} />
            </View>
          ) : (
            <>
              {assign && Array.isArray(assign) && assign.length > 0 ? (
                (() => {
                  const sorted = assign.slice().sort((a: any, b: any) => {
                    const aIsMine =
                      a.training.authorId === user?.client?.id ? 0 : 1;
                    const bIsMine =
                      b.training.authorId === user?.client?.id ? 0 : 1;
                    return aIsMine - bIsMine;
                  });

                  if (typePermission.type === 2) {
                    const meus = sorted.filter(
                      (e: any) => e.training.authorId === user?.client?.id
                    );
                    const outros = sorted.filter(
                      (e: any) => e.training.authorId !== user?.client?.id
                    );
                    return [...meus.slice(0, 1), ...outros];
                  }

                  return sorted;
                })().map((e: any, y: number) => {
                  const isNew =
                    !e.training?.trainingExecution ||
                    (e.training?.trainingExecution &&
                      e.training?.trainingExecution.length === 0);

                  if (tempDel.includes(e.id)) {
                    return null;
                  }

                  const isMyTraining = e.training.authorId === user?.client?.id;

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
                        EditTraining={EditTraining}
                        isMyTraining={isMyTraining}
                      ></MFTrainingExecutionCard>
                      <View style={{ width: "100%", padding: 10 }}>
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
                      backgroundColor: themeColors.backgroundSecondary,
                      marginHorizontal: 20,
                      borderRadius: 20,
                      padding: 30,
                    },
                  ]}
                >
                  <View
                    style={{
                      backgroundColor: themeColors.primary + "15",
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 20,
                    }}
                  >
                    <FontAwesome6
                      name="dumbbell"
                      size={36}
                      color={themeColors.primary}
                    />
                  </View>
                  <Text
                    style={{
                      color: themeColors.text,
                      textAlign: "center",
                      fontSize: 22,
                      fontWeight: "700",
                      marginBottom: 10,
                    }}
                  >
                    Nenhum treino criado ainda
                  </Text>
                  <Text
                    style={{
                      color: themeColors.textSecondary,
                      textAlign: "center",
                      fontSize: 15,
                      marginBottom: 30,
                      lineHeight: 22,
                      paddingHorizontal: 20,
                    }}
                  >
                    Comece criando seu primeiro treino personalizado e organize
                    seus exercícios do seu jeito!
                  </Text>
                  {!(
                    typePermission.type === 2 && typePermission.count >= 1
                  ) && (
                    <TouchableOpacity
                      onPress={() => router.push("/(stack)/create-training")}
                      style={{
                        backgroundColor: themeColors.primary,
                        paddingVertical: 16,
                        paddingHorizontal: 40,
                        borderRadius: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons
                        name="add-circle"
                        size={22}
                        color={themeColors.white}
                      />
                      <Text
                        style={{
                          color: themeColors.white,
                          fontSize: 16,
                          fontWeight: "700",
                        }}
                      >
                        Criar Meu Primeiro Treino
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {assign && Array.isArray(assign) && assign.length > 0 && (
                <View style={{ marginTop: 20, marginBottom: 80 }}>
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: themeColors.text + "10",
                      paddingTop: 30,
                      paddingHorizontal: 20,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: themeColors.textSecondary,
                        fontSize: 14,
                        marginBottom: 20,
                      }}
                    >
                      Esses são todos os seus treinos
                    </Text>
                    {/* {!(
                    typePermission.type === 2 && typePermission.count >= 1
                  ) && (
                    <TouchableOpacity
                      onPress={() => router.push("/(stack)/create-training")}
                      style={{
                        backgroundColor: themeColors.primary,
                        paddingVertical: 14,
                        paddingHorizontal: 30,
                        borderRadius: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons
                        name="add-circle"
                        size={20}
                        color={themeColors.white}
                      />
                      <Text
                        style={{
                          color: themeColors.white,
                          fontSize: 15,
                          fontWeight: "700",
                        }}
                      >
                        Criar Mais Um Treino
                      </Text>
                    </TouchableOpacity>
                  )} */}
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
      <FloatingContinueTrainingButtonWrapper themeColors={themeColors} />
    </View>
  );
}

/* {assign && Array.isArray(assign) && assign.length > 0 ? (
              assign
                ?.slice()
                .sort((a: any, b: any) => {
                  const aIsMine =
                    a.training.authorId === user?.client?.id ? 0 : 1;
                  const bIsMine =
                    b.training.authorId === user?.client?.id ? 0 : 1;
                  return aIsMine - bIsMine;
                })
                .map((e: any, y: number) => {
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
                      <View style={{ width: "100%", padding: 10 }}>
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
                  {!(
                    typePermission.type === 2 && typePermission.count >= 1
                  ) && (
                    <MFPrimaryButton
                      themeColors={themeColors}
                      isDisabled={
                        typePermission.type === 2 && typePermission.count >= 1
                      }
                      onPress={() => router.push("/(stack)/training")}
                      title="Adicionar"
                      isWhiteDetails={true}
                    ></MFPrimaryButton>
                  )}
                </View>
              </View>
            )} */
