import React from "react";
import { createRoot } from "react-dom/client";
import CanvasProvider from "./components/Provider";
import Canvas from "./components/Canvas";
import Sidebar from "./components/Sidebar";
import styles from "./css/App.module.css";

const App = () => {
  return (
    <CanvasProvider>
      <div className={styles.app}>
        <Sidebar />
        <div className={styles.mainContent}>
          <Canvas />
        </div>
      </div>
    </CanvasProvider>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);
