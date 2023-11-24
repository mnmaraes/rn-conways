import React from 'react'
import {lazilyLoadInitialBoard} from '../_utils/board'
import {BoardContainer, Size} from '../_components/BoardContext'

function getInitialBoardState(size: Size) {
  return lazilyLoadInitialBoard([...new Array(size.height)].map(() => new Array(size.width).fill(false)))
}

function getNewBoardStateAfterResize(boardState: boolean[][], newSize: Size) {
  const newBoardState = [...boardState.map(row => [...row])]
  const oldHeight = boardState.length

  if (oldHeight > newSize.height) {
    // If the new height is smaller than the old height, we need to remove rows from the bottom
    newBoardState.splice(newSize.height, oldHeight - newSize.height)
  } else if (oldHeight < newSize.height) {
    // If the new height is larger than the old height, we need to add rows to the bottom
    const newRows = newSize.height - oldHeight
    const newColumns = newSize.width

    const rowsToAdd = [...new Array(newRows)].map(() => new Array(newColumns).fill(false))

    newBoardState.push(...rowsToAdd)
  }

  newBoardState.forEach(row => {
    const oldWidth = row.length

    if (oldWidth > newSize.width) {
      // If the new width is smaller than the old width, we need to remove columns from the right
      row.splice(newSize.width, oldWidth - newSize.width)
    } else if (oldWidth < newSize.width) {
      // If the new width is larger than the old width, we need to add columns to the right
      const newColumns = newSize.width - oldWidth
      row.push(...new Array(newColumns).fill(false))
    }
  })

  return newBoardState
}

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

function gameTick(boardState: boolean[][]) {
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

// JS numbers are 64-bit floats, but get converted to 32-bit signed ints when performing bitwise operations
// If we don't want to deal with the complication of signed ints, we use the lower 31 bits to keep things positive
// Another approach would be to use BigInts, but that really hurts performance
const WORD_SIZE = 31

function compactZeros(binaryBoard: string) {
  let compacted = ''

  let numZeroes = 0
  for (let i = 0; i < binaryBoard.length; i++) {
    const c = binaryBoard[i]

    if (c === '0') {
      numZeroes++
      continue
    }

    if (numZeroes > 3) {
      compacted += `(${numZeroes})`
      numZeroes = 0
    }

    if (numZeroes > 0) {
      compacted += '0'.repeat(numZeroes)
      numZeroes = 0
    }

    compacted += c
  }

  if (numZeroes > 0) {
    compacted += `(${numZeroes})`
  }

  return compacted
}

function compressBoard(boardState: boolean[][]) {
  let binaryBoard = ''

  const height = boardState.length
  const width = boardState[0].length

  binaryBoard += `${width},${height};`

  let shift = 0
  let num = 0

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (boardState[i][j]) {
        // eslint-disable-next-line no-bitwise
        num |= 1 << shift
      }

      shift++

      if (shift === WORD_SIZE) {
        // Convert the number to hex and pad it with 0s to make it 8 characters long, so we can reconstruct it later
        // We also reverse the string so that we can navigate the board in the same order as we read it
        binaryBoard += num.toString(16).split('').reverse().join('').padEnd(8, '0')

        shift = 0
        num = 0
      }
    }
  }

  if (shift !== 0) {
    binaryBoard += num.toString(16).split('').reverse().join('').padEnd(8, '0')
  }

  return compactZeros(binaryBoard)
}

function compressBoardWithoutCompact(boardState: boolean[][]) {
  let binaryBoard = ''

  const height = boardState.length
  const width = boardState[0].length

  binaryBoard += `${width},${height};`

  let shift = 0
  let num = 0

  let numZeroes = 0

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (boardState[i][j]) {
        // eslint-disable-next-line no-bitwise
        num |= 1 << shift
      }

      shift++

      const shouldAppend = shift % 4 === 0

      if (!shouldAppend) {
        continue
      }

      if (num === 0) {
        numZeroes++
        shift = 0
        continue
      }

      if (numZeroes > 3) {
        binaryBoard += `(${numZeroes})`
        numZeroes = 0
      }

      if (numZeroes > 0) {
        binaryBoard += '0'.repeat(numZeroes)
        numZeroes = 0
      }

      binaryBoard += num.toString(16)
      shift = 0
      num = 0
    }
  }

  if (numZeroes > 3) {
    binaryBoard += `(${numZeroes})`
    numZeroes = 0
  }

  if (numZeroes > 0) {
    binaryBoard += '0'.repeat(numZeroes)
    numZeroes = 0
  }

  if (num !== 0) {
    binaryBoard += num.toString(16)
  }

  return binaryBoard
}

const BOARD_LOOKUP = (function buildLoookup() {
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

function reconstructBoard(binaryBoard: string) {
  const [size, board] = binaryBoard.split(';')

  const [width, height] = size.split(',').map(Number)

  const boardState = [...new Array(height)].map(() => new Array(width).fill(false))

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

    const uncompressed = BOARD_LOOKUP[c]

    uncompressed.forEach((isAlive, index) => {
      if (!isAlive) {
        return
      }

      const position = boardIndex + index
      const x = position % width
      const y = Math.floor(position / width)

      if (position < boardSize) {
        boardState[y][x] = isAlive
      }
    })

    strIndex++
    boardIndex += 4
  }

  return boardState
}

function printBoards(a: boolean[][], b: boolean[][]) {
  for (let i = 0; i < a.length; i++) {
    console.log(a[i].map(cell => (cell ? 1 : 0)).join(''), ' | ', b[i].map(cell => (cell ? 1 : 0)).join(''))
  }

  // console.log('\n', boardState.map(row => row.map(cell => (cell ? 1 : 0)).join('')).join('\n'))
}

function boardInfo(boardState: boolean[][]) {
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

function areBoardsEqual(boardState1: boolean[][], boardState2: boolean[][]) {
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

function findFirstStableState(boardState: boolean[][]) {
  const pastStatesMap: {[board: string]: number} = {}

  const start = performance.now()
  let newBoardState = boardState

  let tick = 0

  let timeTicking = 0
  let timeCompressing = 0
  let timeCompressingWithoutCompact = 0
  let timeComparing = 0

  while (true) {
    // TODO: Improve time ticking if we can
    const startTicking = performance.now()
    newBoardState = gameTick(newBoardState)
    timeTicking += performance.now() - startTicking

    const startCompressingIntoBytes = performance.now()
    const bytes = compressBoard(newBoardState)
    timeCompressing += performance.now() - startCompressingIntoBytes

    // if (!areBoardsEqual(newBoardState, reconstructBoard(bytes))) {
    //   console.log("Compress with compact doesn't work")
    //   console.log('Original: ', boardInfo(newBoardState))
    //   console.log('Compressed: ', bytes)
    //   console.log('Reconstructed: ', boardInfo(reconstructBoard(bytes)))
    // }

    const startCompressingIntoBytesWithoutCompact = performance.now()
    const bytesWithoutCompact = compressBoardWithoutCompact(newBoardState)
    timeCompressingWithoutCompact += performance.now() - startCompressingIntoBytesWithoutCompact

    if (!areBoardsEqual(newBoardState, reconstructBoard(bytesWithoutCompact))) {
      console.log("Compress without compact doesn't work")
      console.log('Compressed: ', bytesWithoutCompact)
      printBoards(newBoardState, reconstructBoard(bytesWithoutCompact))

      console.log('Original: ', boardInfo(newBoardState))
      console.log('Reconstructed: ', boardInfo(reconstructBoard(bytesWithoutCompact)))
    }

    // if (bytes !== bytesWithoutCompact) {
    //   console.log('with: ', bytes)
    //   console.log('wout: ', bytesWithoutCompact)
    // }

    const startComparing = performance.now()
    const firstStableIndex = pastStatesMap[bytes]
    timeComparing += performance.now() - startComparing

    if (firstStableIndex != null) {
      // console.log('Original Board: ')
      // printBoard(newBoardState)

      // const boardWCompact = reconstructBoard(bytes)

      // console.log('Compressed Board (w/ compact): ')
      // printBoard(boardWCompact)

      // const boardWoutCompact = reconstructBoard(bytesWithoutCompact)

      // console.log('Compressed Board (w/out compact): ')
      // printBoard(boardWoutCompact)

      console.log({
        timeCompressing,
        timeCompressingWithoutCompact,
        timeTicking,
        timeComparing,
        tpg: timeTicking / firstStableIndex,
      })

      return {
        firstStableGen: firstStableIndex,
        stablePerf: performance.now() - start,
      }
    }

    pastStatesMap[bytes] = ++tick
  }
}

type Props = Readonly<{
  children: React.ReactNode
}>
export function VanillaContainer({children}: Props) {
  const [size, setSize] = React.useState<Size | null>(null)
  const [boardState, setBoardState] = React.useState<boolean[][] | null>(null)

  const lastTick = React.useRef<{time: number; tick: number; avg: number} | null>(null)
  const lastSize = React.useRef<Size | null>(null)

  const [timePerGen, setTimePerGen] = React.useState<number>(0)
  const [genNumber, setGenNumber] = React.useState<number>(0)
  const [firstStableGen, setFirstStableGen] = React.useState<number | null>(null)
  const [stablePerf, setStablePerf] = React.useState<number | null>(null)

  // We want to measure the time between ticks
  React.useEffect(() => {
    setInterval(() => {
      setBoardState(state => {
        return gameTick(state ?? [])
      })
      setGenNumber(i => i + 1)
    }, 1)
  }, [])

  // Calculate the average time per generation
  React.useEffect(() => {
    if (boardState == null || boardState.length === 0) {
      return
    }

    if (lastTick.current === null) {
      lastTick.current = {time: performance.now(), tick: 0, avg: 0}
      return
    }

    const now = performance.now()
    const diff = now - lastTick.current.time

    lastTick.current = {
      time: now,
      tick: lastTick.current.tick + 1,
      avg:
        diff / (lastTick.current.tick + 1) +
        lastTick.current.avg * (lastTick.current.tick / (lastTick.current.tick + 1)),
    }

    setTimePerGen(lastTick.current.avg)
  }, [boardState])

  const resetBoardSize = React.useCallback(
    (newSize: Size) => {
      if (newSize.height === 0 || newSize.width === 0) {
        return
      }

      if (lastSize.current?.height === newSize.height || lastSize.current?.width === newSize.width) {
        return
      }

      lastSize.current = newSize

      if (boardState === null) {
        const newBoardState = getInitialBoardState(newSize)

        const {firstStableGen: stableGen, stablePerf: perf} = findFirstStableState(newBoardState) ?? {}

        setBoardState(newBoardState)
        setFirstStableGen(stableGen ?? null)
        setStablePerf(perf ?? null)
        return
      }

      setBoardState(state => {
        return getNewBoardStateAfterResize(state!, newSize)
      })
    },
    [boardState],
  )

  const onSizeChanged = React.useCallback((newSize: Size) => {
    setSize({...newSize})
  }, [])

  React.useEffect(() => {
    if (size === null) {
      return
    }

    resetBoardSize(size)
  }, [size, resetBoardSize])

  const contextValue = React.useMemo(() => {
    return {
      boardState: boardState ?? [],
      timePerGen,
      genNumber,
      firstStableGen,
      stablePerf,
      onSizeChanged,
    }
  }, [boardState, firstStableGen, genNumber, onSizeChanged, stablePerf, timePerGen])

  return <BoardContainer value={contextValue}>{children}</BoardContainer>
}
