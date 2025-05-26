import { HapticTab } from "@/components/HapticTab";
import { MFCustomTabIcon } from "@/components/my-fit-ui/buttons";
import MFMainHeader from "@/components/my-fit-ui/header";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
// import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function TabLayout() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const themeColors = Colors[`${theme}`];

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[theme].tint,
          headerShown: true,
          tabBarButton: HapticTab,
          tabBarShowLabel: false,
          tabBarBackground: TabBarBackground,
          tabBarItemStyle: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 0,
            margin: 0,
            borderWidth: 0,
          },
          tabBarIconStyle: {
            borderRadius: 50,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 0,
            margin: 0,
            borderWidth: 0,
          },
          tabBarStyle: {
            bottom: 10,
            marginHorizontal: 10,
            borderRadius: 5,
            height: 50,
            backgroundColor: themeColors.secondary,
            elevation: 5,
            paddingTop: 7,
            borderTopWidth: 0,
            borderTopColor: "transparent",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            header: () => (
              <MFMainHeader
                themeColors={themeColors}
                theme={theme}
                toggleTheme={toggleTheme}
              />
            ),

            tabBarIcon: ({ color }) => (
              <MFCustomTabIcon
                color={color}
                route="/"
                icon={<Entypo name="home" size={18} color={color} />}
                iconActive={<Entypo name="home" size={29} color={color} />}
              ></MFCustomTabIcon>
            ),
          }}
        />
        <Tabs.Screen
          name="training/index"
          options={{
            header: () => (
              <MFMainHeader
                themeColors={themeColors}
                theme={theme}
                toggleTheme={toggleTheme}
              />
            ),
            tabBarIcon: ({ color }) => (
              <MFCustomTabIcon
                color={color}
                route="/training"
                icon={<FontAwesome6 name="dumbbell" size={15} color={color} />}
                iconActive={
                  <FontAwesome6 name="dumbbell" size={25} color={color} />
                }
              ></MFCustomTabIcon>
            ),
          }}
        />
        <Tabs.Screen
          name="food/index"
          options={{
            header: () => (
              <MFMainHeader
                themeColors={themeColors}
                theme={theme}
                toggleTheme={toggleTheme}
              />
            ),
            tabBarIcon: ({ color }) => (
              <MFCustomTabIcon
                color={color}
                route="/food"
                icon={
                  <MaterialCommunityIcons
                    name="food-fork-drink"
                    size={17}
                    color={color}
                  />
                }
                iconActive={
                  <MaterialCommunityIcons
                    name="food-fork-drink"
                    size={30}
                    color={color}
                  />
                }
              ></MFCustomTabIcon>
            ),
          }}
        />
        <Tabs.Screen
          name="profile/index"
          options={{
            header: () => (
              <MFMainHeader
                themeColors={themeColors}
                theme={theme}
                toggleTheme={toggleTheme}
              />
            ),
            tabBarIcon: ({ color }) => (
              <MFCustomTabIcon
                color={color}
                route="/profile"
                icon={<FontAwesome name="user" size={16} color={color} />}
                iconActive={<FontAwesome name="user" size={27} color={color} />}
              ></MFCustomTabIcon>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
