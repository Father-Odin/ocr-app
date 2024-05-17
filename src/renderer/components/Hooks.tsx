// import { Rectangle } from "electron";
import { useState, useCallback, useEffect } from "react";
import useImage from "use-image";
import Konva from "konva";
import { RectangleType } from "./Rectangle";

const MIN_RECT_SIZE = 5;

// Custom Hooks
export const useImageLoader = () => {
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [image] = useImage(imageUrl);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string);
        setOriginalUrl(file.path);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  return {
    originalUrl,
    imageUrl,
    image,
    handleFileChange,
  };
};

export const useDrawing = (stageRef: React.RefObject<Konva.Stage | null>) => {
  const [rectangles, setRectangles] = useState<RectangleType[]>([]);
  const [currentRectangle, setCurrentRectangle] =
    useState<RectangleType | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const updateRectangle = useCallback((id: string, newAttr: RectangleType) => {
    setRectangles((rectangles) =>
      rectangles.map((rect) =>
        rect.id === id ? { ...rect, ...newAttr } : rect
      )
    );
  }, []);

  const selectRectangle = useCallback((id: string) => {
    setRectangles((rectangles) =>
      rectangles.map((rect) => ({ ...rect, isSelected: rect.id === id }))
    );
  }, []);

  const deleteRectangle = useCallback((id: string) => {
    setRectangles((rectangles) => rectangles.filter((rect) => rect.id !== id));
  }, []);

  const clearRectangles = useCallback(() => {
    setRectangles([]);
  }, []);

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target !== stageRef.current) return;

      const { x, y } = e.target.getStage()?.getPointerPosition() || {
        x: 0,
        y: 0,
      };

      setIsDrawing(true);
      setCurrentRectangle({
        x,
        y,
        width: 0,
        height: 0,
        fill: "red",
        id: crypto.randomUUID(),
        isSelected: false,
      });
    },
    [rectangles]
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isDrawing || !currentRectangle) return;

      const { x, y } = e.target.getStage()?.getPointerPosition() || {
        x: 0,
        y: 0,
      };

      const width = x - currentRectangle.x;
      const height = y - currentRectangle.y;
      setCurrentRectangle(
        (prev) =>
          prev && {
            ...prev,
            width,
            height,
          }
      );
    },
    [currentRectangle]
  );

  const handleMouseUp = useCallback(() => {
    if (!currentRectangle) {
      setIsDrawing(false);
      return;
    }

    if (currentRectangle.width < 0) {
      currentRectangle.x += currentRectangle.width;
      currentRectangle.width *= -1;
    }

    if (currentRectangle.height < 0) {
      currentRectangle.y += currentRectangle.height;
      currentRectangle.height *= -1;
    }

    if (
      currentRectangle.width <= MIN_RECT_SIZE ||
      currentRectangle.height <= MIN_RECT_SIZE
    ) {
      setIsDrawing(false);
      setCurrentRectangle(null);
      return;
    }

    setRectangles((rectangles) => [...rectangles, currentRectangle]);
    selectRectangle(currentRectangle.id);
    setCurrentRectangle(null);
    setIsDrawing(false);
  }, [currentRectangle]);

  const handleMouseLeave = useCallback(() => {
    if (!currentRectangle || !isDrawing) return;

    if (currentRectangle.width < 0) {
      currentRectangle.x += currentRectangle.width;
      currentRectangle.width *= -1;
    }

    if (currentRectangle.height < 0) {
      currentRectangle.y += currentRectangle.height;
      currentRectangle.height *= -1;
    }

    if (
      currentRectangle.width <= MIN_RECT_SIZE ||
      currentRectangle.height <= MIN_RECT_SIZE
    ) {
      setIsDrawing(false);
      setCurrentRectangle(null);
      return;
    }

    setRectangles((rectangles) => [...rectangles, currentRectangle]);
    selectRectangle(currentRectangle.id);
    setCurrentRectangle(null);
    setIsDrawing(false);
  }, [currentRectangle]);

  useEffect(() => {
    if (!stageRef.current) return;

    const stage = stageRef.current;
    stage.on("mousedown", handleMouseDown);
    stage.on("mousemove", handleMouseMove);
    stage.on("mouseup", handleMouseUp);
    stage.on("mouseleave", handleMouseLeave);

    return () => {
      stage.off("mousedown", handleMouseDown);
      stage.off("mousemove", handleMouseMove);
      stage.off("mouseup", handleMouseUp);
      stage.off("mouseleave", handleMouseLeave);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, stageRef]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const selectedRect = rectangles.find((rect) => rect.isSelected);
        if (selectedRect) deleteRectangle(selectedRect.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [rectangles, deleteRectangle]);

  // Optionally, return what might be needed outside this hook
  return {
    rectangles,
    currentRectangle,
    isDrawing,
    clearRectangles,
    updateRectangle,
    selectRectangle,
    deleteRectangle,
  };
};

export const useCanvasRescaler = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  image: HTMLImageElement | undefined
) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scalingFactor, setScalingFactor] = useState({
    x: 1,
    y: 1,
  });

  const getScalingFactor = useCallback(() => {
    if (!image || !containerRef.current) return;
    if (image.naturalWidth === 0 || image.naturalHeight === 0) return;
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;

    const x = imageWidth / dimensions.width;
    const y = imageHeight / dimensions.height;

    setScalingFactor({ x, y });

    return { x, y };
  }, [image, dimensions, containerRef]);

  useEffect(() => {
    if (!image || !containerRef.current) return;

    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;
    const imageAspectRatio = imageWidth / imageHeight;

    const container = containerRef.current;
    const containerWidth = container?.clientWidth || 0;
    const containerHeight = container?.clientHeight || 0;
    const containerAspectRatio = containerWidth / containerHeight;

    let scaledWidth, scaledHeight;

    if (containerAspectRatio > imageAspectRatio) {
      scaledHeight = Math.min(containerHeight);
      scaledWidth = scaledHeight * imageAspectRatio;
    } else {
      scaledWidth = Math.min(containerWidth);
      scaledHeight = scaledWidth / imageAspectRatio;
    }

    setDimensions({ width: scaledWidth, height: scaledHeight });
  }, [image]);

  return {
    dimensions,
    getScalingFactor,
    scalingFactor,
  };
};
