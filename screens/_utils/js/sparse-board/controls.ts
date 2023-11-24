export type BoardState = {
  size: [number, number]
  board: Set<number>
}

export function gameTick(boardState: BoardState): BoardState {
  const newBoardState = new Set<number>()
  const sparseCounter = new Map<number, number>()

  const [width, height] = boardState.size

  const defaultDeltas = [-width - 1, -width, -width + 1, -1, 1, width - 1, width, width + 1]
  const firstColDeltas = [-width, -width + 1, 1, width, width + 1]
  const lastColDeltas = [-width - 1, -width, -1, width - 1, width]

  for (const position of boardState.board) {
    const col = position % width

    let deltas = defaultDeltas
    switch (col) {
      case 0:
        deltas = firstColDeltas
        break
      case width - 1:
        deltas = lastColDeltas
        break
    }

    for (const delta of deltas) {
      const neighborPosition = position + delta

      if (neighborPosition < 0 || neighborPosition >= width * height) {
        continue
      }

      // Increment the neighbor count
      sparseCounter.set(neighborPosition, (sparseCounter.get(neighborPosition) ?? 0) + 1)
    }
  }

  for (const position of sparseCounter.keys()) {
    const neighbors = sparseCounter.get(position)!

    if (neighbors > 3 || neighbors < 2) {
      continue
    }

    if (neighbors === 3) {
      newBoardState.add(position)
      continue
    }

    const isAlive = boardState.board.has(position)

    if (isAlive) {
      newBoardState.add(position)
    }
  }

  return {
    size: boardState.size,
    board: newBoardState,
  }
}

const TRANSITIONS_CACHE = new Map<string, BoardState>()

export function memoizedGameTick(boardState: BoardState): BoardState {
  const key = stringifyBoard(boardState)

  if (!TRANSITIONS_CACHE.has(key)) {
    TRANSITIONS_CACHE.set(key, gameTick(boardState))
  }

  return TRANSITIONS_CACHE.get(key)!
}

export function stringifyBoard(board: BoardState): string {
  return `${board.size[0]},${board.size[1]};${[...board.board].join(',')}`
}

export function boardFromString(boardString: string): BoardState {
  const [sizeString, encodedBoard] = boardString.split(';')
  const [width, height] = sizeString.split(',').map(Number)

  const board = new Set<number>()

  for (const position of encodedBoard.split(',').map(Number)) {
    board.add(position)
  }

  return {
    size: [width, height],
    board,
  }
}
