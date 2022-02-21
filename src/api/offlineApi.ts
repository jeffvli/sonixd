import { ipcRenderer } from 'electron';

export const getGenres = () => {
  return new Promise((resolve) => {
    ipcRenderer.once('api-getGenres-reply', (_, arg) => {
      resolve(arg);
    });
    ipcRenderer.send('api-getGenres');
  });
};
