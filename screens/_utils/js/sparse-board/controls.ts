export type SparseBoard = {
  size: [number, number]
  board: Set<number>
}

export function gameTick(boardState: SparseBoard): SparseBoard {
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
