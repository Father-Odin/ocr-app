import { memo, useContext, useEffect, useRef } from "react";
import { Rect, Transformer } from "react-konva";
import Konva from "konva";
import { CanvasContext } from "./Provider";

const MIN_RECT_SIZE = 5;

export type RectangleType = {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  id: string;
  isSelected: boolean;
};

const Rectangle = memo(
  ({ id, x, y, width, height, isSelected }: RectangleType) => {
    const {
      drawing: { updateRectangle, selectRectangle },
      refs: { stageRef },
    } = useContext(CanvasContext);

    const shapeRef = useRef<Konva.Rect | null>(null);
    const transformerRef = useRef<Konva.Transformer | null>(null);

    const handleDragBound = (e: any) => {
      const stage = stageRef.current;
      if (!stage) return;

      const { x, y } = e.target.attrs;
      const { width, height } = e.target.size();

      const minX = 0;
      const minY = 0;
      const maxX = stage.width() - width;
      const maxY = stage.height() - height;

      e.target.x(Math.max(minX, Math.min(x, maxX)));
      e.target.y(Math.max(minY, Math.min(y, maxY)));
    };

    const handleDragEnd = () => {
      const node = shapeRef.current;
      if (!node) return;

      updateRectangle(id, {
        x: node.x(),
        y: node.y(),
      });
    };

    const handleTransform = () => {
      const node = shapeRef.current;
      if (!node) return;

      const newStrokeWidth = 1 / Math.max(node.scaleX(), node.scaleY());
      node.strokeWidth(newStrokeWidth);
      node.getLayer()!.batchDraw();
    };

    const handleTransformEnd = () => {
      const node = shapeRef.current;
      if (!node) return;

      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      node.scaleX(1);
      node.scaleY(1);

      updateRectangle(id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
      });
    };

    useEffect(() => {
      if (isSelected && transformerRef.current && shapeRef.current) {
        transformerRef.current?.nodes([shapeRef.current]);
        transformerRef.current?.getLayer()?.batchDraw();
      }
    }, [isSelected]);

    return (
      <>
        <Rect
          ref={shapeRef}
          id={id}
          x={x}
          y={y}
          width={width}
          height={height}
          fill={isSelected ? "rgba(255, 0, 0, 0.5)" : "rgba(0, 0, 255, 0.5)"}
          stroke="white"
          strokeWidth={1}
          draggable
          onDragMove={handleDragBound}
          onDragEnd={handleDragEnd}
          onTransform={handleTransform}
          onTransformEnd={handleTransformEnd}
          onMouseDown={() => selectRectangle(id)}
        />
        {isSelected && (
          <Transformer
            ref={transformerRef}
            rotateEnabled={false}
            keepRatio={false}
            anchorSize={10}
            boundBoxFunc={(oldBox, newBox) => {
              const stage = stageRef.current;
              if (!stage) return oldBox;

              if (
                newBox.width <= MIN_RECT_SIZE ||
                newBox.height <= MIN_RECT_SIZE
              ) {
                return oldBox;
              }

              const { x, y, width, height } = newBox;
              const minX = 0;
              const minY = 0;
              const maxX = stage.width();
              const maxY = stage.height();

              if (x < minX) {
                newBox.width += x;
                newBox.x = minX;
              }
              if (y < minY) {
                newBox.height += y;
                newBox.y = minY;
              }
              if (x + width > maxX) {
                newBox.width = maxX - x;
              }
              if (y + height > maxY) {
                newBox.height = maxY - y;
              }

              return newBox;
            }}
          />
        )}
      </>
    );
  },
  (prev, next) =>
    prev.x === next.x &&
    prev.y === next.y &&
    prev.width === next.width &&
    prev.height === next.height &&
    prev.isSelected === next.isSelected
);

export default Rectangle;
