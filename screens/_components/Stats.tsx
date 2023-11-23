import React from 'react'
import {View, Text, StyleSheet} from 'react-native'
import _ from 'lodash'
import {useBoardContext} from './BoardContext'

export function Stats() {
  const {boardState, timePerGen, genNumber} = useBoardContext()

  return (
    <View style={styles.container}>
      <Stat label="Size" value={`${boardState[0]?.length}x${boardState.length}`} />
      <Stat label="ms/gen" value={_.round(timePerGen)} />
      <Stat label="gen. #" value={genNumber} />
      {/* <Stat label="gen to stable" value={50} /> */}
      {/* <Stat label="stable perf" value={50} /> */}
    </View>
  )
}

type StatProp = Readonly<{
  label: string
  value: string | number
}>
function Stat({label, value}: StatProp) {
  return (
    <View style={styles.statsContainer}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 8,
  },
  statsContainer: {alignItems: 'center', marginHorizontal: 8, marginVertical: 4},
  label: {fontSize: 12, fontWeight: 'bold'},
  value: {fontSize: 12},
})
