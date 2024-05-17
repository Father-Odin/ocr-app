export const ipcCanvas = {
  extractText: (image: string, rectangles: any) => {
    return window.electronAPI.extractText({ image, rectangles });
  },
};
