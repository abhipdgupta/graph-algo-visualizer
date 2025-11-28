export type CanvasMetric = {
    width: number;
    height: number;
    fps: number;
};
export type CellPos = {
    row: number;
    col: number;
};
export type Path = CellId[];
export type CanvasState = {
    state: "drawing_maze" | "setting_markers" | "idle" | "running_algorithm" | "path_found" | "animating_path";
    markerPos?: {
        start: CellPos | null;
        end: CellPos | null;
    } | undefined | null;
    algorithmName?: "bfs" | "dfs" | "dijkstra" | "a-star" | undefined;
    message?: string;
    isActuallyDrawingMaze?: boolean;
    path?: Path | null;
};
export type Color = `#${string}` | `rgba(${number}, ${number}, ${number}, ${number})` | `rgb(${number}, ${number}, ${number})`;
export type CellId = `w${number}-h${number}`;
export type CellSize = {
    width: number;
    height: number;
};
export type Cell = {
    id: CellId;
    pos: CellPos;
    color: Color;
    isWall: boolean;
};
export type Grid = {
    rows: number;
    cols: number;
    cells: Cell[];
    cellSize: CellSize;
};
//# sourceMappingURL=types.d.ts.map