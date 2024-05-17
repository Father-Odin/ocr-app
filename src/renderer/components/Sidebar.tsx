import { createRef, useContext, useEffect, useRef, useState } from "react";
import { CanvasContext } from "./Provider";
import { RectangleType } from "./Rectangle";
import styles from "../css/SideBar.module.css";
import { ipcCanvas } from "../ipcRenderer";
import Modal from "react-modal";

const Sidebar = () => {
  const {
    drawing: {
      rectangles,
      currentRectangle,
      clearRectangles,
      deleteRectangle,
      selectRectangle,
      updateRectangle,
    },
    imageLoader: { originalUrl, handleFileChange },
    rescaler: { getScalingFactor },
  } = useContext(CanvasContext);

  const [rectangleProperties, setRectangleProperties] =
    useState<RectangleType | null>(null);

  const [extractedText, setExtractedText] = useState<string[]>([]);
  const rectangleRefs = useRef([]);
  rectangleRefs.current = rectangles.map(
    (_: any, i: number) => rectangleRefs.current[i] ?? createRef()
  );

  const handleExtractText = async () => {
    const scalingFactor = getScalingFactor();
    const scaledRectangles = rectangles.map((rect: RectangleType) => ({
      ...rect,
      x: rect.x * scalingFactor.x,
      y: rect.y * scalingFactor.y,
      width: rect.width * scalingFactor.x,
      height: rect.height * scalingFactor.y,
    }));

    const data = await ipcCanvas.extractText(originalUrl, scaledRectangles);
    setExtractedText(data);
  };

  useEffect(() => {
    if (currentRectangle) {
      setRectangleProperties(currentRectangle);
    } else {
      const selectedRectangle = rectangles.find(
        (rect: RectangleType) => rect.isSelected
      );

      if (selectedRectangle) {
        setRectangleProperties(selectedRectangle);
      } else {
        setRectangleProperties(null);
      }
    }
  }, [rectangles, currentRectangle]);

  useEffect(() => {
    rectangles.forEach((rect: RectangleType, i: number) => {
      if (rect.isSelected && rectangleRefs.current[i].current) {
        rectangleRefs.current[i].current.scrollIntoView({ behavior: "smooth" });
      }
    });
  }, [rectangles]);

  return (
    <div className={styles.sidebar}>
      <Modal
        isOpen={extractedText.length > 0}
        onRequestClose={() => setExtractedText([])}
        contentLabel="Extracted Text"
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h2>Extracted Text</h2>
        <div className={styles.extractedText}>
          {extractedText.map((text: string, index: number) => (
            <div key={index}>{text}</div>
          ))}
        </div>
        <button onClick={() => setExtractedText([])}>Close</button>
      </Modal>
      <h2>Rectangles</h2>
      <div className={styles.rectangleList}>
        <button
          className={styles.clearRectangles}
          style={{
            display: rectangles.length > 0 ? "block" : "none",
          }}
          onClick={clearRectangles}
        >
          Clear Rectangles
        </button>
        {rectangles.map((rect: RectangleType, index: number) => (
          <div
            ref={rectangleRefs.current[index]}
            key={rect.id}
            className={`${styles.rectangleItem} ${
              rect.isSelected ? styles.selected : ""
            }`}
            onClick={() => selectRectangle(rect.id)}
          >
            <span>Rect {index + 1}</span>
            <button
              className={`${styles.closeButton}`}
              onClick={() => deleteRectangle(rect.id)}
            >
              X
            </button>
          </div>
        ))}
      </div>
      <div className={styles.rectangleProperties}>
        <h3>Rectangle Properties</h3>
        <div className={styles.propertiesContent}>
          {rectangleProperties && (
            <>
              <div className={styles.property}>
                <label htmlFor="x">X</label>
                <input
                  type="number"
                  id="x"
                  value={rectangleProperties.x}
                  onChange={(e) =>
                    updateRectangle(rectangleProperties.id, {
                      x: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className={styles.property}>
                <label htmlFor="y">Y</label>
                <input
                  type="number"
                  id="y"
                  value={rectangleProperties.y}
                  onChange={(e) =>
                    updateRectangle(rectangleProperties.id, {
                      y: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className={styles.property}>
                <label htmlFor="width">Width</label>
                <input
                  type="number"
                  id="width"
                  value={rectangleProperties.width}
                  onChange={(e) =>
                    updateRectangle(rectangleProperties.id, {
                      width: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className={styles.property}>
                <label htmlFor="height">Height</label>
                <input
                  type="number"
                  id="height"
                  value={rectangleProperties.height}
                  onChange={(e) =>
                    updateRectangle(rectangleProperties.id, {
                      height: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </>
          )}
        </div>
      </div>
      <div className={styles.buttons}>
        <input
          className={styles.input}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        <button onClick={handleExtractText}>Extract Text</button>
      </div>
    </div>
  );
};

export default Sidebar;
