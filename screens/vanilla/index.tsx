import React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'
import {Grid} from '../_components/Grid'
import {Stats} from '../_components/Stats'
import {VanillaContainer} from './container'

function VanillaScreen() {
  return (
    <VanillaContainer>
      <>
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
      </>
    </VanillaContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: '#eee',
  },
})

export default VanillaScreen
