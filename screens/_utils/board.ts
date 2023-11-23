import _ from 'lodash'

const patterns = {
  methuseleah: {
    acorn: require('../../patterns/methuselah/acorn.json'),
    bunnies: require('../../patterns/methuselah/bunnies.json'),
  },
  oscillator: {
    blocker: require('../../patterns/oscillator/blocker.json'),
    pentadecathlon: require('../../patterns/oscillator/pentadecathlon.json'),
  },
}

const getBoardSizeKey = (board: boolean[][], expectedDensity: number) =>
  `${board.length}x${board[0].length}:${expectedDensity}`

const BOARD_CACHE: Record<string, boolean[][]> = {}

export function lazilyLoadInitialBoard(board: boolean[][], expectedDensity = 0.5) {
  const key = getBoardSizeKey(board, expectedDensity)

  if (BOARD_CACHE[key] == null) {
    BOARD_CACHE[key] = randomizeBoard(board, expectedDensity)
  }

  return BOARD_CACHE[key]
}

export function randomizeBoard(board: boolean[][], expectedDensity = 0.5) {
  const newBoard = _.cloneDeep(board)

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      newBoard[i][j] = Math.random() < expectedDensity
    }
  }

  return newBoard
}

const PATTERN_SAMPLER = [
  patterns.methuseleah.acorn,
  patterns.methuseleah.bunnies,
  patterns.oscillator.blocker,
  patterns.oscillator.pentadecathlon,
]

export function randomizeBoardWithPatterns(board: boolean[][], numberOfPatterns = board.length) {
  for (let i = 0; i < numberOfPatterns; i++) {
    const pattern = _.sample(PATTERN_SAMPLER)

    const y = Math.floor(Math.random() * board.length)
    const x = Math.floor(Math.random() * board[0].length)

    for (let j = 0; j < pattern.length; j++) {
      for (let k = 0; k < pattern[0].length; k++) {
        if (y + j >= board.length || x + k >= board[0].length) {
          continue
        }

        board[y + j][x + k] = pattern[j][k]
      }
    }
  }
}
