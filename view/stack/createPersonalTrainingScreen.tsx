import { MFPrimaryButton } from "@/components/my-fit-ui/buttons";
import MFStackEditSubtitle from "@/components/my-fit-ui/stackEditSubtitle";
import MFStackHeader from "@/components/my-fit-ui/stackHeader";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import {
  CreateSerie,
  CreateTraining,
  getExercises,
  getGroups,
} from "@/service/training";
import { globalStyles } from "@/styles/global";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

// Configurações pré-definidas para facilitar a seleção
const TRAINING_PRESETS = [
  { id: 1, name: "Iniciante", level: 1, sets: 3, reps: 12, rest: 60 },
  { id: 2, name: "Intermediário", level: 2, sets: 4, reps: 10, rest: 90 },
  { id: 3, name: "Avançado", level: 3, sets: 4, reps: 8, rest: 120 },
  { id: 4, name: "Força", level: 4, sets: 5, reps: 5, rest: 180 },
];

export default function CreatePersonalTrainingScreen() {
  const { theme } = useTheme();
  const themeColors = Colors[`${theme}`];
  const router = useRouter();

  // Estados
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string>("");

  // Dados do treino
  const [trainingId, setTrainingId] = useState<number | null>(null);
  const [trainingName, setTrainingName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState(TRAINING_PRESETS[1]);

  // Grupos musculares e exercícios
  const [muscleGroups, setMuscleGroups] = useState<any[]>([]);
  const [allExercises, setAllExercises] = useState<any[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    setIsLoading(true);
    try {
      const z = await SecureStore.getItemAsync("userToken");
      if (z) {
        setToken(z);
        const groups = await getGroups({ token: z });
        const exercises = await getExercises({ token: z, isFull: true });

        setMuscleGroups(groups || []);
        setAllExercises(exercises || []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      Toast.show({
        type: "error",
        text1: "Erro ao carregar dados iniciais",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function toggleGroupSelection(groupId: number) {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter((id) => id !== groupId));
      // Remove exercícios desse grupo
      setSelectedExercises(
        selectedExercises.filter((ex) => ex.groupMuscleId !== groupId)
      );
    } else {
      setSelectedGroups([...selectedGroups, groupId]);
    }
  }

  function toggleExerciseSelection(exercise: any) {
    const exists = selectedExercises.find((ex) => ex.id === exercise.id);
    if (exists) {
      setSelectedExercises(
        selectedExercises.filter((ex) => ex.id !== exercise.id)
      );
    } else {
      setSelectedExercises([...selectedExercises, exercise]);
    }
  }

  async function createTraining() {
    if (!token) return;

    setIsLoading(true);
    try {
      // 1. Criar o treino
      const trainingResult = await CreateTraining({
        name: trainingName || `Treino ${selectedPreset.name}`,
        description: `Treino personalizado - Nível ${selectedPreset.name}`,
        level: selectedPreset.level,
        url: "",
        photo: "",
        token,
        assign: true,
      });

      if (!trainingResult?.newTraining?.id) {
        throw new Error("Erro ao criar treino");
      }

      const newTrainingId = trainingResult.newTraining.id;
      setTrainingId(newTrainingId);

      // 2. Adicionar cada exercício selecionado como uma série
      for (const exercise of selectedExercises) {
        const difficulty = Array(selectedPreset.sets).fill("0");
        const repetitions = Array(selectedPreset.sets).fill(
          selectedPreset.reps.toString()
        );

        await CreateSerie({
          trainingId: newTrainingId,
          exercise: exercise.id,
          amount: selectedPreset.sets,
          difficulty: difficulty,
          repetitions: repetitions,
          interval: selectedPreset.rest,
          isometry: 0,
          addSet: 0,
          token,
        });
      }

      Toast.show({
        type: "success",
        text1: "✅ Treino criado com sucesso!",
      });

      // Navegar para a tela de treinos
      setTimeout(() => {
        router.push("/(tabs)/training");
      }, 500);
    } catch (error) {
      console.error("Erro ao criar treino:", error);
      Toast.show({
        type: "error",
        text1: "❌ Erro ao criar treino",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function nextStep() {
    if (currentStep === 1 && selectedPreset) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedGroups.length > 0) {
      setCurrentStep(3);
    } else if (currentStep === 3 && selectedExercises.length > 0) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      createTraining();
    }
  }

  function previousStep() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  function canProceed() {
    if (currentStep === 1) return selectedPreset !== null;
    if (currentStep === 2) return selectedGroups.length > 0;
    if (currentStep === 3) return selectedExercises.length > 0;
    if (currentStep === 4) return true;
    return false;
  }

  // STEP 1: Selecionar nível do treino
  const renderStep1 = () => (
    <View style={{ padding: 20, gap: 20 }}>
      <MFStackEditSubtitle
        themeColors={themeColors}
        title="Escolha o nível do seu treino"
        info="Selecione o nível que melhor se adequa ao seu objetivo"
      />

      <View style={{ gap: 15, marginTop: 20 }}>
        {TRAINING_PRESETS.map((preset) => (
          <TouchableOpacity
            key={preset.id}
            onPress={() => setSelectedPreset(preset)}
            style={{
              backgroundColor:
                selectedPreset?.id === preset.id
                  ? themeColors.primary
                  : themeColors.secondary,
              padding: 20,
              borderRadius: 12,
              borderWidth: 2,
              borderColor:
                selectedPreset?.id === preset.id
                  ? themeColors.primary
                  : themeColors.text + "30",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "bold",
                    color:
                      selectedPreset?.id === preset.id
                        ? themeColors.white
                        : themeColors.text,
                    marginBottom: 8,
                  }}
                >
                  {preset.name}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color:
                      selectedPreset?.id === preset.id
                        ? themeColors.white + "CC"
                        : themeColors.textSecondary,
                  }}
                >
                  {preset.sets} séries × {preset.reps} repetições
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color:
                      selectedPreset?.id === preset.id
                        ? themeColors.white + "CC"
                        : themeColors.textSecondary,
                  }}
                >
                  Descanso: {preset.rest}s entre séries
                </Text>
              </View>
              {selectedPreset?.id === preset.id && (
                <AntDesign
                  name="checkcircle"
                  size={30}
                  color={themeColors.white}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // STEP 2: Selecionar grupos musculares
  const renderStep2 = () => (
    <View style={{ padding: 20, gap: 20 }}>
      <MFStackEditSubtitle
        themeColors={themeColors}
        title="Quais músculos treinar?"
        info={`Selecionados: ${selectedGroups.length}`}
      />

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 20,
        }}
      >
        {muscleGroups.map((group) => {
          const isSelected = selectedGroups.includes(group.id);
          return (
            <TouchableOpacity
              key={group.id}
              onPress={() => toggleGroupSelection(group.id)}
              style={{
                backgroundColor: isSelected
                  ? themeColors.primary
                  : themeColors.secondary,
                paddingVertical: 15,
                paddingHorizontal: 20,
                borderRadius: 25,
                borderWidth: 2,
                borderColor: isSelected
                  ? themeColors.primary
                  : themeColors.text + "30",
                minWidth: "45%",
                alignItems: "center",
              }}
            >
              <View style={{ alignItems: "center", gap: 5 }}>
                {isSelected && (
                  <AntDesign
                    name="checkcircle"
                    size={20}
                    color={themeColors.white}
                  />
                )}
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: isSelected ? themeColors.white : themeColors.text,
                    textAlign: "center",
                  }}
                >
                  {group.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // STEP 3: Selecionar exercícios
  const renderStep3 = () => {
    const filteredExercises = allExercises.filter((ex) =>
      selectedGroups.includes(ex.groupMuscleId)
    );

    return (
      <View style={{ padding: 20, gap: 20 }}>
        <MFStackEditSubtitle
          themeColors={themeColors}
          title="Escolha os exercícios"
          info={`${selectedExercises.length} exercício(s) selecionado(s)`}
        />

        <ScrollView style={{ marginTop: 20 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 15 }}>
            {filteredExercises.map((exercise) => {
              const isSelected = selectedExercises.some(
                (ex) => ex.id === exercise.id
              );
              return (
                <TouchableOpacity
                  key={exercise.id}
                  onPress={() => toggleExerciseSelection(exercise)}
                  style={{
                    width: "47%",
                    backgroundColor: isSelected
                      ? themeColors.primary + "20"
                      : themeColors.secondary,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: isSelected
                      ? themeColors.primary
                      : themeColors.text + "20",
                    overflow: "hidden",
                  }}
                >
                  {exercise.image && (
                    <Image
                      source={{ uri: exercise.image }}
                      style={{
                        width: "100%",
                        height: 120,
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
                        marginBottom: 4,
                      }}
                      numberOfLines={2}
                    >
                      {exercise.name}
                    </Text>
                    {exercise.description && (
                      <Text
                        style={{
                          fontSize: 11,
                          color: themeColors.textSecondary,
                        }}
                        numberOfLines={2}
                      >
                        {exercise.description}
                      </Text>
                    )}
                  </View>
                  {isSelected && (
                    <View
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        backgroundColor: themeColors.primary,
                        borderRadius: 15,
                        padding: 4,
                      }}
                    >
                      <AntDesign
                        name="check"
                        size={16}
                        color={themeColors.white}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  // STEP 4: Revisão final
  const renderStep4 = () => (
    <View style={{ padding: 20, gap: 20 }}>
      <MFStackEditSubtitle
        themeColors={themeColors}
        title="Revisar e confirmar"
        info="Confira os detalhes do seu treino"
      />

      <View
        style={{
          backgroundColor: themeColors.secondary,
          padding: 20,
          borderRadius: 12,
          gap: 15,
          marginTop: 20,
        }}
      >
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 12, color: themeColors.textSecondary }}>
            Nível do Treino
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "600", color: themeColors.text }}>
            {selectedPreset.name}
          </Text>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 12, color: themeColors.textSecondary }}>
            Configuração
          </Text>
          <Text style={{ fontSize: 16, color: themeColors.text }}>
            {selectedPreset.sets} séries × {selectedPreset.reps} repetições
          </Text>
          <Text style={{ fontSize: 16, color: themeColors.text }}>
            Descanso: {selectedPreset.rest}s
          </Text>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 12, color: themeColors.textSecondary }}>
            Grupos Musculares
          </Text>
          <Text style={{ fontSize: 16, color: themeColors.text }}>
            {selectedGroups.length} grupo(s) selecionado(s)
          </Text>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 12, color: themeColors.textSecondary }}>
            Total de Exercícios
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "600", color: themeColors.primary }}>
            {selectedExercises.length} exercícios
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: themeColors.info + "20",
          padding: 15,
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: themeColors.info,
        }}
      >
        <Text style={{ fontSize: 14, color: themeColors.text }}>
          💡 Você poderá editar e personalizar cada exercício depois de criar o treino.
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <MFStackHeader title="Novo Treino Personalizado" isLoading={isLoading} />

      {/* Progress Indicator */}
      <View
        style={{
          flexDirection: "row",
          padding: 20,
          paddingBottom: 10,
          justifyContent: "space-between",
        }}
      >
        {[1, 2, 3, 4].map((step) => (
          <View key={step} style={{ flex: 1, alignItems: "center" }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor:
                  currentStep >= step
                    ? themeColors.primary
                    : themeColors.secondary,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color:
                    currentStep >= step
                      ? themeColors.white
                      : themeColors.textSecondary,
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                {step}
              </Text>
            </View>
            {step < 4 && (
              <View
                style={{
                  position: "absolute",
                  top: 20,
                  left: "60%",
                  width: "80%",
                  height: 2,
                  backgroundColor:
                    currentStep > step
                      ? themeColors.primary
                      : themeColors.secondary,
                }}
              />
            )}
          </View>
        ))}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size={40} color={themeColors.primary} />
          <Text style={{ marginTop: 20, color: themeColors.text }}>
            {currentStep === 4 ? "Criando seu treino..." : "Carregando..."}
          </Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </ScrollView>
      )}

      {/* Navigation Buttons */}
      <View
        style={{
          flexDirection: "row",
          padding: 20,
          gap: 10,
          backgroundColor: themeColors.background,
          borderTopWidth: 1,
          borderTopColor: themeColors.text + "20",
        }}
      >
        {currentStep > 1 && (
          <View style={{ flex: 1 }}>
            <MFPrimaryButton
              title="Voltar"
              onPress={previousStep}
              themeColors={themeColors}
              isWhiteDetails={false}
            />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <MFPrimaryButton
            title={currentStep === 4 ? "Criar Treino" : "Continuar"}
            onPress={nextStep}
            isDisabled={!canProceed()}
            isLoading={isLoading}
            themeColors={themeColors}
            isWhiteDetails={true}
          />
        </View>
      </View>
    </View>
  );
}
