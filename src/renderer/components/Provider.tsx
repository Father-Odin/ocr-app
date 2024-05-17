import { createContext, useEffect, useRef } from "react";
import { useDrawing, useImageLoader, useCanvasRescaler } from "./Hooks";
import Konva from "konva";

export const CanvasContext = createContext<any>(null);

const CanvasProvider = ({ children }: any) => {
  const stageRef = useRef<Konva.Stage | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const drawing = useDrawing(stageRef);
  const imageLoader = useImageLoader();
  const rescaler = useCanvasRescaler(containerRef, imageLoader.image);

  useEffect(() => {
    if (imageLoader.image) {
      drawing.clearRectangles();
    }
  }, [imageLoader.image]);

  return (
    <CanvasContext.Provider
      value={{
        drawing,
        imageLoader,
        rescaler,
        refs: { stageRef, containerRef },
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export default CanvasProvider;
