import { MFPrimaryButton } from "@/components/my-fit-ui/buttons";
import MFStackEditSubtitle from "@/components/my-fit-ui/stackEditSubtitle";
import MFStackHeader from "@/components/my-fit-ui/stackHeader";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import {
  CreateSerie,
  EditTraining,
  getExercises,
  getTrainingById,
} from "@/service/training";
import { globalStyles } from "@/styles/global";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const ADD_SET_TYPES = [
  { id: 0, name: "Normal", icon: "dumbbell", description: "Série normal" },
  { id: 1, name: "Drop Set", icon: "trending-down", description: "Reduz peso a cada série" },
  { id: 2, name: "Rest-Pause", icon: "pause", description: "Pausas curtas entre reps" },
  { id: 3, name: "Bi-Set", icon: "link", description: "Dois exercícios seguidos" },
];

export default function EditTrainingDetailedScreen() {
  const { theme } = useTheme();
  const themeColors = Colors[`${theme}`];
  const params = useLocalSearchParams();
  const { id } = params;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [token, setToken] = useState<string>("");

  // Dados do treino
  const [trainingData, setTrainingData] = useState<any>(null);
  const [trainingName, setTrainingName] = useState("");
  const [trainingDescription, setTrainingDescription] = useState("");
  const [trainingLevel, setTrainingLevel] = useState(1);

  // Séries e exercícios
  const [series, setSeries] = useState<any[]>([]);
  const [allExercises, setAllExercises] = useState<any[]>([]);

  // Modal states
  const [editingSerieIndex, setEditingSerieIndex] = useState<number | null>(null);
  const [serieModalVisible, setSerieModalVisible] = useState(false);
  const [addExerciseModalVisible, setAddExerciseModalVisible] = useState(false);

  // Serie editing states
  const [editingSerie, setEditingSerie] = useState<any>(null);
  const [serieAmount, setSerieAmount] = useState(3);
  const [serieReps, setSerieReps] = useState<string[]>(["12", "12", "12"]);
  const [serieInterval, setSerieInterval] = useState(60);
  const [serieAddSet, setSerieAddSet] = useState(0);
  const [serieBisetExercise, setSerieBisetExercise] = useState<number | null>(null);
  const [serieIsometry, setSerieIsometry] = useState(0);

  useEffect(() => {
    loadTrainingData();
  }, []);

  async function loadTrainingData() {
    setIsLoading(true);
    try {
      const z = await SecureStore.getItemAsync("userToken");
      if (z) {
        setToken(z);

        const training = await getTrainingById({ token: z, id: id.toString() });
        const exercises = await getExercises({ token: z, isFull: true });

        if (training?.training) {
          setTrainingData(training);
          setTrainingName(training.training.name);
          setTrainingDescription(training.training.description || "");
          setTrainingLevel(training.training.level);
          setSeries(training.training.series || []);
        }

        setAllExercises(exercises || []);
      }
    } catch (error) {
      console.error("Erro ao carregar treino:", error);
      Toast.show({
        type: "error",
        text1: "Erro ao carregar treino",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function saveTraining() {
    if (!token) return;

    setIsSaving(true);
    try {
      await EditTraining({
        id: trainingData.training.id,
        name: trainingName,
        description: trainingDescription,
        level: trainingLevel,
        url: trainingData.training.url || "",
        photo: trainingData.training.photo || "",
        token,
      });

      Toast.show({
        type: "success",
        text1: "✅ Treino salvo com sucesso!",
      });

      router.back();
    } catch (error) {
      console.error("Erro ao salvar treino:", error);
      Toast.show({
        type: "error",
        text1: "❌ Erro ao salvar treino",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function openEditSerieModal(index: number) {
    const serie = series[index];
    setEditingSerieIndex(index);
    setEditingSerie(serie);

    // Preencher estados com dados atuais
    setSerieAmount(serie.amount || 3);
    setSerieReps(serie.repetitions ? JSON.parse(serie.repetitions) : ["12", "12", "12"]);
    setSerieInterval(serie.interval || 60);
    setSerieAddSet(serie.addSet || 0);
    setSerieBisetExercise(serie.bisetExerciseId || null);
    setSerieIsometry(serie.isometry || 0);

    setSerieModalVisible(true);
  }

  function updateSerieAmount(newAmount: number) {
    const currentReps = [...serieReps];
    if (newAmount > currentReps.length) {
      // Adicionar novas séries com o valor da última
      const lastRep = currentReps[currentReps.length - 1] || "12";
      while (currentReps.length < newAmount) {
        currentReps.push(lastRep);
      }
    } else if (newAmount < currentReps.length) {
      // Remover séries excedentes
      currentReps.splice(newAmount);
    }
    setSerieAmount(newAmount);
    setSerieReps(currentReps);
  }

  function updateSerieRep(index: number, value: string) {
    const newReps = [...serieReps];
    newReps[index] = value;
    setSerieReps(newReps);
  }

  async function saveSerie() {
    if (!token || editingSerieIndex === null || !editingSerie) return;

    setIsSaving(true);
    try {
      await CreateSerie({
        serieId: editingSerie.id,
        trainingId: trainingData.training.id,
        exercise: editingSerie.exerciseId,
        amount: serieAmount,
        difficulty: Array(serieAmount).fill("0"),
        repetitions: serieReps,
        interval: serieInterval,
        isometry: serieIsometry,
        addSet: serieAddSet,
        bisetExerciseId: serieAddSet === 3 ? serieBisetExercise : null,
        token,
      });

      await loadTrainingData();
      setSerieModalVisible(false);

      Toast.show({
        type: "success",
        text1: "✅ Série atualizada!",
      });
    } catch (error) {
      console.error("Erro ao salvar série:", error);
      Toast.show({
        type: "error",
        text1: "❌ Erro ao salvar série",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function removeSerie(index: number) {
    const newSeries = series.filter((_, i) => i !== index);
    setSeries(newSeries);
  }

  async function addExercise(exercise: any) {
    if (!token) return;

    try {
      const newSerie = await CreateSerie({
        trainingId: trainingData.training.id,
        exercise: exercise.id,
        amount: 3,
        difficulty: ["0", "0", "0"],
        repetitions: ["12", "12", "12"],
        interval: 60,
        isometry: 0,
        addSet: 0,
        token,
      });

      await loadTrainingData();
      setAddExerciseModalVisible(false);

      Toast.show({
        type: "success",
        text1: "✅ Exercício adicionado!",
      });
    } catch (error) {
      console.error("Erro ao adicionar exercício:", error);
      Toast.show({
        type: "error",
        text1: "❌ Erro ao adicionar exercício",
      });
    }
  }

  const renderTrainingInfo = () => (
    <View style={{ padding: 20, gap: 20 }}>
      <MFStackEditSubtitle
        themeColors={themeColors}
        title="Informações do Treino"
        info="Configure os dados básicos do treino"
      />

      <View style={{ gap: 15 }}>
        <View>
          <Text style={{ fontSize: 14, color: themeColors.textSecondary, marginBottom: 8 }}>
            Nome do Treino
          </Text>
          <TextInput
            value={trainingName}
            onChangeText={setTrainingName}
            style={{
              backgroundColor: themeColors.secondary,
              color: themeColors.text,
              borderRadius: 12,
              padding: 15,
              fontSize: 16,
              borderWidth: 1,
              borderColor: themeColors.text + "30",
            }}
            placeholder="Ex: Treino A - Peito e Tríceps"
            placeholderTextColor={themeColors.textSecondary}
          />
        </View>

        <View>
          <Text style={{ fontSize: 14, color: themeColors.textSecondary, marginBottom: 8 }}>
            Descrição
          </Text>
          <TextInput
            value={trainingDescription}
            onChangeText={setTrainingDescription}
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: themeColors.secondary,
              color: themeColors.text,
              borderRadius: 12,
              padding: 15,
              fontSize: 16,
              borderWidth: 1,
              borderColor: themeColors.text + "30",
              height: 80,
              textAlignVertical: "top",
            }}
            placeholder="Adicione uma descrição..."
            placeholderTextColor={themeColors.textSecondary}
          />
        </View>

        <View>
          <Text style={{ fontSize: 14, color: themeColors.textSecondary, marginBottom: 8 }}>
            Nível de Dificuldade
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {[
              { level: 1, name: "Iniciante", color: themeColors.success },
              { level: 2, name: "Intermediário", color: themeColors.warning },
              { level: 3, name: "Avançado", color: themeColors.info },
              { level: 4, name: "Expert", color: themeColors.danger },
            ].map((item) => (
              <TouchableOpacity
                key={item.level}
                onPress={() => setTrainingLevel(item.level)}
                style={{
                  flex: 1,
                  backgroundColor:
                    trainingLevel === item.level ? item.color : themeColors.secondary,
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor:
                    trainingLevel === item.level ? item.color : themeColors.text + "30",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color:
                      trainingLevel === item.level ? themeColors.white : themeColors.text,
                    textAlign: "center",
                  }}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const renderSeriesList = () => (
    <View style={{ padding: 20, gap: 20 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <MFStackEditSubtitle
          themeColors={themeColors}
          title="Exercícios do Treino"
          info={`${series.length} exercício(s)`}
        />
        <TouchableOpacity
          onPress={() => setAddExerciseModalVisible(true)}
          style={{
            backgroundColor: themeColors.primary,
            paddingVertical: 8,
            paddingHorizontal: 15,
            borderRadius: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          <AntDesign name="plus" size={16} color={themeColors.white} />
          <Text style={{ color: themeColors.white, fontWeight: "600" }}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      {series.length === 0 ? (
        <View style={{ padding: 40, alignItems: "center" }}>
          <Text style={{ fontSize: 16, color: themeColors.textSecondary, textAlign: "center" }}>
            Nenhum exercício adicionado.{"\n"}Toque em Adicionar para começar.
          </Text>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {series.map((serie, index) => (
            <TouchableOpacity
              key={serie.id || index}
              onPress={() => openEditSerieModal(index)}
              style={{
                backgroundColor: themeColors.secondary,
                borderRadius: 12,
                padding: 15,
                borderWidth: 1,
                borderColor: themeColors.text + "20",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: themeColors.text, marginBottom: 4 }}>
                    {serie.exercise?.name || "Exercício"}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 15, marginTop: 4 }}>
                    <Text style={{ fontSize: 12, color: themeColors.textSecondary }}>
                      {serie.amount || 0} séries
                    </Text>
                    <Text style={{ fontSize: 12, color: themeColors.textSecondary }}>
                      {serie.repetitions ? JSON.parse(serie.repetitions)[0] : 0} reps
                    </Text>
                    <Text style={{ fontSize: 12, color: themeColors.textSecondary }}>
                      {serie.interval || 0}s descanso
                    </Text>
                  </View>
                  {serie.addSet > 0 && (
                    <View style={{ marginTop: 8 }}>
                      <Text style={{ fontSize: 11, color: themeColors.primary, fontWeight: "600" }}>
                        {ADD_SET_TYPES[serie.addSet]?.name || "Técnica avançada"}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      removeSerie(index);
                    }}
                    style={{
                      backgroundColor: themeColors.danger + "20",
                      padding: 8,
                      borderRadius: 8,
                    }}
                  >
                    <FontAwesome name="trash" size={16} color={themeColors.danger} />
                  </TouchableOpacity>
                  <View style={{ padding: 8 }}>
                    <Feather name="chevron-right" size={20} color={themeColors.textSecondary} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderEditSerieModal = () => (
    <Modal
      visible={serieModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setSerieModalVisible(false)}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <View
          style={{
            backgroundColor: themeColors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: "90%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: themeColors.text + "20",
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold", color: themeColors.text }}>
              Editar Série
            </Text>
            <TouchableOpacity onPress={() => setSerieModalVisible(false)}>
              <AntDesign name="close" size={24} color={themeColors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 20 }}>
            <View style={{ gap: 25 }}>
              {/* Nome do Exercício */}
              <View>
                <Text style={{ fontSize: 18, fontWeight: "600", color: themeColors.text, marginBottom: 10 }}>
                  {editingSerie?.exercise?.name}
                </Text>
              </View>

              {/* Número de Séries */}
              <View>
                <Text style={{ fontSize: 14, color: themeColors.textSecondary, marginBottom: 10 }}>
                  Número de Séries
                </Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <TouchableOpacity
                      key={num}
                      onPress={() => updateSerieAmount(num)}
                      style={{
                        flex: 1,
                        backgroundColor:
                          serieAmount === num ? themeColors.primary : themeColors.secondary,
                        padding: 15,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor:
                          serieAmount === num ? themeColors.primary : themeColors.text + "20",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: serieAmount === num ? themeColors.white : themeColors.text,
                          textAlign: "center",
                        }}
                      >
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Repetições por Série */}
              <View>
                <Text style={{ fontSize: 14, color: themeColors.textSecondary, marginBottom: 10 }}>
                  Repetições por Série
                </Text>
                <View style={{ gap: 8 }}>
                  {serieReps.map((rep, index) => (
                    <View key={index} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <Text style={{ fontSize: 14, color: themeColors.text, width: 60 }}>
                        Série {index + 1}:
                      </Text>
                      <TextInput
                        value={rep}
                        onChangeText={(value) => updateSerieRep(index, value)}
                        keyboardType="numeric"
                        style={{
                          flex: 1,
                          backgroundColor: themeColors.secondary,
                          color: themeColors.text,
                          borderRadius: 8,
                          padding: 12,
                          fontSize: 16,
                          borderWidth: 1,
                          borderColor: themeColors.text + "20",
                        }}
                        placeholder="12"
                        placeholderTextColor={themeColors.textSecondary}
                      />
                      <Text style={{ fontSize: 14, color: themeColors.textSecondary }}>reps</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Intervalo de Descanso */}
              <View>
                <Text style={{ fontSize: 14, color: themeColors.textSecondary, marginBottom: 10 }}>
                  Intervalo de Descanso (segundos)
                </Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {[30, 60, 90, 120, 180].map((seconds) => (
                    <TouchableOpacity
                      key={seconds}
                      onPress={() => setSerieInterval(seconds)}
                      style={{
                        flex: 1,
                        backgroundColor:
                          serieInterval === seconds ? themeColors.primary : themeColors.secondary,
                        padding: 12,
                        borderRadius: 8,
                        borderWidth: 2,
                        borderColor:
                          serieInterval === seconds ? themeColors.primary : themeColors.text + "20",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: serieInterval === seconds ? themeColors.white : themeColors.text,
                          textAlign: "center",
                        }}
                      >
                        {seconds}s
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Técnicas Avançadas */}
              <View>
                <Text style={{ fontSize: 14, color: themeColors.textSecondary, marginBottom: 10 }}>
                  Técnicas Avançadas
                </Text>
                <View style={{ gap: 10 }}>
                  {ADD_SET_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      onPress={() => setSerieAddSet(type.id)}
                      style={{
                        backgroundColor:
                          serieAddSet === type.id ? themeColors.primary : themeColors.secondary,
                        padding: 15,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor:
                          serieAddSet === type.id ? themeColors.primary : themeColors.text + "20",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <MaterialCommunityIcons
                        name={type.icon as any}
                        size={24}
                        color={serieAddSet === type.id ? themeColors.white : themeColors.text}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: serieAddSet === type.id ? themeColors.white : themeColors.text,
                          }}
                        >
                          {type.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color:
                              serieAddSet === type.id
                                ? themeColors.white + "CC"
                                : themeColors.textSecondary,
                            marginTop: 2,
                          }}
                        >
                          {type.description}
                        </Text>
                      </View>
                      {serieAddSet === type.id && (
                        <AntDesign name="checkcircle" size={24} color={themeColors.white} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Bi-Set Exercise Selector */}
              {serieAddSet === 3 && (
                <View>
                  <Text style={{ fontSize: 14, color: themeColors.textSecondary, marginBottom: 10 }}>
                    Exercício para Bi-Set
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      {allExercises
                        .filter((ex) => ex.id !== editingSerie?.exerciseId)
                        .map((exercise) => (
                          <TouchableOpacity
                            key={exercise.id}
                            onPress={() => setSerieBisetExercise(exercise.id)}
                            style={{
                              backgroundColor:
                                serieBisetExercise === exercise.id
                                  ? themeColors.primary
                                  : themeColors.secondary,
                              padding: 12,
                              borderRadius: 8,
                              borderWidth: 2,
                              borderColor:
                                serieBisetExercise === exercise.id
                                  ? themeColors.primary
                                  : themeColors.text + "20",
                              minWidth: 120,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 12,
                                fontWeight: "600",
                                color:
                                  serieBisetExercise === exercise.id
                                    ? themeColors.white
                                    : themeColors.text,
                                textAlign: "center",
                              }}
                              numberOfLines={2}
                            >
                              {exercise.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* Isometria */}
              <View>
                <TouchableOpacity
                  onPress={() => setSerieIsometry(serieIsometry === 0 ? 1 : 0)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: themeColors.secondary,
                    padding: 15,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: serieIsometry === 1 ? themeColors.primary : themeColors.text + "20",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <MaterialCommunityIcons
                      name="timer-sand"
                      size={24}
                      color={serieIsometry === 1 ? themeColors.primary : themeColors.text}
                    />
                    <View>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: themeColors.text,
                        }}
                      >
                        Exercício Isométrico
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: themeColors.textSecondary,
                          marginTop: 2,
                        }}
                      >
                        Manter posição sem movimento
                      </Text>
                    </View>
                  </View>
                  {serieIsometry === 1 && (
                    <AntDesign name="checkcircle" size={24} color={themeColors.primary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          <View
            style={{
              padding: 20,
              borderTopWidth: 1,
              borderTopColor: themeColors.text + "20",
            }}
          >
            <MFPrimaryButton
              title={isSaving ? "Salvando..." : "Salvar Alterações"}
              onPress={saveSerie}
              isLoading={isSaving}
              isDisabled={isSaving}
              themeColors={themeColors}
              isWhiteDetails={true}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderAddExerciseModal = () => (
    <Modal
      visible={addExerciseModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setAddExerciseModalVisible(false)}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <View
          style={{
            backgroundColor: themeColors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: "80%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: themeColors.text + "20",
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold", color: themeColors.text }}>
              Adicionar Exercício
            </Text>
            <TouchableOpacity onPress={() => setAddExerciseModalVisible(false)}>
              <AntDesign name="close" size={24} color={themeColors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 20 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {allExercises.map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  onPress={() => addExercise(exercise)}
                  style={{
                    width: "48%",
                    backgroundColor: themeColors.secondary,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: themeColors.text + "20",
                    overflow: "hidden",
                  }}
                >
                  {exercise.image && (
                    <Image
                      source={{ uri: exercise.image }}
                      style={{
                        width: "100%",
                        height: 100,
                        backgroundColor: themeColors.default,
                      }}
                      resizeMode="cover"
                    />
                  )}
                  <View style={{ padding: 12 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: themeColors.text,
                      }}
                      numberOfLines={2}
                    >
                      {exercise.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <MFStackHeader
        title="Editar Treino"
        isLoading={isLoading || isSaving}
        titleBtn="Salvar"
        onPress={saveTraining}
      />

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size={40} color={themeColors.primary} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {renderTrainingInfo()}
          <View style={{ height: 1, backgroundColor: themeColors.text + "20", marginVertical: 10 }} />
          {renderSeriesList()}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {renderEditSerieModal()}
      {renderAddExerciseModal()}

      <View
        style={{
          padding: 20,
          backgroundColor: themeColors.background,
          borderTopWidth: 1,
          borderTopColor: themeColors.text + "20",
        }}
      >
        <MFPrimaryButton
          title={isSaving ? "Salvando..." : "Salvar Alterações"}
          onPress={saveTraining}
          isLoading={isSaving}
          isDisabled={isSaving || !trainingName}
          themeColors={themeColors}
          isWhiteDetails={true}
        />
      </View>
    </View>
  );
}
