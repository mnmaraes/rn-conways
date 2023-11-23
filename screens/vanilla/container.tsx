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
        binaryBoard += num.toString(16).padStart(8, '0')

        shift = 0
        num = 0
      }
    }
  }

  if (shift !== 0) {
    binaryBoard += num.toString(16).padStart(8, '0')
  }

  return binaryBoard
}

function findFirstStableState(boardState: boolean[][]) {
  const pastStatesMap: {[board: string]: number} = {}

  const start = performance.now()
  let newBoardState = boardState

  let tick = 0

  let timeTicking = 0
  let timeCompressing = 0
  let timeComparing = 0

  while (true) {
    // TODO: Improve time ticking if we can
    const startTicking = performance.now()
    newBoardState = gameTick(newBoardState)
    timeTicking += performance.now() - startTicking

    const startCompressingIntoBytes = performance.now()
    const bytes = compressBoard(newBoardState)
    timeCompressing += performance.now() - startCompressingIntoBytes

    const startComparing = performance.now()
    const firstStableIndex = pastStatesMap[bytes]
    timeComparing += performance.now() - startComparing

    if (firstStableIndex != null) {
      console.log({
        timeCompressingIntoBytes: timeCompressing,
        timeTicking,
        timeComparingBytes: timeComparing,
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
