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

export function gameTick(boardState: string) {
  return boardState
}
