import settings from 'electron-settings';
import path from 'path';
import fs from 'fs';
import { getSongCachePath, getImageCachePath } from '../../shared/utils';
// Set setting defaults on first login
const setDefaultSettings = (force: boolean) => {
  if (force || !settings.hasSync('cachePath')) {
    settings.setSync('cachePath', path.join(path.dirname(settings.file())));
  }

  if (force || !settings.hasSync('volume')) {
    settings.setSync('volume', 0.5);
  }

  fs.mkdirSync(getSongCachePath(), { recursive: true });
  fs.mkdirSync(getImageCachePath(), { recursive: true });

  if (force || !settings.hasSync('defaultRepeat')) {
    settings.setSync('defaultRepeat', 'all');
  }

  if (force || !settings.hasSync('defaultShuffle')) {
    settings.setSync('defaultShuffle', false);
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

  if (force || !settings.hasSync('fadeDuration')) {
    settings.setSync('fadeDuration', '9.0');
  }

  if (force || !settings.hasSync('playlistViewType')) {
    settings.setSync('playlistViewType', 'list');
  }

  if (force || !settings.hasSync('albumViewType')) {
    settings.setSync('albumViewType', 'list');
  }

  if (force || !settings.hasSync('songListFontSize')) {
    settings.setSync('songListFontSize', '14');
  }

  if (force || !settings.hasSync('songListRowHeight')) {
    settings.setSync('songListRowHeight', '60.0');
  }

  if (force || !settings.hasSync('songListColumns')) {
    settings.setSync('songListColumns', [
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
        width: 450,
        label: 'Title (Combined)',
      },
      {
        id: 'Album',
        dataKey: 'album',
        alignment: 'left',
        resizable: true,
        width: 450,
        label: 'Album',
      },
      {
        id: 'Duration',
        dataKey: 'duration',
        alignment: 'center',
        resizable: true,
        width: 100,
        label: 'Duration',
      },
      {
        id: 'Fav',
        dataKey: 'starred',
        alignment: 'center',
        resizable: true,
        width: 60,
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
        resizable: true,
        width: 450,
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
        width: 100,
        label: 'Duration',
      },
      {
        id: 'Fav',
        dataKey: 'starred',
        alignment: 'center',
        resizable: true,
        width: 60,
        label: 'Favorite',
      },
    ]);
  }

  if (force || !settings.hasSync('playlistListFontSize')) {
    settings.setSync('playlistListFontSize', '14');
  }

  if (force || !settings.hasSync('playlistListRowHeight')) {
    settings.setSync('playlistListRowHeight', '55.0');
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
    ]);
  }
};

export default setDefaultSettings;
