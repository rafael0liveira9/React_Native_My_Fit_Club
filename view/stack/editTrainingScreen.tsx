import {
  MFDefaulButton,
  MFPrimaryButton,
} from "@/components/my-fit-ui/buttons";
import { MFPlusCard, StepEditCard } from "@/components/my-fit-ui/cards";
import { MFLongTextInput } from "@/components/my-fit-ui/inputs";
import {
  MediaSelectorModal,
  MFCreateSerieModal,
  MFSingleInputModal,
} from "@/components/my-fit-ui/modal";
import MFStackEditSubtitle from "@/components/my-fit-ui/stackEditSubtitle";
import MFStackHeader from "@/components/my-fit-ui/stackHeader";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import {
  EditTraining,
  getExercises,
  getGroups,
  getTrainingById,
  updatePhoto,
} from "@/service/training";
import { globalStyles } from "@/styles/global";
import { trainingStyles } from "@/styles/training";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function EditTrainingScreen() {
  const { width } = useWindowDimensions();
  const { theme } = useTheme(),
    themeColors = Colors[`${theme}`],
    params = useLocalSearchParams(),
    { id } = params,
    router = useRouter();

  const [mediaType, setMediaType] = useState<number>(),
    [step, setStep] = useState<number>(1),
    [muscleGroups, setMuscleGroups] = useState<any>([]),
    [exercisesList, setExercisesList] = useState<any>([]);

  const [hasChanged, setHasChanged] = useState<boolean>(false),
    [isLoading, setIsLoading] = useState<boolean>(false),
    [isSaveLoading, setIsSaveLoading] = useState<boolean>(false),
    [isSingleInputOpen, setIsSingleInputOpen] = useState<boolean>(false),
    [isSerieModalOpen, setIsSerieModalOpen] = useState<boolean>(false),
    [mediaSelectorVisible, setMediaSelectorVisible] = useState<boolean>(false);

  const [token, setToken] = useState<string>(""),
    [data, setData] = useState<any>([]),
    [seriesList, setSeriesList] = useState<any>([]),
    [serieEdit, setSerieEdit] = useState<any>([]),
    [stepDescription, setStepDescription] = useState<string>("");

  async function getUserData() {
    setIsLoading(true);
    try {
      const z = await SecureStore.getItemAsync("userToken");

      if (z) {
        const x = await getTrainingById({ token: z, id: id.toString() });
        const y = await getGroups({ token: z });
        const w = await getExercises({ token: z, isFull: false });

        const muscleCopy =
          y && y.length > 0
            ? y.map((e: any) => ({ value: e.id.toString(), label: e.name }))
            : [];

        const exercisesCopy = w.map((e: any) => ({
          ...e,
          value: e.value ? e.value.toString() : "",
        }));

        setToken(z);
        setData({
          description: x?.training?.description,
          id: x?.training?.id,
          level: x?.training?.level ? x?.training?.level.toString() : "",
          name: x?.training?.name,
          photo: x?.training?.photo,
          url: x?.training?.url,
        });
        setSeriesList(x?.training?.series);
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

  function getMimeType(uri: string): string {
    const extension = uri.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "gif":
        return "image/gif";
      case "webp":
        return "image/webp";
      default:
        return "image/jpeg";
    }
  }

  async function pickImage() {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Você precisa permitir acesso à galeria!");
      return;
    }
    setIsLoading(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedAsset = result.assets[0];
      const token = await SecureStore.getItemAsync("userToken");
      const name = selectedAsset.uri.split("/").pop() || "photo.jpg";
      const type = getMimeType(selectedAsset.uri) || "image/jpeg";

      const file = {
        uri: selectedAsset.uri,
        name: name,
        type: type,
      } as any;
      if (file && token) {
        let response = await updatePhoto(
          `${data.id}`,
          file,
          `training/${data?.id}`,
          token
        );
        setData({ ...data, photo: response.url });
        setIsLoading(false);
        setMediaSelectorVisible(false);
      }
    }
    setMediaSelectorVisible(false);
    Toast.show({
      type: "success",
      text1: `✅ Imagem inserida com sucesso.`,
    });
  }

  async function openCamera() {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Você precisa permitir acesso à câmera!");
      return;
    }
    setIsLoading(true);
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedAsset = result.assets[0];
      const token = await SecureStore.getItemAsync("userToken");
      const name = selectedAsset.uri.split("/").pop() || "photo.jpg";
      const type = getMimeType(selectedAsset.uri) || "image/jpeg";

      const file = {
        uri: selectedAsset.uri,
        name: name,
        type: type,
      } as any;

      if (file && token) {
        let response = await updatePhoto(
          data.id.toSttring(),
          file,
          `training/${data?.id}`,
          token
        );
        setData({ ...data, photo: response.url });
        setIsLoading(false);
        setMediaSelectorVisible(false);
      }
    }
    setMediaSelectorVisible(false);
    Toast.show({
      type: "success",
      text1: `✅ Imagem inserida com sucesso.`,
    });
  }

  function setDataName(string: string) {
    setData({
      ...data,
      name: string,
    });
  }

  function setDataState({ key, value }: { key: string; value: string }) {
    const x = data;
    switch (key) {
      case "description":
        setData({
          ...x,
          description: value,
        });
        break;
      case "level":
        setData({
          ...x,
          level: value,
        });
        break;
      case "url":
        setData({
          ...x,
          url: value,
        });
        break;
      case "photo":
        setData({
          ...x,
          photo: value,
        });
        break;

      default:
        break;
    }
  }

  async function handleEdit() {
    let x = true;
    if (data?.name && token) {
      setIsSaveLoading(true);
      const res = await EditTraining({
        id: data?.id,
        name: data?.name,
        description: data?.description || "",
        level: parseInt(data?.level) || 1,
        url: data?.url || "",
        photo: data?.photo || "",
        token,
      });

      if (res?.exercise || res?.training) {
        Toast.show({
          type: "success",
          text1: `✅ Treino salvo com sucesso...`,
        });
        setIsSingleInputOpen(false);
        setIsSaveLoading(false);
        x = true;
        return x;
      } else {
        Toast.show({
          type: "error",
          text1: `❌ Erro: ${res?.message}`,
        });
        setIsSingleInputOpen(false);
        setIsSaveLoading(false);
        return x;
      }
    }
  }

  function openBack() {
    setMediaType(2);
    setMediaSelectorVisible(true);
  }

  async function changeStep(e: number) {
    let save;

    if (e === 1) {
      save = await handleEdit();
      router.push("/(tabs)/training");
    } else {
      if (hasChanged) {
        if (!!save) {
          setHasChanged(false);
        }
        setStep(2);
      } else {
        setStep(2);
      }
    }
  }

  const stepOne = () => {
    return (
      <View style={[trainingStyles.listBox, { paddingHorizontal: 20 }]}>
        <MFSingleInputModal
          themeColors={themeColors}
          iconLabel={
            <FontAwesome6 name="dumbbell" size={14} color={themeColors.text} />
          }
          title="Alterar o nome do treino"
          inputLabel="Nome do treino"
          button1="SALVAR"
          button2="FECHAR"
          data={data?.name}
          onChange={setDataName}
          isOPen={isSingleInputOpen}
          isLoading={isSaveLoading}
          onPress={handleEdit}
          close={() => setIsSingleInputOpen(false)}
        ></MFSingleInputModal>
        <MFStackEditSubtitle
          themeColors={themeColors}
          title="Dados do treino"
          align="right"
          info="Aqui você pode editar seu treino."
        ></MFStackEditSubtitle>
        <View
          style={[
            trainingStyles.listBox,
            {
              alignItems: "flex-start",
            },
          ]}
        >
          <View style={{ height: 20 }}></View>
          <TouchableOpacity
            style={trainingStyles.title}
            onPress={() => setIsSingleInputOpen(true)}
          >
            <Text
              style={{
                fontWeight: 600,
                fontSize: 30,
                color: themeColors.text,
              }}
            >
              {data?.name}
            </Text>
            <View
              style={[
                trainingStyles.editIcon,
                {
                  backgroundColor: themeColors.secondary,
                  shadowColor: themeColors.text,
                },
              ]}
            >
              <Feather name="edit" size={12} color={themeColors.text} />
            </View>
          </TouchableOpacity>
          <View style={{ height: 20 }}></View>
          <ImageBackground
            source={{ uri: data?.photo }}
            style={[
              trainingStyles.top,
              globalStyles.flexc,
              {
                backgroundColor: themeColors.default,
                borderColor: themeColors.text,
                borderWidth: 4,
                borderRadius: 20,
              },
            ]}
            imageStyle={{
              resizeMode: "cover",
              width: "auto",
              height: "auto",
              alignSelf: "center",
              borderRadius: 16,
            }}
          >
            {!data?.photo && <Text>Nenhuma imagem</Text>}
            <TouchableOpacity
              onPress={openBack}
              style={[
                trainingStyles.imageEdit,
                { backgroundColor: "#fff", top: 5, right: 5 },
              ]}
            >
              <Feather name="edit" size={18} color="black" />
            </TouchableOpacity>
          </ImageBackground>
          <View
            style={{
              paddingVertical: 10,
              width: "100%",
              paddingHorizontal: 80,
            }}
          >
            <MFDefaulButton
              title={
                data?.photo || isLoading ? "Alterar imagem" : "Inserir imagem"
              }
              onPress={openBack}
              isLoading={isSaveLoading}
              isDisabled={isSaveLoading}
              themeColors={themeColors}
            ></MFDefaulButton>
          </View>
          <View
            style={[
              globalStyles.flexc,
              {
                paddingVertical: 10,
                alignItems: "flex-start",
                justifyContent: "flex-start",
                gap: 10,
                width: "100%",
              },
            ]}
          >
            <Text
              style={{
                fontSize: 16,
                color: themeColors.text,
                marginLeft: 15,
              }}
            >
              Dificuldade:{" "}
            </Text>
            <View
              style={[
                globalStyles.flexr,
                {
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 12,
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => setDataState({ key: "level", value: "1" })}
                style={[
                  globalStyles.flexr,
                  {
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    backgroundColor:
                      data?.level === "1"
                        ? themeColors.success
                        : themeColors.secondary,
                    borderColor:
                      data?.level === "1"
                        ? themeColors.success
                        : themeColors.text,
                    borderWidth: 1,
                    borderRadius: 8,
                    minWidth: 80,
                    transitionDelay: "1s",
                    transitionProperty: "ease",
                    transformOrigin: "all",
                    transitionDuration: "1s",
                    transform: data?.level === "1" ? [{ scale: 1.1 }] : [],
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: data?.level === "1" ? 18 : 16,
                    color:
                      data?.level === "1"
                        ? themeColors.white
                        : themeColors.text,
                  }}
                >
                  Fácil
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDataState({ key: "level", value: "2" })}
                style={[
                  globalStyles.flexr,
                  {
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    backgroundColor:
                      data?.level === "2"
                        ? themeColors.warning
                        : themeColors.secondary,
                    borderColor:
                      data?.level === "2"
                        ? themeColors.warning
                        : themeColors.text,
                    borderWidth: 1,
                    borderRadius: 8,
                    minWidth: 80,
                    transitionDelay: "1s",
                    transitionProperty: "ease",
                    transformOrigin: "all",
                    transitionDuration: "1s",
                    transform: data?.level === "2" ? [{ scale: 1.1 }] : [],
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: data?.level === "2" ? 18 : 16,
                    color:
                      data?.level === "2"
                        ? themeColors.white
                        : themeColors.text,
                  }}
                >
                  Mediano
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDataState({ key: "level", value: "3" })}
                style={[
                  globalStyles.flexr,
                  {
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    backgroundColor:
                      data?.level === "3"
                        ? themeColors.info
                        : themeColors.secondary,
                    borderColor:
                      data?.level === "3" ? themeColors.info : themeColors.text,
                    borderWidth: 1,
                    borderRadius: 8,
                    minWidth: 80,
                    transitionDelay: "1s",
                    transitionProperty: "ease",
                    transformOrigin: "all",
                    transitionDuration: "1s",
                    transform: data?.level === "3" ? [{ scale: 1.1 }] : [],
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: data?.level === "3" ? 18 : 16,
                    color:
                      data?.level === "3"
                        ? themeColors.white
                        : themeColors.text,
                  }}
                >
                  Difícil
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDataState({ key: "level", value: "4" })}
                style={[
                  globalStyles.flexr,
                  {
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    backgroundColor:
                      data?.level === "4"
                        ? themeColors.danger
                        : themeColors.secondary,
                    borderColor:
                      data?.level === "4"
                        ? themeColors.danger
                        : themeColors.text,
                    borderWidth: 1,
                    borderRadius: 8,
                    minWidth: 80,
                    transitionDelay: "1s",
                    transitionProperty: "ease",
                    transitionDuration: "1s",
                    transform: data?.level === "4" ? [{ scale: 1.1 }] : [],
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: data?.level === "4" ? 18 : 16,
                    color:
                      data?.level === "4"
                        ? themeColors.white
                        : themeColors.text,
                  }}
                >
                  Avançado
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ paddingTop: 10, paddingBottom: 20, width: "100%" }}>
              <MFLongTextInput
                label="Descrição do treino: "
                themeColors={themeColors}
                placeholder="Digite aqui"
                value={data?.description}
                onChangeText={(e) =>
                  setDataState({ key: "description", value: e })
                }
                error=""
              ></MFLongTextInput>
            </View>
          </View>
        </View>

        <View
          style={(globalStyles.flexc, { padding: 10, width: "100%", gap: 20 })}
        >
          <MFPrimaryButton
            title={!isSaveLoading ? "Exercícios" : "Salvando"}
            onPress={() => changeStep(2)}
            isLoading={isSaveLoading}
            isDisabled={isSaveLoading}
            themeColors={themeColors}
          ></MFPrimaryButton>
        </View>
      </View>
    );
  };

  const stepTwo = () => {
    return (
      <View style={[trainingStyles.listBox, { paddingHorizontal: 20 }]}>
        <MFStackEditSubtitle
          themeColors={themeColors}
          title="Exercícios"
          align="right"
          info="Abaixo você pode criar e editar exercicios do seu treino."
        ></MFStackEditSubtitle>
        <View style={{ height: 20 }}></View>
        <View
          style={[globalStyles.flexc, { padding: 20, width: "100%", gap: 20 }]}
        >
          {seriesList && seriesList.length > 0 ? (
            seriesList.map((e: any, y: number) => {
              return (
                <View key={y} style={{ width: "100%" }}>
                  <StepEditCard
                    data={e?.exercise}
                    themeColors={themeColors}
                    token={token}
                    isIncomplete={!e.interval || !e.exercise || !e.amount}
                    onPress={() => {
                      setSerieEdit(e);
                      setIsSerieModalOpen(true);
                    }}
                  ></StepEditCard>
                </View>
              );
            })
          ) : (
            <View style={(globalStyles.flexc, { paddingVertical: 10 })}>
              <Text style={{ fontSize: 17, color: themeColors.text }}>
                Cadastre uma divisão. Ex: Treino A, Inferiores...
              </Text>
            </View>
          )}
          {seriesList && seriesList.length > 0 && (
            <View style={{ height: 10 }}></View>
          )}
          <View
            style={[
              globalStyles.flexc,
              { width: "100%", paddingHorizontal: 20 },
            ]}
          >
            <TouchableOpacity
              style={{ width: "100%" }}
              onPress={() => {
                setSerieEdit([]);
                setIsSerieModalOpen(true);
              }}
            >
              <MFPlusCard themeColors={themeColors}>
                <AntDesign
                  name="pluscircleo"
                  size={24}
                  color={themeColors.themeGrey}
                />
              </MFPlusCard>
            </TouchableOpacity>
          </View>
          <View style={globalStyles.flexr}>
            <View style={{ width: "50%" }}>
              <MFPrimaryButton
                title={!isSaveLoading ? "Salvar" : "Salvando"}
                onPress={() => changeStep(1)}
                isLoading={isSaveLoading}
                isDisabled={isSaveLoading}
                themeColors={themeColors}
              ></MFPrimaryButton>
            </View>
          </View>
        </View>
      </View>
    );
  };

  function finishSave() {
    setIsSerieModalOpen(false);
    getUserData();
  }

  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    setHasChanged(true);
  }, [data, stepDescription]);

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: themeColors.background,
        position: "relative",
      }}
    >
      <MFCreateSerieModal
        isOPen={isSerieModalOpen}
        themeColors={themeColors}
        title={serieEdit ? `Editar Exercício` : "Criar Exercício"}
        close={() => setIsSerieModalOpen(false)}
        finish={finishSave}
        muscleGroups={muscleGroups}
        exercisesList={exercisesList}
        data={serieEdit}
        trainingId={data.id}
        token={token}
      ></MFCreateSerieModal>
      <MediaSelectorModal
        isLoading={isSaveLoading || isLoading}
        themeColors={themeColors}
        mediaSelectorVisible={mediaSelectorVisible}
        close={() => setMediaSelectorVisible(false)}
        openCamera={openCamera}
        pickImage={pickImage}
      />
      <MFStackHeader
        title={data?.name ? `${data?.name}` : "Treino"}
        isLoading={isLoading}
        titleBtn={!isSaveLoading ? "Salvar" : "Salvando"}
        // onPress={handleEdit}
      ></MFStackHeader>
      <View style={{ height: 30 }}></View>
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
      ) : step === 1 ? (
        stepOne()
      ) : step === 2 ? (
        stepTwo()
      ) : (
        <View></View>
      )}
    </ScrollView>
  );
}
