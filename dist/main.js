// --- UI Elements ---
const canvasContainer = document.getElementById("canvas-container");
const messageDiv = document.getElementById("message");
const chooseMarkerButton = document.getElementById("choose-marker-btn");
const createMazeButton = document.getElementById("draw-maze-btn");
const clearMazeButton = document.getElementById("clear-maze-btn");
const algorithmSelect = document.getElementById("algorithm-select");
const startAlgorithmButton = document.getElementById("start-algo-btn");
const resetButton = document.getElementById("reset-btn");
const showMessage = (msg) => {
    messageDiv.innerText = msg;
    messageDiv.style.display = "block";
};
// --- Canvas Setup ---
canvasContainer.style.width = "80vw";
canvasContainer.style.height = "80vh";
canvasContainer.style.border = "2px solid grey";
const canvas = document.createElement("canvas");
canvas.width = canvasContainer.clientWidth;
canvas.height = canvasContainer.clientHeight;
canvas.tabIndex = 0; // Make canvas focusable to capture keyboard events
canvasContainer.appendChild(canvas);
const rows = 40;
const cols = 40;
const cellMetrics = {
    width: canvas.width / cols,
    height: canvas.height / rows,
};
const ctx = canvas.getContext("2d");
// --- Global State and Control Variables ---
const canvasMetric = {
    width: canvas.width,
    height: canvas.height,
    fps: 60,
};
const canvasState = {
    state: "idle",
    message: "Start by creating mazes!",
    path: null,
};
/** Controls the speed of the animation in milliseconds per step. */
const speedOfSearch = 15;
/** Holds the generator function for the current algorithm visualization. */
let visualizationGenerator = null;
// --- Grid and Cell Management ---
const createGrid = (rows, cols) => {
    const cells = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = {
                id: `w${c}-h${r}`,
                pos: { row: r, col: c },
                color: `rgba(255, 255, 255, 1)`, // default white,
                isWall: false,
            };
            cells.push(cell);
        }
    }
    const cellSize = {
        width: canvas.width / cols,
        height: canvas.height / rows,
    };
    return { rows, cols, cells, cellSize };
};
const grid = createGrid(rows, cols);
const getCellById = (id) => {
    return grid.cells.find((cell) => cell.id === id);
};
const getCellByPos = (grid, pos) => {
    const id = `w${pos.col}-h${pos.row}`;
    return getCellById(id);
};
// --- Rendering Functions ---
const clearCanvas = () => {
    if (!ctx)
        return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};
const renderCell = (cell) => {
    if (!ctx)
        return;
    ctx.fillStyle = cell.color;
    ctx.fillRect(cell.pos.col * grid.cellSize.width, cell.pos.row * grid.cellSize.height, grid.cellSize.width, grid.cellSize.height);
    ctx.strokeStyle = "black";
    ctx.strokeRect(cell.pos.col * grid.cellSize.width, cell.pos.row * grid.cellSize.height, grid.cellSize.width, grid.cellSize.height);
};
const renderGrid = (grid) => {
    grid.cells.forEach((cell) => renderCell(cell));
};
const renderCanvas = () => {
    clearCanvas();
    renderGrid(grid);
};
const getNeighbors = (grid, cell) => {
    const neighbors = [];
    const { row, col } = cell.pos;
    // Potential neighbor positions: Up, Down, Left, Right
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
/**
 * DFS implemented as a generator to yield each visited step for visualization.
 */
function* dfsGenerator(grid, startPos, endPos) {
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
function* bfsGenerator(grid, startPos, endPos) {
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
const animatePathfinding = () => {
    if (!visualizationGenerator) {
        canvasState.state = "idle";
        return;
    }
    const result = visualizationGenerator.next();
    if (result.done) {
        canvasState.path = result.value;
        canvasState.state = "path_found";
    }
    else {
        setTimeout(() => {
            if (canvasState.state === "animating_path") {
                animatePathfinding();
            }
        }, speedOfSearch);
    }
};
chooseMarkerButton.onclick = () => {
    canvasState.state = "setting_markers";
    showMessage("Click on the grids to place markers.\n first click: start (Green), second click: end (Red)");
};
createMazeButton.onclick = () => {
    canvasState.state = "drawing_maze";
    showMessage("Click and drag on the grid to draw walls (Black).");
};
clearMazeButton.onclick = () => {
    grid.cells.forEach((cell) => {
        let isMarker = false;
        if (canvasState.markerPos &&
            canvasState.markerPos.start &&
            cell.pos.row === canvasState.markerPos.start.row &&
            cell.pos.col === canvasState.markerPos.start.col) {
            isMarker = true;
        }
        if (canvasState.markerPos &&
            canvasState.markerPos.end &&
            cell.pos.row === canvasState.markerPos.end.row &&
            cell.pos.col === canvasState.markerPos.end.col) {
            isMarker = true;
        }
        if (!isMarker) {
            cell.isWall = false;
            cell.color = `rgba(255, 255, 255, 1)`;
        }
    });
    canvasState.state = "idle";
    canvasState.path = null;
    visualizationGenerator = null;
    renderCanvas();
    showMessage("Maze cleared! You can draw a new maze now.");
};
startAlgorithmButton.onclick = () => {
    if (!canvasState.markerPos ||
        !canvasState.markerPos.start ||
        !canvasState.markerPos.end) {
        showMessage("Please set start and end markers before starting the algorithm.");
        return;
    }
    if (!canvasState.algorithmName) {
        showMessage("Please select an algorithm to run.");
        return;
    }
    if (canvasState.algorithmName === "dfs") {
        const { start, end } = canvasState.markerPos;
        visualizationGenerator = dfsGenerator(grid, start, end);
        canvasState.state = "animating_path";
        showMessage(`Running ${canvasState.algorithmName.toUpperCase()}...`);
        animatePathfinding();
    }
    else if (canvasState.algorithmName === "bfs") {
        const { start, end } = canvasState.markerPos;
        visualizationGenerator = bfsGenerator(grid, start, end);
        canvasState.state = "animating_path";
        showMessage(`Running ${canvasState.algorithmName.toUpperCase()}...`);
        animatePathfinding();
    }
};
resetButton.onclick = () => {
    grid.cells.forEach((cell) => {
        cell.isWall = false;
        cell.color = `rgba(255, 255, 255, 1)`;
    });
    canvasState.state = "idle";
    canvasState.markerPos = undefined;
    canvasState.algorithmName = undefined;
    canvasState.path = null;
    visualizationGenerator = null;
    renderCanvas();
    showMessage("Canvas reset! You can start over.");
};
algorithmSelect.onchange = (e) => {
    const target = e.target;
    const algo = target.value;
    canvasState.algorithmName = algo;
};
const getMousePosOnCanvas = (e) => {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
    };
};
const getCellFromMousePos = (mousePos) => {
    const col = Math.floor(mousePos.x / grid.cellSize.width);
    const row = Math.floor(mousePos.y / grid.cellSize.height);
    const cellId = `w${col}-h${row}`;
    const cell = getCellById(cellId);
    return cell || null;
};
const registerCanvasEventHandlers = () => {
    canvas.addEventListener("mousedown", (e) => {
        const mousePos = getMousePosOnCanvas(e);
        const cell = getCellFromMousePos(mousePos);
        if (!cell)
            return;
        if (canvasState.state === "drawing_maze") {
            let isCellAMarker = false;
            if (canvasState.markerPos) {
                const { start, end } = canvasState.markerPos;
                if ((start && cell.pos.row === start.row && cell.pos.col === start.col) ||
                    (end && cell.pos.row === end.row && cell.pos.col === end.col)) {
                    isCellAMarker = true;
                }
            }
            if (!isCellAMarker) {
                canvasState.isActuallyDrawingMaze = true;
                cell.isWall = true;
                cell.color = `rgba(0, 0, 0, 1)`;
            }
        }
    });
    canvas.addEventListener("mouseup", () => {
        if (canvasState.state === "drawing_maze") {
            canvasState.isActuallyDrawingMaze = false;
        }
    });
    canvas.addEventListener("mousemove", (e) => {
        const mousePos = getMousePosOnCanvas(e);
        const cell = getCellFromMousePos(mousePos);
        if (!cell)
            return;
        let isCellAMarker = false;
        if (canvasState.markerPos) {
            const { start, end } = canvasState.markerPos;
            if ((start && cell.pos.row === start.row && cell.pos.col === start.col) ||
                (end && cell.pos.row === end.row && cell.pos.col === end.col)) {
                isCellAMarker = true;
            }
        }
        if (canvasState.state === "drawing_maze" &&
            canvasState.isActuallyDrawingMaze &&
            !isCellAMarker) {
            cell.isWall = true;
            cell.color = `rgba(0, 0, 0, 1)`; // black for wall
        }
    });
    canvas.addEventListener("click", (e) => {
        const mousePos = getMousePosOnCanvas(e);
        const cell = getCellFromMousePos(mousePos);
        if (!cell)
            return;
        if (canvasState.state === "setting_markers" && cell.isWall) {
            showMessage("Cannot place a marker on a wall.");
            return;
        }
        if (canvasState.state === "setting_markers") {
            if (!canvasState.markerPos ||
                (!canvasState.markerPos.start && !canvasState.markerPos.end)) {
                canvasState.markerPos = { start: cell.pos, end: null };
                cell.color = `rgba(0, 255, 0, 1)`; // Green
                showMessage("Start marker set! Now click to set the end marker (Red).");
            }
            else if (canvasState.markerPos &&
                canvasState.markerPos.start &&
                !canvasState.markerPos.end) {
                // second marker (end)
                canvasState.markerPos.end = cell.pos;
                cell.color = `rgba(255, 0, 0, 1)`; // Red
                canvasState.state = "idle";
                showMessage("End marker set! You can now start the algorithm.");
            }
            else {
                const startCell = getCellByPos(grid, canvasState.markerPos.start);
                const endCell = getCellByPos(grid, canvasState.markerPos.end);
                if (startCell) {
                    startCell.color = `rgba(255, 255, 255, 1)`;
                }
                if (endCell) {
                    endCell.color = `rgba(255, 255, 255, 1)`;
                }
                canvasState.markerPos = undefined;
                showMessage("Markers reset! You can now set new markers.");
            }
        }
    });
};
const updateCanvasState = () => {
    if (canvasState.state === "path_found") {
        if (canvasState.path && canvasState.path.length > 0) {
            for (let i = 1; i < canvasState.path.length - 1; i++) {
                const cellId = canvasState.path[i];
                const cell = getCellById(cellId);
                if (cell) {
                    cell.color = `rgba(255, 255, 0, 1)`;
                }
            }
            showMessage(`Path found! The final path is highlighted in yellow.`);
        }
        else {
            showMessage("No path found to the end marker.");
        }
        canvasState.state = "idle";
    }
};
const run = () => {
    renderCanvas();
    showMessage(canvasState.message || "Welcome to the Graph Algorithm Visualizer!");
    registerCanvasEventHandlers();
    const fps = canvasMetric.fps;
    const interval = 1000 / fps;
    let then = performance.now();
    const loop = (now) => {
        requestAnimationFrame(loop);
        const delta = now - then;
        if (delta > interval) {
            then = now - (delta % interval);
            if (canvasState.state !== "animating_path") {
                updateCanvasState();
            }
            renderCanvas();
        }
    };
    loop(performance.now());
};
run();
export {};
//# sourceMappingURL=main.js.map