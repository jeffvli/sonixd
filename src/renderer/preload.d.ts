declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        windowClose(): void;
        windowMaximize(): void;
        windowMinimize(): void;
        windowUnmaximize(): void;
      };
    };
  }
}

export {};
