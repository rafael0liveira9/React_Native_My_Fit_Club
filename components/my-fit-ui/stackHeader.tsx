import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { globalStyles } from "@/styles/global";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View, ViewProps } from "react-native";
import { MFSecondaryButton } from "./buttons";

interface HeaderProps extends ViewProps {
  title?: string;
  titleBtn?: string;
  isLoading?: boolean;
  onPress?: any;
}

export default function MFStackHeader({
  title,
  isLoading,
  titleBtn,
  onPress,
}: HeaderProps) {
  const router = useRouter(),
    { theme } = useTheme(),
    themeColors = Colors[`${theme}`];

  return (
    <View
      style={[
        globalStyles.stackHeader,
        { backgroundColor: themeColors.primary },
      ]}
    >
      <View style={globalStyles.stackBackButton}>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color={themeColors.white} />
        </TouchableOpacity>
        <Text
          style={{ color: themeColors.white, fontSize: 24, fontWeight: 600 }}
        >
          {title}
        </Text>
      </View>
      {onPress && (
        <MFSecondaryButton
          isDisabled={isLoading}
          isLoading={isLoading}
          themeColors={themeColors}
          title={titleBtn ? titleBtn : "Salvar"}
          onPress={onPress}
        ></MFSecondaryButton>
      )}
    </View>
  );
}
