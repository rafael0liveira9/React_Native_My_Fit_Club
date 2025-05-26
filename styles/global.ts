import {
  StyleSheet
} from "react-native";

export const globalStyles = StyleSheet.create({
  flexr: {
    display:'flex',
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "center",
  },
  flexc: {
    display:'flex',
    flexDirection: 'column',
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    height: 70,
    backgroundColor: "#f5f5f5",
    display:'flex',
    alignItems: "center",
    justifyContent: "center",
    position: 'relative'
  },
  stackHeader: {
    height: 70,
    display: 'flex',
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop:10
  },
  stackBackButton: {
    display: 'flex',
    flexDirection:'row',
    alignItems: "center",
    justifyContent: "center",
    gap: 20
  },
  headerImageBox: {
    width: '100%',
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    display: 'flex',
  },
  headerLogo: {
    objectFit: 'contain',
    width:60,
  },
  headerThemeBtn: {
    position: 'absolute',
    top: 20,
    right:15
  },
  headerInfoBox: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 9,
    marginTop: 50,
    marginRight: 30
  },
  headerInfoPhoto: {
    width: 220,
    height: 'auto',
    alignItems: "center",
    justifyContent: "center",
    display: 'flex',
  },
  headerPhoto: {
    width: 70,
    height: 70,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    display: 'flex',
  },
  headerInfoContent: {
    width: 220,
    height: 'auto',
    alignItems: "flex-start",
    justifyContent: "flex-start",
    display: 'flex',
    flexDirection: 'column',
    padding: 10,
    gap: 10,
    marginTop:20
  },
  headerInfoText: {
    alignItems: "center",
    justifyContent: "center",
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    textAlign:'center'
  },
  themeBtnBox: {
    width: 220,
    alignItems: "flex-end",
    justifyContent: "flex-start",
    display: 'flex',
    flexDirection: 'row'
  }
  });
  