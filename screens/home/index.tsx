import React from 'react'
import {View, Text, StyleSheet, TouchableHighlight} from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import _ from 'lodash'
import {useNavigation} from '@react-navigation/native'

type Flavor = 'vanilla' | 'zustand' | 'worklets' | 'wasm'

const FLAVORS: Flavor[] = ['vanilla', 'zustand', 'wasm']

function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Choose your flavor:</Text>
      {FLAVORS.map(flavor => (
        <RowContainer key={flavor} label={flavor} />
      ))}
    </View>
  )
}

function RowContainer({label}: Readonly<{label: string}>) {
  const navigation = useNavigation()

  return (
    <TouchableHighlight
      underlayColor={'lightgray'}
      onPress={() => {
        switch (label) {
          case 'vanilla':
            navigation.navigate('Vanilla')
            break
          case 'zustand':
            navigation.navigate('Zustand')
            break
          default:
            navigation.navigate('ComingSoon')
            break
        }
      }}>
      <View style={styles.rowContainer}>
        <Text>{_.capitalize(label)}</Text>
        <MaterialIcons name="chevron-right" />
      </View>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    paddingVertical: 12,
    paddingLeft: 8,
    paddingRight: 16,
    marginLeft: 8,

    borderWidth: 1,
    borderColor: 'transparent',
    borderBottomColor: 'lightgray',
  },
})

export default HomeScreen
