import { useContext } from "react";
import { Stage, Layer, Image as KonvaImage, Rect } from "react-konva";
import { CanvasContext } from "./Provider";
import Rectangle, { RectangleType } from "./Rectangle";
import { ipcCanvas } from "../ipcRenderer";
import styles from "../css/Canvas.module.css";

const Canvas = () => {
  const {
    drawing: { rectangles, currentRectangle },
    imageLoader: { image, originalUrl, handleFileChange },
    rescaler: { dimensions, getScalingFactor },
    refs: { stageRef, containerRef },
  } = useContext(CanvasContext);

  return (
    <div ref={containerRef} className={styles.canvasContainer}>
      <Stage ref={stageRef} width={dimensions.width} height={dimensions.height}>
        <Layer listening={false}>
          <KonvaImage
            image={image}
            width={dimensions.width}
            height={dimensions.height}
          />
        </Layer>
        <Layer>
          {rectangles.map((rect: RectangleType) => (
            <Rectangle key={rect.id} {...rect} />
          ))}
          {currentRectangle && (
            <Rectangle
              key={currentRectangle.id}
              {...currentRectangle}
              fill="purple"
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;
