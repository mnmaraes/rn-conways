import React from 'react'
import {BoardState} from '../../../_utils/js/sparse-board/controls'

export type Size = {
  width: number
  height: number
}

export type ContextProps = {
  boardState: BoardState
  timePerGen: number
  lastTickPerf: number
  genNumber: number
  firstStableGen: number | null
  stablePerf: number | null
  onSizeChanged: (size: Size) => void
}

const BoardContext = React.createContext<ContextProps | null>(null)

type Props = Readonly<{
  value: ContextProps
  children: React.ReactNode
}>
export function BoardContainer({value, children}: Props) {
  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
}

export function useBoardContext() {
  const context = React.useContext(BoardContext)

  if (context === null) {
    throw new Error('useOnSizeChanged must be used within a BoardContext')
  }

  return context
}
