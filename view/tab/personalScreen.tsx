import { MFPrimaryButton } from "@/components/my-fit-ui/buttons";
import {
  MFPersonalEvaluationCard,
  MFPersonalInfoCard,
  MFPersonalRequestCard,
  MFTrainingExecutionCard,
} from "@/components/my-fit-ui/cards";
import { FloatingContinueTrainingButtonWrapper } from "@/components/my-fit-ui/floatingButton";
import { MFLogoutModal } from "@/components/my-fit-ui/modal";
import { ClientSkeleton } from "@/components/my-fit-ui/skeleton";
import MFStackEditSubtitle from "@/components/my-fit-ui/stackEditSubtitle";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { User } from "@/model/user";
import {
  acceptPersonalRequest,
  getAllPersonalRequests,
  getMyPersonals,
  getPersonalsEvaluations,
  sendPersonalEvaluation,
} from "@/service/relations";
import { getTrainingsByToken, TrainingExecute } from "@/service/training";
import { getMyData } from "@/service/user";
import { globalStyles } from "@/styles/global";
import { trainingStyles } from "@/styles/training";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import Toast from "react-native-toast-message";

export default function PersonalScreen() {
  const width = Dimensions.get("window").width;
  const PAGE_WIDTH = width * 0.8;
  const OFFSET = (width - PAGE_WIDTH) / 2;
  const { theme } = useTheme(),
    themeColors = Colors[`${theme}`],
    router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false),
    [isEvaluationLoading, setIsEvaluationLoading] = useState<boolean>(false),
    [isRequestLoading, setIsRequestLoading] = useState<boolean>(false),
    [user, setUser] = useState<User>(),
    [modalType, setModalType] = useState<number>(1),
    [personalTrainings, setPersonalTrainings] = useState<any>(),
    [personalEvaluations, setPersonalEvaluations] = useState<any>(),
    [evaluationFilter, setEvaluationFilter] = useState<number>(0),
    [requests, setRequests] = useState<any>(),
    [personals, setPersonals] = useState<any>(),
    [myEvaluation, setMyEvaluation] = useState<any>(null),
    [executionItem, setExecutionItem] = useState<any | null>(null),
    [actualId, setActualId] = useState<number | null>(null),
    [confirmodalOpen, setConfirmodalOpen] = useState<boolean>(false),
    [token, setToken] = useState<string | null>();

  const [selectedId, setSelectedId] = useState<number | null>(null),
    [selectedPersonal, setSelectedPersonal] = useState<any>(null);

  async function getUserData() {
    setIsLoading(true);
    try {
      const y = await SecureStore.getItemAsync("userId");
      const z = await SecureStore.getItemAsync("userToken");

      setToken(z);
      if (y && z) {
        const data: any = await getMyData({ token: z });
        const req: any = await getAllPersonalRequests({ token: z });
        const persons: any = await getMyPersonals({ token: z });

        if (!!persons) {
          setPersonals(persons);
        }

        if (!!req) {
          setRequests(req);
        }

        if (!!data) {
          setUser({
            id: data?.user?.id,
            type: data?.typeId,
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

  async function getPersonalAssignments() {
    if (selectedId) {
      const personal =
        !!personals && Array.isArray(personals)
          ? personals?.find((a: any) => a.id === selectedId)
          : null;

      if (!personal) return;

      const personalId = personal.client_relationship_responsibleToclient?.id;

      const res = await getTrainingsByToken({
        token: token!,
        personalId: personalId ? personalId.toString() : undefined,
      });

      if (res && Array.isArray(res) && res.length > 0) {
        setPersonalTrainings(res);
      }
    }
  }

  async function RequestNewpersonal(id: number, type: number) {
    setIsRequestLoading(true);
    let x;
    if (type === 1) {
      x = await acceptPersonalRequest({
        token: token!,
        id,
        accept: true,
      });
    } else {
      x = await acceptPersonalRequest({
        token: token!,
        id,
        accept: false,
      });
    }
    setTimeout(() => {
      setIsRequestLoading(false);
    }, 1000);
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

  async function getAllEvaluations() {
    if (selectedPersonal && token) {
      const x = await getPersonalsEvaluations({
        token: token,
        personalId:
          selectedPersonal?.client_relationship_responsibleToclient?.id,
        evaluation: evaluationFilter !== 0 ? evaluationFilter : undefined,
      });

      if (!!x) {
        setPersonalEvaluations(x);
      }
    }
  }

  async function createOrEditEvaluation() {
    if (selectedPersonal && myEvaluation && token) {
      setIsEvaluationLoading(true);
      const x = await sendPersonalEvaluation({
        token: token,
        personalId:
          selectedPersonal?.client_relationship_responsibleToclient?.id,
        evaluation: myEvaluation?.evaluation,
        observations: myEvaluation?.observations,
      });

      setIsEvaluationLoading(false);

      if (x) {
        Toast.show({
          type: "success",
          text1: `✅ Avaliação enviada com sucesso.`,
        });
        getAllEvaluations();
      }
    }
  }

  function GoToExecution(id: number) {
    if (id) router.push(`/execution/${id.toString()}`);
    setConfirmodalOpen(false);
  }

  function OpenModal(id: number, type: number) {
    if (id) {
      setActualId(id);
      setConfirmodalOpen(true);
    }
  }

  const handleStarPress = (value: number) => {
    if (myEvaluation) {
      setMyEvaluation({ ...myEvaluation, evaluation: value });
    } else {
      setMyEvaluation({
        authorId: null,
        createdAt: new Date().toISOString(),
        evaluation: value,
        id: null,
        observations: null,
        personalId: null,
        updatedAt: null,
      });
    }
  };

  const onRefresh = async () => {
    getUserData();
  };

  function getWhpLink({
    personalName,
    myName,
    phone,
    gender,
  }: {
    personalName: string;
    myName: string;
    phone: string;
    gender?: number;
  }) {
    const message = `Olá ${personalName}, aqui é ${
      !!gender && gender === 2 ? "a" : gender === 1 ? "o" : ""
    } ${myName} e estou entrando em contato pelo My Fit Club Brasil...`;
    const encodedMessage = encodeURIComponent(message);

    return `https://wa.me/${phone}?text=${encodedMessage}`;
  }

  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    setMyEvaluation(null);
    setPersonalTrainings(null);
    getPersonalAssignments();
    setSelectedPersonal(
      !!personals && Array.isArray(personals)
        ? personals?.find((p: any) => p.id === selectedId)
        : null
    );
  }, [selectedId]);

  useEffect(() => {
    if (!!selectedPersonal) {
      const evaluationTemp =
        selectedPersonal?.client_relationship_responsibleToclient
          ?.personalEvaluations_personalEvaluations_personalIdToclient;

      if (
        !!evaluationTemp &&
        Array.isArray(evaluationTemp) &&
        evaluationTemp.length > 0
      ) {
        setMyEvaluation(evaluationTemp[0]);
      }

      getAllEvaluations();
    }
  }, [selectedPersonal]);

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: themeColors.background,
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {confirmodalOpen && (
        <View>
          <MFLogoutModal
            warningVisible={confirmodalOpen}
            themeColors={themeColors}
            text={modalType === 1 ? "Iniciar o treino?" : "Finalizar o treino?"}
            onPress={() => CreateAndGoToExecution()}
            close={() => setConfirmodalOpen(false)}
            isLoading={isLoading}
          ></MFLogoutModal>
        </View>
      )}
      <View style={trainingStyles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={onRefresh}
              colors={[themeColors.primary]}
              tintColor={themeColors.primary}
            />
          }
          style={{
            paddingTop: 30,
          }}
        >
          <MFStackEditSubtitle
            themeColors={themeColors}
            title="Meus treinadores"
            info="Aqui você pode verificar sobre o seu personal/academia."
          ></MFStackEditSubtitle>
          <View style={{ height: 30 }}></View>

          {isLoading && (
            <View style={{ paddingHorizontal: 20 }}>
              <ClientSkeleton themeColors={themeColors} />
              <ClientSkeleton themeColors={themeColors} />
              <ClientSkeleton themeColors={themeColors} />
            </View>
          )}

          {!isLoading && (
            <>
            {requests && Array.isArray(requests) && requests.length > 0 && (
              <View style={{ marginTop: 20 }}>
                <View style={{ paddingBottom: 20, paddingHorizontal: 15 }}>
                  <MFStackEditSubtitle
                    themeColors={themeColors}
                    title="Pedidos para treinar você."
                  ></MFStackEditSubtitle>
                </View>
                {!!requests &&
                  Array.isArray(requests) &&
                  requests.length > 0 &&
                  requests.map((e: any) => (
                    <MFPersonalRequestCard
                      key={e.id}
                      themeColors={themeColors}
                      data={e}
                      accept={() =>
                        RequestNewpersonal(
                          e.client_relationship_responsibleToclient.id,
                          1
                        )
                      }
                      refuse={() =>
                        RequestNewpersonal(
                          e.client_relationship_responsibleToclient.id,
                          2
                        )
                      }
                      isLoading={isRequestLoading}
                    />
                  ))}
              </View>
            )}

            <View
              style={{
                width: "75%",
                height: 1,
                backgroundColor: themeColors.text,
                marginHorizontal: 15,
                marginVertical: 25,
              }}
            ></View>

            {!!personals && Array.isArray(personals) && personals.length > 0 ? (
              <View style={[styles.selectContainer, { marginHorizontal: 20 }]}>
                <Picker
                  selectedValue={selectedId}
                  onValueChange={(value: any) => setSelectedId(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecione um treinador" value={null} />
                  {personals.map((p) => (
                    <Picker.Item
                      key={p.id}
                      label={p.client_relationship_responsibleToclient.name}
                      value={p.id}
                    />
                  ))}
                </Picker>
              </View>
            ) : (
              <View
                style={[
                  styles.noTrainingBox,
                  {
                    backgroundColor: themeColors.primaryOpacity,
                    marginHorizontal: "5%",
                    width: "90%",
                  },
                ]}
              >
                <Text
                  style={{
                    color: themeColors.white,
                    fontSize: 18,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  Infelizmente você ainda não possui um personal.
                </Text>
              </View>
            )}
            {personalTrainings &&
            Array.isArray(personalTrainings) &&
            personalTrainings.length > 0 ? (
              <Carousel
                loop
                width={width}
                height={220}
                autoPlay={false}
                data={personalTrainings}
                scrollAnimationDuration={1000}
                renderItem={({ item }: { item: any }) => (
                  <MFTrainingExecutionCard
                    isNew={
                      !item.training?.trainingExecution ||
                      (item.training?.trainingExecution &&
                        item.training?.trainingExecution.length === 0)
                    }
                    isExecutionLoading={isLoading}
                    GoToExecution={GoToExecution}
                    OpenModal={OpenModal}
                    isInExecution={executionItem}
                    themeColors={themeColors}
                    data={item}
                    Unassign={() => {}}
                    isHome={true}
                  />
                )}
                mode="parallax"
                modeConfig={{
                  parallaxScrollingScale: 0.9,
                  parallaxScrollingOffset: 50,
                }}
                pagingEnabled={true}
                style={{
                  paddingHorizontal: OFFSET,
                }}
              />
            ) : selectedPersonal ? (
              <View
                style={[
                  styles.noTrainingBox,
                  {
                    backgroundColor: themeColors.primaryOpacity,
                    marginHorizontal: "5%",
                    width: "90%",
                  },
                ]}
              >
                <Text
                  style={{
                    color: themeColors.white,
                    fontSize: 18,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  Ainda não definiu nenhum treino para você.
                </Text>
              </View>
            ) : null}
            {selectedPersonal && (
              <MFPersonalInfoCard
                selectedPersonal={selectedPersonal}
                themeColors={themeColors}
                isLoading={isLoading}
                onPress={() =>
                  Linking.openURL(
                    getWhpLink({
                      personalName: selectedPersonal
                        .client_relationship_responsibleToclient.nick
                        ? selectedPersonal
                            .client_relationship_responsibleToclient.nick
                        : selectedPersonal
                            .client_relationship_responsibleToclient.name,
                      myName: user?.client?.nick
                        ? user?.client?.nick
                        : user?.client?.name!,
                      phone:
                        selectedPersonal.client_relationship_responsibleToclient
                          .phone,
                      gender:
                        selectedPersonal.client_relationship_responsibleToclient
                          .gender,
                    })
                  )
                }
              />
            )}
            {selectedPersonal && (
              <View
                style={[
                  globalStyles.flexc,
                  styles.cardEvaluation,
                  { paddingHorizontal: 20, paddingVertical: 40 },
                ]}
              >
                <Text
                  style={{
                    fontSize: 22,
                    color: themeColors.text,
                  }}
                >
                  {myEvaluation
                    ? "Sua avaliação deste profissional"
                    : "Avalie este profissional."}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 30,
                    marginBottom: myEvaluation ? 15 : 0,
                  }}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      style={[globalStyles.flexr, { gap: 10 }]}
                      onPress={() => handleStarPress(star)}
                    >
                      <AntDesign
                        name={
                          star <= (myEvaluation?.evaluation || 5)
                            ? "star"
                            : "staro"
                        }
                        size={40}
                        color={
                          myEvaluation?.evaluation
                            ? themeColors.orange
                            : themeColors.themeGrey
                        }
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                {!!myEvaluation && (
                  <TextInput
                    multiline
                    value={myEvaluation?.observations || ""}
                    onChangeText={(text) =>
                      setMyEvaluation({ ...myEvaluation, observations: text })
                    }
                    numberOfLines={5}
                    textAlignVertical="top"
                    keyboardType="default"
                    style={[
                      styles.longInput,
                      {
                        backgroundColor: themeColors.background,
                        color: themeColors.text,
                        borderColor: themeColors.text,
                        marginBottom: 30,
                        width: "100%",
                      },
                    ]}
                    placeholder="Digite suas observações..."
                    placeholderTextColor={themeColors.textSecondary}
                  />
                )}
                {!!myEvaluation && (
                  <MFPrimaryButton
                    title={
                      isEvaluationLoading ? "Enviando" : "Enviar avaliação"
                    }
                    onPress={createOrEditEvaluation}
                    isLoading={isEvaluationLoading}
                    isDisabled={isEvaluationLoading}
                    themeColors={themeColors}
                    isWhiteDetails={true}
                  />
                )}
              </View>
            )}
            {selectedPersonal && (
              <View style={{ width: "100%" }}>
                <View style={{ height: 20 }}></View>
                <MFStackEditSubtitle
                  themeColors={themeColors}
                  title="Avaliações do treinador"
                  align="right"
                ></MFStackEditSubtitle>
                <View style={{ height: 20 }}></View>
                {!!personalEvaluations &&
                Array.isArray(personalEvaluations) &&
                personalEvaluations.length > 0 ? (
                  personalEvaluations.map((e: any) => {
                    return (
                      <MFPersonalEvaluationCard
                        data={e}
                        onPress={() => {}}
                        themeColors={themeColors}
                        key={e.id}
                        myself={
                          e?.client_personalEvaluations_authorIdToclient.id ===
                          user?.client.id
                        }
                      />
                    );
                  })
                ) : (
                  <View
                    style={[globalStyles.flexr, { width: "100%", height: 100 }]}
                  >
                    <Text style={{ fontSize: 20 }}>
                      Ainda não tem avaliações.
                    </Text>
                  </View>
                )}
              </View>
            )}
            <View style={{ height: 50 }}></View>
            </>
          )}
        </ScrollView>
      </View>
      <FloatingContinueTrainingButtonWrapper themeColors={themeColors} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  selectContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
    elevation: 3,
    overflow: "hidden",
    marginLeft: 100,
    paddingLeft: 20,
  },
  picker: {
    height: 50,
  },
  cardEvaluation: {
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 4,
    overflow: "hidden",
    marginBottom: 40,
  },
  noTrainingBox: {
    width: "100%",
    height: 60,
    borderRadius: 12,
    marginVertical: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  longInput: {
    borderWidth: 1,
    borderRadius: 27,
    paddingHorizontal: 18,
    paddingVertical: 20,
    fontSize: 16,
    minHeight: 150,
    height: "auto",
  },
});
