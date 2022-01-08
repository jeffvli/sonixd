export const mockSettings = {
  serverType: 'subsonic',
  autoUpdate: true,
  theme: 'defaultDark',
  showDebugWindow: false,
  globalMediaHotkeys: true,
  cachePath: 'C:\\Users\\jli\\AppData\\Roaming\\Electron',
  legacyAuth: false,
  volume: 0.93,
  audioDeviceId: null,
  seekForwardInterval: 5,
  seekBackwardInterval: 5,
  volumeFade: true,
  repeat: 'all',
  shuffle: false,
  scrollWithCurrentSong: true,
  cacheImages: true,
  cacheSongs: false,
  pollingInterval: 20,
  fadeDuration: 9,
  fadeType: 'equalPower',
  scrobble: false,
  transcode: false,
  playbackFilters: [
    {
      filter: '(（|\\(|\\[|~|-)[Ii]nst(rumental)?(\\)|\\]|~|-|）)',
      enabled: true,
    },
  ],
  musicFolder: {
    id: null,
    name: null,
    albums: true,
    artists: true,
    dashboard: false,
    search: false,
    starred: false,
  },
  gridCardSize: 200,
  gridGapSize: 20,
  gridAlignment: 'flex-start',
  playlistViewType: 'grid',
  albumViewType: 'grid',
  albumSortDefault: 'random',
  musicListFontSize: 13,
  musicListRowHeight: 50,
  musicListColumns: [
    {
      id: '#',
      dataKey: 'index',
      alignment: 'center',
      resizable: true,
      width: 50,
      label: '# (Drag/Drop)',
    },
    {
      id: 'Title',
      dataKey: 'combinedtitle',
      alignment: 'left',
      resizable: true,
      width: 273,
      label: 'Title (Combined)',
    },
    {
      id: 'Album',
      dataKey: 'album',
      alignment: 'left',
      resizable: true,
      width: 263,
      label: 'Album',
    },
    {
      id: 'Duration',
      dataKey: 'duration',
      alignment: 'center',
      resizable: true,
      width: 110,
      label: 'Duration',
    },
    {
      id: 'Bitrate',
      dataKey: 'bitRate',
      alignment: 'left',
      resizable: true,
      width: 72,
      label: 'Bitrate',
    },
    {
      id: 'Fav',
      dataKey: 'starred',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: 'Favorite',
    },
  ],
  albumListFontSize: 14,
  albumListRowHeight: 60,
  albumListColumns: [
    {
      id: '#',
      dataKey: 'index',
      alignment: 'center',
      resizable: true,
      width: 50,
      label: '#',
    },
    {
      id: 'Title',
      dataKey: 'combinedtitle',
      alignment: 'left',
      resizable: true,
      width: 457,
      label: 'Title (Combined)',
    },
    {
      id: 'Tracks',
      dataKey: 'songCount',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: 'Track Count',
    },
    {
      id: 'Duration',
      dataKey: 'duration',
      alignment: 'center',
      resizable: true,
      width: 80,
      label: 'Duration',
    },
    {
      id: 'Fav',
      dataKey: 'starred',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: 'Favorite',
    },
  ],
  artistListFontSize: 14,
  artistListRowHeight: 60,
  artistListColumns: [
    {
      id: '#',
      dataKey: 'index',
      alignment: 'center',
      resizable: true,
      width: 50,
      label: '#',
      uniqueId: 'bOCYMfNieUHtjl1XhM-GT',
    },
    {
      id: 'Art',
      dataKey: 'coverart',
      alignment: 'center',
      resizable: true,
      width: 74,
      label: 'CoverArt',
      uniqueId: '2Z8rUZi47VnlQSBfZzRk8',
    },
    {
      id: 'Name',
      dataKey: 'name',
      alignment: 'left',
      flexGrow: 5,
      label: 'Name',
      uniqueId: 'Vv_luiyR3rp5b07Szd0zd',
    },
    {
      id: 'Album Count',
      dataKey: 'albumCount',
      alignment: 'left',
      flexGrow: 1,
      label: 'Album Count',
      uniqueId: 'IScD9714XLFrQYSAFkmoL',
    },
    {
      id: 'Fav',
      dataKey: 'starred',
      alignment: 'center',
      flexGrow: 1,
      label: 'Favorite',
      uniqueId: 'eFrudHQBTnBXNuD3mL-c1',
    },
  ],
  genreListFontSize: 14,
  genreListRowHeight: 50,
  genreListColumns: [
    {
      id: '#',
      dataKey: 'index',
      alignment: 'center',
      resizable: true,
      width: 66,
      label: '#',
      uniqueId: 'ZXNE6gsaLm0kVRyueOBHS',
    },
    {
      id: 'Name',
      dataKey: 'name',
      alignment: 'left',
      flexGrow: 5,
      label: 'Name',
      uniqueId: 'FTY1gWAjc0i6NVjim_8aZ',
    },
    {
      id: 'Album Count',
      dataKey: 'albumCount',
      alignment: 'left',
      flexGrow: 1,
      label: 'Album Count',
      uniqueId: 'oHqG0mGN_E7iLairZGnZL',
    },
    {
      id: 'Tracks',
      dataKey: 'songCount',
      alignment: 'center',
      flexGrow: 1,
      label: 'Track Count',
      uniqueId: 'c1qxv4S5YC7YUvbOG_WJF',
    },
  ],
  playlistListFontSize: 14,
  playlistListRowHeight: 80,
  playlistListColumns: [
    {
      id: '#',
      dataKey: 'index',
      alignment: 'center',
      resizable: true,
      width: 50,
      label: '#',
    },
    {
      id: 'Art',
      dataKey: 'coverart',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: 'CoverArt',
    },
    {
      id: 'Title',
      dataKey: 'name',
      alignment: 'left',
      resizable: true,
      width: 300,
      label: 'Title',
    },
    {
      id: 'Description',
      dataKey: 'comment',
      alignment: 'left',
      resizable: true,
      width: 200,
      label: 'Description',
    },
    {
      id: 'Tracks',
      dataKey: 'songCount',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: 'Track Count',
    },
    {
      id: 'Owner',
      dataKey: 'owner',
      alignment: 'left',
      resizable: true,
      width: 150,
      label: 'Owner',
    },
    {
      id: 'Modified',
      dataKey: 'changed',
      alignment: 'left',
      resizable: true,
      width: 100,
      label: 'Modified',
    },
  ],
  miniListFontSize: 14,
  miniListRowHeight: 40,
  miniListColumns: [
    {
      id: '#',
      dataKey: 'index',
      alignment: 'center',
      resizable: true,
      width: 50,
      label: '# (Drag/Drop)',
    },
    {
      id: 'Title',
      dataKey: 'title',
      alignment: 'left',
      resizable: true,
      width: 250,
      label: 'Title',
    },
    {
      id: 'Duration',
      dataKey: 'duration',
      alignment: 'center',
      resizable: true,
      width: 80,
      label: 'Duration',
    },
  ],
  font: 'Poppins',
  server: 'http://192.168.14.11:4040',
  serverBase64: 'aHR0cDovLzE5Mi4xNjguMTQuMTE6NDA0MA==',
  dynamicBackground: false,
  minimizeToTray: true,
  exitToTray: true,
  windowPosition: { x: 0, y: 0, width: 960, height: 1560 },
  windowMaximize: false,
  highlightOnRowHover: false,
  titleBarStyle: 'windows',
  startPage: '/',
  discord: {
    enabled: true,
    applicationId: '',
    clientId: '923372440934055968',
  },
  obs: {
    enabled: true,
    url: '',
    type: 'local',
    path: 'C:\\Temp',
    pollingInterval: '2000',
  },
  themesDefault: [
    {
      label: 'Default Dark',
      value: 'defaultDark',
      fonts: {
        size: {
          page: '14px',
          pageTitle: '40px',
          panelTitle: '20px',
        },
      },
      colors: {
        primary: '#2196F3',
        layout: {
          page: {
            color: '#D8D8D8',
            colorSecondary: '#888e94',
            background: '#181A1F',
          },
          playerBar: {
            color: '#D8D8D8',
            colorSecondary: '#888e94',
            background: '#101010',
            button: {
              color: 'rgba(240, 240, 240, 0.8)',
              colorHover: '#FFFFFF',
            },
          },
          sideBar: {
            background: '#101010',
            button: {
              color: '#D8D8D8',
              colorHover: '#FFFFFF',
            },
          },
          titleBar: {
            color: '#FFFFFF',
            background: '#101010',
          },
        },
        button: {
          default: {
            color: '#D8D8D8',
            colorHover: '#FFFFFF',
            background: '#292D33',
            backgroundHover: '#3C3F43',
          },
          primary: {
            color: '#FFFFFF',
            colorHover: '#FFFFFF',
            backgroundHover: '#3B89EC',
          },
          subtle: {
            color: '#D8D8D8',
            colorHover: '#D8D8D8',
            backgroundHover: 'transparent',
          },
          link: {
            color: '#2196F3',
            colorHover: '#3B89EC',
          },
        },
        card: {
          overlayButton: {
            color: '#FFFFFF',
            background: '#000000',
            opacity: 0.8,
          },
        },
        contextMenu: {
          color: '#D8D8D8',
          colorDisabled: '#6A6F76',
          background: '#1E2125',
          backgroundHover: '#292D33',
        },
        input: {
          color: '#D8D8D8',
          background: '#25292E',
          backgroundHover: '#353A45',
          backgroundActive: 'rgba(240, 240, 240, .2)',
        },
        nav: {
          color: '#D8D8D8',
        },
        popover: {
          color: '#D8D8D8',
          background: '#1E2125',
        },
        slider: {
          background: '#3C3F43',
          progressBar: '#888E94',
        },
        spinner: {
          background: 'rgba(233, 235, 240, 0.3)',
          foreground: '#2196F3',
        },
        table: {
          selectedRow: '#4D5156',
        },
        tag: {
          background: '#3C3F43',
          text: '#E2E4E9',
        },
        tooltip: {
          color: '#D8D8D8',
          background: '#1E2125',
        },
      },
      other: {
        button: {
          borderRadius: '0px',
        },
        coverArtFilter: 'drop-shadow(0px 3px 5px #000000)',
        card: {
          border: '1px #3c3f43 solid',
          hover: {
            transform: 'scale(1.03)',
            transition: '0.07s ease-in-out',
            filter: 'none',
          },
          image: {
            borderTop: 'none',
            borderRight: 'none',
            borderBottom: 'none',
            borderLeft: 'none',
            borderRadius: '0px',
          },
          info: {
            borderTop: 'none',
            borderRight: 'none',
            borderBottom: 'none',
            borderLeft: 'none',
            borderRadius: '0px',
          },
        },
        input: {
          borderRadius: '0px',
        },
        miniPlayer: {
          height: '450px',
          opacity: 0.95,
        },
        panel: {
          borderRadius: '0px',
        },
        playerBar: {
          borderTop: '1px solid rgba(240, 240, 240, .15)',
          borderRight: 'none',
          borderBottom: 'none',
          borderLeft: 'none',
          filter: 'none',
        },
        tag: {
          borderRadius: '0px',
        },
        tooltip: {
          border: '1px #3c3f43 solid',
          borderRadius: '0px',
        },
      },
    },
    {
      label: 'Default Light',
      value: 'defaultLight',
      fonts: {
        size: {
          page: '14px',
          pageTitle: '30px',
          panelTitle: '20px',
        },
      },
      colors: {
        primary: '#285DA0',
        layout: {
          page: {
            color: '#000000',
            colorSecondary: '#888e94',
            background: '#FFFFFF',
          },
          playerBar: {
            color: '#FFFFFF',
            colorSecondary: '#888e94',
            background: '#212121',
            button: {
              color: 'rgba(240, 240, 240, 0.8)',
              colorHover: '#FFFFFF',
            },
          },
          sideBar: {
            background: '#212121',
            button: {
              color: '#D8D8D8',
              colorHover: '#FFFFFF',
            },
          },
          titleBar: {
            color: '#FFFFFF',
            background: '#212121',
          },
        },
        button: {
          default: {
            color: '#575757',
            colorHover: '#000000',
            background: '#DFDFE2',
            backgroundHover: '#D2D2D6',
          },
          primary: {
            color: '#FFFFFF',
            colorHover: '#FFFFFF',
            backgroundHover: '#347AD3',
          },
          subtle: {
            color: '#575757',
            colorHover: '#575757',
            backgroundHover: 'transparent',
          },
          link: {
            color: '#575757',
            colorHover: '#575757',
          },
        },
        card: {
          overlayButton: {
            color: '#FFFFFF',
            colorHover: '#FFFFFF',
            background: '#000000',
            backgroundHover: '#285DA0',
            opacity: 0.8,
          },
        },
        contextMenu: {
          color: '#575757',
          colorDisabled: '#BABABA',
          background: '#FFFFFF',
          backgroundHover: '#D2D2D6',
        },
        input: {
          color: '#000000',
          background: '#FFFFFF',
          backgroundHover: '#E5E5EA',
          backgroundActive: 'rgba(0, 0, 0, .2)',
        },
        nav: {
          color: '#000000',
        },
        popover: {
          color: '#000000',
          background: '#FFFFFF',
        },
        slider: {
          background: '#3C3F43',
          progressBar: '#888E94',
        },
        spinner: {
          background: 'rgba(0, 0, 0, 0.3)',
          foreground: '#285DA0',
        },
        table: {
          selectedRow: '#CCCCCC',
        },
        tag: {
          background: '#DFDFE2',
          text: '#000000',
        },
        tooltip: {
          color: '#000000',
          background: '#FFFFFF',
        },
      },
      other: {
        button: {
          borderRadius: '0px',
        },
        coverArtFilter: 'drop-shadow(0px 3px 5px #000000)',
        card: {
          border: '1px #3c3f43 solid',
          hover: {
            transform: 'scale(1.03)',
            transition: '0.07s ease-in-out',
            filter: 'none',
          },
          image: {
            borderTop: 'none',
            borderRight: 'none',
            borderBottom: 'none',
            borderLeft: 'none',
            borderRadius: '0px',
          },
          info: {
            borderTop: 'none',
            borderRight: 'none',
            borderBottom: 'none',
            borderLeft: 'none',
            borderRadius: '0px',
          },
        },
        input: {
          borderRadius: '0px',
        },
        miniPlayer: {
          height: '450px',
          opacity: 0.95,
        },
        panel: {
          borderRadius: '0px',
        },
        playerBar: {
          borderTop: '1px solid rgba(240, 240, 240, .15)',
          borderRight: 'none',
          borderBottom: 'none',
          borderLeft: 'none',
          filter: 'none',
        },
        tag: {
          borderRadius: '0px',
        },
        tooltip: {
          border: '1px #3c3f43 solid',
          borderRadius: '0px',
        },
      },
    },
  ],
  themes: [],
};
