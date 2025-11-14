import { MFMyFriendRequestCard } from "@/components/my-fit-ui/cards";
import { MediaSelectorModal } from "@/components/my-fit-ui/modal";
import MFProfileDataCard from "@/components/my-fit-ui/profileDataInfo";
import MFProfileCard from "@/components/my-fit-ui/profileInfo";
import MFProfilePostsCard from "@/components/my-fit-ui/profilePostsInfo";
import MFStackEditSubtitle from "@/components/my-fit-ui/stackEditSubtitle";
import MFStackHeader from "@/components/my-fit-ui/stackHeader";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { User } from "@/model/user";
import { deletePost, getMyPosts, updatePost } from "@/service/posts";
import { acceptFriendRequest, getAllFriendRequests } from "@/service/relations";
import { getMyData, updateBackground, updatePhoto } from "@/service/user";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Keyboard, ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";

export default function ProfileScreen() {
  const { theme } = useTheme(),
    themeColors = Colors[`${theme}`];
  const appVersion = Constants.expoConfig?.version;
  const appName = Constants.expoConfig?.name;
  const [isLoading, setIsLoading] = useState<boolean>(false),
    [user, setUser] = useState<User>(),
    [posts, setPosts] = useState<any>(),
    [friendRequests, setFriendRequests] = useState<User>(),
    [mediaType, setMediaType] = useState<number>(),
    [mediaSelectorVisible, setMediaSelectorVisible] = useState<boolean>(false),
    [isCardVisible, setIsCardVisible] = useState(true),
    [isPostOpen, setIsPostOpen] = useState<boolean>(false),
    [token, setToken] = useState<string | null>(),
    [postStatus, setPostStatus] = useState<string>("1"),
    [postId, setPostId] = useState<number | null>(null),
    [title, setTitle] = useState<string | null>(null),
    [description, setDescription] = useState<string | null>(null),
    [image, setImage] = useState<any>(null),
    [imageUrl, setImageUrl] = useState<any>(null),
    [tempDel, setTempDel] = useState<number[]>([]),
    [isPostLoading, setIsPostLoading] = useState<boolean>(false),
    [isFrienfshipLoading, setIsFrienfshipLoading] = useState<boolean>(false),
    [unassignOpen, setUnassignOpen] = useState<boolean>(false);

  async function getUserData() {
    setIsLoading(true);
    try {
      const y = await SecureStore.getItemAsync("userId");
      const z = await SecureStore.getItemAsync("userToken");

      if (y && z) {
        const data: any = await getMyData({ token: z });
        const getPosts: any = await getMyPosts({ token: z });
        const friendData: any = await getAllFriendRequests({ token: z });

        setToken(z);

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

        if (!!friendData) {
          setFriendRequests(friendData);
        }

        if (!!getPosts) {
          setPosts(getPosts);
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erro ao recuperar usuário:", error);
      setIsLoading(false);
      return null;
    }
  }

  async function RequestNewFriend(id: number, type: number) {
    setIsFrienfshipLoading(true);
    let x;
    if (type === 1) {
      x = await acceptFriendRequest({
        token: token!,
        id,
        accept: true,
      });
    } else {
      x = await acceptFriendRequest({
        token: token!,
        id,
        accept: false,
      });
    }
    setTimeout(() => {
      setIsFrienfshipLoading(false);
    }, 1000);
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

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: mediaType === 1 ? [2, 2] : [5, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setIsLoading(true);
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
          response = await updatePhoto(
            file,
            `/client/${user?.id ? user?.id : "0"}`,
            token
          );
          const x = {
            ...user,
            client: {
              ...(user?.client || {}),
              photo: response.url || "",
            },
            type: user?.type ?? { id: 2, name: "" },
          };
          if (!!response && !!x) {
            Toast.show({
              type: "success",
              text1: `✅ Imagem inserida com sucesso.`,
            });
            setUser(x);
          }
        } else {
          response = await updateBackground(
            file,
            `/client/${user?.id ? user?.id : "0"}`,
            token
          );
          const x = {
            ...user,
            client: {
              ...(user?.client || {}),
              backgroundImage: response.url || "",
            },
            type: user?.type ?? { id: 2, name: "" },
          };
          if (!!response && !!x) {
            Toast.show({
              type: "success",
              text1: `✅ Imagem inserida com sucesso.`,
            });
            setUser(x);
          }
        }
        setIsLoading(false);
        setMediaSelectorVisible(false);
      }
    }
    setMediaSelectorVisible(false);
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
      aspect: mediaType === 1 ? [2, 2] : [5, 4],
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
          response = await updatePhoto(
            file,
            `/client/${user?.id ? user?.id : "0"}`,
            token
          );
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
          response = await updateBackground(
            file,
            `/client/${user?.id ? user?.id : "0"}`,
            token
          );
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

  async function pickPostImage() {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Você precisa permitir acesso à galeria!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 2],
      quality: 1,
    });

    if (!result.canceled) {
      setIsPostLoading(true);
      const selectedAsset = result.assets[0];
      const name = selectedAsset.uri.split("/").pop() || "photo.jpg";
      const type = getMimeType(selectedAsset.uri) || "image/jpeg";

      const file = {
        uri: selectedAsset.uri,
        name: name,
        type: type,
      } as any;

      if (file) {
        setImage(file);
        Keyboard.dismiss();
        setIsPostLoading(false);
      } else {
        Toast.show({
          type: "error",
          text1: `Erro ao carregar imagem.`,
        });
      }
      setIsPostLoading(false);
    }
  }

  async function openPostCamera() {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Você precisa permitir acesso à câmera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [2, 2],
      quality: 1,
    });

    if (!result.canceled) {
      setIsPostLoading(true);
      const selectedAsset = result.assets[0];
      const token = await SecureStore.getItemAsync("userToken");
      const name = selectedAsset.uri.split("/").pop() || "photo.jpg";
      const type = getMimeType(selectedAsset.uri) || "image/jpeg";

      const file = {
        uri: selectedAsset.uri,
        name: name,
        type: type,
      } as any;

      if (file) {
        setImage(file);
        Keyboard.dismiss();
        setIsPostLoading(false);
      } else {
        Toast.show({
          type: "error",
          text1: `Erro ao carregar imagem.`,
        });
      }
      setIsPostLoading(false);
    }
  }

  async function HandleEditPost() {
    if (
      !!postId &&
      !!postStatus &&
      !!token &&
      (!!title || !!description || !!image)
    ) {
      setIsPostLoading(true);
      const postPost = await updatePost({
        id: postId,
        token: token,
        title: title,
        description: description,
        image: image,
        postStatus: postStatus,
      });

      if (!!postPost.post) {
        setIsPostOpen(false);
        setImage(null);
        setTitle(null);
        setDescription(null);
        setPostId(null);
        getUserData();
        Toast.show({
          type: "success",
          text1: "Post alterado com sucesso.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Falha ao alterar postagem.",
        });
      }

      setIsPostLoading(false);
    }
  }

  async function deleteThisPost(id: number) {
    if (id && token) {
      setIsPostLoading(true);
      const x = await deletePost({
        id: id,
        token: token,
      });

      if (x?.status === 200) {
        setTempDel([...tempDel, id]);
        Toast.show({
          type: "success",
          text1: `✅ Post removido.`,
        });
      } else {
        Toast.show({
          type: "error",
          text1: `❌ Erro ao remover o post.`,
        });
      }
      setIsPostLoading(false);
      setUnassignOpen(false);
    }
  }

  function goToEditPost(data: any) {
    setPostId(data?.id);
    setTitle(data?.title ? data?.title : null);
    setDescription(data?.description ? data?.description : null);
    setImageUrl(data?.image ? data?.image : null);
    setPostStatus(data?.type ? data?.type : "1");

    setIsPostOpen(true);
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
      <MFStackHeader
        title="Usuário"
        isLoading={isLoading}
        // onPress={handleSubmit}
      ></MFStackHeader>
      <MediaSelectorModal
        isLoading={isLoading}
        themeColors={themeColors}
        mediaSelectorVisible={mediaSelectorVisible}
        close={() => setMediaSelectorVisible(false)}
        openCamera={openCamera}
        pickImage={pickImage}
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
        <ScrollView style={{ flex: 1 }}>
          <MFProfileCard
            isLoading={isLoading}
            themeColors={themeColors}
            photoOpen={openPhoto}
            backOpen={openBack}
            user={user}
          />
          <MFProfileDataCard
            isLoading={isLoading}
            themeColors={themeColors}
            photoOpen={openPhoto}
            backOpen={openBack}
            user={user}
          />
          <View
            style={{
              width: "75%",
              height: 1,
              backgroundColor: themeColors.text,
              marginHorizontal: 15,
            }}
          ></View>
          {friendRequests &&
            Array.isArray(friendRequests) &&
            friendRequests.length > 0 && (
              <View style={{ marginTop: 20 }}>
                <View style={{ paddingBottom: 20, paddingHorizontal: 15 }}>
                  <MFStackEditSubtitle
                    themeColors={themeColors}
                    title="Solicitações de amizade"
                  ></MFStackEditSubtitle>
                </View>
                {friendRequests.map((e: any) => (
                  <MFMyFriendRequestCard
                    key={e.id}
                    themeColors={themeColors}
                    data={e}
                    accept={() =>
                      RequestNewFriend(e.client_friendship_senderToclient.id, 1)
                    }
                    refuse={() =>
                      RequestNewFriend(e.client_friendship_senderToclient.id, 2)
                    }
                    isLoading={isFrienfshipLoading}
                  />
                ))}
              </View>
            )}
          <MFProfilePostsCard
            isLoading={isLoading}
            themeColors={themeColors}
            posts={posts}
            tempDel={tempDel}
            deleteThisPost={deleteThisPost}
            unassignOpen={unassignOpen}
            setUnassignOpen={setUnassignOpen}
            goToEditPost={goToEditPost}
            HandleSendPost={() => {}}
            HandleEditPost={HandleEditPost}
            title={title}
            setTitle={setTitle}
            postStatus={postStatus}
            setPostStatus={setPostStatus}
            description={description}
            setDescription={setDescription}
            pickImage={pickPostImage}
            openCamera={openPostCamera}
            image={image}
            imageUrl={imageUrl}
            postId={postId}
            isPostOpen={isPostOpen}
            setIsPostOpen={setIsPostOpen}
            setPostId={setPostId}
            isPostLoading={isPostLoading}
            noImage={() => {
              setImage(null);
              setImageUrl(null);
            }}
          ></MFProfilePostsCard>
        </ScrollView>
      )}
    </View>
  );
}
