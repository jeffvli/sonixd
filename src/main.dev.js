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
import Player from 'mpris-service';
import path from 'path';
import os from 'os';
import settings from 'electron-settings';
import { ipcMain, app, BrowserWindow, shell, globalShortcut, Menu, Tray } from 'electron';
import electronLocalshortcut from 'electron-localshortcut';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { configureStore } from '@reduxjs/toolkit';
import { forwardToRenderer, triggerAlias, replayActionMain } from 'electron-redux';
import playerReducer, { setStatus } from './redux/playerSlice';
import playQueueReducer, {
  decrementCurrentIndex,
  incrementCurrentIndex,
  fixPlayer2Index,
  clearPlayQueue,
  toggleShuffle,
  toggleRepeat,
  setVolume,
} from './redux/playQueueSlice';
import multiSelectReducer from './redux/multiSelectSlice';
import MenuBuilder from './menu';
import { getCurrentEntryList } from './shared/utils';
import setDefaultSettings from './components/shared/setDefaultSettings';

settings.configure({
  prettify: true,
  numSpaces: 2,
});

const isWindows = process.platform === 'win32';
const isWindows10 = os.release().match(/^10\.*/g);
const isMacOS = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

setDefaultSettings(false);

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
let tray = null;
let exitFromTray = false;

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

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../assets');

const getAssetPath = (...paths) => {
  return path.join(RESOURCES_PATH, ...paths);
};

const createWinThumbnailClip = () => {
  if (isWindows) {
    // Set the current song image as thumbnail
    mainWindow.setThumbnailClip({
      x: 15,
      y: mainWindow.getContentSize()[1] - 83,
      height: 65,
      width: 65,
    });
  }
};

const stop = () => {
  const storeValues = store.getState();
  const currentEntryList = getCurrentEntryList(storeValues.playQueue);

  if (storeValues.playQueue[currentEntryList].length > 0) {
    store.dispatch(clearPlayQueue());
    store.dispatch(setStatus('PAUSED'));
  }
};

const pause = () => {
  const storeValues = store.getState();
  const currentEntryList = getCurrentEntryList(storeValues.playQueue);

  if (storeValues.playQueue[currentEntryList].length > 0) {
    store.dispatch(setStatus('PAUSED'));
  }
};

const play = () => {
  const storeValues = store.getState();
  const currentEntryList = getCurrentEntryList(storeValues.playQueue);

  if (storeValues.playQueue[currentEntryList].length > 0) {
    store.dispatch(setStatus('PLAYING'));
  }
};

const playPause = () => {
  const storeValues = store.getState();
  const currentEntryList = getCurrentEntryList(storeValues.playQueue);

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
  const currentEntryList = getCurrentEntryList(storeValues.playQueue);

  if (storeValues.playQueue[currentEntryList].length > 0) {
    store.dispatch(incrementCurrentIndex('usingHotkey'));
    store.dispatch(setStatus('PLAYING'));
  }
};

const previousTrack = () => {
  const storeValues = store.getState();
  const currentEntryList = getCurrentEntryList(storeValues.playQueue);

  if (storeValues.playQueue[currentEntryList].length > 0) {
    store.dispatch(decrementCurrentIndex('usingHotkey'));
    store.dispatch(fixPlayer2Index());
    store.dispatch(setStatus('PLAYING'));
  }
};

if (isLinux) {
  const mprisPlayer = Player({
    name: 'Sonixd',
    identity: 'Sonixd',
    supportedUriSchemes: ['file'],
    supportedMimeTypes: ['audio/mpeg', 'application/ogg'],
    supportedInterfaces: ['player'],
    rate: 1.0,
    minimumRate: 1.0,
    maximumRate: 1.0,
  });

  mprisPlayer.on('quit', () => {
    process.exit();
  });

  mprisPlayer.on('stop', () => {
    stop();

    mprisPlayer.playbackStatus = Player.PLAYBACK_STATUS_STOPPED;
  });

  mprisPlayer.on('pause', () => {
    pause();

    if (mprisPlayer.playbackStatus === 'Playing') {
      mprisPlayer.playbackStatus = Player.PLAYBACK_STATUS_PAUSED;
    }
  });

  mprisPlayer.on('play', () => {
    play();

    if (mprisPlayer.playbackStatus !== 'Playing') {
      mprisPlayer.playbackStatus = Player.PLAYBACK_STATUS_PLAYING;
    }
  });

  mprisPlayer.on('playpause', () => {
    playPause();

    if (mprisPlayer.playbackStatus !== 'Playing') {
      mprisPlayer.playbackStatus = Player.PLAYBACK_STATUS_PLAYING;
    } else {
      mprisPlayer.playbackStatus = Player.PLAYBACK_STATUS_PAUSED;
    }
  });

  mprisPlayer.on('next', () => {
    nextTrack();

    if (mprisPlayer.playbackStatus !== 'Playing') {
      mprisPlayer.playbackStatus = Player.PLAYBACK_STATUS_PLAYING;
    }
  });

  mprisPlayer.on('previous', () => {
    previousTrack();

    if (mprisPlayer.playbackStatus !== 'Playing') {
      mprisPlayer.playbackStatus = Player.PLAYBACK_STATUS_PLAYING;
    }
  });

  mprisPlayer.on('shuffle', () => {
    store.dispatch(toggleShuffle());
    settings.setSync('shuffle', !settings.getSync('shuffle'));
    mprisPlayer.shuffle = Boolean(settings.getSync('shuffle'));
  });

  mprisPlayer.on('volume', (event) => {
    store.dispatch(setVolume(event));
    settings.setSync('volume', event);
  });

  mprisPlayer.on('loopStatus', () => {
    const currentRepeat = settings.getSync('repeat');
    const newRepeat = currentRepeat === 'none' ? 'all' : currentRepeat === 'all' ? 'one' : 'none';
    store.dispatch(toggleRepeat());

    mprisPlayer.loopStatus =
      newRepeat === 'none' ? 'None' : newRepeat === 'all' ? 'Playlist' : 'Track';

    settings.setSync('repeat', newRepeat);
  });

  mprisPlayer.on('position', (event) => {
    const storeValues = store.getState();

    mainWindow.webContents.send('seek-request', {
      position: event.position,
      currentPlayer: storeValues.playQueue.currentPlayer,
    });
  });

  ipcMain.on('playpause', (_event, arg) => {
    if (arg.status === 'PLAYING') {
      mprisPlayer.playbackStatus = Player.PLAYBACK_STATUS_PLAYING;
    } else {
      mprisPlayer.playbackStatus = Player.PLAYBACK_STATUS_PAUSED;
    }

    setTimeout(() => {
      mprisPlayer.seeked(arg.position);
    }, 2000);
  });

  ipcMain.on('seeked', (_event, arg) => {
    // Send the position from Sonixd to MPRIS on manual seek
    mprisPlayer.seeked(arg);
  });

  ipcMain.on('current-song', (_event, arg) => {
    if (mprisPlayer.playbackStatus !== 'Playing') {
      mprisPlayer.playbackStatus = Player.PLAYBACK_STATUS_PLAYING;
    }

    mprisPlayer.metadata = {
      'mpris:trackid': mprisPlayer.objectPath(`track/${arg.id}`),
      'mpris:length': arg.duration ? Math.round((arg.duration || 0) * 1000 * 1000) : null,
      'mpris:artUrl': arg.image.includes('placeholder') ? null : arg.image,
      'xesam:title': arg.title || null,
      'xesam:album': arg.album || null,
      'xesam:artist': arg.artist?.length !== 0 ? arg.artist?.map((artist) => artist.title) : null,
      'xesam:genre': arg.genre[0]?.title || null,
    };
  });
}

const createWinThumbarButtons = () => {
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
        click: () => {
          nextTrack();
        },
      },
    ]);

    mainWindow.setThumbnailClip({
      x: 15,
      y: mainWindow.getContentSize()[1] - 83,
      height: 65,
      width: 65,
    });
  }
};

const createWindow = async () => {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    await installExtensions();
  }

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
    frame: settings.getSync('titleBarStyle') === 'native',
  });

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

  ipcMain.on('enableGlobalHotkeys', () => {
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
  });

  ipcMain.on('disableGlobalHotkeys', () => {
    globalShortcut.unregisterAll();
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
  });

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

      createWinThumbarButtons();
    }
  });

  mainWindow.on('minimize', (event) => {
    if (settings.getSync('minimizeToTray')) {
      event.preventDefault();
      mainWindow.hide();
    }

    if (isWindows && isWindows10) {
      mainWindow.setThumbnailClip({
        x: 0,
        y: 0,
        height: 0,
        width: 0,
      });
    }
  });

  mainWindow.on('restore', () => {
    if (isWindows && isWindows10) {
      createWinThumbnailClip();
    }
  });

  mainWindow.on('close', (event) => {
    if (!exitFromTray && settings.getSync('exitToTray')) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  if (isWindows) {
    mainWindow.on('resize', () => {
      const window = mainWindow.getContentBounds();

      createWinThumbnailClip();
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
  }

  if (isMacOS) {
    mainWindow.on('resize', () => {
      const window = mainWindow.getContentBounds();

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
  }

  mainWindow.once('maximize', () => {
    settings.setSync('windowMaximize', true);
  });

  mainWindow.on('unmaximize', () => {
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
  if (settings.getSync('autoUpdate') === true) {
    // eslint-disable-next-line
    new AppUpdater();
  }
};

const createTray = () => {
  if (isMacOS) {
    return;
  }

  tray = isLinux ? new Tray(getAssetPath('icon.png')) : new Tray(getAssetPath('icon.ico'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open main window',
      click: () => {
        mainWindow.show();
        createWinThumbarButtons();
        createWinThumbnailClip();
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Quit Sonixd',
      click: () => {
        exitFromTray = true;
        app.quit();
      },
    },
  ]);

  tray.on('double-click', () => {
    mainWindow.show();
    createWinThumbarButtons();
    createWinThumbnailClip();
  });

  tray.setToolTip('Sonixd');
  tray.setContextMenu(contextMenu);
};

const gotProcessLock = app.requestSingleInstanceLock();
if (!gotProcessLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    mainWindow.show();
  });
}

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

app
  .whenReady()
  .then(() => {
    createWindow();
    createTray();
    return null;
  })
  .catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

ipcMain.on('reload', () => {
  if (process.env.APPIMAGE) {
    app.exit();
    app.relaunch({
      execPath: process.env.APPIMAGE,
      args: process.argv.slice(1).concat(['--appimage-extract-and-run']),
    });
    app.exit(0);
  } else {
    app.relaunch();
    app.exit();
  }
});
