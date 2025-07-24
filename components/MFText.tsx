import { Text as RNText } from "react-native";

export function MFText(props: any) {
  return (
    <RNText {...props} style={[{ fontFamily: "SpaceMono" }, props.style]}>
      {props.children}
    </RNText>
  );
}
