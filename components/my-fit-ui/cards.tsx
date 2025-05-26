import { globalStyles } from "@/styles/global";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { ReactNode, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
} from "react-native";

interface MFDefaultCardProps extends ViewProps {
  themeColors?: any;
  children: ReactNode;
}

export function MFDefaultCard({
  themeColors,
  children,
  style,
  ...props
}: MFDefaultCardProps) {
  return (
    <View
      style={[
        styles.box,
        {
          backgroundColor: themeColors.secondary,
          shadowColor: themeColors.text,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

export function MFPlusCard({
  themeColors = { secondary: "#1a1a1a" },
  children,
  style,
  ...props
}: MFDefaultCardProps) {
  return (
    <View
      style={[styles.plus, { backgroundColor: themeColors.secondary }, style]}
      {...props}
    >
      {children}
    </View>
  );
}

export function MFTrainingCard({
  themeColors,
  data,
}: {
  themeColors: any;
  data: any;
}) {
  function getStars({ avaliation }: { avaliation: number }) {
    const stars = [];

    for (let index = 0; index < 5; index++) {
      stars.push(
        <AntDesign
          key={index}
          name={index < avaliation ? "star" : "staro"}
          size={18}
          color="#E1E111FF"
        />
      );
    }

    return stars;
  }
  return (
    <View
      key={data.id}
      style={[
        styles.trainingBox,
        {
          backgroundColor: themeColors.secondary,
          shadowColor: themeColors.text,
        },
      ]}
    >
      <View
        style={[globalStyles.flexr, styles.trainingBoxAvaliations, { gap: 10 }]}
      >
        <View
          style={[
            styles.trainingAvaliation,
            {
              backgroundColor: themeColors.success,
              borderColor: themeColors.success,
            },
          ]}
        >
          <Text style={{ color: themeColors.white }}>NOVO</Text>
        </View>
        <View
          style={[
            styles.trainingAvaliation,
            globalStyles.flexr,
            {
              backgroundColor: themeColors.white,
              borderColor: themeColors.grey,
            },
          ]}
        >
          {getStars({ avaliation: 5 })}
        </View>
      </View>
      <View style={[globalStyles.flexr, { gap: 20 }]}>
        <Image
          style={styles.trainingLogo}
          source={{ uri: data?.training?.photo }}
        />
        <View
          style={[
            globalStyles.flexc,
            {
              gap: 10,
              justifyContent: "flex-start",
              alignItems: "flex-start",
              height: "100%",
              paddingVertical: 10,
            },
          ]}
        >
          <Text
            style={{ fontWeight: 600, fontSize: 22, color: themeColors.text }}
          >
            {data?.training?.name}
          </Text>
          <Text
            style={{ fontWeight: 400, fontSize: 15, color: themeColors.text }}
          >
            {data?.training?.description}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function StepEditCard({
  themeColors,
  data,
  isIncomplete,
  token,
}: {
  themeColors: any;
  data: any;
  isIncomplete: boolean;
  token: string;
  onPress?: () => void;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [exercise, setExercise] = useState<string>(
    data?.exercise?.id?.toString()
  );

  return (
    <View
      style={[
        globalStyles.flexc,
        { width: "100%", alignItems: "flex-start", position: "relative" },
      ]}
    >
      {isIncomplete && (
        <View
          style={[styles.cardWarning, { backgroundColor: themeColors.danger }]}
        >
          <Text style={{ color: "#ffffff", fontSize: 11 }}>Incompleto</Text>
        </View>
      )}
      <View
        style={[
          styles.stepBox,
          {
            backgroundColor: themeColors.secondary,
            shadowColor: themeColors.text,
          },
        ]}
      >
        <View
          style={[
            globalStyles.flexc,
            {
              width: "100%",
              height: "auto",
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <View
            style={[
              globalStyles.flexr,
              {
                width: "100%",
                height: "auto",
                justifyContent: "space-between",
                alignItems: "center",
              },
            ]}
          >
            <View style={[globalStyles.flexr, { gap: 10 }]}>
              <FontAwesome6
                name="dumbbell"
                size={12}
                color={themeColors.text}
              />
              <Text
                style={{
                  fontSize: 19,
                  color: themeColors.text,
                  fontWeight: 600,
                }}
              >
                {data?.name ? data?.name : "Sem nome"}
              </Text>
            </View>

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
              }}
              style={[
                styles.deleteExerciseBtn,
                { backgroundColor: themeColors.danger },
              ]}
            >
              <AntDesign name="delete" size={17} color={themeColors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View
        style={{
          width: "50%",
          height: 1,
          backgroundColor: themeColors.themeGrey,
          marginTop: 30,
          marginLeft: 10,
        }}
      ></View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: "100%",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    paddingBottom: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  plus: {
    width: "100%",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  trainingBox: {
    width: "100%",
    minHeight: 100,
    padding: 24,
    borderRadius: 16,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  stepBox: {
    width: "100%",
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 5,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    margin: 0,
  },
  stepBoxOpen: {
    width: "100%",
    paddingVertical: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    margin: 0,
    gap: 20,
  },
  serieBox: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    margin: 0,
    borderWidth: 1,
    position: "relative",
    paddingHorizontal: 7,
    paddingVertical: 20,
    borderRadius: 5,
  },
  cardWarning: {
    position: "absolute",
    top: -10,
    left: 20,
    zIndex: 9,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  trainingLogo: {
    width: 120,
    height: 100,
    borderRadius: 10,
    objectFit: "cover",
  },
  trainingBoxAvaliations: {
    position: "absolute",
    top: -15,
    right: 15,
  },
  trainingAvaliation: {
    paddingVertical: 2,
    paddingHorizontal: 13,
    borderRadius: 5,
    borderWidth: 1,
  },
  deleteExerciseBtn: {
    borderRadius: 200,
    padding: 5,
  },
});
