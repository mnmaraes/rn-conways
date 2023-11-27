import React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'
import {Grid} from '../../_components/Grid/zustand'
import {Stats} from '../../_components/Stats/zustand'
import {ZustandContainer} from './state'

function ZustandScreen() {
  return (
    <ZustandContainer>
      <Stats />
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        maximumZoomScale={100}
        contentContainerStyle={styles.container}>
        <View style={styles.container}>
          <Grid height={70} width={39} />
        </View>
      </ScrollView>
    </ZustandContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: '#eee',
  },
})

export default ZustandScreen
