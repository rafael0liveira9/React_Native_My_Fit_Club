import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";

import React from "react";
import { View } from "react-native";

export default function HomeScren() {
  const { theme } = useTheme(),
    themeColors = Colors[`${theme}`];

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        height: 200,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: themeColors.background,
      }}
    >
      <View style={{ width: "100%", paddingHorizontal: 30 }}></View>
    </View>
  );
}
