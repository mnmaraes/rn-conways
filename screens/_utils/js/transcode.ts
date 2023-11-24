import {SparseBoard} from './sparse-board/controls'
import {mapAlive} from './string-board/controls'

export function stringToFullBoard(stringBoard: string) {
  let fullBoard: boolean[][] = []

  mapAlive(
    stringBoard,
    (x, y) => {
      fullBoard[y][x] = true
    },
    (width, height) => {
      fullBoard = [...new Array(height)].map(() => new Array(width).fill(false))
    },
  )

  return fullBoard
}

export function fullBoardToString(fullBoard: boolean[][]) {
  let stringBoard = ''

  const height = fullBoard.length
  const width = fullBoard[0].length

  stringBoard += `${width},${height};`

  let shift = 0
  let num = 0

  let numZeroes = 0

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (fullBoard[i][j]) {
        // eslint-disable-next-line no-bitwise
        num |= 1 << shift
      }

      shift++

      const shouldAppend = shift % 4 === 0

      if (!shouldAppend) {
        continue
      }

      if (num === 0) {
        numZeroes++
        shift = 0
        continue
      }

      if (numZeroes > 3) {
        stringBoard += `(${numZeroes})`
        numZeroes = 0
      }

      if (numZeroes > 0) {
        stringBoard += '0'.repeat(numZeroes)
        numZeroes = 0
      }

      stringBoard += num.toString(16)
      shift = 0
      num = 0
    }
  }

  if (numZeroes > 3) {
    stringBoard += `(${numZeroes})`
    numZeroes = 0
  }

  if (numZeroes > 0) {
    stringBoard += '0'.repeat(numZeroes)
    numZeroes = 0
  }

  if (num !== 0) {
    stringBoard += num.toString(16)
  }

  return stringBoard
}

export function fullBoardToSparseBoard(fullBoard: boolean[][]): SparseBoard {
  const board = new Set<number>()

  for (let i = 0; i < fullBoard.length; i++) {
    const row = fullBoard[i]

    for (let j = 0; j < row.length; j++) {
      if (row[j]) {
        board.add(i * row.length + j)
      }
    }
  }

  return {
    size: [fullBoard[0].length, fullBoard.length],
    board,
  }
}

export function sparseBoardToFullBoard(sparseBoard: SparseBoard): boolean[][] {
  const fullBoard = [...new Array(sparseBoard.size[1])].map(() => new Array(sparseBoard.size[0]).fill(false))

  for (const position of sparseBoard.board) {
    const col = position % sparseBoard.size[0]
    const row = Math.floor(position / sparseBoard.size[0])

    fullBoard[row][col] = true
  }

  return fullBoard
}
