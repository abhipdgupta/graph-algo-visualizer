# Graph Algorithm Visualizer

This project is a web-based interactive tool to visualize various graph traversal and pathfinding algorithms. Users can draw their own mazes, select start and end points, and see how algorithms like Dijkstra's, A*, Breadth-First Search (BFS), and Depth-First Search (DFS) explore the graph to find the shortest path.

## Demo

Here is a video demonstrating the features of the Graph Algorithm Visualizer:


<video src="./assets/graph-algo-demo-video.mp4" width="900" controls></video>


*(Note: If the video does not play, you can download it from the `assets` folder in this repository.)*

## Features

- **Interactive Grid:** Draw and erase walls to create custom mazes.
- **Algorithm Selection:** Choose from a variety of classic graph algorithms:
  - Dijkstra's Algorithm
  - A* Search
  - Breadth-First Search (BFS)
  - Depth-First Search (DFS)
- **Step-by-Step Visualization:** Watch the algorithm's exploration process unfold in real-time.
- **Path Highlighting:** The final shortest path is highlighted on the grid.
- **Controls:** Easily clear the maze, reset the markers, and start the visualization.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1.  Clone the repo:
    ```sh
    git clone https://github.com/abhipdgupta/garph-algo-visualizer.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd garph-algo-visualizer
    ```
3.  Install NPM packages:
    ```sh
    npm install
    ```

## Usage

1.  **Start the development server:**
    ```sh
    npm run dev
    ```
    This command will watch for changes in the TypeScript files and recompile them.

1.  **Build for production:**
    ```sh
    npm run build
    ```
    This command compiles the TypeScript code into JavaScript. The output will be in the `dist` folder.
    For deploying to GitHub Pages, ensure that the `dist` folder is pushed to your repository.

2.  **Open the application:**
    Open the `index.html` file in your web browser to use the visualizer.

3.  **How to use the visualizer:**
    -   Click "Draw Maze" to start creating walls on the grid by clicking and dragging.
    -   Click "Choose Marker" to set the start (green) and end (red) points.
    -   Select an algorithm from the dropdown menu.
    -   Click "Start Algorithm" to begin the visualization.
    -   Use "Clear Maze" to remove the walls or "Reset" to clear everything.

## Technologies Used

- **HTML5 Canvas:** For rendering the grid and animations.
- **TypeScript:** For the core application logic.
- **Node.js:** For the development environment.
