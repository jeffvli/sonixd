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
import { forwardToRenderer, triggerAlias, replayActionMain } from 'electron-redux';
import playerReducer, { resetPlayer, setStatus } from './redux/playerSlice';
import playQueueReducer, {
  decrementCurrentIndex,
  incrementCurrentIndex,
  fixPlayer2Index,
  clearPlayQueue,
} from './redux/playQueueSlice';
import multiSelectReducer from './redux/multiSelectSlice';
import MenuBuilder from './menu';

const isWindows = process.platform === 'win32';

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

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
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
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
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
    width: settings.getSync('windowPosition.width') || 1024,
    height: settings.getSync('windowPosition.height') || 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.ts'), // Add custom titlebar functionality
    },
    autoHideMenuBar: true,
    minWidth: 768,
    minHeight: 600,
    frame: false,
  });

  const stop = () => {
    const storeValues = store.getState();
    const currentEntryList = storeValues.playQueue.shuffle ? 'shuffledEntry' : 'entry';

    if (storeValues.playQueue[currentEntryList].length > 0) {
      store.dispatch(clearPlayQueue());
      store.dispatch(setStatus('PAUSED'));
      setTimeout(() => store.dispatch(resetPlayer()), 200);
    }
  };

  const playPause = () => {
    const storeValues = store.getState();
    const currentEntryList = storeValues.playQueue.shuffle ? 'shuffledEntry' : 'entry';

    if (storeValues.playQueue[currentEntryList].length > 0) {
      if (storeValues.player.status === 'PAUSED') {
        store.dispatch(setStatus('PLAYING'));
      } else {
        store.dispatch(setStatus('PAUSED'));
      }
    }
  };

  const nextTrack = () => {
    const storeValues = store.getState();
    const currentEntryList = storeValues.playQueue.shuffle ? 'shuffledEntry' : 'entry';
    if (storeValues.playQueue[currentEntryList].length > 0) {
      store.dispatch(resetPlayer());
      store.dispatch(incrementCurrentIndex('usingHotkey'));
      store.dispatch(setStatus('PLAYING'));
    }
  };

  const previousTrack = () => {
    const storeValues = store.getState();
    const currentEntryList = storeValues.playQueue.shuffle ? 'shuffledEntry' : 'entry';
    if (storeValues.playQueue[currentEntryList].length > 0) {
      store.dispatch(resetPlayer());
      store.dispatch(decrementCurrentIndex('usingHotkey'));
      store.dispatch(fixPlayer2Index());
      store.dispatch(setStatus('PLAYING'));
    }
  };

  if (settings.getSync('globalMediaHotkeys')) {
    globalShortcut.register('MediaStop', () => {
      stop();
    });

    globalShortcut.register('MediaPlayPause', () => {
      playPause();
    });

    globalShortcut.register('MediaNextTrack', () => {
      nextTrack();
    });

    globalShortcut.register('MediaPreviousTrack', () => {
      previousTrack();
    });
  } else {
    electronLocalshortcut.register(mainWindow, 'MediaStop', () => {
      stop();
    });

    electronLocalshortcut.register(mainWindow, 'MediaPlayPause', () => {
      playPause();
    });

    electronLocalshortcut.register(mainWindow, 'MediaNextTrack', () => {
      nextTrack();
    });

    electronLocalshortcut.register(mainWindow, 'MediaPreviousTrack', () => {
      previousTrack();
    });
  }

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  // https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();

      if (settings.getSync('windowMaximize')) {
        mainWindow.maximize();
      } else {
        const windowPosition = settings.getSync('windowPosition');
        if (windowPosition) {
          mainWindow.setPosition(windowPosition.x, windowPosition.y);
        }
      }

      if (isWindows) {
        mainWindow.setThumbarButtons([
          {
            tooltip: 'Previous Track',
            icon: getAssetPath('skip-previous.png'),
            click: () => previousTrack(),
          },
          {
            tooltip: 'Play/Pause',
            icon: getAssetPath('play-circle.png'),
            click: () => playPause(),
          },
          {
            tooltip: 'Next Track',
            icon: getAssetPath('skip-next.png'),
            click: () => nextTrack(),
          },
        ]);

        mainWindow.setThumbnailClip({
          x: 15,
          y: mainWindow.getContentSize()[1] - 83,
          height: 65,
          width: 65,
        });
      }
    }
  });

  mainWindow.on('resize', () => {
    const window = mainWindow.getContentBounds();

    // Set the current song image as thumbnail
    mainWindow.setThumbnailClip({
      x: 15,
      y: mainWindow.getContentSize()[1] - 83,
      height: 65,
      width: 65,
    });

    settings.setSync('windowPosition', {
      x: window.x,
      y: window.y,
      width: window.width,
      height: window.height,
    });
  });

  mainWindow.on('moved', () => {
    const window = mainWindow.getContentBounds();
    settings.setSync('windowPosition', {
      x: window.x,
      y: window.y,
      width: window.width,
      height: window.height,
    });
  });

  mainWindow.on('maximize', () => {
    console.log('entered maximize');
    settings.setSync('windowMaximize', true);
  });

  mainWindow.on('unmaximize', () => {
    console.log('entered unmaximize');
    settings.setSync('windowMaximize', false);
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

app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling,MediaSessionService');

app.whenReady().then(createWindow).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
