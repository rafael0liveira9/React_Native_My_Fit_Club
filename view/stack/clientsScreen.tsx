import { MFClientCard } from "@/components/my-fit-ui/cards";
import MFFilterSortBox from "@/components/my-fit-ui/filterBox";
import { FloatingContinueTrainingButtonWrapper } from "@/components/my-fit-ui/floatingButton";
import { ClientSkeleton } from "@/components/my-fit-ui/skeleton";
import MFStackEditSubtitle from "@/components/my-fit-ui/stackEditSubtitle";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import {
  acceptFriendRequest,
  getAllMyFriends,
  newFriendRequest,
} from "@/service/relations";
import { getClients } from "@/service/training";
import { getMyData } from "@/service/user";
import { globalStyles } from "@/styles/global";
import { trainingStyles } from "@/styles/training";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";

export default function ClientsScreen() {
  const { theme } = useTheme(),
    themeColors = Colors[`${theme}`],
    router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isPaginating, setIsPaginating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [user, setUser] = useState<any>();
  const [token, setToken] = useState<string>("");
  const [search, setSearch] = useState<string | undefined>();
  const [myFriends, setMyFriends] = useState<any>({});
  const [total, setTotal] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);

  async function getUserData() {
    setIsLoading(true);
    try {
      const z = await SecureStore.getItemAsync("userToken");

      if (z) {
        const x = await getClients({
          token: z,
          page: "1",
          string: search || undefined,
        });
        const MyData: any = await getMyData({ token: z });
        const friends: any = await getAllMyFriends({ token: z });

        if (friends) {
          const xx = friends.friends
            .map((e: any) =>
              MyData?.user?.client?.id !== e.sender ? e.sender : e.friend
            )
            .filter(Boolean);
          const yy = friends.requests
            .map((e: any) =>
              MyData?.user?.client?.id !== e.friend ? e.friend : null
            )
            .filter(Boolean);
          const zz = friends.receives
            .map((e: any) =>
              MyData?.user?.client?.id !== e.sender ? e.sender : null
            )
            .filter(Boolean);

          setMyFriends({ friends: xx, requests: yy, receives: zz });
        }

        if (MyData) {
          setUser({
            id: MyData?.user?.id,
            type: MyData?.typeId,
            email: MyData?.user?.email,
            client: MyData?.user?.client,
          });
        }

        setData(x.clients);
        setTotal(x.total);
        setTotalPages(x.totalPages);
        setToken(z);
        setSearch(undefined);
        setPage(1);
        setIsPaginating(false);
      }
    } catch (error) {
      console.error("Erro ao recuperar usuário:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function getUserRefresh() {
    setIsRefreshing(true);
    try {
      const z = await SecureStore.getItemAsync("userToken");

      if (z) {
        const x = await getClients({
          token: z,
          page: "1",
          string: search || undefined,
        });
        const MyData: any = await getMyData({ token: z });
        const friends: any = await getAllMyFriends({ token: z });

        if (friends) {
          const xx = friends.friends
            .map((e: any) =>
              MyData?.user?.client?.id !== e.sender ? e.sender : e.friend
            )
            .filter(Boolean);
          const yy = friends.requests
            .map((e: any) =>
              MyData?.user?.client?.id !== e.friend ? e.friend : null
            )
            .filter(Boolean);
          const zz = friends.receives
            .map((e: any) =>
              MyData?.user?.client?.id !== e.sender ? e.sender : null
            )
            .filter(Boolean);

          setMyFriends({ friends: xx, requests: yy, receives: zz });
        }

        if (MyData) {
          setUser({
            id: MyData?.user?.id,
            type: MyData?.typeId,
            email: MyData?.user?.email,
            client: MyData?.user?.client,
          });
        }

        setData(x.clients);
        setTotal(x.total);
        setTotalPages(x.totalPages);
        setToken(z);
        setSearch(undefined);
        setPage(1);
        setIsPaginating(false);
      }
    } catch (error) {
      console.error("Erro ao recuperar usuário:", error);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function newSearch() {
    setIsLoading(true);
    try {
      if (token) {
        const x = await getClients({
          token,
          page: "1",
          string: search || undefined,
        });

        setData(x.clients);
        setTotal(x.total);
        setPage(1);
        setIsPaginating(false);
      }
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setIsLoading(false);
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

  async function newPageChange() {
    if (isPaginating || page >= totalPages) return;
    setIsPaginating(true);
    try {
      if (token) {
        const x = await getClients({
          token,
          page: (page + 1).toString(),
          string: search || undefined,
        });

        setData((prev) => [...prev, ...x.clients]);
        setTotal(x.total);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Erro ao carregar mais:", error);
    } finally {
      setIsPaginating(false);
    }
  }

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <FlatList
      style={{ flex: 1, backgroundColor: themeColors.background }}
      data={data}
      refreshing={isRefreshing}
      onRefresh={() => {
        getUserRefresh();
      }}
      keyExtractor={(item: any, index: number) => index.toString()}
      ListHeaderComponent={
        <View style={{ height: 170 }}>
          <MFFilterSortBox
            themeColors={themeColors}
            search={search}
            isLoading={isLoading}
            setSearch={setSearch}
            onPress={newSearch}
          />
          <View style={trainingStyles.listBox}>
            <MFStackEditSubtitle
              themeColors={themeColors}
              title="Pessoas"
              align="left"
              info="Lista de usuários do aplicativo."
            />
            <View style={{ height: 20 }} />
          </View>
        </View>
      }
      renderItem={({ item }: { item: any }) => {
        let friendStatus = 1;
        console.log(item.id);
        if (myFriends.receives?.includes(item.id)) friendStatus = 4;
        if (myFriends.requests?.includes(item.id)) friendStatus = 3;
        if (myFriends.friends?.includes(item.id)) friendStatus = 2;
        // Type 1=não amigo 2=amig 3=adicionado 4=pedido recebido
        return (
          <View style={{ width: "100%", marginBottom: 10 }}>
            <MFClientCard
              themeColors={themeColors}
              data={item}
              friendStatus={friendStatus}
              onPress={() =>
                addFriendFunction({
                  friendStatus: friendStatus,
                  id: item?.id,
                })
              }
            />
          </View>
        );
      }}
      ListEmptyComponent={
        !isLoading ? (
          <View style={globalStyles.flexc}>
            <Text style={{ fontSize: 20, color: themeColors.text }}>
              Nenhum treino encontrado 😢
            </Text>
          </View>
        ) : null
      }
      ListFooterComponent={
        isLoading ? (
          <View style={{ paddingHorizontal: 20 }}>
            <ClientSkeleton themeColors={themeColors} />
            <ClientSkeleton themeColors={themeColors} />
            <ClientSkeleton themeColors={themeColors} />
            <ClientSkeleton themeColors={themeColors} />
            <ClientSkeleton themeColors={themeColors} />
          </View>
        ) : null
      }
      onEndReached={newPageChange}
      onEndReachedThreshold={0.5}
    />
      <FloatingContinueTrainingButtonWrapper themeColors={themeColors} />
    </View>
  );
}
