import MFMainHeader from "@/components/my-fit-ui/header";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
// import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";

export default function TabLayout() {
  const { theme, toggleTheme } = useTheme();
  const [isHeaderInfoOpen, setisHeaderInfoOpen] = useState(false);
  const themeColors = Colors[`light`];

  const CustomTabBarButton = (props: any) => {
    const isSelected = props?.accessibilityState?.selected ?? false;

    return (
      <TouchableOpacity
        {...props}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          borderBottomWidth: isSelected ? 2 : 0,
          borderColor: "red",
          padding: 5,
        }}
      >
        {props.children}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[theme].tint,
          headerShown: true,
          tabBarShowLabel: false,
          tabBarItemStyle: {
            padding: 0,
            margin: 0,
          },
          tabBarIconStyle: {
            width: "100%",
            height: 55,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 0,
            margin: 0,
            borderWidth: 0,
          },
          tabBarStyle: {
            width: "100%",
            height: 55,
            elevation: 5,
            borderTopWidth: 1,
            borderColor: themeColors.secondary,
            paddingTop: 0,
            paddingBottom: 0,
            margin: 0,
            backgroundColor: themeColors.secondary,
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
                isOpen={isHeaderInfoOpen}
                setIsOpen={setisHeaderInfoOpen}
              />
            ),
            tabBarButton: (props) => <CustomTabBarButton {...props} />,
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  flex: 1,
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  borderTopWidth: focused ? 3 : 0,
                  borderColor: themeColors.primary,
                }}
              >
                <Entypo name="home" size={focused ? 29 : 18} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="clients/index"
          options={{
            header: () => (
              <MFMainHeader
                themeColors={themeColors}
                theme={theme}
                toggleTheme={toggleTheme}
                isOpen={isHeaderInfoOpen}
                setIsOpen={setisHeaderInfoOpen}
              />
            ),
            tabBarButton: (props) => <CustomTabBarButton {...props} />,
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  flex: 1,
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  borderTopWidth: focused ? 3 : 0,
                  borderColor: themeColors.primary,
                }}
              >
                <Ionicons
                  name="person"
                  size={focused ? 25 : 15}
                  color={color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="personal/index"
          options={{
            header: () => (
              <MFMainHeader
                themeColors={themeColors}
                theme={theme}
                toggleTheme={toggleTheme}
                isOpen={isHeaderInfoOpen}
                setIsOpen={setisHeaderInfoOpen}
              />
            ),
            tabBarButton: (props) => <CustomTabBarButton {...props} />,
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  flex: 1,
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  borderTopWidth: focused ? 3 : 0,
                  borderColor: themeColors.primary,
                }}
              >
                <FontAwesome6
                  name="dumbbell"
                  size={focused ? 25 : 15}
                  color={color}
                />
              </View>
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
                isOpen={isHeaderInfoOpen}
                setIsOpen={setisHeaderInfoOpen}
              />
            ),
            tabBarButton: (props) => <CustomTabBarButton {...props} />,
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  flex: 1,
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  borderTopWidth: focused ? 3 : 0,
                  borderColor: themeColors.primary,
                }}
              >
                <MaterialIcons
                  name="dashboard-customize"
                  size={focused ? 25 : 15}
                  color={color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="shop/index"
          options={{
            header: () => (
              <MFMainHeader
                themeColors={themeColors}
                theme={theme}
                toggleTheme={toggleTheme}
                isOpen={isHeaderInfoOpen}
                setIsOpen={setisHeaderInfoOpen}
              />
            ),
            tabBarButton: (props) => <CustomTabBarButton {...props} />,
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  flex: 1,
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  borderTopWidth: focused ? 3 : 0,
                  borderColor: themeColors.primary,
                }}
              >
                <Entypo
                  name="shopping-cart"
                  size={focused ? 27 : 16}
                  color={color}
                />
              </View>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
