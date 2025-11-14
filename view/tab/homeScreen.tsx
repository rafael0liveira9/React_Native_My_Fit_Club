import { MFPrimaryButton } from "@/components/my-fit-ui/buttons";
import {
  MFAdmimPostCard,
  MFCreatePostCard,
  MFMyPostCard,
  MFPostCard,
  MFPubliCard,
  MFTrainingExecutionCard,
} from "@/components/my-fit-ui/cards";
import { FloatingContinueTrainingButtonWrapper } from "@/components/my-fit-ui/floatingButton";
import { MFLogoutModal } from "@/components/my-fit-ui/modal";
import { PostSkeleton, TrainingSkeleton } from "@/components/my-fit-ui/skeleton";
import MFStackEditSubtitle from "@/components/my-fit-ui/stackEditSubtitle";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { deletePost, getAllPosts, newPost, updatePost } from "@/service/posts";
import {
  acceptFriendRequest,
  getAllMyFriends,
  newFriendRequest,
} from "@/service/relations";
import {
  GetLastExecution,
  getTrainingsByToken,
  TrainingExecute,
} from "@/service/training";
import { getMyData } from "@/service/user";
import { globalStyles } from "@/styles/global";
import { trainingStyles } from "@/styles/training";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  findNodeHandle,
  Image,
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

import Carousel from "react-native-reanimated-carousel";
import Toast from "react-native-toast-message";

export default function HomeScren() {
  const scrollRef = useRef<ScrollView>(null);
  const targetRef = useRef<View>(null);

  const width = Dimensions.get("window").width;
  const { theme } = useTheme(),
    createPostAnim = useRef(new Animated.Value(1)).current,
    themeColors = Colors[`${theme}`],
    router = useRouter(),
    [lastExecution, setLasExecution] = useState<any>(null),
    [isPostOpen, setIsPostOpen] = useState<boolean>(false),
    [token, setToken] = useState<string | null>(),
    [user, setUser] = useState<any>(),
    [postStatus, setPostStatus] = useState<string>("1"),
    [posts, setPosts] = useState<string | null>(),
    [myFriends, setMyFriends] = useState<any>(),
    [postId, setPostId] = useState<number | null>(null),
    [title, setTitle] = useState<string | null>(null),
    [description, setDescription] = useState<string | null>(null),
    [image, setImage] = useState<any>(null),
    [imageUrl, setImageUrl] = useState<any>(null),
    [modalType, setModalType] = useState<number>(1),
    [tempDel, setTempDel] = useState<number[]>([]),
    [confirmodalOpen, setConfirmodalOpen] = useState<boolean>(false),
    [isPostLoading, setIsPostLoading] = useState<boolean>(false),
    [refreshing, setRefreshing] = useState(false),
    [executionItem, setExecutionItem] = useState<any | null>(null),
    [isLoading, setIsLoading] = useState<boolean>(false),
    [unassignOpen, setUnassignOpen] = useState<boolean>(false),
    [actualId, setActualId] = useState<number | null>(null),
    [assign, setAssign] = useState<any>();
  const [showScrollButton, setShowScrollButton] = useState(false);

  const PAGE_WIDTH = width * 0.8;
  const OFFSET = (width - PAGE_WIDTH) / 2;

  const notTrainedMessages = [
    "Você ainda não treinou hoje, então... Bora?",
    "Seu corpo merece esse cuidado. Que tal treinar agora?",
    "Bora fazer o dia valer a pena com um treino top?",
    "Ainda dá tempo de suar a camisa hoje! Vai lá!",
    "Lembre-se: consistência constrói resultados. Vamos nessa?",
    "O treino de hoje é o resultado de amanhã. Vamos começar?",
    "Você nunca vai se arrepender de um treino feito!",
    "Mexa-se! Sua saúde agradece!",
    "Seu futuro eu agradece o esforço de hoje. Vai com tudo!",
    "A melhor hora para começar é agora. Bora pro treino!",
  ];

  const trainedMessages = [
    "Treino concluído, você já deu o seu 1% de hoje, é isso!",
    "Parabéns por se priorizar hoje! 👏",
    "Você venceu a preguiça e cuidou de si, boa!",
    "Disciplina feita! Mais um passo rumo ao seu objetivo!",
    "É sobre o esforço de hoje que o futuro vai agradecer.",
    "Você brilhou no treino de hoje. Continue assim!",
    "Constância é tudo, e você entregou!",
    "Agora é recuperar e se preparar pro próximo. Missão cumprida!",
    "Cada treino conta, e hoje foi mais um. Você é foda!",
    "Orgulhe-se: você fez o que precisava ser feito.",
  ];

  function getRandomMessage(messages: string[]): string {
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowScrollButton(scrollY > 300);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    try {
      const y = await SecureStore.getItemAsync("userId");
      const z = await SecureStore.getItemAsync("userToken");

      setToken(z);

      if (y && z) {
        const data: any = await getAllPosts({ token: z });
        const MyData: any = await getMyData({ token: z });

        if (!!MyData) {
          setUser({
            id: MyData?.user?.id,
            type: MyData?.typeId,
            email: MyData?.user?.email,
            client: {
              id: MyData?.user?.client?.id,
              document: MyData?.user?.client?.document,
              cref: MyData?.user?.client?.cref,
              name: MyData?.user?.client?.name,
              nick: MyData?.user?.client?.nick,
              description: MyData?.user?.client?.description,
              phone: MyData?.user?.client?.phone,
              photo: MyData?.user?.client?.photo,
              backgroundImage: MyData?.user?.client?.backgroundImage,
              objective: MyData?.user?.client?.objective,
              instagram: MyData?.user?.client?.instagram,
              gender: MyData?.user?.client?.gender,
              birthDate: MyData?.user?.client?.birthDate,
            },
          });
        } else {
          console.log("Nenhum usuário para recuperar");
        }

        if (!!data) {
          setPosts(data);
        } else {
          console.log("Nenhum post para recuperar");
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erro ao recuperar usuário:", error);
      setIsLoading(false);
      return null;
    }
    setRefreshing(false);
  };

  async function getData() {
    setIsLoading(true);

    try {
      const y = await SecureStore.getItemAsync("userId");
      const z = await SecureStore.getItemAsync("userToken");

      const myTrainings = await getTrainingsByToken({ token: z! });
      const myLastExecution = await GetLastExecution({ token: z! });

      setToken(z);
      setExecutionItem(null);
      setLasExecution(myLastExecution?.data);

      if (y && z) {
        const data: any = await getAllPosts({ token: z });
        const MyData: any = await getMyData({ token: z });
        const friends: any = await getAllMyFriends({ token: z });

        if (!!friends) {
          let xx = friends.friends.map((e: any) => {
            if (!!e.sender || !!e.friend) {
              if (MyData?.user?.client?.id !== e.sender) {
                return e.sender;
              }
              if (MyData?.user?.client?.id !== e.friend) {
                return e.friend;
              }
            }
          });
          let yy = friends.requests.map((e: any) => {
            if (!!e.friend) {
              if (MyData?.user?.client?.id !== e.friend) {
                return e.friend;
              }
            }
          });
          let zz = friends.receives.map((e: any) => {
            if (!!e.sender) {
              if (MyData?.user?.client?.id !== e.sender) {
                return e.sender;
              }
            }
          });

          setMyFriends({ friends: xx, requests: yy, receives: zz });
        }

        if (!!MyData) {
          setUser({
            id: MyData?.user?.id,
            type: MyData?.typeId,
            email: MyData?.user?.email,
            client: {
              id: MyData?.user?.client?.id,
              document: MyData?.user?.client?.document,
              cref: MyData?.user?.client?.cref,
              name: MyData?.user?.client?.name,
              nick: MyData?.user?.client?.nick,
              description: MyData?.user?.client?.description,
              phone: MyData?.user?.client?.phone,
              photo: MyData?.user?.client?.photo,
              backgroundImage: MyData?.user?.client?.backgroundImage,
              objective: MyData?.user?.client?.objective,
              instagram: MyData?.user?.client?.instagram,
              gender: MyData?.user?.client?.gender,
              birthDate: MyData?.user?.client?.birthDate,
            },
          });
          if (!!myTrainings) {
            const y = [...(myTrainings || [])].filter(
              (e) =>
                !!e.training?.trainingExecution[0]?.startAt &&
                !e.training?.trainingExecution[0]?.endAt
            );
            if (!!y && y.length > 0) {
              setExecutionItem(y[0]?.id);
            }
            setAssign(myTrainings);
          }
        } else {
          console.log("Nenhum usuário para recuperar");
        }

        if (!!data) {
          setPosts(data);
        } else {
          console.log("Nenhum post para recuperar");
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

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
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

  async function openCamera() {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Você precisa permitir acesso à câmera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
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

  const publi = [
    {
      id: 1,
      image: require("@/assets/images/my-fit/anuncio-test.png"),
      url: "https://wa.me/5541992730204?text=Ol%C3%A1%2C%20quero%20anunciar",
    },
  ];

  async function HandleSendPost() {
    if (!!postStatus && !!token && (!!title || !!description || !!image)) {
      setIsPostLoading(true);
      const postPost = await newPost({
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
        getData();
        Toast.show({
          type: "success",
          text1: "Post criado com sucesso.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Falha ao criar postagem.",
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
        getData();
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
          text1: `✅ Treino removido.`,
        });
      } else {
        Toast.show({
          type: "error",
          text1: `❌ Erro ao remover o treino.`,
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

  function GoToExecution(id: number) {
    if (id) router.push(`/execution/${id.toString()}`);
    setConfirmodalOpen(false);
  }

  function OpenModal(id: number, type: number) {
    if (id) {
      setActualId(id);
      setConfirmodalOpen(true);
    }
  }

  async function CreateAndGoToExecution() {
    if (actualId && token) {
      setIsLoading(true);
      const x = await TrainingExecute({
        trainingId: +actualId,
        token: token,
      });

      setIsLoading(false);
      setConfirmodalOpen(false);

      if (x?.status === 200 && x.data?.execution?.id) {
        Toast.show({
          type: "success",
          text1: `✅ Treino iniciado.`,
        });
        router.push(`/execution/${x.data?.execution?.id.toString()}`);
      } else {
        Toast.show({
          type: "error",
          text1: `❌ Erro ao iniciar o treino.`,
        });
      }
    }
  }

  async function addFriendFunction({
    friendStatus,
    id,
  }: {
    friendStatus: number;
    id: number;
  }) {
    switch (friendStatus) {
      case 1:
        await newFriendRequest({ id: id, token: token! });
        break;

      case 3:
        await acceptFriendRequest({ id: id, token: token!, accept: false });
        break;

      case 4:
        await acceptFriendRequest({ id: id, token: token!, accept: true });
        break;

      default:
        break;
    }
  }

  const scrollToSubtitle = () => {
    const targetHandle = findNodeHandle(targetRef.current);
    const scrollHandle = findNodeHandle(scrollRef.current);

    if (targetHandle != null && scrollHandle != null) {
      UIManager.measureLayout(
        targetHandle,
        scrollHandle,
        () => {
          console.warn("Erro ao medir layout.");
        },
        (x, y) => {
          scrollRef.current?.scrollTo({ y, animated: true });
        }
      );
    } else {
      console.warn("targetHandle ou scrollHandle é null");
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (!!image || !!title || !!description) {
      setIsPostOpen(true);
    }
  }, [image, title, description]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: themeColors.background,
        position: "relative",
      }}
    >
      {showScrollButton && (
        <View
          style={[
            globalStyles.flexr,
            {
              position: "absolute",
              top: 80,
              zIndex: 999,
              width: "100%",
              opacity: 0.7,
            },
          ]}
        >
          <TouchableOpacity
            onPress={scrollToSubtitle}
            style={{
              backgroundColor: themeColors.background,
              borderRadius: 200,
              borderWidth: 2,
              borderColor: themeColors.background,
            }}
          >
            <AntDesign name="upcircle" size={50} color={themeColors.primary} />
          </TouchableOpacity>
        </View>
      )}
      {confirmodalOpen && (
        <View>
          <MFLogoutModal
            warningVisible={confirmodalOpen}
            themeColors={themeColors}
            text={modalType === 1 ? "Iniciar o treino?" : "Finalizar o treino?"}
            onPress={() => CreateAndGoToExecution()}
            close={() => setConfirmodalOpen(false)}
            isLoading={isLoading}
          ></MFLogoutModal>
        </View>
      )}
      <View style={trainingStyles.container}>
        <MFCreatePostCard
            isLoading={isPostLoading}
            themeColors={themeColors}
            HandleSendPost={HandleSendPost}
            HandleEditPost={HandleEditPost}
            title={title}
            setTitle={setTitle}
            postStatus={postStatus}
            setPostStatus={setPostStatus}
            description={description}
            setDescription={setDescription}
            pickImage={pickImage}
            openCamera={openCamera}
            image={image}
            imageUrl={imageUrl}
            postId={postId}
            isPostOpen={isPostOpen}
            setIsPostOpen={setIsPostOpen}
            setPostId={setPostId}
            noImage={() => {
              setImage(null);
              setImageUrl(null);
            }}
          />

        {isLoading ? (
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[themeColors.primary]}
                tintColor={themeColors.primary}
              />
            }
          >
            {/* Skeleton do header de treino */}
            <View style={{ padding: 20, paddingBottom: 10 }}>
              <PostSkeleton themeColors={themeColors} />
            </View>

            {/* Skeleton dos cards de treino */}
            <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
              <TrainingSkeleton themeColors={themeColors} />
            </View>

            {/* Skeletons de posts */}
            <PostSkeleton themeColors={themeColors} />
            <PostSkeleton themeColors={themeColors} />
            <PostSkeleton themeColors={themeColors} />
          </ScrollView>
        ) : (
          <ScrollView
            ref={scrollRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[themeColors.primary]}
                tintColor={themeColors.primary}
              />
            }
          >
            {!lastExecution?.todayTraining ? (
              <>
                <View
                  style={{ padding: 20, paddingBottom: 10 }}
                  ref={targetRef}
                >
                  <MFStackEditSubtitle
                    themeColors={themeColors}
                    title={`Bora treinar ${
                      user?.client?.nick
                        ? ", " + user?.client?.nick
                        : user?.client?.name
                        ? ", " + user?.client?.name
                        : ""
                    }!`}
                  ></MFStackEditSubtitle>
                  <Text style={{ color: themeColors.text, paddingLeft: 12 }}>
                    {getRandomMessage(notTrainedMessages)}
                  </Text>
                </View>

                {!!assign && Array.isArray(assign) && assign.length > 0 ? (
                  <Carousel
                    loop
                    width={width}
                    height={200}
                    autoPlay={false}
                    data={assign}
                    scrollAnimationDuration={1000}
                    renderItem={({ item }: { item: any }) => (
                      <MFTrainingExecutionCard
                        isNew={
                          !item.training?.trainingExecution ||
                          (item.training?.trainingExecution &&
                            item.training?.trainingExecution.length === 0)
                        }
                        isExecutionLoading={isLoading}
                        GoToExecution={GoToExecution}
                        OpenModal={OpenModal}
                        isInExecution={executionItem}
                        themeColors={themeColors}
                        data={item}
                        Unassign={() => {}}
                        isHome={true}
                      />
                    )}
                    mode="parallax"
                    modeConfig={{
                      parallaxScrollingScale: 0.9,
                      parallaxScrollingOffset: 50,
                    }}
                    pagingEnabled={true}
                    style={{
                      paddingHorizontal: OFFSET,
                    }}
                  />
                ) : (
                  <View
                    style={[
                      trainingStyles.noTrainingBox,
                      {
                        shadowColor: themeColors.text,
                        backgroundColor: themeColors.backgroundSecondary,
                      },
                    ]}
                  >
                    <Image
                      style={trainingStyles.fitinhoImage}
                      source={
                        user?.client.gender === 2
                          ? require(`@/assets/images/my-fit/fitinho_fem.png`)
                          : require(`@/assets/images/my-fit/fitinho_masc.png`)
                      }
                    />
                    <View
                      style={[globalStyles.flexc, { width: "55%", gap: 20 }]}
                    >
                      <Text
                        style={{
                          color: themeColors.text,
                          textAlign: "center",
                          fontSize: 20,
                        }}
                      >
                        Você não possui nenhum programa de treinamento.
                      </Text>
                      <MFPrimaryButton
                        themeColors={themeColors}
                        onPress={() => router.push("/(tabs)/shop")}
                        title="Adicionar"
                        isWhiteDetails={true}
                      ></MFPrimaryButton>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <>
                <View
                  style={{ padding: 20, paddingBottom: 10 }}
                  ref={targetRef}
                >
                  <MFStackEditSubtitle
                    isPrimary={true}
                    themeColors={themeColors}
                    title={`Parabéns ${
                      user?.client?.nick
                        ? ", " + user?.client?.nick
                        : user?.client?.name
                        ? ", " + user?.client?.name
                        : ""
                    }.`}
                  ></MFStackEditSubtitle>
                  <Text style={{ color: themeColors.text, paddingLeft: 12 }}>
                    {getRandomMessage(trainedMessages)}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: themeColors.secondary,
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    borderRadius: 12,
                    marginHorizontal: 20,
                    marginTop: 12,
                    shadowColor: themeColors.text,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    marginBottom: 20,
                    position: "relative",
                  }}
                >
                  <AntDesign
                    name="checkcircle"
                    size={30}
                    color={themeColors.success}
                    style={{ position: "absolute", top: -10, right: -10 }}
                  />
                  <Text
                    style={{
                      color: themeColors.text,
                      fontSize: 20,
                      fontWeight: "bold",
                    }}
                  >
                    {lastExecution?.trainingExecution?.training?.name}
                  </Text>

                  <Text style={{ color: themeColors.text, marginTop: 4 }}>
                    {lastExecution?.trainingExecution?.training?.description}
                  </Text>

                  <View style={{ flexDirection: "row", marginTop: 12 }}>
                    <Text style={{ color: themeColors.text, marginRight: 16 }}>
                      ⏱️ Duração: {lastExecution?.duration || "--:--"}
                    </Text>
                    <Text style={{ color: themeColors.text }}>
                      📅 Realizado em:{" "}
                      {new Date(
                        lastExecution?.trainingExecution?.startAt
                      ).toLocaleDateString("pt-BR")}
                    </Text>
                  </View>
                </View>
              </>
            )}
            <View
              style={{
                paddingHorizontal: 20,
                paddingTop: 0,
                paddingBottom: 20,
              }}
            >
              <MFStackEditSubtitle
                themeColors={themeColors}
                title=""
                align="left"
              ></MFStackEditSubtitle>
            </View>
            {posts &&
              Array.isArray(posts) &&
              posts
                .filter((e, y) => y <= 3)
                .map((e: any, y: number) => {
                  let friendStatus = 1;

                  if (
                    !!myFriends.receives &&
                    Array.isArray(myFriends.receives) &&
                    myFriends.receives.includes(e.client?.id)
                  ) {
                    friendStatus = 4;
                  }

                  if (
                    !!myFriends.requests &&
                    Array.isArray(myFriends.requests) &&
                    myFriends.requests.includes(e.client?.id)
                  ) {
                    friendStatus = 3;
                  }

                  if (
                    !!myFriends.friends &&
                    Array.isArray(myFriends.friends) &&
                    myFriends.friends.includes(e.client?.id)
                  ) {
                    friendStatus = 2;
                  }

                  if (e.client.userType === 1) {
                    return (
                      <View key={`post-${e.id}`}>
                        <MFAdmimPostCard themeColors={themeColors} data={e} />
                      </View>
                    );
                  } else if (e.client.id === user?.client?.id) {
                    if (tempDel.includes(e.id)) return null;
                    return (
                      <View key={`post-${e.id}`}>
                        <MFMyPostCard
                          themeColors={themeColors}
                          data={e}
                          user={user}
                          deleteThisPost={deleteThisPost}
                          isLoading={isPostLoading}
                          unassignOpen={unassignOpen}
                          setUnassignOpen={setUnassignOpen}
                          goToEditPost={goToEditPost}
                        />
                      </View>
                    );
                  } else {
                    return (
                      <View key={`post-${e.id}`}>
                        <MFPostCard
                          themeColors={themeColors}
                          data={e}
                          friendStatus={friendStatus}
                          onPress={() =>
                            addFriendFunction({
                              friendStatus: friendStatus,
                              id: e.client?.id,
                            })
                          }
                        />
                      </View>
                    );
                  }
                })}
            {publi &&
              Array.isArray(publi) &&
              publi.map((pub: any, index: number) => (
                <View key={`publi-${pub.id}`}>
                  <MFPubliCard themeColors={themeColors} data={pub} />
                </View>
              ))}
            {posts &&
              Array.isArray(posts) &&
              posts
                .filter((e, y) => y > 3)
                .map((e: any, y: number) => {
                  let friendStatus = 1;

                  if (
                    !!myFriends.receives &&
                    Array.isArray(myFriends.receives) &&
                    myFriends.receives.includes(e.id)
                  ) {
                    friendStatus = 4;
                  }

                  if (
                    !!myFriends.requests &&
                    Array.isArray(myFriends.requests) &&
                    myFriends.requests.includes(e.client?.id)
                  ) {
                    friendStatus = 3;
                  }

                  if (
                    !!myFriends.friends &&
                    Array.isArray(myFriends.friends) &&
                    myFriends.friends.includes(e.client?.id)
                  ) {
                    friendStatus = 2;
                  }

                  if (e.client.id === user?.client?.id) {
                    if (tempDel.includes(e.id)) return null;
                    return (
                      <View key={`post-${e.id}`}>
                        <MFMyPostCard
                          themeColors={themeColors}
                          data={e}
                          user={user}
                          deleteThisPost={deleteThisPost}
                          isLoading={isPostLoading}
                          unassignOpen={unassignOpen}
                          setUnassignOpen={setUnassignOpen}
                          goToEditPost={goToEditPost}
                        />
                      </View>
                    );
                  } else {
                    return (
                      <View key={`post-${e.id}`}>
                        <MFPostCard
                          themeColors={themeColors}
                          data={e}
                          friendStatus={friendStatus}
                          onPress={() =>
                            addFriendFunction({
                              friendStatus: friendStatus,
                              id: e.client?.id,
                            })
                          }
                        />
                      </View>
                    );
                  }
                })}
            <View
              style={[
                globalStyles.flexr,
                { width: "100%", height: 70, marginBottom: 100 },
              ]}
            >
              <Text style={{ color: themeColors.text, fontSize: 16 }}>
                {posts && Array.isArray(posts) && posts.length > 0
                  ? `Não há mais postagens.`
                  : `Não há postagens.`}
              </Text>
            </View>
          </ScrollView>
        )}
      </View>
      <FloatingContinueTrainingButtonWrapper themeColors={themeColors} />
    </View>
  );
}
