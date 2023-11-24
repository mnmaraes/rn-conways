import {BOARD_LOOKUP} from './string-board/control'

export function stringToFullBoard(stringBoard: string) {
  const [size, board] = stringBoard.split(';')

  const [width, height] = size.split(',').map(Number)

  const fullBoard = [...new Array(height)].map(() => new Array(width).fill(false))

  let boardIndex = 0
  let strIndex = 0

  const boardSize = width * height

  while (strIndex < board.length) {
    const c = board[strIndex]

    if (c === '(') {
      let numStr = ''
      while (board[++strIndex] !== ')') {
        numStr += board[strIndex]
      }

      const numZeroes = Number(numStr)

      strIndex++
      boardIndex += numZeroes * 4
      continue
    }

    const uncompressed = BOARD_LOOKUP[c]

    uncompressed.forEach((isAlive, index) => {
      if (!isAlive) {
        return
      }

      const position = boardIndex + index
      const x = position % width
      const y = Math.floor(position / width)

      if (position < boardSize) {
        fullBoard[y][x] = isAlive
      }
    })

    strIndex++
    boardIndex += 4
  }

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
