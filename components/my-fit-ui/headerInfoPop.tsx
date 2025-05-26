import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { MFPrimaryButton, MFThemeChangeButton } from "./buttons";
import { MFDefaultCard } from "./cards";

export default function HeaderPopUp({
  globalStyles,
  themeColors,
  theme,
  toggleTheme,
  user,
  isLoading,
  onOpenChange,
  onOpenWarning,
}: {
  globalStyles: any;
  themeColors: any;
  theme: string;
  toggleTheme: () => void;
  onOpenChange: () => void;
  onOpenWarning: () => void;
  user: any;
  isLoading: boolean;
}) {
  return (
    <View style={globalStyles.headerInfoBox}>
      <MFDefaultCard themeColors={themeColors}>
        <View style={globalStyles.themeBtnBox}>
          <MFThemeChangeButton
            title=""
            type={theme === "dark" ? "left" : "right"}
            color={theme === "dark" ? themeColors.info : themeColors.warning}
            icon={
              theme === "dark" ? (
                <Entypo name="moon" size={18} color={themeColors.text} />
              ) : (
                <Feather
                  name="sun"
                  size={18}
                  color={themeColors.texSecondary}
                />
              )
            }
            onPress={toggleTheme}
          ></MFThemeChangeButton>
        </View>
        <View style={globalStyles.headerInfoPhoto}>
          {user?.photo ? (
            <Image
              source={{ uri: user?.photo }}
              style={[
                globalStyles.headerPhoto,
                {
                  backgroundColor: themeColors.primaryContrast,
                  borderWidth: 3,
                  borderColor: themeColors.text,
                },
              ]}
            />
          ) : (
            <View
              style={[
                globalStyles.headerPhoto,
                { backgroundColor: themeColors.primaryContrast },
              ]}
            >
              {isLoading ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator size={20} color={themeColors.primary} />
                </View>
              ) : (
                <Text style={{ fontSize: 40, color: themeColors.white }}>
                  {user?.name?.charAt(0).toUpperCase() ?? "?"}
                </Text>
              )}
            </View>
          )}
        </View>
        <View style={globalStyles.headerInfoContent}>
          <Text
            style={[
              globalStyles.headerInfoText,
              { fontSize: 20, color: themeColors.text },
            ]}
          >
            Olá, {user?.nick ? user?.nick : (user?.name).split(" ", 1)}!
          </Text>
          <View style={globalStyles.headerInfoText}>
            <MaterialIcons name="email" size={16} color={themeColors.text} />
            <Text style={{ textAlign: "center", color: themeColors.text }}>
              {user?.email}
            </Text>
          </View>
        </View>
        <View style={{ width: "100%", paddingHorizontal: 20, marginTop: 40 }}>
          <MFPrimaryButton
            themeColors={themeColors}
            onPress={onOpenWarning}
            title="Sair"
          ></MFPrimaryButton>
        </View>
      </MFDefaultCard>
    </View>
  );
}
