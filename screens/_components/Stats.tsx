import React from 'react'
import {View, Text, StyleSheet} from 'react-native'
import _ from 'lodash'
import {formatDuration, intervalToDuration} from 'date-fns'
import {useBoardContext} from './BoardContext'

export function Stats() {
  const {boardState, timePerGen, genNumber, firstStableGen, stablePerf} = useBoardContext()

  const gps = 1000 / timePerGen

  return (
    <View style={styles.container}>
      <Stat label="Size" value={`${boardState.size[0]}x${boardState.size[1]}`} />
      <Stat label="gen/s" value={gps} />
      <Stat label="gen. #" value={genNumber} />
      <Stat label="gen to stable" value={firstStableGen ?? 'calculating'} />
      <Stat label="stable perf" value={stablePerf ?? 'calculating'} />
      <Stat
        label="Time to Stabilize"
        value={
          firstStableGen == null
            ? 'calculating'
            : formatDuration(
                intervalToDuration({
                  start: 0,
                  end: Math.round(timePerGen * firstStableGen),
                }),
              )
        }
      />
    </View>
  )
}

const formatValue = (value: number) => {
  if (value > 1000000) {
    return `${_.round(value / 1000000, 1)}m`
  }

  if (value > 1000) {
    return `${_.round(value / 1000, 1)}k`
  }

  return _.round(value, 1)
}

type StatProp = Readonly<{
  label: string
  value: string | number
}>
function Stat({label, value}: StatProp) {
  return (
    <View style={styles.statsContainer}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{typeof value === 'number' ? formatValue(value) : value}</Text>
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
