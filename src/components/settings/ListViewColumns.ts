import i18next from 'i18next';

export const songColumnList = [
  {
    label: i18next.t('# (Drag/Drop)'),
    value: {
      id: '#',
      dataKey: 'index',
      alignment: 'center',
      resizable: true,
      width: 50,
      label: i18next.t('# (Drag/Drop)'),
    },
  },
  {
    label: i18next.t('Album'),
    value: {
      id: i18next.t('Album'),
      dataKey: 'album',
      alignment: 'left',
      resizable: true,
      width: 200,
      label: i18next.t('Album'),
    },
  },
  {
    label: i18next.t('Artist'),
    value: {
      id: i18next.t('Artist'),
      dataKey: 'artist',
      alignment: 'left',
      resizable: true,
      width: 200,
      label: i18next.t('Artist'),
    },
  },
  {
    label: i18next.t('Bitrate'),
    value: {
      id: i18next.t('Bitrate'),
      dataKey: 'bitRate',
      alignment: 'left',
      resizable: true,
      width: 100,
      label: i18next.t('Bitrate'),
    },
  },
  {
    label: i18next.t('CoverArt'),
    value: {
      id: i18next.t('Art'),
      dataKey: 'coverart',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18next.t('CoverArt'),
    },
  },
  {
    label: i18next.t('Created'),
    value: {
      id: i18next.t('Created'),
      dataKey: 'created',
      alignment: 'left',
      resizable: true,
      width: 100,
      label: i18next.t('Created'),
    },
  },
  {
    label: i18next.t('Duration'),
    value: {
      id: i18next.t('Duration'),
      dataKey: 'duration',
      alignment: 'center',
      resizable: true,
      width: 80,
      label: i18next.t('Duration'),
    },
  },
  {
    label: i18next.t('Favorite'),
    value: {
      id: i18next.t('Fav'),
      dataKey: 'starred',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18next.t('Favorite'),
    },
  },
  {
    label: i18next.t('Genre'),
    value: {
      id: i18next.t('Genre'),
      dataKey: 'genre',
      alignment: 'left',
      resizable: true,
      width: 150,
      label: i18next.t('Genre'),
    },
  },
  {
    label: i18next.t('Path'),
    value: {
      id: i18next.t('Path'),
      dataKey: 'path',
      alignment: 'left',
      resizable: true,
      width: 200,
      label: i18next.t('Path'),
    },
  },
  {
    label: i18next.t('Play Count'),
    value: {
      id: i18next.t('Plays'),
      dataKey: 'playCount',
      alignment: 'center',
      resizable: true,
      width: 60,
      label: i18next.t('Play Count'),
    },
  },
  {
    label: i18next.t('Rating'),
    value: {
      id: i18next.t('Rate'),
      dataKey: 'userRating',
      alignment: 'center',
      resizable: true,
      width: 150,
      label: i18next.t('Rating'),
    },
  },
  {
    label: i18next.t('Size'),
    value: {
      id: i18next.t('Size'),
      dataKey: 'size',
      alignment: 'center',
      resizable: true,
      width: 150,
      label: i18next.t('Size'),
    },
  },
  {
    label: i18next.t('Track'),
    value: {
      id: i18next.t('Track #'),
      dataKey: 'track',
      alignment: 'left',
      resizable: true,
      width: 80,
      label: i18next.t('Track'),
    },
  },
  {
    label: i18next.t('Title'),
    value: {
      id: i18next.t('Title'),
      dataKey: 'title',
      alignment: 'left',
      resizable: true,
      width: 300,
      label: i18next.t('Title'),
    },
  },
  {
    label: i18next.t('Title (Combined)'),
    value: {
      id: i18next.t('Title'),
      dataKey: 'combinedtitle',
      alignment: 'left',
      resizable: true,
      width: 300,
      label: i18next.t('Title (Combined)'),
    },
  },
  {
    label: i18next.t('Year'),
    value: {
      id: i18next.t('Year'),
      dataKey: 'year',
      alignment: 'left',
      resizable: true,
      width: 60,
      label: i18next.t('Year'),
    },
  },
];

export const songColumnListAuto = [
  {
    label: i18next.t('# (Drag/Drop)'),
    value: {
      id: '#',
      dataKey: 'index',
      alignment: 'center',
      resizable: true,
      width: 50,
      label: i18next.t('# (Drag/Drop)'),
    },
  },
  {
    label: i18next.t('Album'),
    value: {
      id: i18next.t('Album'),
      dataKey: 'album',
      alignment: 'left',
      flexGrow: 3,
      label: i18next.t('Album'),
    },
  },
  {
    label: i18next.t('Artist'),
    value: {
      id: i18next.t('Artist'),
      dataKey: 'artist',
      alignment: 'left',
      flexGrow: 3,
      label: i18next.t('Artist'),
    },
  },
  {
    label: i18next.t('Bitrate'),
    value: {
      id: i18next.t('Bitrate'),
      dataKey: 'bitRate',
      alignment: 'left',
      flexGrow: 1,
      label: i18next.t('Bitrate'),
    },
  },
  {
    label: i18next.t('CoverArt'),
    value: {
      id: i18next.t('Art'),
      dataKey: 'coverart',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18next.t('CoverArt'),
    },
  },
  {
    label: i18next.t('Created'),
    value: {
      id: i18next.t('Created'),
      dataKey: 'created',
      alignment: 'left',
      flexGrow: 2,
      label: i18next.t('Created'),
    },
  },
  {
    label: i18next.t('Duration'),
    value: {
      id: i18next.t('Duration'),
      dataKey: 'duration',
      alignment: 'center',
      flexGrow: 2,
      label: i18next.t('Duration'),
    },
  },
  {
    label: i18next.t('Favorite'),
    value: {
      id: i18next.t('Fav'),
      dataKey: 'starred',
      alignment: 'center',
      flexGrow: 1,
      label: i18next.t('Favorite'),
    },
  },
  {
    label: i18next.t('Genre'),
    value: {
      id: i18next.t('Genre'),
      dataKey: 'genre',
      alignment: 'left',
      flexGrow: 2,
      label: i18next.t('Genre'),
    },
  },
  {
    label: i18next.t('Path'),
    value: {
      id: i18next.t('Path'),
      dataKey: 'path',
      alignment: 'left',
      flexGrow: 3,
      label: i18next.t('Path'),
    },
  },
  {
    label: i18next.t('Play Count'),
    value: {
      id: i18next.t('Plays'),
      dataKey: 'playCount',
      alignment: 'center',
      flexGrow: 1,
      label: i18next.t('Play Count'),
    },
  },
  {
    label: i18next.t('Rating'),
    value: {
      id: i18next.t('Rate'),
      dataKey: 'userRating',
      alignment: 'center',
      flexGrow: 3,
      label: i18next.t('Rating'),
    },
  },
  {
    label: i18next.t('Size'),
    value: {
      id: i18next.t('Size'),
      dataKey: 'size',
      alignment: 'center',
      flexGrow: 1,
      label: i18next.t('Size'),
    },
  },
  {
    label: i18next.t('Track'),
    value: {
      id: i18next.t('Track #'),
      dataKey: 'track',
      alignment: 'left',
      flexGrow: 1,
      label: i18next.t('Track'),
    },
  },
  {
    label: i18next.t('Title'),
    value: {
      id: i18next.t('Title'),
      dataKey: 'title',
      alignment: 'left',
      flexGrow: 5,
      label: i18next.t('Title'),
    },
  },
  {
    label: i18next.t('Title (Combined)'),
    value: {
      id: i18next.t('Title'),
      dataKey: 'combinedtitle',
      alignment: 'left',
      flexGrow: 5,
      label: i18next.t('Title (Combined)'),
    },
  },
  {
    label: i18next.t('Year'),
    value: {
      id: i18next.t('Year'),
      dataKey: 'year',
      alignment: 'left',
      flexGrow: 1,
      label: i18next.t('Year'),
    },
  },
];

export const songColumnPicker = [
  { label: i18next.t('# (Drag/Drop)') },
  { label: i18next.t('Album') },
  { label: i18next.t('Artist') },
  { label: i18next.t('Bitrate') },
  { label: i18next.t('CoverArt') },
  { label: i18next.t('Created') },
  { label: i18next.t('Duration') },
  { label: i18next.t('Favorite') },
  { label: i18next.t('Genre') },
  { label: i18next.t('Path') },
  { label: i18next.t('Play Count') },
  { label: i18next.t('Rating') },
  { label: i18next.t('Size') },
  { label: i18next.t('Track') },
  { label: i18next.t('Title') },
  { label: i18next.t('Title (Combined)') },
  { label: i18next.t('Year') },
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
    label: i18next.t('Artist'),
    value: {
      id: i18next.t('Artist'),
      dataKey: 'artist',
      alignment: 'left',
      resizable: true,
      width: 200,
      label: i18next.t('Artist'),
    },
  },
  {
    label: i18next.t('CoverArt'),
    value: {
      id: i18next.t('Art'),
      dataKey: 'coverart',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18next.t('CoverArt'),
    },
  },
  {
    label: i18next.t('Created'),
    value: {
      id: i18next.t('Created'),
      dataKey: 'created',
      alignment: 'left',
      resizable: true,
      width: 100,
      label: i18next.t('Created'),
    },
  },
  {
    label: i18next.t('Duration'),
    value: {
      id: i18next.t('Duration'),
      dataKey: 'duration',
      alignment: 'center',
      resizable: true,
      width: 80,
      label: i18next.t('Duration'),
    },
  },
  {
    label: i18next.t('Favorite'),
    value: {
      id: i18next.t('Fav'),
      dataKey: 'starred',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18next.t('Favorite'),
    },
  },
  {
    label: i18next.t('Genre'),
    value: {
      id: i18next.t('Genre'),
      dataKey: 'genre',
      alignment: 'left',
      resizable: true,
      width: 70,
      label: i18next.t('Genre'),
    },
  },
  {
    label: i18next.t('Play Count'),
    value: {
      id: i18next.t('Plays'),
      dataKey: 'playCount',
      alignment: 'center',
      resizable: true,
      width: 60,
      label: i18next.t('Play Count'),
    },
  },
  {
    label: i18next.t('Rating'),
    value: {
      id: i18next.t('Rate'),
      dataKey: 'userRating',
      alignment: 'center',
      resizable: true,
      width: 150,
      label: i18next.t('Rating'),
    },
  },
  {
    label: i18next.t('Track Count'),
    value: {
      id: i18next.t('Tracks'),
      dataKey: 'songCount',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18next.t('Track Count'),
    },
  },
  {
    label: i18next.t('Title'),
    value: {
      id: i18next.t('Title'),
      dataKey: 'title',
      alignment: 'left',
      resizable: true,
      width: 300,
      label: i18next.t('Title'),
    },
  },
  {
    label: i18next.t('Title (Combined)'),
    value: {
      id: i18next.t('Title'),
      dataKey: 'combinedtitle',
      alignment: 'left',
      resizable: true,
      width: 300,
      label: i18next.t('Title (Combined)'),
    },
  },
  {
    label: i18next.t('Year'),
    value: {
      id: i18next.t('Year'),
      dataKey: 'year',
      alignment: 'left',
      resizable: true,
      width: 60,
      label: i18next.t('Year'),
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
    label: i18next.t('Artist'),
    value: {
      id: i18next.t('Artist'),
      dataKey: 'artist',
      alignment: 'left',
      flexGrow: 3,
      label: i18next.t('Artist'),
    },
  },
  {
    label: i18next.t('CoverArt'),
    value: {
      id: i18next.t('Art'),
      dataKey: 'coverart',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18next.t('CoverArt'),
    },
  },
  {
    label: i18next.t('Created'),
    value: {
      id: i18next.t('Created'),
      dataKey: 'created',
      alignment: 'left',
      flexGrow: 2,
      label: i18next.t('Created'),
    },
  },
  {
    label: i18next.t('Duration'),
    value: {
      id: i18next.t('Duration'),
      dataKey: 'duration',
      alignment: 'center',
      flexGrow: 2,
      label: i18next.t('Duration'),
    },
  },
  {
    label: i18next.t('Favorite'),
    value: {
      id: i18next.t('Fav'),
      dataKey: 'starred',
      alignment: 'center',
      flexGrow: 1,
      label: i18next.t('Favorite'),
    },
  },
  {
    label: i18next.t('Genre'),
    value: {
      id: i18next.t('Genre'),
      dataKey: 'genre',
      alignment: 'left',
      flexGrow: 2,
      label: i18next.t('Genre'),
    },
  },
  {
    label: i18next.t('Play Count'),
    value: {
      id: i18next.t('Plays'),
      dataKey: 'playCount',
      alignment: 'center',
      resizable: true,
      width: 60,
      label: i18next.t('Play Count'),
    },
  },
  {
    label: i18next.t('Rating'),
    value: {
      id: i18next.t('Rate'),
      dataKey: 'userRating',
      alignment: 'center',
      flexGrow: 3,
      label: i18next.t('Rating'),
    },
  },
  {
    label: i18next.t('Track Count'),
    value: {
      id: i18next.t('Tracks'),
      dataKey: 'songCount',
      alignment: 'center',
      flexGrow: 1,
      label: i18next.t('Track Count'),
    },
  },
  {
    label: i18next.t('Title'),
    value: {
      id: i18next.t('Title'),
      dataKey: 'title',
      alignment: 'left',
      flexGrow: 5,
      label: i18next.t('Title'),
    },
  },
  {
    label: i18next.t('Title (Combined)'),
    value: {
      id: i18next.t('Title'),
      dataKey: 'combinedtitle',
      alignment: 'left',
      flexGrow: 5,
      label: i18next.t('Title (Combined)'),
    },
  },
  {
    label: i18next.t('Year'),
    value: {
      id: i18next.t('Year'),
      dataKey: 'year',
      alignment: 'left',
      flexGrow: 1,
      label: i18next.t('Year'),
    },
  },
];

export const albumColumnPicker = [
  { label: '#' },
  { label: i18next.t('Artist') },
  { label: i18next.t('CoverArt') },
  { label: i18next.t('Created') },
  { label: i18next.t('Duration') },
  { label: i18next.t('Favorite') },
  { label: i18next.t('Genre') },
  { label: i18next.t('Play Count') },
  { label: i18next.t('Rating') },
  { label: i18next.t('Title') },
  { label: i18next.t('Title (Combined)') },
  { label: i18next.t('Track Count') },
  { label: i18next.t('Year') },
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
    label: i18next.t('CoverArt'),
    value: {
      id: i18next.t('Art'),
      dataKey: 'coverart',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18next.t('CoverArt'),
    },
  },
  {
    label: i18next.t('Created'),
    value: {
      id: i18next.t('Created'),
      dataKey: 'created',
      alignment: 'left',
      resizable: true,
      width: 100,
      label: i18next.t('Created'),
    },
  },
  {
    label: i18next.t('Description'),
    value: {
      id: i18next.t('Description'),
      dataKey: 'comment',
      alignment: 'left',
      resizable: true,
      width: 200,
      label: i18next.t('Description'),
    },
  },
  {
    label: i18next.t('Duration'),
    value: {
      id: i18next.t('Duration'),
      dataKey: 'duration',
      alignment: 'center',
      resizable: true,
      width: 80,
      label: i18next.t('Duration'),
    },
  },
  {
    label: i18next.t('Genre'),
    value: {
      id: i18next.t('Genre'),
      dataKey: 'genre',
      alignment: 'left',
      resizable: true,
      width: 70,
      label: i18next.t('Genre'),
    },
  },
  {
    label: i18next.t('Modified'),
    value: {
      id: i18next.t('Modified'),
      dataKey: 'changed',
      alignment: 'left',
      resizable: true,
      width: 100,
      label: i18next.t('Modified'),
    },
  },
  {
    label: i18next.t('Owner'),
    value: {
      id: i18next.t('Owner'),
      dataKey: 'owner',
      alignment: 'left',
      resizable: true,
      width: 150,
      label: i18next.t('Owner'),
    },
  },
  {
    label: i18next.t('Play Count'),
    value: {
      id: i18next.t('Plays'),
      dataKey: 'playCount',
      alignment: 'center',
      resizable: true,
      width: 60,
      label: i18next.t('Play Count'),
    },
  },
  {
    label: i18next.t('Track Count'),
    value: {
      id: i18next.t('Tracks'),
      dataKey: 'songCount',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18next.t('Track Count'),
    },
  },
  {
    label: i18next.t('Title'),
    value: {
      id: i18next.t('Title'),
      dataKey: 'title',
      alignment: 'left',
      resizable: true,
      width: 300,
      label: i18next.t('Title'),
    },
  },
  {
    label: i18next.t('Visibility'),
    value: {
      id: i18next.t('Visibility'),
      dataKey: 'public',
      alignment: 'left',
      resizable: true,
      width: 100,
      label: i18next.t('Visibility'),
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
    label: i18next.t('CoverArt'),
    value: {
      id: i18next.t('Art'),
      dataKey: 'coverart',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18next.t('CoverArt'),
    },
  },
  {
    label: i18next.t('Created'),
    value: {
      id: i18next.t('Created'),
      dataKey: 'created',
      alignment: 'left',
      flexGrow: 2,
      label: i18next.t('Created'),
    },
  },
  {
    label: i18next.t('Description'),
    value: {
      id: i18next.t('Description'),
      dataKey: 'comment',
      alignment: 'left',
      flexGrow: 3,
      label: i18next.t('Description'),
    },
  },
  {
    label: i18next.t('Duration'),
    value: {
      id: i18next.t('Duration'),
      dataKey: 'duration',
      alignment: 'center',
      flexGrow: 2,
      label: i18next.t('Duration'),
    },
  },
  {
    label: i18next.t('Genre'),
    value: {
      id: i18next.t('Genre'),
      dataKey: 'genre',
      alignment: 'left',
      flexGrow: 2,
      label: i18next.t('Genre'),
    },
  },
  {
    label: i18next.t('Modified'),
    value: {
      id: i18next.t('Modified'),
      dataKey: 'changed',
      alignment: 'left',
      flexGrow: 2,
      label: i18next.t('Modified'),
    },
  },
  {
    label: i18next.t('Owner'),
    value: {
      id: i18next.t('Owner'),
      dataKey: 'owner',
      alignment: 'left',
      flexGrow: 1,
      label: i18next.t('Owner'),
    },
  },
  {
    label: i18next.t('Play Count'),
    value: {
      id: i18next.t('Plays'),
      dataKey: 'playCount',
      alignment: 'center',
      flexGrow: 1,
      label: i18next.t('Play Count'),
    },
  },
  {
    label: i18next.t('Track Count'),
    value: {
      id: i18next.t('Tracks'),
      dataKey: 'songCount',
      alignment: 'center',
      flexGrow: 1,
      label: i18next.t('Track Count'),
    },
  },
  {
    label: i18next.t('Title'),
    value: {
      id: i18next.t('Title'),
      dataKey: 'title',
      alignment: 'left',
      flexGrow: 5,
      label: i18next.t('Title'),
    },
  },
  {
    label: i18next.t('Visibility'),
    value: {
      id: i18next.t('Visibility'),
      dataKey: 'public',
      alignment: 'left',
      flexGrow: 2,
      label: i18next.t('Visibility'),
    },
  },
];

export const playlistColumnPicker = [
  { label: '#' },
  { label: i18next.t('CoverArt') },
  { label: i18next.t('Created') },
  { label: i18next.t('Description') },
  { label: i18next.t('Duration') },
  { label: i18next.t('Modified') },
  { label: i18next.t('Owner') },
  { label: i18next.t('Title') },
  { label: i18next.t('Track Count') },
  { label: i18next.t('Visibility') },
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
    label: i18next.t('Album Count'),
    value: {
      id: i18next.t('Album Count'),
      dataKey: 'albumCount',
      alignment: 'left',
      resizable: true,
      width: 100,
      label: i18next.t('Album Count'),
    },
  },
  {
    label: i18next.t('CoverArt'),
    value: {
      id: i18next.t('Art'),
      dataKey: 'coverart',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18next.t('CoverArt'),
    },
  },
  {
    label: i18next.t('Duration'),
    value: {
      id: i18next.t('Duration'),
      dataKey: 'duration',
      alignment: 'center',
      width: 80,
      label: i18next.t('Duration'),
    },
  },
  {
    label: i18next.t('Favorite'),
    value: {
      id: i18next.t('Fav'),
      dataKey: 'starred',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18next.t('Favorite'),
    },
  },
  {
    label: i18next.t('Rating'),
    value: {
      id: i18next.t('Rate'),
      dataKey: 'userRating',
      alignment: 'center',
      resizable: true,
      width: 150,
      label: i18next.t('Rating'),
    },
  },

  {
    label: i18next.t('Title'),
    value: {
      id: i18next.t('Title'),
      dataKey: 'title',
      alignment: 'left',
      resizable: true,
      width: 300,
      label: i18next.t('Title'),
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
    label: i18next.t('Album Count'),
    value: {
      id: i18next.t('Album Count'),
      dataKey: 'albumCount',
      alignment: 'left',
      flexGrow: 1,
      label: i18next.t('Album Count'),
    },
  },
  {
    label: i18next.t('CoverArt'),
    value: {
      id: i18next.t('Art'),
      dataKey: 'coverart',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18next.t('CoverArt'),
    },
  },
  {
    label: i18next.t('Duration'),
    value: {
      id: i18next.t('Duration'),
      dataKey: 'duration',
      alignment: 'center',
      flexGrow: 2,
      label: i18next.t('Duration'),
    },
  },
  {
    label: i18next.t('Favorite'),
    value: {
      id: i18next.t('Fav'),
      dataKey: 'starred',
      alignment: 'center',
      flexGrow: 1,
      label: i18next.t('Favorite'),
    },
  },
  {
    label: i18next.t('Rating'),
    value: {
      id: i18next.t('Rate'),
      dataKey: 'userRating',
      alignment: 'center',
      flexGrow: 3,
      label: i18next.t('Rating'),
    },
  },
  {
    label: i18next.t('Title'),
    value: {
      id: i18next.t('Title'),
      dataKey: 'title',
      alignment: 'left',
      flexGrow: 5,
      label: i18next.t('Title'),
    },
  },
];

export const artistColumnPicker = [
  { label: '#' },
  { label: i18next.t('Album Count') },
  { label: i18next.t('CoverArt') },
  { label: i18next.t('Duration') },
  { label: i18next.t('Favorite') },
  { label: i18next.t('Rating') },
  { label: i18next.t('Title') },
];

export const genreColumnPicker = [
  { label: '#' },
  { label: i18next.t('Album Count') },
  { label: i18next.t('Title') },
  { label: i18next.t('Track Count') },
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
    label: i18next.t('Album Count'),
    value: {
      id: i18next.t('Album Count'),
      dataKey: 'albumCount',
      alignment: 'left',
      resizable: true,
      width: 100,
      label: i18next.t('Album Count'),
    },
  },
  {
    label: i18next.t('Title'),
    value: {
      id: i18next.t('Title'),
      dataKey: 'title',
      alignment: 'left',
      resizable: true,
      width: 300,
      label: i18next.t('Title'),
    },
  },
  {
    label: i18next.t('Track Count'),
    value: {
      id: i18next.t('Tracks'),
      dataKey: 'songCount',
      alignment: 'center',
      resizable: true,
      width: 100,
      label: i18next.t('Track Count'),
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
    label: i18next.t('Album Count'),
    value: {
      id: i18next.t('Albums'),
      dataKey: 'albumCount',
      alignment: 'left',
      flexGrow: 1,
      label: i18next.t('Album Count'),
    },
  },
  {
    label: i18next.t('Title'),
    value: {
      id: i18next.t('Title'),
      dataKey: 'title',
      alignment: 'left',
      flexGrow: 5,
      label: i18next.t('Title'),
    },
  },
  {
    label: i18next.t('Track Count'),
    value: {
      id: i18next.t('Tracks'),
      dataKey: 'songCount',
      alignment: 'center',
      flexGrow: 1,
      label: i18next.t('Track Count'),
    },
  },
];
