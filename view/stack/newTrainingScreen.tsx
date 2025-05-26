import { MFTrainingCard } from "@/components/my-fit-ui/cards";
import MFFilterSortBox from "@/components/my-fit-ui/filterBox";
import { MFSingleInputModal } from "@/components/my-fit-ui/modal";
import MFStackEditSubtitle from "@/components/my-fit-ui/stackEditSubtitle";
import MFStackHeader from "@/components/my-fit-ui/stackHeader";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { CreateTraining, getTrainingsByToken } from "@/service/training";
import { globalStyles } from "@/styles/global";
import { trainingStyles } from "@/styles/training";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function NewTrainingScreen() {
  const { theme } = useTheme(),
    themeColors = Colors[`${theme}`],
    router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false),
    [isSaveLoading, setIsSaveLoading] = useState<boolean>(false),
    [isNewOPen, setIsNewOPen] = useState<boolean>(false),
    [token, setToken] = useState<any>([]),
    [name, setName] = useState<any>([]),
    [search, setSearch] = useState<string>(""),
    [sort, setSort] = useState<string>(""),
    [step, setStep] = useState<any>(1),
    [data, setData] = useState<any>([]),
    [page, setPage] = useState<number>(1);

  async function getUserData() {
    setIsLoading(true);
    try {
      const z = await SecureStore.getItemAsync("userToken");

      if (z) {
        const x = await getTrainingsByToken({ token: z });
        setData(x);
        setToken(z);
      } else {
        console.log("Nenhum usuário para recuperar");
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao recuperar usuário:", error);
      setIsLoading(false);
      return null;
    }
  }

  const sortOptions = [
    {
      label: "Recentes",
      value: "0",
      icon: <MaterialIcons name="autorenew" size={18} color="black" />,
    },
    {
      label: "Grátis",
      value: "1",
      icon: <MaterialIcons name="attach-money" size={21} color="black" />,
    },
    {
      label: "Avaliação",
      value: "2",
      icon: <AntDesign name="staro" size={17} color="black" />,
    },
    {
      label: "Maior preço",
      value: "3",
      icon: <AntDesign name="down" size={18} color="black" />,
    },
    {
      label: "Menor preço",
      value: "4",
      icon: <AntDesign name="up" size={18} color="black" />,
    },
  ];

  async function handleNewTraining() {
    if (name && token) {
      setIsLoading(true);
      const res = await CreateTraining({
        name: name,
        description: "",
        level: 1,
        url: "",
        photo: "",
        token: token,
      });

      if (res?.newAssignment?.id) {
        Toast.show({
          type: "success",
          text1: `✅ Treino criado com sucesso...`,
        });
        router.push(`/training/${(res?.newAssignment?.id).toString()}`);
      } else {
        Toast.show({
          type: "error",
          text1: `❌ Erro: ${res?.message}`,
        });
        setIsNewOPen(false);
      }
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getUserData();
  }, []);

  // console.log(data);
  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: themeColors.background,
        position: "relative",
      }}
    >
      <MFSingleInputModal
        themeColors={themeColors}
        iconLabel={
          <FontAwesome6 name="dumbbell" size={14} color={themeColors.text} />
        }
        title="Criando novo treino"
        inputLabel="Nome do treino"
        button1="ENVIAR"
        button2="FECHAR"
        data={name}
        onChange={setName}
        isOPen={isNewOPen}
        isLoading={isLoading}
        onPress={handleNewTraining}
        close={() => setIsNewOPen(false)}
      ></MFSingleInputModal>
      <MFStackHeader
        title="Treinos"
        isLoading={isSaveLoading}
        titleBtn="Criar novo"
        onPress={() => setIsNewOPen(true)}
      ></MFStackHeader>
      <MFFilterSortBox
        themeColors={themeColors}
        search={search}
        sort={sort}
        setSearch={setSearch}
        setSort={setSort}
        sortOptions={sortOptions}
      ></MFFilterSortBox>
      <View style={trainingStyles.listBox}>
        <MFStackEditSubtitle
          themeColors={themeColors}
          title="Treinos disponíveis"
          align="left"
        ></MFStackEditSubtitle>
        <View style={{ height: 20 }}></View>
        <View
          style={[
            globalStyles.flexr,
            trainingStyles.trainingTabsBox,
            { borderColor: themeColors.themeGrey },
          ]}
        >
          <TouchableOpacity
            onPress={() => setStep(1)}
            style={[
              trainingStyles.trainingTab,
              {
                backgroundColor:
                  step === 1 ? themeColors.primary : themeColors.grey,
              },
            ]}
          >
            <Text
              style={{
                color: step === 1 ? themeColors.white : themeColors.text,
              }}
            >
              Loja
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setStep(2)}
            style={[
              trainingStyles.trainingTab,
              {
                backgroundColor:
                  step === 2 ? themeColors.primary : themeColors.grey,
              },
            ]}
          >
            <Text
              style={{
                color: step === 2 ? themeColors.white : themeColors.text,
              }}
            >
              Meus treinos
            </Text>
          </TouchableOpacity>
        </View>
        {isLoading ? (
          <ActivityIndicator size={40} color={themeColors.text} />
        ) : !(Array.isArray(data) && data.length > 0) ? (
          <Text style={{ fontSize: 20, color: themeColors.text }}>
            Nenhum item encontrado 😢
          </Text>
        ) : (
          <View
            style={[
              globalStyles.flexc,
              { width: "100%", gap: 30, paddingHorizontal: 20 },
            ]}
          >
            {step === 1 && (
              <Text style={{ fontSize: 20, color: themeColors.text }}>
                Nenhum item encontrado 😢
              </Text>
            )}
            {step === 2 &&
              data &&
              data?.map((e: any, y: number) => {
                return (
                  <TouchableOpacity
                    style={{ width: "100%" }}
                    onPress={() =>
                      router.push(`/training/${(e?.id).toString()}`)
                    }
                    key={y}
                  >
                    <MFTrainingCard
                      themeColors={themeColors}
                      data={e}
                    ></MFTrainingCard>
                  </TouchableOpacity>
                );
              })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
