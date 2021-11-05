import settings from 'electron-settings';
import path from 'path';

const setDefaultSettings = (force: boolean) => {
  if (force || !settings.hasSync('legacyAuth')) {
    settings.setSync('legacyAuth', false);
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
    settings.setSync('exitToTray', false);
  }

  if (force || !settings.hasSync('showDebugWindow')) {
    settings.setSync('showDebugWindow', false);
  }

  if (force || !settings.hasSync('globalMediaHotkeys')) {
    settings.setSync('globalMediaHotkeys', false);
  }

  if (force || !settings.hasSync('cachePath')) {
    settings.setSync('cachePath', path.join(path.dirname(settings.file())));
  }

  if (force || !settings.hasSync('titleBarStyle')) {
    settings.setSync('titleBarStyle', 'windows');
  }

  if (force || !settings.hasSync('scrobble')) {
    settings.setSync('scrobble', false);
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

  if (force || !settings.hasSync('volume')) {
    settings.setSync('volume', 0.3);
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

  if (force || !settings.hasSync('playlistViewType')) {
    settings.setSync('playlistViewType', 'list');
  }

  if (force || !settings.hasSync('albumViewType')) {
    settings.setSync('albumViewType', 'list');
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
        enabled: true,
      },
      {
        filter: '(（|\\(|\\[|~|-)[Ii]nst(rumental)?(\\)|\\]|~|-|）)',
        enabled: true,
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
        id: 'Title',
        dataKey: 'combinedtitle',
        alignment: 'left',
        flexGrow: 5,
        label: 'Title (Combined)',
      },
      {
        id: 'Album',
        dataKey: 'album',
        alignment: 'left',
        flexGrow: 3,
        label: 'Album',
      },
      {
        id: 'Duration',
        dataKey: 'duration',
        alignment: 'center',
        flexGrow: 2,
        label: 'Duration',
      },
      {
        id: 'Bitrate',
        dataKey: 'bitRate',
        alignment: 'left',
        flexGrow: 1,
        label: 'Bitrate',
      },
      {
        id: 'Fav',
        dataKey: 'starred',
        alignment: 'center',
        flexGrow: 1,
        label: 'Favorite',
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
        id: 'Title',
        dataKey: 'combinedtitle',
        alignment: 'left',
        flexGrow: 5,
        label: 'Title (Combined)',
      },
      {
        id: 'Tracks',
        dataKey: 'songCount',
        alignment: 'center',
        flexGrow: 1,
        label: 'Track Count',
      },
      {
        id: 'Duration',
        dataKey: 'duration',
        alignment: 'center',
        flexGrow: 2,
        label: 'Duration',
      },
      {
        id: 'Fav',
        dataKey: 'starred',
        alignment: 'center',
        flexGrow: 1,
        label: 'Favorite',
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
        id: 'Title',
        dataKey: 'name',
        alignment: 'left',
        flexGrow: 5,
        label: 'Title',
      },
      {
        id: 'Description',
        dataKey: 'comment',
        alignment: 'left',
        flexGrow: 3,
        label: 'Description',
      },
      {
        id: 'Tracks',
        dataKey: 'songCount',
        alignment: 'center',
        flexGrow: 1,
        label: 'Track Count',
      },
      {
        id: 'Owner',
        dataKey: 'owner',
        alignment: 'left',
        flexGrow: 2,
        label: 'Owner',
      },
      {
        id: 'Modified',
        dataKey: 'changed',
        alignment: 'left',
        flexGrow: 1,
        label: 'Modified',
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
        id: 'Art',
        dataKey: 'coverart',
        alignment: 'center',
        resizable: true,
        width: 50,
        label: 'CoverArt',
      },
      {
        id: 'Name',
        dataKey: 'name',
        alignment: 'left',
        flexGrow: 5,
        label: 'Name',
      },
      {
        id: 'Albums',
        dataKey: 'albumCount',
        alignment: 'left',
        flexGrow: 1,
        label: 'Album Count',
      },
      {
        id: 'Fav',
        dataKey: 'starred',
        alignment: 'center',
        flexGrow: 1,
        label: 'Favorite',
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
        id: 'Title',
        dataKey: 'combinedtitle',
        alignment: 'left',
        label: 'Title (Combined)',
        rowIndex: 7,
        resizable: true,
      },
      {
        width: 60,
        id: 'Duration',
        dataKey: 'duration',
        alignment: 'center',
        label: 'Duration',
        rowIndex: 3,
        resizable: true,
      },
      {
        width: 45,
        id: 'Fav',
        dataKey: 'starred',
        alignment: 'center',
        label: 'Favorite',
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
        id: 'Name',
        dataKey: 'name',
        alignment: 'left',
        flexGrow: 5,
        label: 'Name',
      },
      {
        id: 'Albums',
        dataKey: 'albumCount',
        alignment: 'left',
        flexGrow: 3,
        label: 'Album Count',
      },
      {
        id: 'Tracks',
        dataKey: 'songCount',
        alignment: 'left',
        flexGrow: 1,
        label: 'Song Count',
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
            background: 'linear-gradient(0deg, rgba(18,19,24,1) 64%, rgba(46,46,44,0.913) 100%)',
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
          selectedRow: 'rgba(150, 150, 150, .3)',
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
            background: 'linear-gradient(0deg, rgba(255,255,255,1) 64%, rgba(181,181,178,1) 100%)',
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
  ]);
};

export default setDefaultSettings;
