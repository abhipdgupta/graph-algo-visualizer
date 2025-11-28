import type { Cell, CellId, CellPos, Grid, Path } from "./types";
export type ParentMap = Record<CellId, CellId | null>;
export declare function dfsGenerator(grid: Grid, startPos: CellPos, endPos: CellPos): Generator<{
    cell: Cell;
    found: boolean;
}, Path | null, unknown>;
export declare function bfsGenerator(grid: Grid, startPos: CellPos, endPos: CellPos): Generator<{
    cell: Cell;
    found: boolean;
}, Path | null, unknown>;
export declare function dijkstraGenerator(grid: Grid, startPos: CellPos, endPos: CellPos): Generator<{
    cell: Cell;
    found: boolean;
}, Path | null, unknown>;
export declare function astarGenerator(grid: Grid, startPos: CellPos, endPos: CellPos): Generator<{
    cell: Cell;
    found: boolean;
}, Path | null, unknown>;
//# sourceMappingURL=path-finding-alog.d.ts.map