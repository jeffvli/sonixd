import settings from 'electron-settings';
import path from 'path';
import i18n from '../../i18n/i18n';
import { isMacOS } from '../../shared/utils';

const setDefaultSettings = (force: boolean) => {
  if (force || !settings.hasSync('discord.enabled')) {
    settings.setSync('discord.enabled', false);
  }

  if (force || !settings.hasSync('discord.clientId')) {
    settings.setSync('discord.clientId', '923372440934055968');
  }

  if (force || !settings.hasSync('discord.serverImage')) {
    settings.setSync('discord.serverImage', false);
  }

  if (force || !settings.hasSync('obs.enabled')) {
    settings.setSync('obs.enabled', false);
  }

  if (force || !settings.hasSync('obs.url')) {
    settings.setSync('obs.url', '');
  }

  if (force || !settings.hasSync('obs.type')) {
    settings.setSync('obs.type', 'local');
  }

  if (force || !settings.hasSync('obs.path')) {
    settings.setSync('obs.path', '');
  }

  if (force || !settings.hasSync('obs.pollingInterval')) {
    settings.setSync('obs.pollingInterval', 2000);
  }

  if (force || !settings.hasSync('transcode')) {
    settings.setSync('transcode', false);
  }

  if (force || !settings.hasSync('resume')) {
    settings.setSync('resume', false);
  }

  if (force || !settings.hasSync('autoUpdate')) {
    settings.setSync('autoUpdate', true);
  }

  if (force || !settings.hasSync('autoUpdateNotice')) {
    settings.setSync('autoUpdateNotice', true);
  }

  if (force || !settings.hasSync('serverType')) {
    settings.setSync('serverType', 'subsonic');
  }

  if (force || !settings.hasSync('legacyAuth')) {
    settings.setSync('legacyAuth', false);
  }

  if (force || !settings.hasSync('language')) {
    settings.setSync('language', 'en');
  }

  if (force || !settings.hasSync('theme')) {
    settings.setSync('theme', 'defaultDark');
  }

  if (force || !settings.hasSync('font')) {
    settings.setSync('font', 'Poppins');
  }

  if (force || !settings.hasSync('dynamicBackground')) {
    settings.setSync('dynamicBackground', false);
  }

  if (force || !settings.hasSync('highlightOnRowHover')) {
    settings.setSync('highlightOnRowHover', true);
  }

  if (force || !settings.hasSync('minimizeToTray')) {
    settings.setSync('minimizeToTray', false);
  }

  if (force || !settings.hasSync('exitToTray')) {
    let defaultExitToTray = false;
    if (isMacOS()) {
      defaultExitToTray = true;
    }
    settings.setSync('exitToTray', defaultExitToTray);
  }

  if (force || !settings.hasSync('showDebugWindow')) {
    settings.setSync('showDebugWindow', false);
  }

  if (force || !settings.hasSync('globalMediaHotkeys')) {
    settings.setSync('globalMediaHotkeys', false);
  }

  if (force || !settings.hasSync('systemMediaTransportControls')) {
    settings.setSync('systemMediaTransportControls', false);
  }

  if (force || !settings.hasSync('cachePath')) {
    settings.setSync('cachePath', path.join(path.dirname(settings.file())));
  }

  if (force || !settings.hasSync('titleBarStyle')) {
    let defaultTitleBarStyle = 'windows';
    if (isMacOS()) {
      defaultTitleBarStyle = 'mac';
    }
    settings.setSync('titleBarStyle', defaultTitleBarStyle);
  }

  if (force || !settings.hasSync('artistPageLegacy')) {
    settings.setSync('artistPageLegacy', false);
  }

  if (force || !settings.hasSync('startPage')) {
    settings.setSync('startPage', '/');
  }

  if (force || !settings.hasSync('scrobble')) {
    settings.setSync('scrobble', true);
  }

  if (force || !settings.hasSync('systemNotifications')) {
    settings.setSync('systemNotifications', false);
  }

  if (force || !settings.hasSync('musicFolder.id')) {
    settings.setSync('musicFolder.id', null);
  }

  if (force || !settings.hasSync('musicFolder.albums')) {
    settings.setSync('musicFolder.albums', true);
  }

  if (force || !settings.hasSync('musicFolder.artists')) {
    settings.setSync('musicFolder.artists', true);
  }

  if (force || !settings.hasSync('musicFolder.dashboard')) {
    settings.setSync('musicFolder.dashboard', false);
  }

  if (force || !settings.hasSync('musicFolder.search')) {
    settings.setSync('musicFolder.search', false);
  }

  if (force || !settings.hasSync('musicFolder.starred')) {
    settings.setSync('musicFolder.starred', false);
  }

  if (force || !settings.hasSync('musicFolder.music')) {
    settings.setSync('musicFolder.music', true);
  }

  if (force || !settings.hasSync('sidebar.expand')) {
    settings.setSync('sidebar.expand', true);
  }

  if (force || !settings.hasSync('sidebar.width')) {
    settings.setSync('sidebar.width', '225px');
  }

  if (force || !settings.hasSync('sidebar.coverArt')) {
    settings.setSync('sidebar.coverArt', true);
  }

  if (force || !settings.hasSync('sidebar.selected')) {
    settings.setSync('sidebar.selected', [
      'dashboard',
      'nowplaying',
      'favorites',
      'songs',
      'albums',
      'artists',
      'genres',
      'folders',
      'config',
      'collapse',
      'playlists',
      'playlistList',
    ]);
  }

  if (force || !settings.hasSync('pagination.music.recordsPerPage')) {
    settings.setSync('pagination.music.recordsPerPage', 50);
  }

  if (force || !settings.hasSync('pagination.music.serverSide')) {
    settings.setSync('pagination.music.serverSide', true);
  }

  if (force || !settings.hasSync('pagination.album.recordsPerPage')) {
    settings.setSync('pagination.album.recordsPerPage', 50);
  }

  if (force || !settings.hasSync('pagination.album.serverSide')) {
    settings.setSync('pagination.album.serverSide', false);
  }

  if (force || !settings.hasSync('volume')) {
    settings.setSync('volume', 0.3);
  }

  if (force || !settings.hasSync('audioDeviceId')) {
    settings.setSync('audioDeviceId', null);
  }

  if (force || !settings.hasSync('seekForwardInterval')) {
    settings.setSync('seekForwardInterval', 5);
  }

  if (force || !settings.hasSync('seekBackwardInterval')) {
    settings.setSync('seekBackwardInterval', 5);
  }

  if (force || !settings.hasSync('volumeFade')) {
    settings.setSync('volumeFade', true);
  }

  if (force || !settings.hasSync('repeat')) {
    settings.setSync('repeat', 'all');
  }

  if (force || !settings.hasSync('shuffle')) {
    settings.setSync('shuffle', false);
  }

  if (force || !settings.hasSync('scrollWithCurrentSong')) {
    settings.setSync('scrollWithCurrentSong', true);
  }

  if (force || !settings.hasSync('cacheImages')) {
    settings.setSync('cacheImages', true);
  }

  if (force || !settings.hasSync('cacheSongs')) {
    settings.setSync('cacheSongs', false);
  }

  if (force || !settings.hasSync('pollingInterval')) {
    settings.setSync('pollingInterval', 100);
  }

  if (force || !settings.hasSync('fadeDuration')) {
    settings.setSync('fadeDuration', 9);
  }

  if (force || !settings.hasSync('fadeType')) {
    settings.setSync('fadeType', 'equalPower');
  }

  if (force || !settings.hasSync('gridCardSize')) {
    settings.setSync('gridCardSize', 175);
  }

  if (force || !settings.hasSync('gridGapSize')) {
    settings.setSync('gridGapSize', 20);
  }

  if (force || !settings.hasSync('gridAlignment')) {
    settings.setSync('gridAlignment', 'flex-start');
  }

  if (force || !settings.hasSync('playlistViewType')) {
    settings.setSync('playlistViewType', 'list');
  }

  if (force || !settings.hasSync('albumViewType')) {
    settings.setSync('albumViewType', 'list');
  }

  if (force || !settings.hasSync('albumSortDefault')) {
    settings.setSync('albumSortDefault', 'random');
  }

  if (force || !settings.hasSync('musicSortDefault')) {
    settings.setSync('musicSortDefault', 'random');
  }

  if (force || !settings.hasSync('artistViewType')) {
    settings.setSync('artistViewType', 'list');
  }

  if (force || !settings.hasSync('musicListFontSize')) {
    settings.setSync('musicListFontSize', '14');
  }

  if (force || !settings.hasSync('musicListRowHeight')) {
    settings.setSync('musicListRowHeight', '60.0');
  }

  if (force || !settings.hasSync('randomPlaylistTrackCount')) {
    settings.setSync('randomPlaylistTrackCount', 50);
  }

  if (force || !settings.hasSync('playbackFilters')) {
    settings.setSync('playbackFilters', [
      {
        filter: '(\\(|\\[|~|-|（)[Oo]ff [Vv]ocal(\\)|\\]|~|-|）)',
        enabled: false,
      },
      {
        filter: '(（|\\(|\\[|~|-)[Ii]nst(rumental)?(\\)|\\]|~|-|）)',
        enabled: false,
      },
    ]);
  }

  if (force || !settings.hasSync('musicListColumns')) {
    settings.setSync('musicListColumns', [
      {
        id: '#',
        dataKey: 'index',
        alignment: 'center',
        resizable: true,
        width: 50,
        label: '# (Drag/Drop)',
      },
      {
        id: i18n.t('Title')?.toString(),
        dataKey: 'combinedtitle',
        alignment: 'left',
        flexGrow: 5,
        label: i18n.t('Title (Combined)')?.toString(),
      },
      {
        id: i18n.t('Album')?.toString(),
        dataKey: 'album',
        alignment: 'left',
        flexGrow: 3,
        label: i18n.t('Album')?.toString(),
      },
      {
        id: i18n.t('Duration')?.toString(),
        dataKey: 'duration',
        alignment: 'center',
        flexGrow: 2,
        label: i18n.t('Duration')?.toString(),
      },
      {
        id: i18n.t('Bitrate')?.toString(),
        dataKey: 'bitRate',
        alignment: 'left',
        flexGrow: 1,
        label: i18n.t('Bitrate')?.toString(),
      },
      {
        id: i18n.t('Fav')?.toString(),
        dataKey: 'starred',
        alignment: 'center',
        flexGrow: 1,
        label: i18n.t('Favorite')?.toString(),
      },
    ]);
  }

  if (force || !settings.hasSync('albumListFontSize')) {
    settings.setSync('albumListFontSize', '14');
  }

  if (force || !settings.hasSync('albumListRowHeight')) {
    settings.setSync('albumListRowHeight', '60.0');
  }

  if (force || !settings.hasSync('albumListColumns')) {
    settings.setSync('albumListColumns', [
      {
        id: '#',
        dataKey: 'index',
        alignment: 'center',
        resizable: true,
        width: 50,
        label: '#',
      },
      {
        id: i18n.t('Title')?.toString(),
        dataKey: 'combinedtitle',
        alignment: 'left',
        flexGrow: 5,
        label: i18n.t('Title (Combined)')?.toString(),
      },
      {
        id: i18n.t('Tracks')?.toString(),
        dataKey: 'songCount',
        alignment: 'center',
        flexGrow: 1,
        label: i18n.t('Track Count')?.toString(),
      },
      {
        id: i18n.t('Duration')?.toString(),
        dataKey: 'duration',
        alignment: 'center',
        flexGrow: 2,
        label: i18n.t('Duration')?.toString(),
      },
      {
        id: i18n.t('Fav')?.toString(),
        dataKey: 'starred',
        alignment: 'center',
        flexGrow: 1,
        label: i18n.t('Favorite')?.toString(),
      },
    ]);
  }

  if (force || !settings.hasSync('playlistListFontSize')) {
    settings.setSync('playlistListFontSize', '14');
  }

  if (force || !settings.hasSync('playlistListRowHeight')) {
    settings.setSync('playlistListRowHeight', '45.0');
  }

  if (force || !settings.hasSync('playlistListColumns')) {
    settings.setSync('playlistListColumns', [
      {
        id: '#',
        dataKey: 'index',
        alignment: 'center',
        resizable: true,
        width: 50,
        label: '#',
      },
      {
        id: i18n.t('Title')?.toString(),
        dataKey: 'title',
        alignment: 'left',
        flexGrow: 5,
        label: i18n.t('Title')?.toString(),
      },
      {
        id: i18n.t('Description')?.toString(),
        dataKey: 'comment',
        alignment: 'left',
        flexGrow: 3,
        label: i18n.t('Description')?.toString(),
      },
      {
        id: i18n.t('Tracks')?.toString(),
        dataKey: 'songCount',
        alignment: 'center',
        flexGrow: 1,
        label: i18n.t('Track Count')?.toString(),
      },
      {
        id: i18n.t('Owner')?.toString(),
        dataKey: 'owner',
        alignment: 'left',
        flexGrow: 2,
        label: i18n.t('Owner')?.toString(),
      },
      {
        id: i18n.t('Modified')?.toString(),
        dataKey: 'changed',
        alignment: 'left',
        flexGrow: 1,
        label: i18n.t('Modified')?.toString(),
      },
    ]);
  }

  if (force || !settings.hasSync('artistListFontSize')) {
    settings.setSync('artistListFontSize', '14');
  }

  if (force || !settings.hasSync('artistListRowHeight')) {
    settings.setSync('artistListRowHeight', '60.0');
  }

  if (force || !settings.hasSync('artistListColumns')) {
    settings.setSync('artistListColumns', [
      {
        id: '#',
        dataKey: 'index',
        alignment: 'center',
        resizable: true,
        width: 50,
        label: '#',
      },
      {
        id: i18n.t('Art')?.toString(),
        dataKey: 'coverart',
        alignment: 'center',
        resizable: true,
        width: 50,
        label: i18n.t('CoverArt')?.toString(),
      },
      {
        id: i18n.t('Title')?.toString(),
        dataKey: 'title',
        alignment: 'left',
        flexGrow: 5,
        label: i18n.t('Title')?.toString(),
      },
      {
        id: i18n.t('Albums')?.toString(),
        dataKey: 'albumCount',
        alignment: 'left',
        flexGrow: 1,
        label: i18n.t('Album Count')?.toString(),
      },
      {
        id: i18n.t('Fav')?.toString(),
        dataKey: 'starred',
        alignment: 'center',
        flexGrow: 1,
        label: i18n.t('Favorite')?.toString(),
      },
    ]);
  }

  if (force || !settings.hasSync('miniListFontSize')) {
    settings.setSync('miniListFontSize', '12');
  }

  if (force || !settings.hasSync('miniListRowHeight')) {
    settings.setSync('miniListRowHeight', '40');
  }

  if (force || !settings.hasSync('miniListColumns')) {
    settings.setSync('miniListColumns', [
      {
        id: '#',
        dataKey: 'index',
        alignment: 'center',
        resizable: true,
        width: 50,
        label: '# (Drag/Drop)',
      },
      {
        width: 220,
        id: i18n.t('Title')?.toString(),
        dataKey: 'combinedtitle',
        alignment: 'left',
        label: i18n.t('Title (Combined)')?.toString(),
        rowIndex: 7,
        resizable: true,
      },
      {
        width: 60,
        id: i18n.t('Duration')?.toString(),
        dataKey: 'duration',
        alignment: 'center',
        label: i18n.t('Duration')?.toString(),
        rowIndex: 3,
        resizable: true,
      },
      {
        width: 45,
        id: i18n.t('Fav')?.toString(),
        dataKey: 'starred',
        alignment: 'center',
        label: i18n.t('Favorite')?.toString(),
        rowIndex: 6,
        resizable: true,
      },
    ]);
  }

  if (force || !settings.hasSync('genreListFontSize')) {
    settings.setSync('genreListFontSize', '14');
  }

  if (force || !settings.hasSync('genreListRowHeight')) {
    settings.setSync('genreListRowHeight', '50');
  }

  if (force || !settings.hasSync('genreListColumns')) {
    settings.setSync('genreListColumns', [
      {
        id: '#',
        dataKey: 'index',
        alignment: 'center',
        resizable: true,
        width: 50,
        label: '#',
      },
      {
        id: i18n.t('Title')?.toString(),
        dataKey: 'title',
        alignment: 'left',
        flexGrow: 5,
        label: i18n.t('Title')?.toString(),
      },
      {
        id: i18n.t('Albums')?.toString(),
        dataKey: 'albumCount',
        alignment: 'left',
        flexGrow: 3,
        label: i18n.t('Album Count')?.toString(),
      },
      {
        id: i18n.t('Tracks')?.toString(),
        dataKey: 'songCount',
        alignment: 'left',
        flexGrow: 1,
        label: i18n.t('Song Count')?.toString(),
      },
    ]);
  }

  if (force || !settings.hasSync('themes')) {
    settings.setSync('themes', []);
  }

  settings.setSync('themesDefault', [
    {
      label: 'Default Dark',
      value: 'defaultDark',
      type: 'dark',
      fonts: {
        size: {
          page: '14px',
          panelTitle: '20px',
        },
      },
      colors: {
        primary: '#2196F3',
        layout: {
          page: {
            color: '#D8D8D8',
            colorSecondary: '#888e94',
            background: 'linear-gradient(0deg, rgba(20,21,24,1) 32%, rgba(25,25,25,1) 100%)',
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
          miniPlayer: {
            background: '#141518',
          },
        },
        button: {
          default: {
            color: '#D8D8D8',
            colorHover: '#FFFFFF',
            background: '#212227',
            backgroundHover: '#3C3F43',
          },
          primary: {
            color: '#FFFFFF',
            colorHover: '#FFFFFF',
            backgroundHover: '#3B89EC',
          },
          subtle: {
            color: '#D8D8D8',
            colorHover: '#FFFFFF',
            backgroundHover: 'transparent',
          },
        },
        card: {
          overlayButton: {
            color: '#FFFFFF',
            background: 'transparent',
            backgroundHover: '#3B89EC',
            opacity: 0.8,
          },
        },
        contextMenu: {
          color: '#D8D8D8',
          colorDisabled: '#6A6F76',
          background: '#151619',
          backgroundHover: '#292D33',
        },
        input: {
          color: '#D8D8D8',
          background: '#212227',
          backgroundHover: '#353A45',
          backgroundActive: 'rgba(240, 240, 240, .2)',
        },
        nav: {
          color: '#D8D8D8',
        },
        popover: {
          color: '#D8D8D8',
          background: '#151619',
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
          selectedRow: 'rgba(150, 150, 150, .3)',
        },
        tag: {
          background: '#3C3F43',
          text: '#E2E4E9',
        },
        tooltip: {
          color: '#D8D8D8',
          background: '#151619',
        },
      },
      other: {
        button: {
          borderRadius: '15px',
        },
        coverArtBorderRadius: '5px',
        coverArtFilter: 'none',
        card: {
          border: 'none',
          hover: {
            transform: 'none',
            transition: 'none',
            filter: 'none',
          },
          image: {
            borderTop: '2px transparent ridge',
            borderRight: '2px transparent ridge',
            borderBottom: '2px transparent ridge',
            borderLeft: '2px transparent ridge',
            borderRadius: '15px',
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
          borderRadius: '15px',
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
          borderRadius: '15px',
        },
        tooltip: {
          border: '1px #3c3f43 solid',
          borderRadius: '5px',
        },
      },
    },
    {
      label: 'Default Light',
      value: 'defaultLight',
      type: 'light',
      fonts: {
        size: {
          page: '14px',
          panelTitle: '20px',
        },
      },
      colors: {
        primary: '#285DA0',
        layout: {
          page: {
            color: '#000000',
            colorSecondary: '#4c4c4c',
            background: 'linear-gradient(0deg, rgba(255,255,255,1) 64%, rgba(220,220,220,1) 100%)',
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
          miniPlayer: {
            background: 'rgba(255,255,255,1)',
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
            colorHover: '#000000',
            backgroundHover: 'transparent',
          },
        },
        card: {
          overlayButton: {
            color: '#FFFFFF',
            colorHover: '#FFFFFF',
            background: 'transparent',
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
          background: '#F7F7F7',
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
          selectedRow: 'rgba(150, 150, 150, .5)',
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
          borderRadius: '15px',
        },
        coverArtBorderRadius: '5px',
        coverArtFilter: 'none',
        card: {
          border: 'none',
          hover: {
            transform: 'none',
            transition: 'none',
            filter: 'none',
          },
          image: {
            borderTop: '2px transparent ridge',
            borderRight: '2px transparent ridge',
            borderBottom: '2px transparent ridge',
            borderLeft: '2px transparent ridge',
            borderRadius: '15px',
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
          borderRadius: '15px',
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
          borderRadius: '15px',
        },
        tooltip: {
          border: '1px #3c3f43 solid',
          borderRadius: '5px',
        },
      },
    },
    {
      label: 'Plex-like',
      value: 'plexLike',
      type: 'dark',
      fonts: {
        size: {
          page: '14px',
          panelTitle: '20px',
        },
      },
      colors: {
        primary: '#F0AA16',
        layout: {
          page: {
            color: '#EEEFEF',
            colorSecondary: '#868B90',
            background: '#252D39',
          },
          playerBar: {
            color: '#EEEFEF',
            colorSecondary: '#868B90',
            background: '#1F262F',
            button: {
              color: 'rgba(240, 240, 240, 0.8)',
              colorHover: '#FFFFFF',
            },
          },
          sideBar: {
            background: '#1F262F',
            button: {
              color: '#D8D8D8',
              colorHover: '#FFFFFF',
            },
          },
          titleBar: {
            color: '#FFFFFF',
            background: '#1F262F',
          },
          miniPlayer: {
            background: '#252D39',
          },
        },
        button: {
          default: {
            color: '#D8D8D8',
            colorHover: '#FFFFFF',
            background: '#212227',
            backgroundHover: '#3C3F43',
          },
          primary: {
            color: '#212227',
            colorHover: '#212227',
            backgroundHover: '#F3B52F',
          },
          subtle: {
            color: '#D8D8D8',
            colorHover: '#FFFFFF',
            backgroundHover: 'transparent',
          },
        },
        card: {
          overlayButton: {
            color: '#FFFFFF',
            background: 'transparent',
            backgroundHover: '#F3B52F',
            opacity: 0.8,
          },
        },
        contextMenu: {
          color: '#D8D8D8',
          colorDisabled: '#6A6F76',
          background: '#151619',
          backgroundHover: '#292D33',
        },
        input: {
          color: '#D8D8D8',
          background: '#3C4043',
          backgroundHover: '#353A45',
          backgroundActive: 'rgba(240, 240, 240, .2)',
        },
        nav: {
          color: '#D8D8D8',
        },
        popover: {
          color: '#D8D8D8',
          background: '#191A1C',
        },
        slider: {
          background: '#3C3F43',
          progressBar: '#888E94',
        },
        spinner: {
          background: 'rgba(233, 235, 240, 0.3)',
          foreground: '#F0AA16',
        },
        table: {
          selectedRow: 'rgba(150, 150, 150, .3)',
        },
        tag: {
          background: '##3C3F43',
          text: '#E2E4E9',
        },
        tooltip: {
          color: '#D8D8D8',
          background: '#151619',
        },
      },
      other: {
        button: {
          borderRadius: '15px',
        },
        coverArtBorderRadius: '5px',
        coverArtFilter: 'none',
        card: {
          border: 'none',
          hover: {
            transform: 'none',
            transition: 'none',
            filter: 'none',
          },
          image: {
            borderTop: '2px transparent ridge',
            borderRight: '2px transparent ridge',
            borderBottom: '2px transparent ridge',
            borderLeft: '2px transparent ridge',
            borderRadius: '15px',
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
          borderRadius: '15px',
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
          borderRadius: '15px',
        },
        tooltip: {
          border: '1px #3c3f43 solid',
          borderRadius: '5px',
        },
      },
    },
    {
      label: 'Spotify-like',
      value: 'spotifyLike',
      type: 'dark',
      fonts: {
        size: {
          page: '14px',
          panelTitle: '20px',
        },
      },
      colors: {
        primary: '#1DB954',
        layout: {
          page: {
            color: '#FFFFFF',
            colorSecondary: '#B3B3B3',
            background: 'linear-gradient(0deg, rgba(20,21,24,1) 32%, rgba(25,25,25,1) 100%)',
          },
          playerBar: {
            color: '#FFFFFF',
            colorSecondary: '#B3B3B3',
            background: '#181818',
            button: {
              color: 'rgba(240, 240, 240, 0.8)',
              colorHover: '#FFFFFF',
            },
          },
          sideBar: {
            background: '#000000',
            button: {
              color: '#D8D8D8',
              colorHover: '#FFFFFF',
            },
          },
          titleBar: {
            color: '#FFFFFF',
            background: '#000000',
          },
          miniPlayer: {
            background: '#141518',
          },
        },
        button: {
          default: {
            color: '#D8D8D8',
            colorHover: '#FFFFFF',
            background: '#212227',
            backgroundHover: '#3C3F43',
          },
          primary: {
            color: '#FFFFFF',
            colorHover: '#FFFFFF',
            backgroundHover: '#1DB954',
          },
          subtle: {
            color: '#D8D8D8',
            colorHover: '#FFFFFF',
            backgroundHover: 'transparent',
          },
        },
        card: {
          overlayButton: {
            color: '#FFFFFF',
            background: 'transparent',
            backgroundHover: '#1DB954',
            opacity: 0.8,
          },
        },
        contextMenu: {
          color: '#D8D8D8',
          colorDisabled: '#6A6F76',
          background: '#151619',
          backgroundHover: '#292D33',
        },
        input: {
          color: '#D8D8D8',
          background: '#212227',
          backgroundHover: '#353A45',
          backgroundActive: 'rgba(240, 240, 240, .2)',
        },
        nav: {
          color: '#D8D8D8',
        },
        popover: {
          color: '#D8D8D8',
          background: '#151619',
        },
        slider: {
          background: '#3C3F43',
          progressBar: '#888E94',
        },
        spinner: {
          background: 'rgba(233, 235, 240, 0.3)',
          foreground: '#1ED760',
        },
        table: {
          selectedRow: 'rgba(150, 150, 150, .3)',
        },
        tag: {
          background: '#1E1E22',
          text: '#E2E4E9',
        },
        tooltip: {
          color: '#D8D8D8',
          background: '#151619',
        },
      },
      other: {
        button: {
          borderRadius: '15px',
        },
        coverArtBorderRadius: '5px',
        coverArtFilter: 'none',
        card: {
          border: 'none',
          hover: {
            transform: 'none',
            transition: 'none',
            filter: 'none',
          },
          image: {
            borderTop: '2px transparent ridge',
            borderRight: '2px transparent ridge',
            borderBottom: '2px transparent ridge',
            borderLeft: '2px transparent ridge',
            borderRadius: '15px',
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
          borderRadius: '15px',
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
          borderRadius: '15px',
        },
        tooltip: {
          border: '1px #3c3f43 solid',
          borderRadius: '5px',
        },
      },
    },
    {
      label: 'City Lights',
      value: 'cityLights',
      type: 'dark',
      fonts: {
        size: {
          page: '14px',
          panelTitle: '20px',
        },
      },
      colors: {
        primary: '#D6513F',
        layout: {
          page: {
            color: '#B7C5D3',
            colorSecondary: '#718CA1',
            background: '#1D252C',
          },
          playerBar: {
            color: '#B7C5D3',
            colorSecondary: '#718CA1',
            background: '#171D23',
            button: {
              color: '#75787E',
              colorHover: '#F8F5F8',
            },
          },
          sideBar: {
            background: '#171D23',
            button: {
              color: '#75787E',
              colorHover: '#F8F5F8',
            },
          },
          titleBar: {
            color: '#FFFFFF',
            background: '#171D23',
          },
          miniPlayer: {
            background: '#141518',
          },
        },
        button: {
          default: {
            color: '#D8D8D8',
            colorHover: '#FFFFFF',
            background: '#364552',
            backgroundHover: '#008B94',
          },
          primary: {
            color: '#FFFFFF',
            colorHover: '#FFFFFF',
            backgroundHover: '#67252C',
          },
          subtle: {
            color: '#D8D8D8',
            colorHover: '#FFFFFF',
            backgroundHover: '#1D252C',
          },
        },
        card: {
          overlayButton: {
            color: '#FFFFFF',
            background: 'transparent',
            backgroundHover: '#67252C',
            opacity: 0.8,
          },
        },
        contextMenu: {
          color: '#D8D8D8',
          colorDisabled: '#6A6F76',
          background: '#151619',
          backgroundHover: '#292D33',
        },
        input: {
          color: '#D8D8D8',
          background: '#333F4A',
          backgroundHover: '#1D252C',
          backgroundActive: 'rgba(240, 240, 240, .2)',
        },
        nav: {
          color: '#D8D8D8',
        },
        popover: {
          color: '#D8D8D8',
          background: '#151619',
        },
        slider: {
          background: '#3C3F43',
          progressBar: '#888E94',
        },
        spinner: {
          background: 'rgba(233, 235, 240, 0.3)',
          foreground: '#D6513F',
        },
        table: {
          selectedRow: 'rgba(150, 150, 150, .3)',
        },
        tag: {
          background: '#5EC4FF',
          text: '#181E24',
        },
        tooltip: {
          color: '#D8D8D8',
          background: '#151619',
        },
      },
      other: {
        button: {
          borderRadius: '15px',
        },
        coverArtBorderRadius: '5px',
        coverArtFilter: 'none',
        card: {
          border: 'none',
          hover: {
            transform: 'none',
            transition: 'none',
            filter: 'none',
          },
          image: {
            borderTop: '2px transparent ridge',
            borderRight: '2px transparent ridge',
            borderBottom: '2px transparent ridge',
            borderLeft: '2px transparent ridge',
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
          borderRadius: '15px',
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
          borderRadius: '15px',
        },
        tooltip: {
          border: '1px #3c3f43 solid',
          borderRadius: '5px',
        },
      },
    },
    {
      label: 'One Dark',
      value: 'oneDark',
      type: 'dark',
      fonts: {
        size: {
          page: '14px',
          panelTitle: '20px',
        },
      },
      colors: {
        primary: '#98C379',
        layout: {
          page: {
            color: '#CCCCCC',
            colorSecondary: '#8E9094',
            background: '#282C34',
          },
          playerBar: {
            color: '#B7C5D3',
            colorSecondary: '#718CA1',
            background: '#21252B',
            button: {
              color: '#757982',
              colorHover: '#D7DAE0',
            },
          },
          sideBar: {
            background: '#333842',
            button: {
              color: '#757982',
              colorHover: '#D7DAE0',
            },
          },
          titleBar: {
            color: '#9DA5B4',
            background: '#21252B',
          },
          miniPlayer: {
            background: '#282C34',
          },
        },
        button: {
          default: {
            color: '#FFFFFC',
            colorHover: '#FFFFFF',
            background: '#4D78CC',
            backgroundHover: '#6087CF',
          },
          primary: {
            color: '#FFFFFF',
            colorHover: '#FFFFFF',
            backgroundHover: '#55684F',
          },
          subtle: {
            color: '#D8D8D8',
            colorHover: '#FFFFFF',
            backgroundHover: '#1D252C',
          },
        },
        card: {
          overlayButton: {
            color: '#FFFFFF',
            background: 'transparent',
            backgroundHover: '#C26C75',
            opacity: 0.8,
          },
        },
        contextMenu: {
          color: '#F0F0F0',
          colorDisabled: '#6A6F76',
          background: '#353B45',
          backgroundHover: '#2C313A',
        },
        input: {
          color: '#D8D8D8',
          background: '#1B1D23',
          backgroundHover: '#262A31',
          backgroundActive: 'rgba(240, 240, 240, .2)',
        },
        nav: {
          color: '#CCCCCC',
        },
        popover: {
          color: '#CCCCCC',
          background: '#151619',
        },
        slider: {
          background: '#3C3F43',
          progressBar: '#888E94',
        },
        spinner: {
          background: 'rgba(233, 235, 240, 0.3)',
          foreground: '#C26C75',
        },
        table: {
          selectedRow: 'rgba(150, 150, 150, .3)',
        },
        tag: {
          background: '#528BFF',
          text: '#D7D4E8',
        },
        tooltip: {
          color: '#CCCCCC',
          background: '#21252B',
        },
      },
      other: {
        button: {
          borderRadius: '0px',
        },
        coverArtBorderRadius: '5px',
        coverArtFilter: 'none',
        card: {
          border: 'none',
          hover: {
            transform: 'none',
            transition: 'none',
            filter: 'none',
          },
          image: {
            borderTop: '2px transparent ridge',
            borderRight: '2px transparent ridge',
            borderBottom: '2px transparent ridge',
            borderLeft: '2px transparent ridge',
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
          borderRadius: '50px',
        },
        tooltip: {
          border: '1px #3c3f43 solid',
          borderRadius: '5px',
        },
      },
    },
    {
      label: 'Gruvbox Dark',
      value: 'gruvboxDark',
      type: 'dark',
      fonts: {
        size: {
          page: '14px',
          panelTitle: '20px',
        },
      },
      colors: {
        primary: '#8EC07C',
        layout: {
          page: {
            color: '#EBDBB2',
            colorSecondary: '#A89984',
            background: 'linear-gradient(0deg, rgba(29, 32, 33, 1) 32%, rgba(40, 40, 40, 1) 100%)',
          },
          playerBar: {
            color: '#EBDBB2',
            colorSecondary: '#A89984',
            background: '#1D2021',
            button: {
              color: '#A89984',
              colorHover: '#8EC07C',
            },
          },
          sideBar: {
            background: '#1D2021',
            button: {
              color: '#A89984',
              colorHover: '#8EC07C',
            },
          },
          titleBar: {
            color: '#EBDBB2',
            background: '#1D2021',
          },
          miniPlayer: {
            background: '#282828',
          },
        },
        button: {
          default: {
            color: '#BDAE93',
            colorHover: '#EBDBB2',
            background: '#1D2021',
            backgroundHover: '#504945',
          },
          primary: {
            color: '#EBDBB2',
            colorHover: '#EBDBB2',
            backgroundHover: '#8EC07C',
          },
          subtle: {
            color: '#BDAE93',
            colorHover: '#EBDBB2',
            backgroundHover: 'transparent',
          },
        },
        card: {
          overlayButton: {
            color: '#EBDBB2',
            background: 'transparent',
            backgroundHover: '#8EC07C',
            opacity: 0.8,
          },
        },
        contextMenu: {
          color: '#EBDBB2',
          colorDisabled: '#A89984',
          background: '#1D2021',
          backgroundHover: '#504945',
        },
        input: {
          color: '#EBDBB2',
          background: '#1D2021',
          backgroundHover: '#282828',
          backgroundActive: 'rgba(80, 63, 79, 1)',
        },
        nav: {
          color: '#EBDBB2',
        },
        popover: {
          color: '#EBDBB2',
          background: '#1D2021',
        },
        slider: {
          background: '#282828',
          progressBar: '#8EC07C',
        },
        spinner: {
          background: '#1D2021',
          foreground: '#EBDBB2',
        },
        table: {
          selectedRow: 'rgba(124, 111, 100, .3)',
        },
        tag: {
          background: '#8EC07C',
          text: '#282828',
        },
        tooltip: {
          color: '#EBDBB2',
          background: '#1D2021',
        },
      },
      other: {
        button: {
          borderRadius: '15px',
        },
        coverArtBorderRadius: '5px',
        coverArtFilter: 'none',
        card: {
          border: 'none',
          hover: {
            transform: 'none',
            transition: 'none',
            filter: 'none',
          },
          image: {
            borderTop: '2px transparent ridge',
            borderRight: '2px transparent ridge',
            borderBottom: '2px transparent ridge',
            borderLeft: '2px transparent ridge',
            borderRadius: '15px',
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
          borderRadius: '15px',
        },
        miniPlayer: {
          height: '450px',
          opacity: 0.95,
        },
        panel: {
          borderRadius: '0px',
        },
        playerBar: {
          borderTop: '1px solid #282828',
          borderRight: 'none',
          borderBottom: 'none',
          borderLeft: 'none',
          filter: 'none',
        },
        tag: {
          borderRadius: '15px',
        },
        tooltip: {
          border: '1px #282828 solid',
          borderRadius: '5px',
        },
      },
    },
    {
      label: 'Gruvbox Light',
      value: 'gruvboxLight',
      type: 'light',
      fonts: {
        size: {
          page: '14px',
          panelTitle: '20px',
        },
      },
      colors: {
        primary: '#427B58',
        layout: {
          page: {
            color: '#3C3836',
            colorSecondary: '#7C6F64',
            background:
              'linear-gradient(0deg, rgba(235, 219, 178, 1) 32%, rgba(251, 241, 199, 1) 100%)',
          },
          playerBar: {
            color: '#3C3836',
            colorSecondary: '#7C6F64',
            background: '#EBDBB2',
            button: {
              color: '#7C6F64',
              colorHover: '#427B58',
            },
          },
          sideBar: {
            background: '#EBDBB2',
            button: {
              color: '#7C6F64',
              colorHover: '#427B58',
            },
          },
          titleBar: {
            color: '#3C3836',
            background: '#EBDBB2',
          },
          miniPlayer: {
            background: '#FBF1C7',
          },
        },
        button: {
          default: {
            color: '#EBDBB2',
            colorHover: '#EBDBB2',
            background: '#665C54',
            backgroundHover: '#3C3836',
          },
          primary: {
            color: '#3C3836',
            colorHover: '#3C3836',
            backgroundHover: '#427B58',
          },
          subtle: {
            color: '#665c54',
            colorHover: '#3C3836',
            backgroundHover: 'transparent',
          },
        },
        card: {
          overlayButton: {
            color: '#3C3836',
            background: 'transparent',
            backgroundHover: '#427B58',
            opacity: 0.8,
          },
        },
        contextMenu: {
          color: '#3C3836',
          colorDisabled: '#7C6F64',
          background: '#EBDBB2',
          backgroundHover: '#504945',
        },
        input: {
          color: '#3C3836',
          background: '#EBDBB2',
          backgroundHover: '#FBF1C7',
          backgroundActive: 'rgba(40, 40, 40, .2)',
        },
        nav: {
          color: '#3C3836',
        },
        popover: {
          color: '#3C3836',
          background: '#EBDBB2',
        },
        slider: {
          background: '#FBF1C7',
          progressBar: '#427B58',
        },
        spinner: {
          background: '#EBDBB2',
          foreground: '#3C3836',
        },
        table: {
          selectedRow: 'rgba(168, 153, 132, .5)',
        },
        tag: {
          background: '#427B58',
          text: '#FBF1C7',
        },
        tooltip: {
          color: '#3C3836',
          background: '#EBDBB2',
        },
      },
      other: {
        button: {
          borderRadius: '15px',
        },
        coverArtBorderRadius: '3px',
        coverArtFilter: 'none',
        card: {
          border: 'none',
          hover: {
            transform: 'none',
            transition: 'none',
            filter: 'none',
          },
          image: {
            borderTop: '2px transparent ridge',
            borderRight: '2px transparent ridge',
            borderBottom: '2px transparent ridge',
            borderLeft: '2px transparent ridge',
            borderRadius: '15px',
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
          borderRadius: '15px',
        },
        miniPlayer: {
          height: '450px',
          opacity: 0.95,
        },
        panel: {
          borderRadius: '0px',
        },
        playerBar: {
          borderTop: '1px solid #FBF1C7',
          borderRight: 'none',
          borderBottom: 'none',
          borderLeft: 'none',
          filter: 'none',
        },
        tag: {
          borderRadius: '15px',
        },
        tooltip: {
          border: '1px #FBF1C7 solid',
          borderRadius: '5px',
        },
      },
    },
    {
      label: 'Breeze Dark',
      value: 'breezeDark',
      type: 'dark',
      fonts: {
        size: {
          page: '14px',
          panelTitle: '20px',
        },
      },
      colors: {
        primary: '#3DAEE9',
        layout: {
          page: {
            color: '#FCFDFC',
            colorSecondary: '#A1A9B1',
            background: '#1B1E20',
          },
          playerBar: {
            color: '#FCFDFC',
            colorSecondary: '#FCFDFC',
            background: '#1B1E20',
            button: {
              color: 'rgba(240, 240, 240, 0.8)',
              colorHover: '#3DAEE9',
            },
          },
          sideBar: {
            background: '#2A2E32',
            button: {
              color: '#FCFCFC',
              colorHover: '#3DAEE9',
            },
          },
          titleBar: {
            color: '#FCFCFC',
            background: '#31363B',
          },
          miniPlayer: {
            background: '#1B1E20',
          },
        },
        button: {
          default: {
            color: '#FCFCFC',
            colorHover: '#FFFFFF',
            background: '#31363B',
            backgroundHover: '#334E5E',
          },
          primary: {
            color: '#FCFCFC',
            colorHover: '#FFFFFF',
            backgroundHover: '#3DAEE9',
          },
          subtle: {
            color: '#FCFDFC',
            colorHover: '#FCFDFC',
            backgroundHover: 'transparent',
          },
          link: {
            color: '#3DAEE9',
            colorHover: '#9B59B6',
          },
        },
        card: {
          overlayButton: {
            color: '#FFFFFF',
            background: 'transparent',
            opacity: 0.8,
          },
        },
        contextMenu: {
          color: '#FCFCFC',
          colorDisabled: '#A1A9B1',
          background: '#2A2E32',
          backgroundHover: '#2D5165',
        },
        input: {
          color: '#D8D8D8',
          background: '#212227',
          backgroundHover: '#2D5165',
          backgroundActive: 'rgba(240, 240, 240, .2)',
        },
        nav: {
          color: '#FCFCFC',
        },
        popover: {
          color: '#FCFCFC',
          background: '#151619',
        },
        slider: {
          background: '#2A2E32',
          progressBar: '#3DAEE9',
        },
        spinner: {
          background: 'rgba(233, 235, 240, 0.3)',
          foreground: '#3DAEE9',
        },
        table: {
          selectedRow: '#1E5774',
        },
        tag: {
          background: '#31363B',
          text: '#FCFCFC',
        },
        tooltip: {
          color: '#FCFCFC',
          background: '#31363B',
        },
      },
      other: {
        button: {
          borderRadius: '15px',
        },
        coverArtBorderRadius: '5px',
        coverArtFilter: 'none',
        card: {
          border: 'none',
          hover: {
            transform: 'none',
            transition: 'none',
            filter: 'none',
          },
          image: {
            borderTop: '2px transparent ridge',
            borderRight: '2px transparent ridge',
            borderBottom: '2px transparent ridge',
            borderLeft: '2px transparent ridge',
            borderRadius: '15px',
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
          borderRadius: '15px',
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
          borderRadius: '15px',
        },
        tooltip: {
          border: '1px #3C3F43 solid',
          borderRadius: '5px',
        },
      },
    },
  ]);
};

export default setDefaultSettings;
