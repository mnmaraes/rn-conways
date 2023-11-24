import {BoardState} from './sparse-board/controls'

export function printBoards(a: BoardState, b: BoardState) {
  const range = [...Array(a.size[0]).keys()]
  const [width, height] = a.size

  for (let i = 0; i < height; i++) {
    console.log(
      range.map(j => (a.board.has(i * width + j) ? 1 : 0)).join(''),
      ' | ',
      range.map(j => (b.board.has(i * width + j) ? 1 : 0)).join(''),
    )
  }
}

export function areBoardsEqual(boardState1: BoardState, boardState2: BoardState) {
  if (boardState1.board.size !== boardState2.board.size) {
    return false
  }

  for (const position of boardState1.board) {
    if (!boardState2.board.has(position)) {
      return false
    }
  }

  return true
}
