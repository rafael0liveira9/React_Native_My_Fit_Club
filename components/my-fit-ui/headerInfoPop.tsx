import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome,
  Octicons,
} from "@expo/vector-icons";
import Constants from "expo-constants";
import { useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { MFDefaultCard } from "./cards";
import MFStackEditSubtitle from "./stackEditSubtitle";

export default function HeaderPopUp({
  globalStyles,
  themeColors,
  theme,
  toggleTheme,
  user,
  isLoading,
  onOpenChange,
  onOpenWarning,
  faq,
}: {
  globalStyles: any;
  themeColors: any;
  faq: any;
  theme: string;
  toggleTheme: () => void;
  onOpenChange: () => void;
  onOpenWarning: () => void;
  user: any;
  isLoading: boolean;
}) {
  const [opennedFaq, setOppenedFaq] = useState<number | null>(null),
    appName = Constants.expoConfig?.name,
    appVersion = Constants.expoConfig?.version,
    appVersionStatus = "",
    createdBy = "BAY Digital Services",
    policyPrivacy =
      "https://github.com/rafael0liveira9/React_Native_My_Fit_Club/blob/master/privacy-policy.txt",
    createdByUrl = "https://www.linkedin.com/in/rafael-oliveira-18934a160/";

  return (
    <View style={globalStyles.headerInfoBox}>
      <TouchableWithoutFeedback>
        <MFDefaultCard themeColors={themeColors}>
          <View style={{ width: "100%", height: "100%" }}>
            <ScrollView
              style={{
                flex: 1,
                padding: 10,
              }}
            >
              <View
                style={[
                  globalStyles.flexc,
                  { marginBottom: 20, width: "100%", alignItems: "flex-end" },
                ]}
              >
                <Text
                  style={[
                    globalStyles.title,
                    { color: themeColors.text, fontSize: 30, fontWeight: 600 },
                  ]}
                >
                  Olá, {user.name}!
                </Text>
                <Text style={{ color: themeColors.textSecondary }}>
                  {user?.email}
                </Text>
              </View>

              <View style={{ marginVertical: 10 }}>
                <MFStackEditSubtitle
                  themeColors={themeColors}
                  title="Sobre o app"
                  align="left"
                  info="Informações sobre o aplicativo."
                ></MFStackEditSubtitle>
                <View
                  style={{
                    paddingLeft: 20,
                    marginTop: 10,
                    gap: 10,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => Linking.openURL(createdByUrl)}
                    style={[
                      globalStyles.flexr,
                      { gap: 20, justifyContent: "flex-start" },
                    ]}
                  >
                    <Feather name="link" size={16} color={themeColors.text} />
                    <Text
                      style={{
                        color: themeColors.info,
                        fontSize: 16,
                        textDecorationLine: "underline",
                        textDecorationStyle: "solid",
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "900",
                          color: themeColors.text,
                          textDecorationLine: "none",
                          textDecorationStyle: "solid",
                        }}
                      >
                        Criado por:{" "}
                      </Text>
                      {"  "}
                      {createdBy}
                      {"  "}
                    </Text>
                  </TouchableOpacity>
                  <View
                    style={[
                      globalStyles.flexr,
                      { gap: 20, justifyContent: "flex-start" },
                    ]}
                  >
                    <Feather
                      name="smartphone"
                      size={16}
                      color={themeColors.text}
                    />
                    <Text style={{ color: themeColors.text, fontSize: 16 }}>
                      <Text style={{ fontWeight: 900 }}>Nome: </Text> {appName}
                    </Text>
                  </View>
                  <View
                    style={[
                      globalStyles.flexr,
                      { gap: 20, justifyContent: "flex-start" },
                    ]}
                  >
                    <Octicons
                      style={{ paddingLeft: 3 }}
                      name="number"
                      size={16}
                      color={themeColors.text}
                    />
                    <Text style={{ color: themeColors.text, fontSize: 16 }}>
                      <Text style={{ fontWeight: 900 }}>Versão: </Text>{" "}
                      {appVersionStatus} {appVersion}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={toggleTheme}
                    style={[
                      globalStyles.flexr,
                      { gap: 20, justifyContent: "flex-start" },
                    ]}
                  >
                    {theme === "dark" ? (
                      <Entypo name="moon" size={16} color={themeColors.text} />
                    ) : (
                      <Feather name="sun" size={16} color={themeColors.text} />
                    )}
                    <Text style={{ color: themeColors.text }}>
                      <Text style={{ fontWeight: 900 }}>Tema:</Text>
                      {"  "}
                      {theme === "dark" ? "Escuro" : "Claro"}
                    </Text>
                    <Switch
                      style={{ height: 16 }}
                      value={theme === "dark"}
                      onValueChange={toggleTheme}
                      trackColor={{ false: "#ccc", true: "#999" }}
                      thumbColor={
                        theme === "dark"
                          ? themeColors.text
                          : themeColors.primary
                      }
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(policyPrivacy)}
                    style={[
                      globalStyles.flexr,
                      { gap: 20, justifyContent: "flex-start" },
                    ]}
                  >
                    <Feather name="link" size={16} color={themeColors.text} />
                    <Text
                      style={{
                        color: themeColors.info,
                        fontSize: 16,
                        textDecorationLine: "underline",
                        textDecorationStyle: "solid",
                      }}
                    >
                      {" "}
                      Politica de Privacidade{" "}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                onPress={onOpenWarning}
                style={{
                  backgroundColor: themeColors.danger,
                  padding: 15,
                  borderRadius: 10,
                  marginVertical: 40,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Sair da conta
                </Text>
              </TouchableOpacity>
              {!!faq && Array.isArray(faq) && faq.length > 0 && (
                <View style={{ marginVertical: 20 }}>
                  <MFStackEditSubtitle
                    themeColors={themeColors}
                    title="FAQ"
                    align="left"
                    info="Perguntas e respostas."
                  ></MFStackEditSubtitle>
                  <View
                    style={{
                      paddingLeft: 20,
                      marginTop: 30,
                      gap: 30,
                      width: 320,
                    }}
                  >
                    {faq.map((e: any) => {
                      return (
                        <Pressable
                          onPress={
                            opennedFaq === e.id
                              ? () => setOppenedFaq(null)
                              : () => setOppenedFaq(e.id)
                          }
                          key={e.id}
                          style={{ width: "100%" }}
                        >
                          <View
                            style={[
                              globalStyles.flexr,
                              {
                                gap: 10,
                                justifyContent: "flex-start",
                                width: "100%",
                              },
                            ]}
                          >
                            {opennedFaq === e.id ? (
                              <AntDesign
                                name="up"
                                size={18}
                                color={themeColors.text}
                              />
                            ) : (
                              <AntDesign
                                name="down"
                                size={18}
                                color={themeColors.text}
                              />
                            )}
                            <Text
                              style={{
                                color: themeColors.text,
                                fontSize: 16,
                                fontWeight: 900,
                              }}
                            >
                              {e.question}
                            </Text>
                            <FontAwesome
                              name="question-circle-o"
                              size={16}
                              color={themeColors.text}
                            />
                          </View>
                          {opennedFaq === e.id && (
                            <View
                              style={[
                                globalStyles.flexr,
                                {
                                  width: "100%",
                                  justifyContent: "flex-start",
                                  alignItems: "flex-start",
                                  padding: 15,
                                  backgroundColor: themeColors.background,
                                  borderWidth: 1,
                                  borderColor: themeColors.background,
                                  borderTopRightRadius: 20,
                                  borderBottomRightRadius: 20,
                                  borderBottomLeftRadius: 20,
                                  shadowColor: "#000",
                                  shadowOpacity: 0.3,
                                  shadowRadius: 100,
                                  elevation: 5,
                                  minHeight: 100,
                                  marginBottom: 10,
                                  marginTop: 5,
                                },
                              ]}
                            >
                              <Text
                                style={{
                                  color: themeColors.text,
                                  fontSize: 15,
                                }}
                              >
                                {e.answer}
                              </Text>
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </MFDefaultCard>
      </TouchableWithoutFeedback>
    </View>
  );
}
