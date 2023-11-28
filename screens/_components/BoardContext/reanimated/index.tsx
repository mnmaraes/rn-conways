import React from 'react'
import {SharedValue} from 'react-native-reanimated'

export type SerializableBoardState = {
  size: [number, number]
  board: number[]
}

export type Size = {
  width: number
  height: number
}

export type BoardContextProps = {
  boardState: SharedValue<SerializableBoardState | null>
}

const BoardContext = React.createContext<BoardContextProps | null>(null)

export type SizeContextProps = {
  onSizeChanged: (size: Size) => void
}

const SizeContext = React.createContext<SizeContextProps | null>(null)

export type ContextProps = {
  timePerGen: number
  lastTickPerf: number
  genNumber: number
  firstStableGen: number | null
  stablePerf: number | null
}

const DashContext = React.createContext<ContextProps | null>(null)

type Props = Readonly<{
  state: SharedValue<SerializableBoardState | null>
  dashValues: ContextProps
  onSizeChanged: (size: Size) => void
  children: React.ReactNode
}>
export function BoardContainer({state, dashValues, onSizeChanged, children}: Props) {
  const sizeValue = React.useMemo(() => ({onSizeChanged}), [onSizeChanged])
  const boardValue = React.useMemo(() => ({boardState: state}), [state])

  return (
    <SizeContext.Provider value={sizeValue}>
      <BoardContext.Provider value={boardValue}>
        <DashContext.Provider value={dashValues}>{children}</DashContext.Provider>
      </BoardContext.Provider>
    </SizeContext.Provider>
  )
}

export function useBoardState() {
  const context = React.useContext(BoardContext)

  if (context === null) {
    throw new Error('useBoardState must be used within a BoardContainer')
  }

  return context
}

export function useSizeControls() {
  const context = React.useContext(SizeContext)

  if (context === null) {
    throw new Error('useSize must be used within a BoardContainer')
  }

  return context
}

export function useDashboardValues() {
  const context = React.useContext(DashContext)

  if (context === null) {
    throw new Error('useDashboardValues must be used within a BoardContainer')
  }

  return context
}
