const close = () => window.electron.ipcRenderer.windowClose();

const minimize = () => window.electron.ipcRenderer.windowMinimize();

const maximize = () => window.electron.ipcRenderer.windowMaximize();

const unmaximize = () => window.electron.ipcRenderer.windowUnmaximize();

export const controls = {
  close,
  minimize,
  maximize,
  unmaximize,
};
