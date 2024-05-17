export interface ElectronAPI {
  extractText: (payload: {
    image: string;
    rectangles: any;
  }) => Promise<string[]>;
  onProgress: (callback: any) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
