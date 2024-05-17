import { createWorker } from "tesseract.js";
import sharp from "sharp";

// Register IPC handlers
export const registerIpcMainHandlers = {
  extractText: async (
    event: Electron.IpcMainEvent,
    payload: { image: string; rectangles: any }
  ) => {
    const worker = await createWorker("eng", 1, {
      logger: (m) => {
        console.log(m.progress);
      },
    });

    const croppedImages = await Promise.all(
      payload.rectangles.map(async (rect: any) => {
        const { x, y, width, height } = rect;

        const image = sharp(payload.image)
          .extract({
            left: parseInt(x),
            top: parseInt(y),
            width: parseInt(width),
            height: parseInt(height),
          })
          .resize(1024, 1024, {
            fit: sharp.fit.inside,
            withoutEnlargement: true,
          })
          .withMetadata({
            density: 300,
          })
          .grayscale()
          .toBuffer();

        return image;
      })
    );

    // Save the images
    await Promise.all(
      croppedImages.map(async (image, i) => {
        await sharp(image).toFile(
          `C:\\Users\\jaspe\\Documents\\Programs\\Electron_OCR\\ocr-app\\src\\static\\cropped${i}.png`
        );
      })
    );

    // Recognize text in the cropped images
    const text = await Promise.all(
      croppedImages.map(async (image) => {
        const ret = await worker.recognize(image);

        return ret.data.text;
      })
    );

    await worker.terminate();

    return text;
  },
};
