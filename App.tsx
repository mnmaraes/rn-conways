import React from 'react'
import {NavigationContainer} from '@react-navigation/native'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import HomeScreen from './screens/home'
import ComingSoonScreen from './screens/coming-soon'
import VanillaScreen from './screens/vanilla'
import ZustandScreen from './screens/state-options/zustand'
import ReanimatedScreen from './screens/ui/reanimated'

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Vanilla" component={VanillaScreen} />
        <Stack.Screen name="Zustand" component={ZustandScreen} />
        <Stack.Screen name="Reanimated" component={ReanimatedScreen} />
        <Stack.Screen name="ComingSoon" component={ComingSoonScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
