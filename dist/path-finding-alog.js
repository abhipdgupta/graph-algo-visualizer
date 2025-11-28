export function* dfsGenerator(grid, startPos, endPos) {
    const stack = [];
    const visited = new Set();
    const parentMap = {};
    const startCell = getCellByPos(grid, startPos);
    const endCell = getCellByPos(grid, endPos);
    if (!startCell || !endCell)
        return null;
    stack.push(startCell);
    visited.add(startCell.id);
    parentMap[startCell.id] = null;
    while (stack.length > 0) {
        const currentCell = stack.pop();
        yield { cell: currentCell, found: currentCell.id === endCell.id };
        if (currentCell.id === endCell.id) {
            // Path Reconstruction
            const path = [];
            let currentId = endCell.id;
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
export function* bfsGenerator(grid, startPos, endPos) {
    // Use a Queue for BFS (First-In, First-Out)
    const queue = [];
    const visited = new Set();
    const parentMap = {};
    const startCell = getCellByPos(grid, startPos);
    const endCell = getCellByPos(grid, endPos);
    if (!startCell || !endCell)
        return null;
    queue.push(startCell);
    visited.add(startCell.id);
    parentMap[startCell.id] = null;
    while (queue.length > 0) {
        const currentCell = queue.shift();
        yield { cell: currentCell, found: currentCell.id === endCell.id };
        if (currentCell.id === endCell.id) {
            // Path Reconstruction
            const path = [];
            let currentId = endCell.id;
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
export function* dijkstraGenerator(grid, startPos, endPos) {
    const startCell = getCellByPos(grid, startPos);
    const endCell = getCellByPos(grid, endPos);
    if (!startCell || !endCell)
        return null;
    const distances = {};
    const parentMap = {};
    const visited = new Set();
    const priorityQueue = [];
    grid.cells.forEach((cell) => {
        distances[cell.id] = Infinity;
        parentMap[cell.id] = null;
    });
    distances[startCell.id] = 0;
    priorityQueue.push({ cell: startCell, distance: 0 });
    while (priorityQueue.length > 0) {
        priorityQueue.sort((a, b) => a.distance - b.distance);
        const { cell: currentCell } = priorityQueue.shift();
        if (visited.has(currentCell.id))
            continue;
        visited.add(currentCell.id);
        yield { cell: currentCell, found: currentCell.id === endCell.id };
        if (currentCell.id === endCell.id) {
            const path = [];
            let currentId = endCell.id;
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
            const newDist = distances[currentCell.id] + costToNeighbor;
            if (newDist < distances[neighbor.id]) {
                distances[neighbor.id] = newDist;
                parentMap[neighbor.id] = currentCell.id;
                priorityQueue.push({ cell: neighbor, distance: newDist });
            }
        }
    }
    return null;
}
const manhattanDistance = (pos1, pos2) => {
    return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
};
export function* astarGenerator(grid, startPos, endPos) {
    const startCell = getCellByPos(grid, startPos);
    const endCell = getCellByPos(grid, endPos);
    if (!startCell || !endCell)
        return null;
    const gScore = {};
    const fScore = {};
    const parentMap = {};
    const openSet = [];
    grid.cells.forEach((cell) => {
        gScore[cell.id] = Infinity;
        fScore[cell.id] = Infinity;
        parentMap[cell.id] = null;
    });
    gScore[startCell.id] = 0;
    fScore[startCell.id] = manhattanDistance(startPos, endPos);
    openSet.push({ cell: startCell, fScore: fScore[startCell.id] });
    while (openSet.length > 0) {
        openSet.sort((a, b) => a.fScore - b.fScore);
        const { cell: currentCell } = openSet.shift();
        yield { cell: currentCell, found: currentCell.id === endCell.id };
        if (currentCell.id === endCell.id) {
            const path = [];
            let currentId = endCell.id;
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
            const tentativeGScore = gScore[currentCell.id] + costToNeighbor;
            if (tentativeGScore < gScore[neighbor.id]) {
                parentMap[neighbor.id] = currentCell.id;
                gScore[neighbor.id] = tentativeGScore;
                fScore[neighbor.id] =
                    gScore[neighbor.id] + manhattanDistance(neighbor.pos, endPos);
                if (!openSet.some((item) => item.cell.id === neighbor.id)) {
                    openSet.push({ cell: neighbor, fScore: fScore[neighbor.id] });
                }
            }
        }
    }
    return null;
}
const getNeighbors = (grid, cell) => {
    const neighbors = [];
    const { row, col } = cell.pos;
    const potentialNeighbors = [
        { row: row - 1, col: col }, // Up
        { row: row + 1, col: col }, // Down
        { row: row, col: col - 1 }, // Left
        { row: row, col: col + 1 }, // Right
    ];
    for (const pos of potentialNeighbors) {
        if (pos.row >= 0 &&
            pos.row < grid.rows &&
            pos.col >= 0 &&
            pos.col < grid.cols) {
            const neighbor = getCellByPos(grid, pos);
            if (neighbor && !neighbor.isWall) {
                neighbors.push(neighbor);
            }
        }
    }
    return neighbors;
};
const getCellById = (grid, id) => {
    return grid.cells.find((cell) => cell.id === id);
};
const getCellByPos = (grid, pos) => {
    const id = `w${pos.col}-h${pos.row}`;
    return getCellById(grid, id);
};
//# sourceMappingURL=path-finding-alog.js.map