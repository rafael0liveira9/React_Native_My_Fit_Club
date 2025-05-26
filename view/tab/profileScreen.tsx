import { MediaSelectorModal } from "@/components/my-fit-ui/modal";
import MFProfileDataCard from "@/components/my-fit-ui/profileDataInfo";
import MFProfileCard from "@/components/my-fit-ui/profileInfo";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { User } from "@/model/user";
import { getMyData, updateBackground, updatePhoto } from "@/service/user";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import Toast from "react-native-toast-message";

export default function ProfileScreen() {
  const { theme } = useTheme(),
    themeColors = Colors[`${theme}`];
  const appVersion = Constants.expoConfig?.version;
  const appName = Constants.expoConfig?.name;
  const [isLoading, setIsLoading] = useState<boolean>(false),
    [user, setUser] = useState<User>(),
    [mediaType, setMediaType] = useState<number>(),
    [mediaSelectorVisible, setMediaSelectorVisible] = useState<boolean>(false),
    [editModalVisible, setEditModalVisible] = useState<boolean>(false);

  async function getUserData() {
    setIsLoading(true);
    try {
      const y = await SecureStore.getItemAsync("userId");
      const z = await SecureStore.getItemAsync("userToken");

      if (y && z) {
        const data: any = await getMyData({ token: z });

        if (!!data) {
          setUser({
            id: data?.user?.id,
            type: data?.typeId,
            email: data?.user?.email,
            client: {
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
        let response;
        if (mediaType === 1) {
          response = await updatePhoto(file, "fake-club", token);
          const x = {
            ...user,
            client: {
              ...(user?.client || {}),
              photo: response.url || "",
            },
            type: user?.type ?? { id: 2, name: "" },
          };
          setUser(x);
        } else {
          response = await updateBackground(file, "fake-club", token);
          const x = {
            ...user,
            client: {
              ...(user?.client || {}),
              backgroundImage: response.url || "",
            },
            type: user?.type ?? { id: 2, name: "" },
          };
          setUser(x);
        }
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
        let response;
        if (mediaType === 1) {
          response = await updatePhoto(file, "fake-club", token);
          const x = {
            ...user,
            client: {
              ...(user?.client || {}),
              photo: response.url || "",
            },
            type: user?.type ?? { id: 2, name: "" },
          };
          setUser(x);
        } else {
          response = await updateBackground(file, "fake-club", token);
          const x = {
            ...user,
            client: {
              ...(user?.client || {}),
              backgroundImage: response.url || "",
            },
            type: user?.type ?? { id: 2, name: "" },
          };
          setUser(x);
        }
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

  function openPhoto() {
    setMediaType(1);
    setMediaSelectorVisible(true);
  }
  function openBack() {
    setMediaType(2);
    setMediaSelectorVisible(true);
  }

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: themeColors.background,
      }}
    >
      <MediaSelectorModal
        isLoading={isLoading}
        themeColors={themeColors}
        mediaSelectorVisible={mediaSelectorVisible}
        close={() => setMediaSelectorVisible(false)}
        openCamera={openCamera}
        pickImage={pickImage}
      />
      <MFProfileCard
        isLoading={isLoading}
        themeColors={themeColors}
        photoOpen={openPhoto}
        backOpen={openBack}
        user={user}
      />
      {isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size={40} color={themeColors.primary} />
        </View>
      ) : (
        <MFProfileDataCard
          isLoading={isLoading}
          themeColors={themeColors}
          photoOpen={openPhoto}
          backOpen={openBack}
          user={user}
        />
      )}
    </View>
  );
}
