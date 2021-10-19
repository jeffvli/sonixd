import settings from 'electron-settings';
import path from 'path';

const setDefaultSettings = (force: boolean) => {
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
        id: 'Title',
        dataKey: 'combinedtitle',
        alignment: 'left',
        flexGrow: 5,
        label: 'Title (Combined)',
      },
      {
        id: 'Duration',
        dataKey: 'duration',
        alignment: 'center',
        flexGrow: 2,
        label: 'Duration',
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
};

export default setDefaultSettings;
