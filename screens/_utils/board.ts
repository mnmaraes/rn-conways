import _ from 'lodash'

const patterns = {
  methuseleah: {
    acorn: require('../../patterns/methuselah/acorn.json'),
    bunnies: require('../../patterns/methuselah/bunnies.json'),
  },
  oscillator: {
    blocker: require('../../patterns/oscillator/blocker.json'),
    pentadecathlon: require('../../patterns/oscillator/pentadecathlon.json'),
  },
}

export function randomizeBoard(board: boolean[][], expectedDensity = 0.5) {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      board[i][j] = Math.random() < expectedDensity
    }
  }
}

const PATTERN_SAMPLER = [
  patterns.methuseleah.acorn,
  patterns.methuseleah.bunnies,
  patterns.oscillator.blocker,
  patterns.oscillator.pentadecathlon,
]

export function randomizeBoardWithPatterns(board: boolean[][], numberOfPatterns = board.length) {
  for (let i = 0; i < numberOfPatterns; i++) {
    const pattern = _.sample(PATTERN_SAMPLER)

    const y = Math.floor(Math.random() * board.length)
    const x = Math.floor(Math.random() * board[0].length)

    for (let j = 0; j < pattern.length; j++) {
      for (let k = 0; k < pattern[0].length; k++) {
        if (y + j >= board.length || x + k >= board[0].length) {
          continue
        }

        board[y + j][x + k] = pattern[j][k]
      }
    }
  }
}
