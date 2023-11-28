import {Size} from '../_components/BoardContext/plain'
import {BoardState, memoizedGameTick, stringifyBoard} from './js/sparse-board/controls'

const getBoardSizeKey = (board: BoardState, expectedDensity: number) =>
  `${board.size[1]}x${board.size[0]}:${expectedDensity}`

const BOARD_CACHE: Record<string, BoardState> = {}

export function lazilyLoadInitialBoard(board: BoardState, expectedDensity = 0.5) {
  const key = getBoardSizeKey(board, expectedDensity)

  if (BOARD_CACHE[key] == null) {
    BOARD_CACHE[key] = randomizeBoard(board, expectedDensity)
  }

  return BOARD_CACHE[key]
}

export function randomizeBoard(board: BoardState, expectedDensity = 0.5): BoardState {
  const newState = new Set<number>()

  const [width, height] = board.size

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (Math.random() < expectedDensity) {
        newState.add(i * width + j)
      }
    }
  }

  return {
    size: board.size,
    board: newState,
  }
}

export function getInitialBoardState(size: Size): BoardState {
  return lazilyLoadInitialBoard({
    size: [size.width, size.height],
    board: new Set<number>(),
  })
}

export function getNewBoardStateAfterResize(boardState: BoardState, newSize: Size): BoardState {
  const newState = new Set<number>()

  for (const position of boardState.board) {
    const col = position % boardState.size[0]
    const row = Math.floor(position / boardState.size[0])

    newState.add(row * newSize.width + col)
  }

  return {
    size: [newSize.width, newSize.height],
    board: newState,
  }
}

export function findFirstStableState(boardState: BoardState) {
  const pastStatesMap: {[board: string]: number} = {}

  const start = performance.now()
  let newBoardState = boardState

  let tick = 0

  while (true) {
    newBoardState = memoizedGameTick(newBoardState)

    const boardString = stringifyBoard(newBoardState)

    const firstStableIndex = pastStatesMap[boardString]

    if (firstStableIndex != null) {
      return {
        firstStableGen: firstStableIndex,
        stablePerf: performance.now() - start,
      }
    }

    pastStatesMap[boardString] = ++tick
  }
}
