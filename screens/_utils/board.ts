import {BoardState} from './js/sparse-board/controls'

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
