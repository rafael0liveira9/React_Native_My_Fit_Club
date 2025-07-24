import { showConfetti } from "@/components/my-fit-ui/animations";
import MFTrainingInfoCard, {
  MFClockExecute,
} from "@/components/my-fit-ui/cards";
import { MFTrainingExecutionView } from "@/components/my-fit-ui/execution";
import {
  MFDefaultModal,
  MFFinishTrainingModal,
} from "@/components/my-fit-ui/modal";
import MFStackHeader from "@/components/my-fit-ui/stackHeader";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import {
  ExerciseFinish,
  FinishTraining,
  getExecutionById,
  getGroups,
  NewEvaluationUpdate,
} from "@/service/training";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function ExecutTrainingScreen() {
  const { width } = useWindowDimensions();
  const { theme } = useTheme(),
    themeColors = Colors[`${theme}`],
    params = useLocalSearchParams(),
    { id } = params,
    router = useRouter();

  const [muscleGroups, setMuscleGroups] = useState<any>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string>(""),
    [data, setData] = useState<any>([]),
    [isTrainingInfoOpen, setIsTrainingInfoOpen] = useState(false),
    [isFirstRender, setIsFirstRender] = useState<boolean>(true),
    [evaluationModalOpen, setEvaluationModalOpen] = useState<boolean>(false),
    [evaluation, setEvaluation] = useState<number | undefined>(5),
    [observation, setObservation] = useState<string>(""),
    [isTrainingComplete, setIsTrainingComplete] = useState<boolean>(false),
    [clockData, setClockData] = useState<any>(null),
    [myEvaluation, setMyEvaluation] = useState<any>(null),
    [seriesList, setSeriesList] = useState<any>([]);

  async function getUserData() {
    setIsLoading(true);
    try {
      const z = await SecureStore.getItemAsync("userToken");

      if (z) {
        const x = await getExecutionById({ token: z, id: id.toString() });
        const y = await getGroups({ token: z });
        const parsedSeries = x?.training?.series?.map((item: any) => ({
          ...item,
          repetitions:
            !!item.repetitions && typeof item.repetitions === "string"
              ? JSON.parse(item.repetitions)
              : item.repetitions,
          difficulty:
            !!item.difficulty && typeof item.difficulty === "string"
              ? JSON.parse(item.difficulty)
              : item.difficulty,
        }));

        setToken(z);
        setData({
          description: x?.training?.description,
          id: x?.training?.id,
          level: x?.training?.level ? x?.training?.level.toString() : "",
          name: x?.training?.name,
          photo: x?.training?.photo,
          url: x?.training?.url,
          expirationDate: x?.expirationDate,
          CompanyResposibleId: x?.CompanyResposibleId,
          responsibleId: x?.responsibleId,
          author: x?.training?.user?.name
            ? {
                id: x?.training?.user?.id,
                name: x?.training?.user?.name,
                cref: x?.training?.user?.cref,
                photo: x?.training?.user?.photo,
              }
            : null,
          evaluation: x?.training?.evaluation,
          myEvaluation: x?.training?.trainingEvaluations[0]
            ? x?.training?.trainingEvaluations[0]
            : null,
          executionsCount: x?.executionsCount,
          maxExecutions: x?.maxExecutions,
          createdAt: x?.training?.createdAt,
          assignmentDate: x?.createdAt,
          TotalExecutionsCount: x?.TotalExecutionsCount,
          exercises:
            parsedSeries && Array.isArray(parsedSeries)
              ? parsedSeries.map((e: any) => {
                  return {
                    exerciseId: e?.exercise?.id,
                    groupMuscleId: e?.exercise?.groupMuscleId,
                  };
                })
              : null,
        });
        setMyEvaluation(x?.training?.trainingEvaluations);
        setSeriesList(parsedSeries);
        setMuscleGroups(y && y.length > 0 ? y : []);
      } else {
        console.log("Nenhum treino para recuperar");
      }
    } catch (error) {
      console.error("Erro ao recuperar treino:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function FinishAllExecution() {
    if (!id || !token) {
      Toast.show({
        type: "error",
        text1: `❌ Erro ao finalizar o treino.`,
      });
      return;
    }

    const isFirstEvaluationInside = !(!!myEvaluation &&
    Array.isArray(myEvaluation) &&
    myEvaluation.length > 0
      ? true
      : false);

    try {
      setIsLoading(true);

      const x = await FinishTraining({
        evaluation: isFirstEvaluationInside && evaluation ? +evaluation : null,
        executionId: +id,
        observation: isFirstEvaluationInside ? observation : null,
        token: token,
      });

      if (x?.status === 200) {
        showConfetti();
        Toast.show({
          type: "success",
          text1: `✅ Treino finalizado.`,
        });
        router.replace("/(tabs)/training");
      } else {
        Toast.show({
          type: "error",
          text1: `❌ Erro ao finalizar o treino.`,
        });
      }
    } catch (error) {
      console.error("Erro ao finalizar treino:", error);
      Toast.show({
        type: "error",
        text1: `❌ Erro inesperado ao finalizar o treino.`,
      });
    } finally {
      setIsLoading(false);
      setEvaluationModalOpen(false);
    }
  }

  async function FinishTrainingHandle({
    exerciseId,
    difficulty,
  }: {
    exerciseId: number;
    difficulty: string[];
  }) {
    const x = await ExerciseFinish({
      token: token,
      exerciseId: exerciseId,
      executionId: +id,
      difficulty: difficulty,
    });

    if (x.status === 200 || x.status === 201) {
      getUserData();
      Toast.show({
        type: "success",
        text1: "Exercício concluido",
      });
      return true;
    } else {
      Toast.show({
        type: "error",
        text1: "Falha ao concluir exercício",
      });
      return false;
    }
  }

  async function NewEvaluationTrainingHandle({
    newEvaluation,
    newObservation,
  }: {
    newEvaluation: number;
    newObservation?: string;
  }) {
    if (!!token && !!newEvaluation && !!data?.myEvaluation?.id) {
      setIsLoading(true);
      const x = await NewEvaluationUpdate({
        token: token,
        id: data?.myEvaluation?.id,
        evaluation: newEvaluation,
        observation: newObservation,
      });
      if (x.status === 200 || x.status === 201) {
        setIsTrainingInfoOpen(false);
        setIsLoading(false);
        getUserData();
        Toast.show({
          type: "success",
          text1: "Avaliação alterada",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Falha ao alterar avaliação",
        });
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    let newClockData = null;
    let lakingData = null;
    if (seriesList && Array.isArray(seriesList)) {
      const x = seriesList.filter(
        (e: any) =>
          !e.serieExecution ||
          (!!e.serieExecution &&
            Array.isArray(e.serieExecution) &&
            e.serieExecution.length === 0)
      );
      lakingData = x.map((e: any) => e?.id);
      newClockData = x[0];
    }
    if (lakingData !== null && lakingData.length === 0) {
      setIsTrainingComplete(true);
      if (isFirstRender) {
        setIsFirstRender(false);
      } else {
        FinishAllExecution();
      }
    } else {
      setIsTrainingComplete(false);
    }
    setClockData(newClockData);
  }, [seriesList]);

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: themeColors.background,
        position: "relative",
      }}
    >
      {evaluationModalOpen && (
        <MFFinishTrainingModal
          warningVisible={evaluationModalOpen}
          evaluation={evaluation}
          setEvaluation={setEvaluation}
          observation={observation}
          setObservation={setObservation}
          themeColors={themeColors}
          isLoading={isLoading}
          isComplete={isTrainingComplete}
          isFirstEvaluation={
            !(!!myEvaluation &&
            Array.isArray(myEvaluation) &&
            myEvaluation.length > 0
              ? true
              : false)
          }
          close={() => setEvaluationModalOpen(false)}
          onPress={FinishAllExecution}
        ></MFFinishTrainingModal>
      )}
      {isTrainingInfoOpen && (
        <MFDefaultModal
          themeColors={themeColors}
          close={() => setIsTrainingInfoOpen(false)}
          warningVisible={isTrainingInfoOpen}
        >
          <MFTrainingInfoCard
            themeColors={themeColors}
            data={data}
            NewEvaluationTrainingHandle={NewEvaluationTrainingHandle}
            close={() => setIsTrainingInfoOpen(false)}
            muscleGroups={muscleGroups}
            isLoading={isLoading}
          ></MFTrainingInfoCard>
        </MFDefaultModal>
      )}
      <MFClockExecute
        themeColors={themeColors}
        clockData={clockData}
      ></MFClockExecute>
      <MFStackHeader
        replace={"/(tabs)/training"}
        title={data?.name ? `${data?.name}` : "Treino"}
        isLoading={isLoading}
        titleBtn={!isLoading ? "Finalizar" : " "}
        onPress={!isLoading ? () => setEvaluationModalOpen(true) : null}
        openTrainingInfo={() => setIsTrainingInfoOpen(true)}
      ></MFStackHeader>
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: themeColors.background,
          position: "relative",
        }}
      >
        {!data && <View style={{ height: 30 }}></View>}
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
        ) : data ? (
          <MFTrainingExecutionView
            themeColors={themeColors}
            training={data}
            series={seriesList}
            setSeriesList={setSeriesList}
            muscleGroups={muscleGroups}
            setClockData={setClockData}
            FinishTrainingHandle={FinishTrainingHandle}
            clockData={clockData}
            isTrainingComplete={isTrainingComplete}
            openTrainingInfo={() => setIsTrainingInfoOpen(true)}
          ></MFTrainingExecutionView>
        ) : (
          <View
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
            }}
          >
            <Text>
              *Erro - Nenhuma execução iniciada, volte para tela inicial.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  containerClock: {
    position: "absolute",
    width: "90%",
    minHeight: 70,
    bottom: 10,
    left: "5%",
    zIndex: 9,
    padding: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 1,
  },
  clockBox: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timerClock: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  buttonClock: {
    backgroundColor: "#00cc88",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonTextClock: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
