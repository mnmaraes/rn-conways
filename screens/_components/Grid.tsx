import {useLayout} from '@react-native-community/hooks'
import React from 'react'
import {Dimensions, StyleSheet, View} from 'react-native'
import {useBoardContext} from './BoardContext'

const DEFAULT_SCALE = 10

function getDefaults(width: number, height: number) {
  const window = Dimensions.get('window')

  return {
    width: Math.round((width || window.width) / DEFAULT_SCALE),
    height: Math.round((height || window.height) / DEFAULT_SCALE),
  }
}

type Props = Readonly<{
  width?: number
  height?: number
}>
export function Grid({width, height}: Props) {
  const [size, setSize] = React.useState({
    width: width ?? 0,
    height: height ?? 0,
  })
  const {width: layoutWidth, height: layoutHeight, onLayout} = useLayout()

  const {boardState, onSizeChanged} = useBoardContext()

  React.useEffect(() => {
    const defaults = getDefaults(layoutWidth, layoutHeight)

    const newSize = {
      width: width ?? defaults.width,
      height: height ?? defaults.height,
    }

    setSize(oldSize => {
      if (oldSize.width === newSize.width && oldSize.height === newSize.height) {
        return oldSize
      }

      return newSize
    })
  }, [width, height, layoutWidth, layoutHeight, onSizeChanged])

  React.useEffect(() => {
    onSizeChanged(size)
  }, [onSizeChanged, size])

  const dynamicStyles = React.useMemo(() => {
    if (size.width === 0 || size.height === 0) {
      return styles
    }

    const widthPerCell = layoutWidth / size.width
    const heightPerCell = layoutHeight / size.height

    const cellSize = Math.min(widthPerCell * 0.8, heightPerCell * 0.8)

    const verticalGap = (layoutHeight - cellSize * size.height) / (size.height - 1)
    const horizontalGap = (layoutWidth - cellSize * size.width) / (size.width - 1)

    const gap = Math.min(verticalGap, horizontalGap)

    const verticalPadding = layoutHeight - cellSize * size.height - gap * (size.height - 1)
    const horizontalPadding = layoutWidth - cellSize * size.width - gap * (size.width - 1)

    // We need to disable the `no-shadow` rule here so it won't conflict with the `no-unused-styles` rule
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const dynamicStyles = StyleSheet.create({
      gridContainer: {
        ...styles.gridContainer,
        gap: gap,
        paddingVertical: verticalPadding / 2,
      },
      gridRow: {
        ...styles.gridRow,
        gap: gap,
        paddingHorizontal: horizontalPadding / 2,
      },
    })

    return dynamicStyles
  }, [size, layoutWidth, layoutHeight])

  if (boardState == null || boardState.board.size === 0) {
    return null
  }

  return (
    <View style={dynamicStyles.gridContainer} onLayout={onLayout}>
      {[...Array(size.height)].map((_, i) => {
        return (
          <View key={i} style={dynamicStyles.gridRow}>
            {[...Array(size.width)].map((__, j) => {
              return (
                <View
                  key={j}
                  style={boardState.board.has(i * boardState.size[0] + j) ? styles.livingCell : styles.deadCell}
                />
              )
            })}
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  gridContainer: {
    flex: 1,
  },
  gridRow: {
    flex: 1,

    flexDirection: 'row',
  },
  livingCell: {
    flex: 1,

    backgroundColor: 'black',
  },
  deadCell: {
    flex: 1,

    backgroundColor: 'white',
  },
})
