export function gameTick(boardState: boolean[][]) {
  const newBoardState = [...boardState.map(row => Array(row.length).fill(false))]
  const sparseCounter: {[col: number]: {[row: number]: {isAlive: boolean; neighbors: number}}} = {}

  for (let i = 0; i < boardState.length; i++) {
    for (let j = 0; j < boardState[i].length; j++) {
      if (!boardState[i][j]) {
        continue
      }

      // Increment neighbors' counts
      for (let k = -1; k <= 1; k++) {
        for (let l = -1; l <= 1; l++) {
          const x = j + k
          const y = i + l

          if (x < 0 || x >= boardState[i].length || y < 0 || y >= boardState.length) {
            continue
          }

          if (k === 0 && l === 0) {
            continue
          }

          if (!sparseCounter[y]) {
            sparseCounter[y] = {}
          }

          if (!sparseCounter[y][x]) {
            sparseCounter[y][x] = {
              isAlive: false,
              neighbors: 0,
            }
          }

          sparseCounter[y][x].neighbors++
        }
      }

      // Set self to alive
      if (!sparseCounter[i]) {
        sparseCounter[i] = {}
      }

      if (!sparseCounter[i][j]) {
        sparseCounter[i][j] = {
          isAlive: true,
          neighbors: 0,
        }
      } else {
        sparseCounter[i][j].isAlive = true
      }
    }
  }

  // Get new board state
  Object.keys(sparseCounter).forEach(iStr => {
    const i = Number(iStr)

    const row = sparseCounter[i]

    Object.keys(row).forEach(jStr => {
      const j = Number(jStr)

      const {isAlive, neighbors} = row[j]

      if ((!isAlive && neighbors === 3) || (isAlive && (neighbors === 2 || neighbors === 3))) {
        newBoardState[i][j] = true
      }
    })
  })

  return newBoardState
}
