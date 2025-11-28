import type { Cell, CellId, CellPos, Grid, Path } from "./types";

export type ParentMap = Record<CellId, CellId | null>;

export function* dfsGenerator(
  grid: Grid,
  startPos: CellPos,
  endPos: CellPos
): Generator<{ cell: Cell; found: boolean }, Path | null, unknown> {
  const stack: Cell[] = [];
  const visited: Set<CellId> = new Set();
  const parentMap: ParentMap = {};

  const startCell = getCellByPos(grid, startPos);
  const endCell = getCellByPos(grid, endPos);

  if (!startCell || !endCell) return null;

  stack.push(startCell);
  visited.add(startCell.id);
  parentMap[startCell.id] = null;

  while (stack.length > 0) {
    const currentCell = stack.pop() as Cell;

    yield { cell: currentCell, found: currentCell.id === endCell.id };

    if (currentCell.id === endCell.id) {
      // Path Reconstruction
      const path: Path = [];
      let currentId: CellId | null = endCell.id;

      while (currentId !== null) {
        path.unshift(currentId);
        currentId = parentMap[currentId] || null;
      }
      return path;
    }

    if (currentCell.id !== startCell.id && currentCell.id !== endCell.id) {
      currentCell.color = `rgba(0, 0, 255, 0.6)`;
    }

    const neighbors = getNeighbors(grid, currentCell);

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.id)) {
        visited.add(neighbor.id);
        parentMap[neighbor.id] = currentCell.id;
        stack.push(neighbor);
      }
    }
  }

  return null;
}
export function* bfsGenerator(
  grid: Grid,
  startPos: CellPos,
  endPos: CellPos
): Generator<{ cell: Cell; found: boolean }, Path | null, unknown> {
  // Use a Queue for BFS (First-In, First-Out)
  const queue: Cell[] = [];
  const visited: Set<CellId> = new Set();
  const parentMap: ParentMap = {};

  const startCell = getCellByPos(grid, startPos);
  const endCell = getCellByPos(grid, endPos);

  if (!startCell || !endCell) return null;

  queue.push(startCell);
  visited.add(startCell.id);
  parentMap[startCell.id] = null;

  while (queue.length > 0) {
    const currentCell = queue.shift() as Cell;

    yield { cell: currentCell, found: currentCell.id === endCell.id };

    if (currentCell.id === endCell.id) {
      // Path Reconstruction
      const path: Path = [];
      let currentId: CellId | null = endCell.id;

      while (currentId !== null) {
        path.unshift(currentId);
        // Trace back using parent map
        currentId = parentMap[currentId] || null;
      }
      return path;
    }

    if (currentCell.id !== startCell.id && currentCell.id !== endCell.id) {
      currentCell.color = `rgba(0, 0, 255, 0.6)`;
    }

    const neighbors = getNeighbors(grid, currentCell);

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.id)) {
        visited.add(neighbor.id);
        parentMap[neighbor.id] = currentCell.id;
        // Enqueue the neighbor
        queue.push(neighbor);
      }
    }
  }

  return null;
}

export function* dijkstraGenerator(
  grid: Grid,
  startPos: CellPos,
  endPos: CellPos
): Generator<{ cell: Cell; found: boolean }, Path | null, unknown> {
  const startCell = getCellByPos(grid, startPos);
  const endCell = getCellByPos(grid, endPos);

  if (!startCell || !endCell) return null;

  const distances: Record<CellId, number> = {};
  const parentMap: ParentMap = {};
  const visited: Set<CellId> = new Set();
  const priorityQueue: { cell: Cell; distance: number }[] = [];

  grid.cells.forEach((cell) => {
    distances[cell.id] = Infinity;
    parentMap[cell.id] = null;
  });

  distances[startCell.id] = 0;
  priorityQueue.push({ cell: startCell, distance: 0 });

  while (priorityQueue.length > 0) {
    priorityQueue.sort((a, b) => a.distance - b.distance);
    const { cell: currentCell } = priorityQueue.shift()!;

    if (visited.has(currentCell.id)) continue;
    visited.add(currentCell.id);

    yield { cell: currentCell, found: currentCell.id === endCell.id };

    if (currentCell.id === endCell.id) {
      const path: Path = [];
      let currentId: CellId | null = endCell.id;

      while (currentId !== null) {
        path.unshift(currentId);
        currentId = parentMap[currentId] || null;
      }
      return path;
    }

    if (currentCell.id !== startCell.id && currentCell.id !== endCell.id) {
      currentCell.color = `rgba(0, 0, 255, 0.6)`;
    }

    const neighbors = getNeighbors(grid, currentCell);
    const costToNeighbor = 1;

    for (const neighbor of neighbors) {
      const newDist = distances[currentCell.id]! + costToNeighbor;

      if (newDist < distances[neighbor.id]!) {
        distances[neighbor.id] = newDist;
        parentMap[neighbor.id] = currentCell.id;
        priorityQueue.push({ cell: neighbor, distance: newDist });
      }
    }
  }

  return null;
}
const manhattanDistance = (pos1: CellPos, pos2: CellPos): number => {
  return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
};

export function* astarGenerator(
  grid: Grid,
  startPos: CellPos,
  endPos: CellPos
): Generator<{ cell: Cell; found: boolean }, Path | null, unknown> {
  const startCell = getCellByPos(grid, startPos);
  const endCell = getCellByPos(grid, endPos);

  if (!startCell || !endCell) return null;

  const gScore: Record<CellId, number> = {};
  const fScore: Record<CellId, number> = {};
  const parentMap: ParentMap = {};
  const openSet: { cell: Cell; fScore: number }[] = [];

  grid.cells.forEach((cell) => {
    gScore[cell.id] = Infinity;
    fScore[cell.id] = Infinity;
    parentMap[cell.id] = null;
  });

  gScore[startCell.id] = 0;
  fScore[startCell.id] = manhattanDistance(startPos, endPos);
  openSet.push({ cell: startCell, fScore: fScore[startCell.id]! });

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.fScore - b.fScore);
    const { cell: currentCell } = openSet.shift()!;

    yield { cell: currentCell, found: currentCell.id === endCell.id };

    if (currentCell.id === endCell.id) {
      const path: Path = [];
      let currentId: CellId | null = endCell.id;

      while (currentId !== null) {
        path.unshift(currentId);
        currentId = parentMap[currentId] || null;
      }
      return path;
    }

    if (currentCell.id !== startCell.id && currentCell.id !== endCell.id) {
      currentCell.color = `rgba(0, 0, 255, 0.6)`;
    }

    const neighbors = getNeighbors(grid, currentCell);
    const costToNeighbor = 1;

    for (const neighbor of neighbors) {
      const tentativeGScore = gScore[currentCell.id]! + costToNeighbor;

      if (tentativeGScore < gScore[neighbor.id]!) {
        parentMap[neighbor.id] = currentCell.id;
        gScore[neighbor.id] = tentativeGScore;
        fScore[neighbor.id] =
          gScore[neighbor.id]! + manhattanDistance(neighbor.pos, endPos);
        if (!openSet.some((item) => item.cell.id === neighbor.id)) {
          openSet.push({ cell: neighbor, fScore: fScore[neighbor.id]! });
        }
      }
    }
  }

  return null;
}

const getNeighbors = (grid: Grid, cell: Cell): Cell[] => {
  const neighbors: Cell[] = [];
  const { row, col } = cell.pos;

  const potentialNeighbors: CellPos[] = [
    { row: row - 1, col: col }, // Up
    { row: row + 1, col: col }, // Down
    { row: row, col: col - 1 }, // Left
    { row: row, col: col + 1 }, // Right
  ];

  for (const pos of potentialNeighbors) {
    if (
      pos.row >= 0 &&
      pos.row < grid.rows &&
      pos.col >= 0 &&
      pos.col < grid.cols
    ) {
      const neighbor = getCellByPos(grid, pos);
      if (neighbor && !neighbor.isWall) {
        neighbors.push(neighbor);
      }
    }
  }

  return neighbors;
};

const getCellById = (grid: Grid, id: CellId): Cell | undefined => {
  return grid.cells.find((cell) => cell.id === id);
};

const getCellByPos = (grid: Grid, pos: CellPos): Cell | undefined => {
  const id: CellId = `w${pos.col}-h${pos.row}`;
  return getCellById(grid, id);
};
