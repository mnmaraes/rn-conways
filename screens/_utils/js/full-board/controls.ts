function cellState(boardState: boolean[][], x: number, y: number) {
  const isAlive = boardState[y][x]

  let neighbors = 0
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const neighborX = x + i
      const neighborY = y + j

      if (neighborX < 0 || neighborX >= boardState[0].length || neighborY < 0 || neighborY >= boardState.length) {
        continue
      }

      if (i === 0 && j === 0) {
        continue
      }

      if (boardState[neighborY][neighborX]) {
        neighbors++
      }
    }
  }

  return {
    isAlive,
    neighbors,
  }
}

export function gameTick(boardState: boolean[][]) {
  const newState = []

  for (let i = 0; i < boardState.length; i++) {
    const newRow = []
    for (let j = 0; j < boardState[0].length; j++) {
      const {isAlive, neighbors} = cellState(boardState, j, i)

      if (!isAlive && neighbors === 3) {
        newRow.push(true)
      } else if (isAlive && (neighbors < 2 || neighbors > 3)) {
        newRow.push(false)
      } else {
        newRow.push(isAlive)
      }
    }

    newState.push(newRow)
  }

  return newState
}
