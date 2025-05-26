import AntDesign from "@expo/vector-icons/AntDesign";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View, ViewProps } from "react-native";
import { MFSelectSort, MFTextInput } from "./inputs";

interface MFDefaultCardProps extends ViewProps {
  themeColors?: any;
  search: string;
  sort: string;
  setSearch: (value: string) => void;
  setSort: (value: string) => void;
  sortOptions: { value: string; label: string; icon?: React.ReactNode }[];
}

export default function MFFilterSortBox({
  themeColors,
  search,
  sort,
  setSearch,
  setSort,
  sortOptions,
}: MFDefaultCardProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  function setSortFilter(string: string) {
    if (string) {
      setSort(string);
      setIsOpen(false);
    }
  }

  return (
    <View style={styles.box}>
      <View style={styles.search}>
        <MFTextInput
          themeColors={themeColors}
          placeholder="Buscar"
          value={search}
          onChangeText={setSearch}
          icon={
            <AntDesign
              name="search1"
              size={24}
              color={themeColors.textSecondary}
            />
          }
          error={""}
        ></MFTextInput>
      </View>
      <View style={styles.sort}>
        <TouchableOpacity onPress={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <AntDesign name="menu-unfold" size={30} color={themeColors.text} />
          ) : (
            <AntDesign name="menu-fold" size={30} color={themeColors.text} />
          )}
        </TouchableOpacity>

        {isOpen && (
          <View
            style={[styles.sortOpen, { backgroundColor: themeColors.grey }]}
          >
            <MFSelectSort
              themeColors={themeColors}
              sort={sort}
              setSort={setSortFilter}
              sortOptions={sortOptions}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    gap: 10,
  },
  search: {
    width: "80%",
  },
  sort: {
    width: "15%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 17,
    position: "relative",
  },
  sortOpen: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 15,
    elevation: 6,
    marginTop: 40,
    marginRight: 30,
  },
});
