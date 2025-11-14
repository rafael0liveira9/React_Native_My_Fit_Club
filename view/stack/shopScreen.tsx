import { MFShopTrainingCard } from "@/components/my-fit-ui/cards";
import MFFilterSortBox from "@/components/my-fit-ui/filterBox";
import { FloatingContinueTrainingButtonWrapper } from "@/components/my-fit-ui/floatingButton";
import { MFSingleInputModal } from "@/components/my-fit-ui/modal";
import { ProductSkeleton } from "@/components/my-fit-ui/skeleton";
import MFStackEditSubtitle from "@/components/my-fit-ui/stackEditSubtitle";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { CreateTraining, getShop } from "@/service/training";
import { globalStyles } from "@/styles/global";
import { trainingStyles } from "@/styles/training";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

export default function ShopScreen() {
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
    [shopPackages, setShopPackages] = useState<any>([]),
    [shopTrainings, setShopTrainings] = useState<any>([]),
    [page, setPage] = useState<number>(1);

  async function getUserData() {
    setIsLoading(true);
    try {
      const z = await SecureStore.getItemAsync("userToken");

      if (z) {
        const x = await getShop({ token: z });
        setShopTrainings(x);
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
      {/* <MFStackHeader
        title="Treinos"
        isLoading={isSaveLoading}
        titleBtn="Criar novo"
        onPress={() => setIsNewOPen(true)}
      ></MFStackHeader> */}
      <MFFilterSortBox
        themeColors={themeColors}
        search={search}
        setSearch={setSearch}
        isLoading={isLoading}
        placeholder="Buscar treino"
        onPress={async () => {
          setIsLoading(true);
          try {
            if (token) {
              const x = await getShop({ token, search });
              setShopTrainings(x);
            }
          } catch (error) {
            console.error("Erro na busca:", error);
          } finally {
            setIsLoading(false);
          }
        }}
      ></MFFilterSortBox>
      <View style={trainingStyles.listBox}>
        <MFStackEditSubtitle
          themeColors={themeColors}
          title="Adquirir treino"
          align="left"
          info="Lista de treinos que estão disponiveis para você atribuir ao seu treinamento."
        ></MFStackEditSubtitle>
        <View style={{ height: 20 }}></View>

        {/* Tabs Modernizadas */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: themeColors.backgroundSecondary,
            borderRadius: 12,
            padding: 4,
            marginBottom: 20,
          }}
        >
          <TouchableOpacity
            onPress={() => setStep(1)}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 10,
              backgroundColor:
                step === 1 ? themeColors.primary : "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <Text
              style={{
                color: step === 1 ? themeColors.white : themeColors.text,
                fontSize: 15,
                fontWeight: step === 1 ? "700" : "500",
              }}
            >
              Treinos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setStep(2)}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 10,
              backgroundColor:
                step === 2 ? themeColors.primary : "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <Text
              style={{
                color: step === 2 ? themeColors.white : themeColors.text,
                fontSize: 15,
                fontWeight: step === 2 ? "700" : "500",
              }}
            >
              Pacotes
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 10,
            paddingBottom: 100,
          }}
        >
          {isLoading ? (
            <>
              <ProductSkeleton themeColors={themeColors} />
              <ProductSkeleton themeColors={themeColors} />
              <ProductSkeleton themeColors={themeColors} />
              <ProductSkeleton themeColors={themeColors} />
              <ProductSkeleton themeColors={themeColors} />
              <ProductSkeleton themeColors={themeColors} />
            </>
          ) : step === 1 &&
            shopTrainings &&
            Array.isArray(shopTrainings) &&
            shopTrainings.length > 0 ? (
            shopTrainings.map((e: any) => {
              return (
                <MFShopTrainingCard
                  key={e.id}
                  data={e}
                  themeColors={themeColors}
                  onPress={() =>
                    router.push(`/(stack)/shop/${"training"}/${e.id}`)
                  }
                ></MFShopTrainingCard>
              );
            })
          ) : (
            <View style={{ width: "100%", alignItems: "center", paddingTop: 40 }}>
              <Text style={{ fontSize: 20, color: themeColors.text }}>
                Nenhum treino encontrado 😢
              </Text>
            </View>
          )}
        </View>
      </View>
      <FloatingContinueTrainingButtonWrapper themeColors={themeColors} />
    </ScrollView>
  );
}
