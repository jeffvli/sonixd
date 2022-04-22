declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        windowClose(): void;
        windowMinimize(): void;
        windowMaximize(): void;
        windowUnmaximize(): void;
      };
    };
  }
}

export {};
