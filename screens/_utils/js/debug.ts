export function printBoards(a: boolean[][], b: boolean[][]) {
  for (let i = 0; i < a.length; i++) {
    console.log(a[i].map(cell => (cell ? 1 : 0)).join(''), ' | ', b[i].map(cell => (cell ? 1 : 0)).join(''))
  }
}

export function boardInfo(boardState: boolean[][]) {
  let countAlive = 0
  let firstAlive = null
  let lastAlive = null

  for (let i = 0; i < boardState.length; i++) {
    for (let j = 0; j < boardState[i].length; j++) {
      if (boardState[i][j]) {
        countAlive++

        if (firstAlive === null) {
          firstAlive = [i, j]
        }

        lastAlive = [i, j]
      }
    }
  }

  return {
    countAlive,
    firstAlive,
    lastAlive,
  }
}

export function areBoardsEqual(boardState1: boolean[][], boardState2: boolean[][]) {
  if (boardState1.length !== boardState2.length) {
    return false
  }

  for (let i = 0; i < boardState1.length; i++) {
    if (boardState1[i].length !== boardState2[i].length) {
      return false
    }

    for (let j = 0; j < boardState1[i].length; j++) {
      if (boardState1[i][j] !== boardState2[i][j]) {
        return false
      }
    }
  }

  return true
}
