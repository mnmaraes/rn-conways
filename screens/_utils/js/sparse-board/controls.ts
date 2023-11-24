export type SparseBoard = {
  size: [number, number]
  board: Set<number>
}

export function gameTick(boardState: SparseBoard): SparseBoard {
  const newBoardState: number[] = []
  const sparseCounter: {[position: number]: number} = {}

  const [width, height] = boardState.size

  for (const position of boardState.board) {
    const col = position % width
    const row = Math.floor(position / width)

    for (let k = -1; k <= 1; k++) {
      for (let l = -1; l <= 1; l++) {
        const neighborRow = row + k
        const neighborCol = col + l

        if (neighborRow < 0 || neighborRow >= height || neighborCol < 0 || neighborCol >= width) {
          continue
        }

        const neighborPosition = neighborRow * width + neighborCol

        // If this is the current cell's position, do nothing
        if (neighborPosition === position) {
          continue
        }

        // Increment the neighbor count
        if (!sparseCounter[neighborPosition]) {
          sparseCounter[neighborPosition] = 1
        } else {
          sparseCounter[neighborPosition] += 1
        }
      }
    }
  }

  Object.keys(sparseCounter).forEach(positionStr => {
    const position = Number(positionStr)

    const isAlive = boardState.board.has(position)
    const neighbors = sparseCounter[position]

    if ((!isAlive && neighbors === 3) || (isAlive && (neighbors === 2 || neighbors === 3))) {
      newBoardState.push(position)
    }
  })

  return {
    size: boardState.size,
    board: new Set(newBoardState),
  }
}
