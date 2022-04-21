import i18n from '../../i18n/i18n';

export const songColumnList = [
  {
    label: i18n.t('# (Drag/Drop)'),
    value: {
      id: '#',
      dataKey: 'index',
      alignment: 'center',
      resizable: true,
      width: 50,
      label: i18n.t('# (Drag/Drop)'),
    },
  },
  {
    label: i18n.t('Album'),
    value: {
      id: i18n.t('Album'),
      dataKey: 'album',
      alignment: 'left',
      resizable: true,
      width: 200,
      label: i18n.t('Album'),
    },
  },
  {
    label: i18n.t('Artist'),
    value: {
      id: i18n.t('Artist'),
      dataKey: 'artist',
      alignment: 'left',
      resizable: true,
      width: 200,
      label: i18n.t('Artist'),
    },
  },
  {
    label: i18n.t('Bitrate'),
    value: {
      id: i18n.t('Bitrate'),
      dataKey: 'bitRate',
      alignment: 'left',
      resizable: true,
      width: 100,
      label: i18n.t('Bitrate'),
    },
  },
  {
    label: i18n.t('CoverArt'),
    value: {
      id: i18n.t('Art'),
      dataKey: 'coverart',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18n.t('CoverArt'),
    },
  },
  {
    label: i18n.t('Created'),
    value: {
      id: i18n.t('Created'),
      dataKey: 'created',
      alignment: 'left',
      resizable: true,
      width: 100,
      label: i18n.t('Created'),
    },
  },
  {
    label: i18n.t('Duration'),
    value: {
      id: i18n.t('Duration'),
      dataKey: 'duration',
      alignment: 'center',
      resizable: true,
      width: 80,
      label: i18n.t('Duration'),
    },
  },
  {
    label: i18n.t('Favorite'),
    value: {
      id: i18n.t('Fav'),
      dataKey: 'starred',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18n.t('Favorite'),
    },
  },
  {
    label: i18n.t('Genre'),
    value: {
      id: i18n.t('Genre'),
      dataKey: 'genre',
      alignment: 'left',
      resizable: true,
      width: 150,
      label: i18n.t('Genre'),
    },
  },
  {
    label: i18n.t('Path'),
    value: {
      id: i18n.t('Path'),
      dataKey: 'path',
      alignment: 'left',
      resizable: true,
      width: 200,
      label: i18n.t('Path'),
    },
  },
  {
    label: i18n.t('Play Count'),
    value: {
      id: i18n.t('Plays'),
      dataKey: 'playCount',
      alignment: 'center',
      resizable: true,
      width: 60,
      label: i18n.t('Play Count'),
    },
  },
  {
    label: i18n.t('Rating'),
    value: {
      id: i18n.t('Rate'),
      dataKey: 'userRating',
      alignment: 'center',
      resizable: true,
      width: 150,
      label: i18n.t('Rating'),
    },
  },
  {
    label: i18n.t('Size'),
    value: {
      id: i18n.t('Size'),
      dataKey: 'size',
      alignment: 'center',
      resizable: true,
      width: 150,
      label: i18n.t('Size'),
    },
  },
  {
    label: i18n.t('Track'),
    value: {
      id: i18n.t('Track #'),
      dataKey: 'track',
      alignment: 'left',
      resizable: true,
      width: 80,
      label: i18n.t('Track'),
    },
  },
  {
    label: i18n.t('Title'),
    value: {
      id: i18n.t('Title'),
      dataKey: 'title',
      alignment: 'left',
      resizable: true,
      width: 300,
      label: i18n.t('Title'),
    },
  },
  {
    label: i18n.t('Title (Combined)'),
    value: {
      id: i18n.t('Title'),
      dataKey: 'combinedtitle',
      alignment: 'left',
      resizable: true,
      width: 300,
      label: i18n.t('Title (Combined)'),
    },
  },
  {
    label: i18n.t('Year'),
    value: {
      id: i18n.t('Year'),
      dataKey: 'year',
      alignment: 'left',
      resizable: true,
      width: 60,
      label: i18n.t('Year'),
    },
  },
];

export const songColumnListAuto = [
  {
    label: i18n.t('# (Drag/Drop)'),
    value: {
      id: '#',
      dataKey: 'index',
      alignment: 'center',
      resizable: true,
      width: 50,
      label: i18n.t('# (Drag/Drop)'),
    },
  },
  {
    label: i18n.t('Album'),
    value: {
      id: i18n.t('Album'),
      dataKey: 'album',
      alignment: 'left',
      flexGrow: 3,
      label: i18n.t('Album'),
    },
  },
  {
    label: i18n.t('Artist'),
    value: {
      id: i18n.t('Artist'),
      dataKey: 'artist',
      alignment: 'left',
      flexGrow: 3,
      label: i18n.t('Artist'),
    },
  },
  {
    label: i18n.t('Bitrate'),
    value: {
      id: i18n.t('Bitrate'),
      dataKey: 'bitRate',
      alignment: 'left',
      flexGrow: 1,
      label: i18n.t('Bitrate'),
    },
  },
  {
    label: i18n.t('CoverArt'),
    value: {
      id: i18n.t('Art'),
      dataKey: 'coverart',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18n.t('CoverArt'),
    },
  },
  {
    label: i18n.t('Created'),
    value: {
      id: i18n.t('Created'),
      dataKey: 'created',
      alignment: 'left',
      flexGrow: 2,
      label: i18n.t('Created'),
    },
  },
  {
    label: i18n.t('Duration'),
    value: {
      id: i18n.t('Duration'),
      dataKey: 'duration',
      alignment: 'center',
      flexGrow: 2,
      label: i18n.t('Duration'),
    },
  },
  {
    label: i18n.t('Favorite'),
    value: {
      id: i18n.t('Fav'),
      dataKey: 'starred',
      alignment: 'center',
      flexGrow: 1,
      label: i18n.t('Favorite'),
    },
  },
  {
    label: i18n.t('Genre'),
    value: {
      id: i18n.t('Genre'),
      dataKey: 'genre',
      alignment: 'left',
      flexGrow: 2,
      label: i18n.t('Genre'),
    },
  },
  {
    label: i18n.t('Path'),
    value: {
      id: i18n.t('Path'),
      dataKey: 'path',
      alignment: 'left',
      flexGrow: 3,
      label: i18n.t('Path'),
    },
  },
  {
    label: i18n.t('Play Count'),
    value: {
      id: i18n.t('Plays'),
      dataKey: 'playCount',
      alignment: 'center',
      flexGrow: 1,
      label: i18n.t('Play Count'),
    },
  },
  {
    label: i18n.t('Rating'),
    value: {
      id: i18n.t('Rate'),
      dataKey: 'userRating',
      alignment: 'center',
      flexGrow: 3,
      label: i18n.t('Rating'),
    },
  },
  {
    label: i18n.t('Size'),
    value: {
      id: i18n.t('Size'),
      dataKey: 'size',
      alignment: 'center',
      flexGrow: 1,
      label: i18n.t('Size'),
    },
  },
  {
    label: i18n.t('Track'),
    value: {
      id: i18n.t('Track #'),
      dataKey: 'track',
      alignment: 'left',
      flexGrow: 1,
      label: i18n.t('Track'),
    },
  },
  {
    label: i18n.t('Title'),
    value: {
      id: i18n.t('Title'),
      dataKey: 'title',
      alignment: 'left',
      flexGrow: 5,
      label: i18n.t('Title'),
    },
  },
  {
    label: i18n.t('Title (Combined)'),
    value: {
      id: i18n.t('Title'),
      dataKey: 'combinedtitle',
      alignment: 'left',
      flexGrow: 5,
      label: i18n.t('Title (Combined)'),
    },
  },
  {
    label: i18n.t('Year'),
    value: {
      id: i18n.t('Year'),
      dataKey: 'year',
      alignment: 'left',
      flexGrow: 1,
      label: i18n.t('Year'),
    },
  },
];

export const songColumnPicker = [
  { label: i18n.t('# (Drag/Drop)') },
  { label: i18n.t('Album') },
  { label: i18n.t('Artist') },
  { label: i18n.t('Bitrate') },
  { label: i18n.t('CoverArt') },
  { label: i18n.t('Created') },
  { label: i18n.t('Duration') },
  { label: i18n.t('Favorite') },
  { label: i18n.t('Genre') },
  { label: i18n.t('Path') },
  { label: i18n.t('Play Count') },
  { label: i18n.t('Rating') },
  { label: i18n.t('Size') },
  { label: i18n.t('Track') },
  { label: i18n.t('Title') },
  { label: i18n.t('Title (Combined)') },
  { label: i18n.t('Year') },
];

export const albumColumnList = [
  {
    label: '#',
    value: {
      id: '#',
      dataKey: 'index',
      alignment: 'center',
      resizable: true,
      width: 50,
      label: '#',
    },
  },
  {
    label: i18n.t('Artist'),
    value: {
      id: i18n.t('Artist'),
      dataKey: 'artist',
      alignment: 'left',
      resizable: true,
      width: 200,
      label: i18n.t('Artist'),
    },
  },
  {
    label: i18n.t('CoverArt'),
    value: {
      id: i18n.t('Art'),
      dataKey: 'coverart',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18n.t('CoverArt'),
    },
  },
  {
    label: i18n.t('Created'),
    value: {
      id: i18n.t('Created'),
      dataKey: 'created',
      alignment: 'left',
      resizable: true,
      width: 100,
      label: i18n.t('Created'),
    },
  },
  {
    label: i18n.t('Duration'),
    value: {
      id: i18n.t('Duration'),
      dataKey: 'duration',
      alignment: 'center',
      resizable: true,
      width: 80,
      label: i18n.t('Duration'),
    },
  },
  {
    label: i18n.t('Favorite'),
    value: {
      id: i18n.t('Fav'),
      dataKey: 'starred',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18n.t('Favorite'),
    },
  },
  {
    label: i18n.t('Genre'),
    value: {
      id: i18n.t('Genre'),
      dataKey: 'genre',
      alignment: 'left',
      resizable: true,
      width: 70,
      label: i18n.t('Genre'),
    },
  },
  {
    label: i18n.t('Play Count'),
    value: {
      id: i18n.t('Plays'),
      dataKey: 'playCount',
      alignment: 'center',
      resizable: true,
      width: 60,
      label: i18n.t('Play Count'),
    },
  },
  {
    label: i18n.t('Rating'),
    value: {
      id: i18n.t('Rate'),
      dataKey: 'userRating',
      alignment: 'center',
      resizable: true,
      width: 150,
      label: i18n.t('Rating'),
    },
  },
  {
    label: i18n.t('Track Count'),
    value: {
      id: i18n.t('Tracks'),
      dataKey: 'songCount',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18n.t('Track Count'),
    },
  },
  {
    label: i18n.t('Title'),
    value: {
      id: i18n.t('Title'),
      dataKey: 'title',
      alignment: 'left',
      resizable: true,
      width: 300,
      label: i18n.t('Title'),
    },
  },
  {
    label: i18n.t('Title (Combined)'),
    value: {
      id: i18n.t('Title'),
      dataKey: 'combinedtitle',
      alignment: 'left',
      resizable: true,
      width: 300,
      label: i18n.t('Title (Combined)'),
    },
  },
  {
    label: i18n.t('Year'),
    value: {
      id: i18n.t('Year'),
      dataKey: 'year',
      alignment: 'left',
      resizable: true,
      width: 60,
      label: i18n.t('Year'),
    },
  },
];

export const albumColumnListAuto = [
  {
    label: '#',
    value: {
      id: '#',
      dataKey: 'index',
      alignment: 'center',
      resizable: true,
      width: 50,
      label: '#',
    },
  },
  {
    label: i18n.t('Artist'),
    value: {
      id: i18n.t('Artist'),
      dataKey: 'artist',
      alignment: 'left',
      flexGrow: 3,
      label: i18n.t('Artist'),
    },
  },
  {
    label: i18n.t('CoverArt'),
    value: {
      id: i18n.t('Art'),
      dataKey: 'coverart',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18n.t('CoverArt'),
    },
  },
  {
    label: i18n.t('Created'),
    value: {
      id: i18n.t('Created'),
      dataKey: 'created',
      alignment: 'left',
      flexGrow: 2,
      label: i18n.t('Created'),
    },
  },
  {
    label: i18n.t('Duration'),
    value: {
      id: i18n.t('Duration'),
      dataKey: 'duration',
      alignment: 'center',
      flexGrow: 2,
      label: i18n.t('Duration'),
    },
  },
  {
    label: i18n.t('Favorite'),
    value: {
      id: i18n.t('Fav'),
      dataKey: 'starred',
      alignment: 'center',
      flexGrow: 1,
      label: i18n.t('Favorite'),
    },
  },
  {
    label: i18n.t('Genre'),
    value: {
      id: i18n.t('Genre'),
      dataKey: 'genre',
      alignment: 'left',
      flexGrow: 2,
      label: i18n.t('Genre'),
    },
  },
  {
    label: i18n.t('Play Count'),
    value: {
      id: i18n.t('Plays'),
      dataKey: 'playCount',
      alignment: 'center',
      resizable: true,
      width: 60,
      label: i18n.t('Play Count'),
    },
  },
  {
    label: i18n.t('Rating'),
    value: {
      id: i18n.t('Rate'),
      dataKey: 'userRating',
      alignment: 'center',
      flexGrow: 3,
      label: i18n.t('Rating'),
    },
  },
  {
    label: i18n.t('Track Count'),
    value: {
      id: i18n.t('Tracks'),
      dataKey: 'songCount',
      alignment: 'center',
      flexGrow: 1,
      label: i18n.t('Track Count'),
    },
  },
  {
    label: i18n.t('Title'),
    value: {
      id: i18n.t('Title'),
      dataKey: 'title',
      alignment: 'left',
      flexGrow: 5,
      label: i18n.t('Title'),
    },
  },
  {
    label: i18n.t('Title (Combined)'),
    value: {
      id: i18n.t('Title'),
      dataKey: 'combinedtitle',
      alignment: 'left',
      flexGrow: 5,
      label: i18n.t('Title (Combined)'),
    },
  },
  {
    label: i18n.t('Year'),
    value: {
      id: i18n.t('Year'),
      dataKey: 'year',
      alignment: 'left',
      flexGrow: 1,
      label: i18n.t('Year'),
    },
  },
];

export const albumColumnPicker = [
  { label: '#' },
  { label: i18n.t('Artist') },
  { label: i18n.t('CoverArt') },
  { label: i18n.t('Created') },
  { label: i18n.t('Duration') },
  { label: i18n.t('Favorite') },
  { label: i18n.t('Genre') },
  { label: i18n.t('Play Count') },
  { label: i18n.t('Rating') },
  { label: i18n.t('Title') },
  { label: i18n.t('Title (Combined)') },
  { label: i18n.t('Track Count') },
  { label: i18n.t('Year') },
];

export const playlistColumnList = [
  {
    label: '#',
    value: {
      id: '#',
      dataKey: 'index',
      alignment: 'center',
      resizable: true,
      width: 50,
      label: '#',
    },
  },
  {
    label: i18n.t('CoverArt'),
    value: {
      id: i18n.t('Art'),
      dataKey: 'coverart',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18n.t('CoverArt'),
    },
  },
  {
    label: i18n.t('Created'),
    value: {
      id: i18n.t('Created'),
      dataKey: 'created',
      alignment: 'left',
      resizable: true,
      width: 100,
      label: i18n.t('Created'),
    },
  },
  {
    label: i18n.t('Description'),
    value: {
      id: i18n.t('Description'),
      dataKey: 'comment',
      alignment: 'left',
      resizable: true,
      width: 200,
      label: i18n.t('Description'),
    },
  },
  {
    label: i18n.t('Duration'),
    value: {
      id: i18n.t('Duration'),
      dataKey: 'duration',
      alignment: 'center',
      resizable: true,
      width: 80,
      label: i18n.t('Duration'),
    },
  },
  {
    label: i18n.t('Genre'),
    value: {
      id: i18n.t('Genre'),
      dataKey: 'genre',
      alignment: 'left',
      resizable: true,
      width: 70,
      label: i18n.t('Genre'),
    },
  },
  {
    label: i18n.t('Modified'),
    value: {
      id: i18n.t('Modified'),
      dataKey: 'changed',
      alignment: 'left',
      resizable: true,
      width: 100,
      label: i18n.t('Modified'),
    },
  },
  {
    label: i18n.t('Owner'),
    value: {
      id: i18n.t('Owner'),
      dataKey: 'owner',
      alignment: 'left',
      resizable: true,
      width: 150,
      label: i18n.t('Owner'),
    },
  },
  {
    label: i18n.t('Play Count'),
    value: {
      id: i18n.t('Plays'),
      dataKey: 'playCount',
      alignment: 'center',
      resizable: true,
      width: 60,
      label: i18n.t('Play Count'),
    },
  },
  {
    label: i18n.t('Track Count'),
    value: {
      id: i18n.t('Tracks'),
      dataKey: 'songCount',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18n.t('Track Count'),
    },
  },
  {
    label: i18n.t('Title'),
    value: {
      id: i18n.t('Title'),
      dataKey: 'title',
      alignment: 'left',
      resizable: true,
      width: 300,
      label: i18n.t('Title'),
    },
  },
  {
    label: i18n.t('Visibility'),
    value: {
      id: i18n.t('Visibility'),
      dataKey: 'public',
      alignment: 'left',
      resizable: true,
      width: 100,
      label: i18n.t('Visibility'),
    },
  },
];

export const playlistColumnListAuto = [
  {
    label: '#',
    value: {
      id: '#',
      dataKey: 'index',
      alignment: 'center',
      resizable: true,
      width: 50,
      label: '#',
    },
  },
  {
    label: i18n.t('CoverArt'),
    value: {
      id: i18n.t('Art'),
      dataKey: 'coverart',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18n.t('CoverArt'),
    },
  },
  {
    label: i18n.t('Created'),
    value: {
      id: i18n.t('Created'),
      dataKey: 'created',
      alignment: 'left',
      flexGrow: 2,
      label: i18n.t('Created'),
    },
  },
  {
    label: i18n.t('Description'),
    value: {
      id: i18n.t('Description'),
      dataKey: 'comment',
      alignment: 'left',
      flexGrow: 3,
      label: i18n.t('Description'),
    },
  },
  {
    label: i18n.t('Duration'),
    value: {
      id: i18n.t('Duration'),
      dataKey: 'duration',
      alignment: 'center',
      flexGrow: 2,
      label: i18n.t('Duration'),
    },
  },
  {
    label: i18n.t('Genre'),
    value: {
      id: i18n.t('Genre'),
      dataKey: 'genre',
      alignment: 'left',
      flexGrow: 2,
      label: i18n.t('Genre'),
    },
  },
  {
    label: i18n.t('Modified'),
    value: {
      id: i18n.t('Modified'),
      dataKey: 'changed',
      alignment: 'left',
      flexGrow: 2,
      label: i18n.t('Modified'),
    },
  },
  {
    label: i18n.t('Owner'),
    value: {
      id: i18n.t('Owner'),
      dataKey: 'owner',
      alignment: 'left',
      flexGrow: 1,
      label: i18n.t('Owner'),
    },
  },
  {
    label: i18n.t('Play Count'),
    value: {
      id: i18n.t('Plays'),
      dataKey: 'playCount',
      alignment: 'center',
      flexGrow: 1,
      label: i18n.t('Play Count'),
    },
  },
  {
    label: i18n.t('Track Count'),
    value: {
      id: i18n.t('Tracks'),
      dataKey: 'songCount',
      alignment: 'center',
      flexGrow: 1,
      label: i18n.t('Track Count'),
    },
  },
  {
    label: i18n.t('Title'),
    value: {
      id: i18n.t('Title'),
      dataKey: 'title',
      alignment: 'left',
      flexGrow: 5,
      label: i18n.t('Title'),
    },
  },
  {
    label: i18n.t('Visibility'),
    value: {
      id: i18n.t('Visibility'),
      dataKey: 'public',
      alignment: 'left',
      flexGrow: 2,
      label: i18n.t('Visibility'),
    },
  },
];

export const playlistColumnPicker = [
  { label: '#' },
  { label: i18n.t('CoverArt') },
  { label: i18n.t('Created') },
  { label: i18n.t('Description') },
  { label: i18n.t('Duration') },
  { label: i18n.t('Modified') },
  { label: i18n.t('Owner') },
  { label: i18n.t('Title') },
  { label: i18n.t('Track Count') },
  { label: i18n.t('Visibility') },
];

export const artistColumnList = [
  {
    label: '#',
    value: {
      id: '#',
      dataKey: 'index',
      alignment: 'center',
      resizable: true,
      width: 50,
      label: '#',
    },
  },
  {
    label: i18n.t('Album Count'),
    value: {
      id: i18n.t('Album Count'),
      dataKey: 'albumCount',
      alignment: 'left',
      resizable: true,
      width: 100,
      label: i18n.t('Album Count'),
    },
  },
  {
    label: i18n.t('CoverArt'),
    value: {
      id: i18n.t('Art'),
      dataKey: 'coverart',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18n.t('CoverArt'),
    },
  },
  {
    label: i18n.t('Duration'),
    value: {
      id: i18n.t('Duration'),
      dataKey: 'duration',
      alignment: 'center',
      width: 80,
      label: i18n.t('Duration'),
    },
  },
  {
    label: i18n.t('Favorite'),
    value: {
      id: i18n.t('Fav'),
      dataKey: 'starred',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18n.t('Favorite'),
    },
  },
  {
    label: i18n.t('Genre'),
    value: {
      id: i18n.t('Genre'),
      dataKey: 'genre',
      alignment: 'left',
      resizable: true,
      width: 70,
      label: i18n.t('Genre'),
    },
  },
  {
    label: i18n.t('Rating'),
    value: {
      id: i18n.t('Rate'),
      dataKey: 'userRating',
      alignment: 'center',
      resizable: true,
      width: 150,
      label: i18n.t('Rating'),
    },
  },

  {
    label: i18n.t('Title'),
    value: {
      id: i18n.t('Title'),
      dataKey: 'title',
      alignment: 'left',
      resizable: true,
      width: 300,
      label: i18n.t('Title'),
    },
  },
];

export const artistColumnListAuto = [
  {
    label: '#',
    value: {
      id: '#',
      dataKey: 'index',
      alignment: 'center',
      resizable: true,
      width: 50,
      label: '#',
    },
  },
  {
    label: i18n.t('Album Count'),
    value: {
      id: i18n.t('Album Count'),
      dataKey: 'albumCount',
      alignment: 'left',
      flexGrow: 1,
      label: i18n.t('Album Count'),
    },
  },
  {
    label: i18n.t('CoverArt'),
    value: {
      id: i18n.t('Art'),
      dataKey: 'coverart',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18n.t('CoverArt'),
    },
  },
  {
    label: i18n.t('Duration'),
    value: {
      id: i18n.t('Duration'),
      dataKey: 'duration',
      alignment: 'center',
      flexGrow: 2,
      label: i18n.t('Duration'),
    },
  },
  {
    label: i18n.t('Favorite'),
    value: {
      id: i18n.t('Fav'),
      dataKey: 'starred',
      alignment: 'center',
      flexGrow: 1,
      label: i18n.t('Favorite'),
    },
  },
  {
    label: i18n.t('Genre'),
    value: {
      id: i18n.t('Genre'),
      dataKey: 'genre',
      alignment: 'center',
      flexGrow: 2,
      label: i18n.t('Genre'),
    },
  },
  {
    label: i18n.t('Rating'),
    value: {
      id: i18n.t('Rate'),
      dataKey: 'userRating',
      alignment: 'center',
      flexGrow: 3,
      label: i18n.t('Rating'),
    },
  },
  {
    label: i18n.t('Title'),
    value: {
      id: i18n.t('Title'),
      dataKey: 'title',
      alignment: 'left',
      flexGrow: 5,
      label: i18n.t('Title'),
    },
  },
];

export const artistColumnPicker = [
  { label: '#' },
  { label: i18n.t('Album Count') },
  { label: i18n.t('CoverArt') },
  { label: i18n.t('Duration') },
  { label: i18n.t('Favorite') },
  { label: i18n.t('Genre') },
  { label: i18n.t('Rating') },
  { label: i18n.t('Title') },
];

export const genreColumnPicker = [
  { label: '#' },
  { label: i18n.t('Album Count') },
  { label: i18n.t('Title') },
  { label: i18n.t('Track Count') },
];

export const genreColumnList = [
  {
    label: '#',
    value: {
      id: '#',
      dataKey: 'index',
      alignment: 'center',
      resizable: true,
      width: 50,
      label: '#',
    },
  },
  {
    label: i18n.t('Album Count'),
    value: {
      id: i18n.t('Album Count'),
      dataKey: 'albumCount',
      alignment: 'left',
      resizable: true,
      width: 100,
      label: i18n.t('Album Count'),
    },
  },
  {
    label: i18n.t('Title'),
    value: {
      id: i18n.t('Title'),
      dataKey: 'title',
      alignment: 'left',
      resizable: true,
      width: 300,
      label: i18n.t('Title'),
    },
  },
  {
    label: i18n.t('Track Count'),
    value: {
      id: i18n.t('Tracks'),
      dataKey: 'songCount',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18n.t('Track Count'),
    },
  },
];

export const genreColumnListAuto = [
  {
    label: '#',
    value: {
      id: '#',
      dataKey: 'index',
      alignment: 'center',
      resizable: true,
      width: 50,
      label: '#',
    },
  },
  {
    label: i18n.t('Album Count'),
    value: {
      id: i18n.t('Albums'),
      dataKey: 'albumCount',
      alignment: 'left',
      flexGrow: 1,
      label: i18n.t('Album Count'),
    },
  },
  {
    label: i18n.t('Title'),
    value: {
      id: i18n.t('Title'),
      dataKey: 'title',
      alignment: 'left',
      flexGrow: 5,
      label: i18n.t('Title'),
    },
  },
  {
    label: i18n.t('Track Count'),
    value: {
      id: i18n.t('Tracks'),
      dataKey: 'songCount',
      alignment: 'center',
      flexGrow: 1,
      label: i18n.t('Track Count'),
    },
  },
];
