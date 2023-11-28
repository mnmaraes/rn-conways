import React from 'react'
import {SharedValue, useSharedValue} from 'react-native-reanimated'
import {BoardContainer, SerializableBoardState, Size} from '../../_components/BoardContext/reanimated'
import {memoizedGameTick} from '../../_utils/js/sparse-board/controls'
import {findFirstStableState, getInitialBoardState} from '../../_utils/board'

function tick(boardState: SharedValue<SerializableBoardState | null>) {
  'worklet'
}

type Props = Readonly<{
  children: React.ReactNode
}>
export function ReanimatedContainer({children}: Props) {
  const [size, setSize] = React.useState<Size | null>(null)
  const boardState = useSharedValue<SerializableBoardState | null>(null)

  const lastTick = React.useRef<{time: number; tick: number; avg: number} | null>(null)
  const lastSize = React.useRef<Size | null>(null)

  const [lastTickPerf, setLastTickPerf] = React.useState<number>(0)
  const [timePerGen, setTimePerGen] = React.useState<number>(0)
  const [genNumber, setGenNumber] = React.useState<number>(0)
  const [firstStableGen, setFirstStableGen] = React.useState<number | null>(null)
  const [stablePerf, setStablePerf] = React.useState<number | null>(null)

  // We want to measure the time between ticks
  React.useEffect(() => {
    const interval = setInterval(() => {
      'worklet'
      if (boardState.value === null) {
        return
      }

      const state = memoizedGameTick({size: boardState.value.size, board: new Set(boardState.value.board)})

      boardState.value = {
        size: state.size,
        board: [...state.board],
      }
      // setGenNumber(i => i + 1)
    }, 1000 / 55) // Need to be careful here. If we set this too low, the app will freeze.
    // 55 is the highest value that will work on Simulator. Device will work up to 120, but a lot of the initial frames will be dropped.

    return () => {
      clearInterval(interval)
    }
  }, [boardState])

  // Calculate the average time per generation
  React.useEffect(() => {
    if (boardState == null || boardState.value?.board.size === 0) {
      return
    }

    if (lastTick.current === null) {
      lastTick.current = {time: performance.now(), tick: 0, avg: 0}
      return
    }

    const now = performance.now()
    const diff = now - lastTick.current.time

    lastTick.current = {
      time: now,
      tick: lastTick.current.tick + 1,
      avg:
        diff / (lastTick.current.tick + 1) +
        lastTick.current.avg * (lastTick.current.tick / (lastTick.current.tick + 1)),
    }

    setTimePerGen(lastTick.current.avg)
    setLastTickPerf(diff)
  }, [boardState])

  const resetBoardSize = React.useCallback(
    (newSize: Size) => {
      if (newSize.height === 0 || newSize.width === 0) {
        return
      }

      if (lastSize.current?.height === newSize.height || lastSize.current?.width === newSize.width) {
        return
      }

      lastSize.current = newSize

      if (boardState.value === null) {
        const newBoardState = getInitialBoardState(newSize)

        const {firstStableGen: stableGen, stablePerf: perf} = findFirstStableState(newBoardState) ?? {}

        boardState.value = {
          size: newBoardState.size,
          board: [...newBoardState.board],
        }
        setFirstStableGen(stableGen ?? null)
        setStablePerf(perf ?? null)
        return
      }

      // boardState.value = getNewBoardStateAfterResize(boardState.value, newSize)
    },
    [boardState],
  )

  const onSizeChanged = React.useCallback((newSize: Size) => {
    setSize({...newSize})
  }, [])

  React.useEffect(() => {
    if (size === null) {
      return
    }

    resetBoardSize(size)
  }, [size, resetBoardSize])

  const dashValues = React.useMemo(() => {
    return {
      timePerGen,
      lastTickPerf,
      genNumber,
      firstStableGen,
      stablePerf,
    }
  }, [firstStableGen, genNumber, lastTickPerf, stablePerf, timePerGen])

  return (
    <BoardContainer state={boardState} onSizeChanged={onSizeChanged} dashValues={dashValues}>
      {children}
    </BoardContainer>
  )
}
