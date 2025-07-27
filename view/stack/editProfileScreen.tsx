import {
  MFDateInputText2,
  MFLongTextInput,
  MFSelectInput,
  MFTextInput,
} from "@/components/my-fit-ui/inputs";
import MFStackEditSubtitle from "@/components/my-fit-ui/stackEditSubtitle";
import MFStackHeader from "@/components/my-fit-ui/stackHeader";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import {
  cellPhoneRegex,
  cpfFormat,
  cpfRegex,
  emailRegex,
  getErrorText,
  MFGenders,
  MFObjetives,
  phoneFormat,
} from "@/controllers/utils";
import { EditUserBody } from "@/model/user";
import { getMyData, update } from "@/service/user";
import { profileStyles } from "@/styles/profile";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function EditProfileScreen() {
  const { theme } = useTheme(),
    themeColors = Colors[`${theme}`],
    router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false),
    [isSaveLoading, setIsSaveLoading] = useState<boolean>(false),
    [errors, setErrors] = useState<string[]>([]),
    [name, setName] = useState<string>(),
    [email, setEmail] = useState<string>(),
    [description, setDescription] = useState<string>(),
    [document, setDocument] = useState<string>(),
    [nick, setNick] = useState<string>(),
    [phone, setPhone] = useState<string>(),
    [objective, setObjective] = useState<string>(),
    [gender, setGender] = useState<string>(),
    [birthDate, setBirthDate] = useState<string>(),
    [instagram, setInstagram] = useState<string>(),
    [user, setUser] = useState<{ id: number; type: number }>();

  async function getUserData() {
    setIsLoading(true);
    try {
      const y = await SecureStore.getItemAsync("userId");
      const z = await SecureStore.getItemAsync("userToken");

      if (y && z) {
        const data: any = await getMyData({ token: z });

        if (!!data) {
          setName(data?.user?.client?.name);
          setEmail(data?.user?.email);
          setDescription(data?.user?.client?.description);
          setNick(data?.user?.client?.nick);
          setPhone(
            data?.user?.client?.phone
              ? phoneFormat(data?.user?.client?.phone)
              : ""
          );
          setObjective(data?.user?.client?.objective);
          setInstagram(data?.user?.client?.instagram);
          setGender((data?.user?.client?.gender).toString());
          setDocument(
            data?.user?.client?.document
              ? cpfFormat(data?.user?.client?.document)
              : ""
          );
          setBirthDate(data?.user?.client?.birthDate);
          setUser({
            id: data?.user?.id,
            type: data?.typeId,
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

  function errorCheck() {
    let updatedErrors = [];

    if (name && name.length < 3) {
      updatedErrors.push("name");
    }
    if (email && email.length > 0) {
      if (!emailRegex.test(email)) {
        updatedErrors.push("email");
      }
    }

    if (document && document.length > 0) {
      if (!cpfRegex.test(document)) {
        updatedErrors.push("document");
      }
    }
    // if (cnpj && cnpj.length > 0) {
    //   const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    //   if (!cnpjRegex.test(cnpj)) {
    //     updatedErrors.push("cnpj");
    //   }
    // }

    if (phone && phone.length > 0) {
      if (!cellPhoneRegex.test(phone)) {
        updatedErrors.push("phone");
      }
    }

    setErrors(updatedErrors);
  }

  async function handleSubmit() {
    const x: EditUserBody = {
      name: name,
      description: description,
      nick: nick,
      objective: objective,
      phone: phone?.replace(/\D/g, ""),
      instagram: instagram,
      gender: parseInt(gender!),
      birthDate: birthDate,
      document: document?.replace(/\D/g, ""),
    };

    setIsSaveLoading(true);
    try {
      const z = await SecureStore.getItemAsync("userToken");

      if (z) {
        const data: any = await update(x, z);

        if (
          !!data &&
          data.message === "Usuário e cliente editados com sucesso"
        ) {
          Toast.show({
            type: "success",
            text1: `✅ Usuário salvo com sucesso.`,
          });

          setIsSaveLoading(false);
          router.replace("/(stack)/profile/page");
        } else {
          Toast.show({
            type: "error",
            text1: `❌ Erro: ${data?.message}`,
          });
        }
        setIsSaveLoading(false);
      }
    } catch (error) {
      console.error("Erro ao recuperar usuário:", error);
      setIsLoading(false);
      return null;
    }
  }

  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    errorCheck();
  }, [name, document, phone]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: themeColors.background,
        }}
      >
        <MFStackHeader
          title="Editar dados"
          isLoading={isSaveLoading}
          onPress={handleSubmit}
        ></MFStackHeader>
        {isLoading ? (
          <View
            style={{
              height: "100%",
              minHeight: 500,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size={40} color={themeColors.primary} />
          </View>
        ) : (
          <View style={profileStyles.profileEditBox}>
            <MFStackEditSubtitle
              themeColors={themeColors}
              title="My Fit Club"
              align="right"
              info="Dados pertinentes ao app."
            ></MFStackEditSubtitle>
            <MFSelectInput
              label="Objetivo atual"
              labelIcon={
                <FontAwesome6
                  name="dumbbell"
                  size={16}
                  color={themeColors.text}
                />
              }
              selectedValue={objective || "0"}
              onValueChange={setObjective}
              options={[{ label: "-", value: "-" }, ...MFObjetives]}
              themeColors={Colors[theme]}
              isDisabled={false}
              error={
                !objective || objective === "-"
                  ? "Preencha o seu objetivo."
                  : ""
              }
            />
            <View style={{ height: 50 }}></View>
            <MFStackEditSubtitle
              themeColors={themeColors}
              title="Dados pessoais"
              align="right"
              info="Dados pessoais para funcionalidades exclusivas de relacionamento entre clientes."
            ></MFStackEditSubtitle>
            <MFTextInput
              label="Nome: "
              labelIcon={
                <FontAwesome name="user" size={16} color={themeColors.text} />
              }
              themeColors={themeColors}
              placeholder="Digite o nome"
              value={name}
              onChangeText={setName}
              error={
                name && name.length > 0
                  ? errors.includes("name")
                    ? getErrorText("name")
                    : ""
                  : "Preencha com um nome"
              }
            ></MFTextInput>
            <MFTextInput
              isNumeric={true}
              label="CPF: "
              labelIcon={
                <Ionicons
                  name="document-lock"
                  size={16}
                  color={themeColors.text}
                />
              }
              themeColors={themeColors}
              placeholder="Digite o nome"
              value={document}
              onChangeText={(text: string) => {
                if (text) {
                  setDocument(cpfFormat(text.toString()));
                } else {
                  setDocument("");
                }
              }}
              error={
                document && document.length > 0
                  ? errors.includes("document")
                    ? getErrorText("document")
                    : ""
                  : "Preencha com um documento válido"
              }
            ></MFTextInput>
            <MFTextInput
              label="Apelido: "
              labelIcon={
                <FontAwesome
                  name="user-secret"
                  size={16}
                  color={themeColors.text}
                />
              }
              themeColors={themeColors}
              placeholder="Digite o apelido"
              value={nick}
              onChangeText={setNick}
              error={nick && nick.length > 0 ? "" : "Preencha com um apelido."}
            ></MFTextInput>
            <MFSelectInput
              label="Gênero"
              labelIcon={
                <FontAwesome5
                  name="transgender"
                  size={16}
                  color={themeColors.text}
                />
              }
              selectedValue={gender || "0"}
              onValueChange={setGender}
              options={[{ label: "-", value: "-" }, ...MFGenders]}
              themeColors={Colors[theme]}
              isDisabled={false}
              error={!gender || gender === "-" ? "Preencha o seu gênero." : ""}
            />
            <MFDateInputText2
              label="Data de Nascimento"
              labelIcon={
                <FontAwesome
                  name="birthday-cake"
                  size={16}
                  color={themeColors.text}
                />
              }
              value={birthDate || ""}
              onChange={setBirthDate}
              error={birthDate ? "" : "Preencha com a Data de Nascimento."}
              themeColors={themeColors}
            />
            <MFLongTextInput
              label="Sobre mim: "
              labelIcon={
                <FontAwesome
                  name="paragraph"
                  size={16}
                  color={themeColors.text}
                />
              }
              themeColors={themeColors}
              placeholder="Digite aqui"
              value={description}
              onChangeText={setDescription}
              error={description ? "" : "Escreva um pouco sobre você."}
            ></MFLongTextInput>
            <View style={{ height: 50 }}></View>
            <MFStackEditSubtitle
              themeColors={themeColors}
              title="Dados de contato"
              align="right"
              info="Dados de contato, para diversas interações."
            ></MFStackEditSubtitle>
            <MFTextInput
              isDisabled={true}
              label="E-mail: "
              labelIcon={
                <MaterialIcons
                  name="email"
                  size={16}
                  color={themeColors.text}
                />
              }
              themeColors={themeColors}
              placeholder="Digite o e-mail"
              value={email}
            ></MFTextInput>
            <MFTextInput
              label="Whatsapp: "
              isNumeric={true}
              labelIcon={
                <FontAwesome5
                  name="whatsapp-square"
                  size={16}
                  color={themeColors.text}
                />
              }
              themeColors={themeColors}
              placeholder="Digite o whatsapp"
              value={phone}
              onChangeText={(text: string) => {
                if (text) {
                  setPhone(phoneFormat(text.toString()));
                } else {
                  setPhone("");
                }
              }}
              error={
                phone && phone.length > 0
                  ? errors.includes("phone")
                    ? getErrorText("phone")
                    : ""
                  : "Preencha com o Whatsapp."
              }
            ></MFTextInput>
            <MFTextInput
              label="Instagram: "
              labelIcon={
                <Entypo
                  name="instagram-with-circle"
                  size={16}
                  color={themeColors.text}
                />
              }
              themeColors={themeColors}
              placeholder="Digite o e-mail"
              value={instagram}
              onChangeText={setInstagram}
              error={instagram ? "" : "Preencha com o Instagram."}
            ></MFTextInput>
            <View style={{ height: 50 }}></View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
