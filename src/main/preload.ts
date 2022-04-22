import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    windowClose() {
      ipcRenderer.send('window-close');
    },
    windowMinimize() {
      ipcRenderer.send('window-minimize');
    },
    windowMaximize() {
      ipcRenderer.send('window-maximize');
    },
    windowUnmaximize() {
      ipcRenderer.send('window-unmaximize');
    },
  },
});
