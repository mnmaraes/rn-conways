export const BOARD_LOOKUP = (function buildLoookup() {
  const lookup: {[char: string]: [boolean, boolean, boolean, boolean]} = {}

  const max = Math.pow(2, 4)

  for (let i = 0; i < max; i++) {
    const key = i.toString(16)

    // eslint-disable-next-line no-bitwise
    const value = [...new Array(4)].map((_, index) => (i & (1 << index)) !== 0) as [boolean, boolean, boolean, boolean]

    lookup[key] = value
  }

  return lookup
})()

export const REVERSE_BOARD_LOOKUP = (function buildLoookup() {
  const lookup: {[value: string]: string} = {}

  const max = Math.pow(2, 4)

  for (let i = 0; i < max; i++) {
    const key = [...new Array(4)]
      // eslint-disable-next-line no-bitwise
      .map((_, index) => ((i & (1 << index)) !== 0 ? '1' : '0'))
      .reverse()
      .join('')

    const value = i.toString(16)

    lookup[key] = value
  }

  return lookup
})()

export function mapAlive(
  stringBoard: string,
  onAlive: (x: number, y: number) => void,
  onBoardSetup?: (width: number, height: number) => void,
) {
  const [size, board] = stringBoard.split(';')

  const [width, height] = size.split(',').map(Number)

  onBoardSetup?.(width, height)

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

    if (c === '0') {
      strIndex++
      boardIndex += 4
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
        onAlive(x, y)
      }
    })

    strIndex++
    boardIndex += 4
  }
}

export function gameTick(boardState: string) {
  const sparseCounter: {[position: number]: {isAlive: boolean; neighbors: number}} = {}

  let width = 0
  let height = 0

  mapAlive(
    boardState,
    (j, i) => {
      for (let k = -1; k <= 1; k++) {
        for (let l = -1; l <= 1; l++) {
          const row = i + k
          const col = j + l

          if (row < 0 || row >= height || col < 0 || col >= width) {
            continue
          }

          const position = row * width + col

          // If this is the current cell's position, set it to alive
          if (k === 0 && l === 0) {
            if (!sparseCounter[position]) {
              sparseCounter[position] = {
                isAlive: true,
                neighbors: 0,
              }
            } else {
              sparseCounter[position].isAlive = true
            }

            continue
          }

          // Otherwise, increment the neighbor count
          if (!sparseCounter[position]) {
            sparseCounter[position] = {
              isAlive: false,
              neighbors: 1,
            }
          } else {
            sparseCounter[position].neighbors++
          }
        }
      }
    },
    (w, h) => {
      width = w
      height = h
    },
  )

  const alivePositions: number[] = []

  Object.keys(sparseCounter).forEach(positionStr => {
    const position = Number(positionStr)

    const {isAlive, neighbors} = sparseCounter[position]

    if ((!isAlive && neighbors === 3) || (isAlive && (neighbors === 2 || neighbors === 3))) {
      alivePositions.push(position)
    }
  })

  const visited: number[] = []
  const aliveSet = new Set(alivePositions)

  let lastPosition = -1

  let newState = ''
  for (let i = 0; i < alivePositions.length; i++) {
    const position = alivePositions[i]

    if (visited.includes(position)) {
      continue
    }

    if (position - lastPosition > 4) {
      const skipped = Math.floor((position - lastPosition - 1) / 4)
      if (skipped > 3) {
        newState += `(${skipped})`
      } else {
        newState += '0'.repeat(skipped)
      }
    }

    const start = Math.floor(position / 4) * 4

    const binaryString = [...new Array(4)]
      .map((_, index) => start + index)
      .reverse()
      .map(index => {
        if (index < position) {
          return '0'
        }

        visited.push(index)

        return aliveSet.has(index) ? '1' : '0'
      })
      .join('')

    newState += REVERSE_BOARD_LOOKUP[binaryString]
    lastPosition = start + 3
  }

  const endPosition = width * height - 1

  if (endPosition - lastPosition > 4) {
    const skipped = Math.floor((endPosition - lastPosition) / 4)
    if (skipped > 3) {
      newState += `(${skipped})`
    } else {
      newState += '0'.repeat(skipped)
    }
  }

  return `${width},${height};${newState}`
}
