import React from 'react'
import {create} from 'zustand'
import {BoardState, memoizedGameTick} from '../../_utils/js/sparse-board/controls'
import {Size} from '../../_components/BoardContext/plain'
import {findFirstStableState, getInitialBoardState} from '../../_utils/board'

type BoardStoreState = {
  boardState: BoardState | null
  timePerGen: number
  lastTickPerf: number
  genNumber: number
  firstStableGen: number | null
  stablePerf: number | null
  tick: () => void
  onSizeChanged: (size: Size) => void
}

export const useBoardStateStore = create<BoardStoreState>((set, get) => ({
  boardState: null,
  timePerGen: 0,
  lastTickPerf: 0,
  genNumber: 0,
  firstStableGen: null,
  stablePerf: null,
  tick: () => {
    set(({boardState, genNumber}) => {
      if (boardState === null) {
        return {}
      }

      return {boardState: memoizedGameTick(boardState), genNumber: genNumber + 1}
    })
  },
  onSizeChanged: (size: Size) => {
    const state = get()

    if (
      size.width === 0 ||
      size.height === 0 ||
      (size.width === state.boardState?.size[0] && size.height === state.boardState?.size[1])
    ) {
      // Do nothing. New size is invalid or unchanged
      return
    }

    if (state.boardState === null) {
      const newBoardState = getInitialBoardState(size)

      const {firstStableGen: stableGen, stablePerf: perf} = findFirstStableState(newBoardState) ?? {}

      set({boardState: newBoardState, firstStableGen: stableGen ?? null, stablePerf: perf ?? null})
      return
    }

    const {
      boardState: {
        size: [width, height],
      },
    } = state

    if (width === size.width && height === size.height) {
      return
    }
  },
}))

type Props = Readonly<{
  children: React.ReactNode
}>
export function ZustandContainer({children}: Props) {
  const boardState = useBoardStateStore(state => state.boardState)
  const tick = useBoardStateStore(state => state.tick)

  const lastTick = React.useRef<{time: number; tick: number; avg: number} | null>(null)

  React.useEffect(() => {
    const interval = setInterval(() => {
      tick()
    }, 1)

    return () => {
      clearInterval(interval)
    }
  }, [tick])

  // Calculate the average time per generation
  React.useEffect(() => {
    if (boardState == null || boardState.board.size === 0) {
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

    useBoardStateStore.setState({
      timePerGen: lastTick.current.avg,
      lastTickPerf: diff,
    })
  }, [boardState])

  return <>{children}</>
}
