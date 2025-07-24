import { CreateSerie } from "@/service/training";
import { globalStyles } from "@/styles/global";
import { profileStyles } from "@/styles/profile";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
} from "react-native";
import Toast from "react-native-toast-message";
import { WebView } from "react-native-webview";
import { MFModalSmallButton } from "./buttons";
import { MFDefaultCard } from "./cards";
import { MFLongTextInput, MFSelectInput, MFTextInput } from "./inputs";

interface MFLoginProps extends ViewProps {
  warningVisible?: boolean;
  themeColors?: any;
  text?: string;
  isLoading?: boolean;
  onPress?: (e: GestureResponderEvent) => void;
  close: () => void;
}

interface MFFinishTrainingProps extends ViewProps {
  warningVisible?: boolean;
  themeColors?: any;
  isLoading?: boolean;
  onPress: () => void;
  close?: (e: GestureResponderEvent) => void;
  isComplete?: boolean;
  isFirstEvaluation?: boolean;
  observation: string | undefined;
  setObservation: (value: string) => void;
  evaluation: number | undefined;
  setEvaluation: (value: number) => void;
}

interface MFSingleInputProps extends ViewProps {
  themeColors?: any;
  isOPen?: boolean;
  isLoading?: boolean;
  title?: string;
  inputLabel?: string;
  button1?: string;
  button2?: string;
  data?: string;
  onChange?: (string: string) => void;
  onPress?: (e: GestureResponderEvent) => void;
  close?: (e: GestureResponderEvent) => void;
  icon?: React.ReactNode;
  iconLabel?: React.ReactNode;
}

interface MFCreateStepProps extends ViewProps {
  themeColors?: any;
  isOPen?: boolean;
  isLoading?: boolean;
  inputLabel?: any;
  button1?: any;
  button2?: any;
  title?: string;
  onPress?: (e: GestureResponderEvent) => void;
  close?: (e: GestureResponderEvent) => void;
  name?: string;
  setName?: (string: string) => void;
  description?: string;
  setDescription?: (string: string) => void;
}

interface MFCreateSerieProps extends ViewProps {
  themeColors?: any;
  isOPen?: boolean;
  title?: string;
  onPress?: (e: GestureResponderEvent) => void;
  close: () => void;
  finish: () => void;
  muscleGroups?: any;
  exercisesList?: any;
  data?: any;
  trainingId?: any;
  token?: string;
}

interface MFMediaSelectorProps extends ViewProps {
  mediaSelectorVisible: boolean;
  isLoading: boolean;
  themeColors: any;
  close?: (e: GestureResponderEvent) => void;
  openCamera?: () => void;
  pickImage?: () => void;
}

export function MFLogoutModal({
  warningVisible,
  themeColors,
  text,
  onPress,
  close,
  isLoading,
  ...props
}: MFLoginProps) {
  return (
    <Modal
      visible={warningVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={close}
    >
      <View style={styles.container}>
        <MFDefaultCard themeColors={themeColors}>
          <Text
            style={[
              styles.text,
              { color: themeColors.text, textAlign: "center" },
            ]}
          >
            {text}
          </Text>
          <View style={styles.btnBox}>
            {!isLoading && (
              <>
                <MFModalSmallButton
                  type="1"
                  title="SIM"
                  themeColors={themeColors}
                  onPress={onPress!}
                  isLoading={isLoading}
                />
                <MFModalSmallButton
                  type="2"
                  title="Não"
                  themeColors={themeColors}
                  onPress={close!}
                  isLoading={isLoading}
                />
              </>
            )}
            {isLoading && (
              <MFModalSmallButton
                type="3"
                title=" "
                themeColors={themeColors}
                onPress={() => {}}
                isLoading={isLoading}
              />
            )}
          </View>
        </MFDefaultCard>
      </View>
    </Modal>
  );
}

export function MediaSelectorModal({
  mediaSelectorVisible,
  close,
  isLoading,
  themeColors,
  openCamera,
  pickImage,
}: MFMediaSelectorProps) {
  return (
    <Modal
      visible={mediaSelectorVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={close}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        {isLoading ? (
          <View
            style={[
              profileStyles.mediaModalContainer,
              {
                backgroundColor: themeColors.white,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <ActivityIndicator size={20} color={themeColors.primary} />
          </View>
        ) : (
          <View
            style={[
              profileStyles.mediaModalContainer,
              { backgroundColor: themeColors.white },
            ]}
          >
            <TouchableOpacity
              onPress={close}
              style={[
                profileStyles.mediaModalCloseButton,
                { backgroundColor: themeColors.white },
              ]}
            >
              <AntDesign name="closecircle" size={24} color="black" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={openCamera}
              style={[
                profileStyles.mediaModalIcon,
                { backgroundColor: themeColors.grey },
              ]}
            >
              <Text
                style={[
                  profileStyles.mediaModalText,
                  {
                    backgroundColor: themeColors.primary,
                    color: themeColors.white,
                  },
                ]}
              >
                Foto
              </Text>
              <Feather name="camera" size={60} color={themeColors.black} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickImage}
              style={[
                profileStyles.mediaModalIcon,
                { backgroundColor: themeColors.grey },
              ]}
            >
              <Text
                style={[
                  profileStyles.mediaModalText,
                  {
                    backgroundColor: themeColors.primary,
                    color: themeColors.white,
                  },
                ]}
              >
                Galeria
              </Text>
              <Feather name="image" size={60} color={themeColors.black} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

export function MFSingleInputModal({
  isOPen,
  themeColors,
  title,
  inputLabel,
  data,
  button1,
  button2,
  onChange,
  onPress,
  close,
  icon,
  iconLabel,
  isLoading,
  ...props
}: MFSingleInputProps) {
  return (
    <Modal
      visible={isOPen}
      animationType="slide"
      transparent={true}
      onRequestClose={close}
    >
      <View style={styles.container}>
        <MFDefaultCard themeColors={themeColors}>
          <Text style={[styles.text, { color: themeColors.text }]}>
            {title}
          </Text>
          <MFTextInput
            labelIcon={iconLabel}
            icon={icon}
            themeColors={themeColors}
            placeholder={`Digite aqui...`}
            label={inputLabel}
            value={data}
            onChangeText={onChange}
            error={data ? "" : `Digite o ${inputLabel}`}
          ></MFTextInput>
          <View style={[styles.btnBox, { marginTop: 30 }]}>
            <MFModalSmallButton
              isDisabled={isLoading}
              type="1"
              title={!isLoading ? button1! : "Enviando"}
              themeColors={themeColors}
              onPress={
                !isLoading && data
                  ? onPress!
                  : () => {
                      Toast.show({
                        type: "error",
                        text1: `❌ Atenção, preencha ${inputLabel}.`,
                      });
                    }
              }
              isLoading={isLoading}
            />
            {!isLoading && (
              <MFModalSmallButton
                type="2"
                title={button2!}
                themeColors={themeColors}
                onPress={close!}
                isLoading={isLoading}
              />
            )}
          </View>
        </MFDefaultCard>
      </View>
    </Modal>
  );
}

export function MFCreateStepModal({
  isOPen,
  themeColors,
  title,
  inputLabel,
  button1,
  button2,
  onPress,
  close,
  isLoading,
  name,
  setName,
  description,
  setDescription,
}: MFCreateStepProps) {
  return (
    <Modal
      visible={isOPen}
      animationType="slide"
      transparent={true}
      onRequestClose={close}
    >
      <View style={styles.container}>
        <MFDefaultCard themeColors={themeColors}>
          <Text style={[styles.text, { color: themeColors.text }]}>
            {title}
          </Text>
          <MFTextInput
            themeColors={themeColors}
            placeholder={`Exemplo: Treino B, Treino de superiores...`}
            label={"Nome da divisão:"}
            value={name}
            onChangeText={setName}
            error={name ? "" : `Digite o nome da divisão`}
          ></MFTextInput>
          {/* <MFTextInput
            themeColors={themeColors}
            placeholder={`Digite aqui...`}
            label={"Descrição:"}
            value={description}
            onChangeText={setDescription}
          ></MFTextInput> */}
          <View style={[styles.btnBox, { marginTop: 30 }]}>
            <MFModalSmallButton
              isDisabled={isLoading}
              type="1"
              title={!isLoading ? button1! : "Enviando"}
              themeColors={themeColors}
              onPress={
                !isLoading && name
                  ? onPress!
                  : () => {
                      Toast.show({
                        type: "error",
                        text1: `❌ Atenção, preencha ${inputLabel}.`,
                      });
                    }
              }
              isLoading={isLoading}
            />
            {!isLoading && (
              <MFModalSmallButton
                type="2"
                title={button2!}
                themeColors={themeColors}
                onPress={close!}
                isLoading={isLoading}
              />
            )}
          </View>
        </MFDefaultCard>
      </View>
    </Modal>
  );
}

export function MFCreateSerieModal({
  isOPen,
  themeColors,
  onPress,
  close,
  finish,
  title,
  muscleGroups,
  exercisesList,
  data,
  trainingId,
  token,
}: MFCreateSerieProps) {
  const [isSaveLoading, setIsSaveLoading] = useState<boolean>(false),
    [exercise, setExercise] = useState<string>(""),
    [muscleSelected, setMuscleSelected] = useState<string>(""),
    [dataFiltered, setDataFiltered] = useState<any>(""),
    [interval, setInterval] = useState<string>(""),
    [addSet, setAddSet] = useState<string>("0"),
    [isometry, setIsometry] = useState<string>(""),
    [amount, setAmount] = useState<string>(""),
    [repetitions, setRepetitions] = useState<string[]>([]),
    [bisetExerciseId, setBisetExerciseId] = useState<string>(""),
    [muscleBisetSelected, setMuscleBisetSelected] = useState<string>(""),
    [dataBisetFiltered, setDataBisetFiltered] = useState<any>("");

  async function handleSaveSerie(serie: any) {
    if (token) {
      setIsSaveLoading(true);

      const res = await CreateSerie({
        token: token,
        trainingId: trainingId ? parseInt(trainingId) : undefined,
        serieId: data?.id ? data?.id : undefined,
        amount: amount ? parseInt(amount!) : 0,
        exercise: exercise ? parseInt(exercise!) : 0,
        interval: interval ? parseInt(interval!) : 0,
        isometry: isometry ? parseInt(isometry!) : 0,
        repetitions: [],
        difficulty: [],
        addSet: addSet ? parseInt(addSet!) : 0,
        bisetExerciseId:
          addSet && addSet === "3" && bisetExerciseId
            ? parseInt(bisetExerciseId)
            : undefined,
      });

      if (res?.serie) {
        Toast.show({
          type: "success",
          text1: `✅ ${res?.message}`,
        });
        finish();
      } else {
        Toast.show({
          type: "error",
          text1: `❌ Erro: ${res?.message}`,
        });
      }
      setIsSaveLoading(false);
    }
  }

  useEffect(() => {
    if (data) {
      setMuscleSelected(
        data.exercise?.groupMuscleId
          ? data.exercise?.groupMuscleId.toString()
          : ""
      );
      setExercise(data.exercise?.id ? data.exercise?.id.toString() : "0");
      setAmount(data.amount ? data.amount.toString() : "3");
      setInterval(data.interval ? data.interval.toString() : "60");
      setRepetitions([]);
      setAddSet(data.addSet ? data.addSet.toString() : "0");
      setIsometry(data.isometry ? data.isometry.toString() : "0");
      if (data.addSet === "3") {
        setMuscleBisetSelected(
          data.bisetExerciseId?.groupMuscleId
            ? data.bisetExerciseId?.groupMuscleId.toString()
            : ""
        );
        setBisetExerciseId(
          data.bisetExerciseId?.id ? data.bisetExerciseId?.id.toString() : ""
        );
      }
    }
  }, [data]);

  useEffect(() => {
    if (muscleSelected) {
      const x = exercisesList.filter(
        (a: { groupMuscleId: number; label: string; value: string }) =>
          a.groupMuscleId === parseInt(muscleSelected)
      );
      setDataFiltered(x);
    }

    if (muscleBisetSelected) {
      const x = exercisesList.filter(
        (a: { groupMuscleId: number; label: string; value: string }) =>
          a.groupMuscleId === parseInt(muscleBisetSelected)
      );
      setDataBisetFiltered(x);
    }
  }, [muscleSelected, muscleBisetSelected]);

  const isometry1 = [
    { label: "-", value: "0" },
    { label: "Com isometria", value: "1" },
  ];
  const isometry2 = [
    { label: "-", value: "0" },
    { label: "Primeiro exercício", value: "1" },
    { label: "Segundo exercício", value: "2" },
    { label: "Ambos os exercícios", value: "3" },
  ];

  return (
    <Modal
      visible={isOPen}
      animationType="slide"
      transparent={true}
      onRequestClose={close}
    >
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            style={{ flex: 1, width: "100%" }}
          >
            <MFDefaultCard themeColors={themeColors}>
              <Text style={[styles.text, { color: themeColors.text }]}>
                {title}
              </Text>
              <View style={{ width: "100%" }}>
                <View style={[globalStyles.flexr, styles.serieBox]}>
                  <MFSelectInput
                    label="Grupo Muscular"
                    selectedValue={muscleSelected}
                    onValueChange={setMuscleSelected}
                    options={[{ label: "-", value: "0" }, ...muscleGroups]}
                    themeColors={themeColors}
                    isDisabled={false}
                    error={
                      !muscleSelected || muscleSelected === "-"
                        ? "Selecione o grupo muscular."
                        : ""
                    }
                  ></MFSelectInput>
                  {muscleSelected && muscleSelected !== "-" && (
                    <>
                      <MFSelectInput
                        label="Exercício"
                        selectedValue={exercise || "0"}
                        onValueChange={setExercise}
                        options={[{ label: "-", value: "0" }, ...dataFiltered]}
                        themeColors={themeColors}
                        isDisabled={false}
                        error={
                          !exercise || exercise === "-"
                            ? "Selecione o exercício muscular."
                            : ""
                        }
                      ></MFSelectInput>
                      {/* <MFDoubleInput
                        isNumeric
                        selectedValue={amount}
                        selectedValue2={
                          repetitions ? repetitions.toString() : ""
                        }
                        onValueChange={setAmount}
                        onValueChange2={setRepetitions}
                        themeColors={themeColors}
                        placeholder={`Digite uma quantidade de séries...`}
                        label={"Séries x Repetições"}
                        error={
                          !amount || !repetitions
                            ? "Digite uma quantidade de séries e repetições."
                            : ""
                        }
                      ></MFDoubleInput> */}
                      <MFTextInput
                        isNumeric
                        themeColors={themeColors}
                        placeholder={`Digite o intervalo...`}
                        label={"Intervalo de descanso (sec)"}
                        value={interval ? interval.toString() : ""}
                        onChangeText={setInterval}
                        error={!interval ? "Digite um intervalo." : ""}
                      ></MFTextInput>
                      <MFSelectInput
                        label="Variação de exercício"
                        selectedValue={addSet ? addSet.toString() : "0"}
                        onValueChange={setAddSet}
                        options={[
                          { label: "-", value: "0" },
                          { label: "Dropset", value: "1" },
                          { label: "Upset", value: "2" },
                          { label: "Biset", value: "3" },
                        ]}
                        themeColors={themeColors}
                        isDisabled={false}
                      ></MFSelectInput>
                      <MFSelectInput
                        label="Isometria"
                        selectedValue={isometry ? isometry.toString() : "0"}
                        onValueChange={setIsometry}
                        options={addSet === "3" ? isometry2 : isometry1}
                        themeColors={themeColors}
                        isDisabled={false}
                      ></MFSelectInput>
                      {addSet && addSet === "3" && (
                        <>
                          <MFSelectInput
                            label="Grupo Muscular"
                            selectedValue={muscleBisetSelected || "0"}
                            onValueChange={setMuscleBisetSelected}
                            options={[
                              { label: "-", value: "0" },
                              ...muscleGroups,
                            ]}
                            themeColors={themeColors}
                            isDisabled={false}
                            error={
                              !muscleBisetSelected ||
                              muscleBisetSelected === "-"
                                ? "Selecione o grupo muscular."
                                : ""
                            }
                          ></MFSelectInput>
                          {muscleBisetSelected && (
                            <MFSelectInput
                              label="Exercício Biset"
                              selectedValue={
                                bisetExerciseId ? bisetExerciseId : "0"
                              }
                              onValueChange={setBisetExerciseId}
                              options={[
                                { label: "-", value: "-" },
                                ...dataBisetFiltered,
                              ]}
                              themeColors={themeColors}
                              isDisabled={false}
                              error={
                                !bisetExerciseId || bisetExerciseId === "-"
                                  ? "Selecione o exercício muscular."
                                  : ""
                              }
                            ></MFSelectInput>
                          )}
                        </>
                      )}
                    </>
                  )}
                </View>
              </View>
              <View style={[styles.btnBox, { marginTop: 30 }]}>
                <MFModalSmallButton
                  isDisabled={isSaveLoading}
                  type="1"
                  title={!isSaveLoading ? "Salvar" : "Enviando"}
                  themeColors={themeColors}
                  onPress={!isSaveLoading ? handleSaveSerie! : () => {}}
                  isLoading={isSaveLoading}
                />
                {!isSaveLoading && (
                  <MFModalSmallButton
                    type="2"
                    title={"Fechar"}
                    themeColors={themeColors}
                    onPress={close!}
                    isLoading={isSaveLoading}
                  />
                )}
              </View>
            </MFDefaultCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export default function MFYouTubeModal({
  video,
  ytModalVisible,
  setYtModalVisible,
}: {
  video: string;
  ytModalVisible: boolean;
  setYtModalVisible: (any: boolean) => void;
}) {
  return (
    <Modal
      animationType="slide"
      visible={ytModalVisible}
      onRequestClose={() => setYtModalVisible(false)}
    >
      <View style={{ flex: 1, backgroundColor: "black", padding: 20 }}>
        <View style={{ height: 130 }}></View>
        <WebView source={{ uri: video }} style={styles.ytVideoBox} />
        <TouchableOpacity
          onPress={() => setYtModalVisible(false)}
          style={styles.closeBtnYT}
        >
          <Text style={{ color: "white", fontSize: 20 }}>Fechar</Text>
        </TouchableOpacity>
        <View style={{ height: 150 }}></View>
      </View>
    </Modal>
  );
}

export function MFFinishTrainingModal({
  warningVisible,
  themeColors,
  onPress,
  close,
  isLoading,
  isComplete,
  isFirstEvaluation,
  observation,
  setObservation,
  evaluation,
  setEvaluation,
  ...props
}: MFFinishTrainingProps) {
  const [step, setStep] = useState<number>(0);

  function ChangeStep() {
    if (step === 1) {
      if (isFirstEvaluation === true) {
        setStep(2);
        return null;
      } else {
        onPress();
        return null;
      }
    } else if (step === 2) {
      onPress();
      return null;
    }
  }

  useEffect(() => {
    if (!isComplete) {
      setStep(1);
    } else if (isFirstEvaluation) {
      setStep(2);
    } else {
      setStep(3);
    }
  }, [isComplete, isFirstEvaluation]);

  const renderStars = () => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((num) => (
          <TouchableOpacity key={num} onPress={() => setEvaluation(num)}>
            <FontAwesome
              name={!!evaluation && evaluation >= num ? "star" : "star-o"}
              size={36}
              color="#FFD700"
              style={{ marginHorizontal: 4 }}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={warningVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={close}
    >
      <View style={styles.container}>
        <MFDefaultCard themeColors={themeColors}>
          {/* Step 1 - Confirmação */}
          <TouchableOpacity
            onPress={close}
            style={[
              {
                position: "absolute",
                top: -20,
                right: -10,
                zIndex: 111,
                backgroundColor: themeColors.secondary,
                borderRadius: 100,
              },
            ]}
          >
            <AntDesign name="closecircle" size={40} color={themeColors.text} />
          </TouchableOpacity>
          {step === 1 ? (
            <View style={styles.finishTrainingMain}>
              <View style={globalStyles.flexr}>
                <Text
                  style={[
                    styles.text,
                    { color: themeColors.text, textAlign: "center" },
                  ]}
                >
                  Deseja concluir sem finalizar os exercícios?
                </Text>
              </View>
              {isLoading ? (
                <MFModalSmallButton
                  type="3"
                  title=" "
                  themeColors={themeColors}
                  onPress={() => {}}
                  isLoading={isLoading}
                />
              ) : (
                <View style={globalStyles.flexr}>
                  <MFModalSmallButton
                    type="1"
                    title="SIM"
                    themeColors={themeColors}
                    onPress={ChangeStep}
                    isLoading={isLoading}
                  />
                  <MFModalSmallButton
                    type="2"
                    title="NÃO"
                    themeColors={themeColors}
                    onPress={close!}
                    isLoading={isLoading}
                  />
                </View>
              )}
            </View>
          ) : (
            // Step 2 - Avaliação
            step === 2 && (
              <View style={styles.finishTrainingMain}>
                <Text
                  style={[
                    styles.text,
                    { color: themeColors.text, marginBottom: 16 },
                  ]}
                >
                  Por favor, avalie o treino:
                </Text>
                {renderStars()}
                <MFLongTextInput
                  themeColors={themeColors}
                  placeholder="Comente..."
                  value={observation}
                  onChangeText={setObservation}
                />
                <MFModalSmallButton
                  type="1"
                  title="Avaliar"
                  themeColors={themeColors}
                  onPress={ChangeStep}
                  isLoading={isLoading}
                />
              </View>
            )
          )}
        </MFDefaultCard>
      </View>
    </Modal>
  );
}

export function MFDefaultModal({
  warningVisible,
  themeColors,
  text,
  onPress,
  close,
  isLoading,
  children,
  ...props
}: MFLoginProps) {
  return (
    <Modal visible={warningVisible} animationType="slide" transparent={true}>
      <Pressable style={styles.container} onPress={() => close()}>
        {children}
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  containerYT: { marginTop: 50, alignItems: "center" },
  openBtnYT: { color: "blue", fontSize: 18 },
  closeBtnYT: {
    backgroundColor: "black",
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffffff",
    borderRadius: 8,
  },
  finishTrainingMain: {
    width: "90%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  container: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  text: {
    fontSize: 22,
    fontWeight: 600,
    marginBottom: 30,
  },
  btnBox: {
    display: "flex",
    gap: 20,
    flexDirection: "row",
  },
  button: {
    width: 80,
    height: 30,
  },
  serieBox: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    margin: 0,
    // borderWidth: 1,
    position: "relative",
    paddingHorizontal: 7,
    paddingVertical: 20,
    borderRadius: 5,
  },
  ytVideoFull: {
    width: "100%",
    minHeight: 800,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 30,
  },
  ytVideoBox: {
    width: "100%",
    maxHeight: "90%",
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
});
