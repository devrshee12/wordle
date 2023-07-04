import { StyleSheet } from "react-native";
import { colors } from "../../constants";

export default StyleSheet.create({
  
    map:{
      alignSelf: "stretch",
      marginVertical: 20,
      // height: 100 
    },
    row:{
      flexDirection: "row",
      alignSelf: "stretch",
      justifyContent: "center"
  
    },
    cell:{
      // backgroundColor: "green",
      borderWidth: 3 ,
      borderColor: colors.darkgrey,
      flex: 1,
      // width: 30,
      maxWidth: 70,
      aspectRatio: 1,
      height: 30,
      margin: 3,
      justifyContent: "center",
      alignItems: "center"
    },
    cellText: {
      color: colors.lightgrey,
      fontWeight: "bold",
      fontSize: 28,
  
    }
  
  
  });