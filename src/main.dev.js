/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import settings from 'electron-settings';
import { app, BrowserWindow, shell, globalShortcut } from 'electron';
import electronLocalshortcut from 'electron-localshortcut';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { configureStore } from '@reduxjs/toolkit';
import {
  forwardToRenderer,
  triggerAlias,
  replayActionMain,
} from 'electron-redux';
import playerReducer, { resetPlayer, setStatus } from './redux/playerSlice';
import playQueueReducer, {
  decrementCurrentIndex,
  incrementCurrentIndex,
  fixPlayer2Index,
  clearPlayQueue,
} from './redux/playQueueSlice';
import multiSelectReducer from './redux/multiSelectSlice';
import MenuBuilder from './menu';

export const store = configureStore({
  reducer: {
    player: playerReducer,
    playQueue: playQueueReducer,
    multiSelect: multiSelectReducer,
  },
  middleware: [triggerAlias, forwardToRenderer],
});

replayActionMain(store);

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      { forceDownload, loadExtensionOptions: { allowFileAccess: true } }
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths) => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.ts'), // Add custom titlebar functionality
    },
    autoHideMenuBar: true,
    minWidth: 640,
    minHeight: 600,
    frame: false,
  });

  if (settings.getSync('globalMediaHotkeys')) {
    globalShortcut.register('MediaStop', () => {
      const storeValues = store.getState();
      const currentEntryList = storeValues.playQueue.shuffle
        ? 'shuffledEntry'
        : 'entry';

      if (storeValues.playQueue[currentEntryList].length > 0) {
        store.dispatch(clearPlayQueue());
        store.dispatch(setStatus('PAUSED'));
        setTimeout(() => store.dispatch(resetPlayer()), 200);
      }
    });

    globalShortcut.register('MediaPlayPause', () => {
      const storeValues = store.getState();
      const currentEntryList = storeValues.playQueue.shuffle
        ? 'shuffledEntry'
        : 'entry';

      if (storeValues.playQueue[currentEntryList].length > 0) {
        if (storeValues.player.status === 'PAUSED') {
          store.dispatch(setStatus('PLAYING'));
        } else {
          store.dispatch(setStatus('PAUSED'));
        }
      }
    });

    globalShortcut.register('MediaNextTrack', () => {
      const storeValues = store.getState();
      const currentEntryList = storeValues.playQueue.shuffle
        ? 'shuffledEntry'
        : 'entry';
      if (storeValues.playQueue[currentEntryList].length > 0) {
        store.dispatch(resetPlayer());
        store.dispatch(incrementCurrentIndex('usingHotkey'));
        store.dispatch(setStatus('PLAYING'));
      }
    });

    globalShortcut.register('MediaPreviousTrack', () => {
      const storeValues = store.getState();
      const currentEntryList = storeValues.playQueue.shuffle
        ? 'shuffledEntry'
        : 'entry';
      if (storeValues.playQueue[currentEntryList].length > 0) {
        store.dispatch(resetPlayer());
        store.dispatch(decrementCurrentIndex('usingHotkey'));
        store.dispatch(fixPlayer2Index());
        store.dispatch(setStatus('PLAYING'));
      }
    });
  } else {
    electronLocalshortcut.register(mainWindow, 'MediaStop', () => {
      const storeValues = store.getState();
      const currentEntryList = storeValues.playQueue.shuffle
        ? 'shuffledEntry'
        : 'entry';

      if (storeValues.playQueue[currentEntryList].length > 0) {
        store.dispatch(clearPlayQueue());
        store.dispatch(setStatus('PAUSED'));
        setTimeout(() => store.dispatch(resetPlayer()), 200);
      }
    });

    electronLocalshortcut.register(mainWindow, 'MediaPlayPause', () => {
      const storeValues = store.getState();
      const currentEntryList = storeValues.playQueue.shuffle
        ? 'shuffledEntry'
        : 'entry';

      if (storeValues.playQueue[currentEntryList].length > 0) {
        if (storeValues.player.status === 'PAUSED') {
          store.dispatch(setStatus('PLAYING'));
        } else {
          store.dispatch(setStatus('PAUSED'));
        }
      }
    });

    electronLocalshortcut.register(mainWindow, 'MediaNextTrack', () => {
      const storeValues = store.getState();
      const currentEntryList = storeValues.playQueue.shuffle
        ? 'shuffledEntry'
        : 'entry';
      if (storeValues.playQueue[currentEntryList].length > 0) {
        store.dispatch(resetPlayer());
        store.dispatch(incrementCurrentIndex('usingHotkey'));
        store.dispatch(setStatus('PLAYING'));
      }
    });

    electronLocalshortcut.register(mainWindow, 'MediaPreviousTrack', () => {
      const storeValues = store.getState();
      const currentEntryList = storeValues.playQueue.shuffle
        ? 'shuffledEntry'
        : 'entry';
      if (storeValues.playQueue[currentEntryList].length > 0) {
        store.dispatch(resetPlayer());
        store.dispatch(decrementCurrentIndex('usingHotkey'));
        store.dispatch(fixPlayer2Index());
        store.dispatch(setStatus('PLAYING'));
      }
    });
  }

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  globalShortcut.unregisterAll();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.commandLine.appendSwitch(
  'disable-features',
  'HardwareMediaKeyHandling,MediaSessionService'
);

app.whenReady().then(createWindow).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
