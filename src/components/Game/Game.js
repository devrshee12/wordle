import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Alert, ActivityIndicator} from 'react-native';
import { colors, CLEAR, ENTER, colorsToEmoji} from '../../constants';
import Keyboard from "../Keyboard"
import { useEffect, useState } from 'react';

import words from '../../words';
import styles from "./Game.styles"
import {copyArray, getDayOfTheYear, getDayKey} from "../../utils"
import AsyncStorage from '@react-native-async-storage/async-storage';
import EndScreen from '../EndScreen/EndScreen';
import Animated, {SlideInDown, SlideInLeft, ZoomIn, FlipInEasyY} from "react-native-reanimated"


const NUMBER_OF_TRIES = 6



const dayOfTheYear = getDayOfTheYear();
const dayKey = getDayKey();


// const game = {
//   day_1: {
//     rows: [[], []],
//     curRow: 4,
//     curCol: 2,
//     gameState: "won",
//   }
//   //......
// }



const Game = () => {
  // AsyncStorage.removeItem("@game");
  const word = words[dayOfTheYear];
  const letters = word.split("");
  const [rows, setRows] = useState(new Array(NUMBER_OF_TRIES).fill(new Array(letters.length).fill("")))
  const [curRow, setCurRow] = useState(0);
  const [curCol, setCurCol] = useState(0);
  const [gameState, setGameState] = useState("playing"); // won, lost, playing
  const [loaded, setLoaded] = useState(false);



  useEffect(() => {
    if(curRow > 0){
      checkGameState();
    }
  }, [curRow])

  useEffect(() => {
    if(loaded){
      persistState()
    }
  }, [rows, curRow, curCol, gameState])

  useEffect(() => {
    readData();
  }, [])


  const persistState = async() => {

    // write all the state variables in async storage
    
    const dataForToday = {
      rows,
      curRow,
      curCol,
      gameState
    }

    try{
      const existingStateString = await AsyncStorage.getItem("@game");
      const existingState = existingStateString ? JSON.parse(existingStateString) : {};

      existingState[dayKey] = dataForToday
      
      const dataString = JSON.stringify(existingState); // later JSON.parse(string)
      console.log("saving : ", dataString)
      await AsyncStorage.setItem("@game", dataString) 
    }
    catch(err){
      console.log("Failed to write data to async storage");
    }


  }


  const readData = async() => {
    const dataString = await AsyncStorage.getItem("@game");
    console.log(dataString)
    try{
      const data = JSON.parse(dataString);
      console.log("got data : ", data);
      console.log("day key : ", dayKey);
      const day = data[dayKey]
      setRows(day.rows);
      setCurCol(day.curCol);
      setCurRow(day.curRow);
      setGameState(day.gameState);
    }
    catch(err){
      console.log("could not parse the state", err);
    }
    setLoaded(true);
  }

  const checkGameState = () => {
    if(checkIfWon() && gameState !== "won"){
      setGameState("won");
    }else if(checkIfLost() && gameState !== "lost"){
      setGameState("lost");
    }
  }

  


  const checkIfWon = () => {
    const row = rows[curRow - 1];
    return row.every((letter, i) => letter === letters[i])

  }


  const checkIfLost = () => {
    return !checkIfWon() && curRow === rows.length;
  }


  const onKeyPressed = (key) => {
    if(gameState !== "playing"){
      return;
    }
     
    const updatedRows = copyArray(rows);


    if(key === CLEAR){
      const prevCol = curCol - 1;
      if(prevCol >= 0){
        updatedRows[curRow][prevCol] = "";
        setRows(updatedRows);
        setCurCol(prevCol); 
      }
      return;
    }

    if(key === ENTER){
      if(curCol === rows[0].length){
        setCurRow(curRow + 1);
        setCurCol(0);
      }



      return;
    }


    if(curCol < rows[0].length){
      updatedRows[curRow][curCol] = key;
      setRows(updatedRows);
      setCurCol(curCol + 1);
    }
  }

  const isCellActive = (row, col) => {
    return row === curRow && col === curCol;
  }


  const getCellBGColor = function(row, col){
    const letter = rows[row][col];
    // console.log("calling");
    // console.log(letter + " " + row + " " + col);
    if(row >= curRow){
      return colors.black;
    }
    if(letter === letters[col]){
      return colors.primary;
    }
    if(letters.includes(letter)){
      return colors.secondary
    }
    return colors.darkgrey
  } 



  const getAllLettersWithColor = (color) => {
    return rows.flatMap((row, i) => 
      row.filter((cell, j) => getCellBGColor(i, j) === color)
    )
  }

  const greenCaps = getAllLettersWithColor(colors.primary);
  const yellowCaps = getAllLettersWithColor(colors.secondary);
  const greyCaps = getAllLettersWithColor(colors.darkgrey);


  const getCellStyle = (i, j) => {
    return [styles.cell, {borderColor: (isCellActive(i, j) ? colors.grey: colors.darkgrey), backgroundColor: getCellBGColor(i, j)},]
  }


  if(!loaded){
    return (
      <ActivityIndicator/>
    )
  }

  if(gameState !== "playing"){
    return (<EndScreen won={gameState === 'won'} rows={rows} getCellBGColor={getCellBGColor}/>)
  }

  return (
    
      
    <>
    
        <ScrollView style={styles.map}>
        {
            rows.map((row, i) => {
            return (
                <Animated.View entering={SlideInLeft.delay(i * 30)} style={styles.row} key={`row-${i}`}> 
                {
                    row.map((letter, j) => {
                    return (
                      <>
                        {i < curRow && (<Animated.View entering={FlipInEasyY.delay(j * 100)} style={getCellStyle(i, j)} key={`cell-color-${i}-${j}`}>
                        <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
                        </Animated.View>)}
                        {i === curRow && !!letter && (<Animated.View entering={ZoomIn} style={getCellStyle(i, j)} key={`cell-active-${i}-${j}`}>
                        <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
                        </Animated.View>)}
                        {!letter && (<View style={getCellStyle(i, j)} key={`cell-${i}-${j}`}>
                        <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
                        </View>)}
                      </>
                    )
                    })
                }

                </Animated.View>
            )
            })
        }
        </ScrollView>
        <Keyboard onKeyPressed={onKeyPressed} 
        greenCaps={greenCaps} // ['a', 'b', 'c']
        yellowCaps={yellowCaps} 
        greyCaps={greyCaps}/>
    </>
    
  );
}





export default Game;