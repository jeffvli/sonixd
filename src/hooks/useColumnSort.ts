/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
import { useState, useEffect } from 'react';
import _ from 'lodash';
import i18n from '../i18n/i18n';
import { Item } from '../types';

const ALBUM_COLUMNS = [
  { label: i18n.t('Artist'), dataKey: 'albumArtist' },
  { label: i18n.t('Created'), dataKey: 'created' },
  { label: i18n.t('Duration'), dataKey: 'duration' },
  { label: i18n.t('Favorite'), dataKey: 'starred' },
  { label: i18n.t('Genre'), dataKey: 'albumGenre' },
  { label: i18n.t('Play Count'), dataKey: 'playCount' },
  { label: i18n.t('Rating'), dataKey: 'userRating' },
  { label: i18n.t('Song Count'), dataKey: 'songCount' },
  { label: i18n.t('Title'), dataKey: 'title' },
  { label: i18n.t('Year'), dataKey: 'year' },
];

const ARTIST_COLUMNS = [
  { label: i18n.t('Album Count'), dataKey: 'albumCount' },
  { label: i18n.t('Duration'), dataKey: 'duration' },
  { label: i18n.t('Favorite'), dataKey: 'starred' },
  { label: i18n.t('Rating'), dataKey: 'userRating' },
  { label: i18n.t('Title'), dataKey: 'title' },
];

const MUSIC_COLUMNS = [
  { label: i18n.t('Artist'), dataKey: 'albumArtist' },
  { label: i18n.t('Bitrate'), dataKey: 'bitRate' },
  { label: i18n.t('Created'), dataKey: 'created' },
  { label: i18n.t('Duration'), dataKey: 'duration' },
  { label: i18n.t('Favorite'), dataKey: 'starred' },
  { label: i18n.t('Genre'), dataKey: 'albumGenre' },
  { label: i18n.t('Play Count'), dataKey: 'playCount' },
  { label: i18n.t('Rating'), dataKey: 'userRating' },
  { label: i18n.t('Size'), dataKey: 'size' },
  { label: i18n.t('Title'), dataKey: 'title' },
  { label: i18n.t('Year'), dataKey: 'year' },
];

const PLAYLIST_COLUMNS = [
  { label: i18n.t('Created'), dataKey: 'created' },
  { label: i18n.t('Description'), dataKey: 'comment' },
  { label: i18n.t('Duration'), dataKey: 'duration' },
  { label: i18n.t('Modified'), dataKey: 'changed' },
  { label: i18n.t('Owner'), dataKey: 'owner' },
  { label: i18n.t('Song Count'), dataKey: 'songCount' },
  { label: i18n.t('Title'), dataKey: 'title' },
  { label: i18n.t('Visibility'), dataKey: 'public' },
];

const GENRE_COLUMNS = [
  { label: i18n.t('Album Count'), dataKey: 'albumCount' },
  { label: i18n.t('Song Count'), dataKey: 'songCount' },
  { label: i18n.t('Title'), dataKey: 'title' },
];

const useColumnSort = (data: any[], type: Item, sort: { column: string; type: 'asc' | 'desc' }) => {
  const [sortProps, setSortProps] = useState<any>(sort);
  const [sortedData, setSortedData] = useState<any[]>([]);
  const [sortColumns, setSortColumns] = useState<any[]>([]);

  useEffect(() => {
    if (type === Item.Album) {
      return setSortColumns(ALBUM_COLUMNS);
    }

    if (type === Item.Artist) {
      return setSortColumns(ARTIST_COLUMNS);
    }

    if (type === Item.Music) {
      return setSortColumns(MUSIC_COLUMNS);
    }

    if (type === Item.Genre) {
      return setSortColumns(GENRE_COLUMNS);
    }

    if (type === Item.Playlist) {
      return setSortColumns(PLAYLIST_COLUMNS);
    }
  }, [type]);

  useEffect(() => {
    setSortProps(sort);

    const sortedByColumn = sortProps.column
      ? _.orderBy(
          data,
          [
            (entry: any) => {
              return typeof entry[sortProps.column!] === 'string'
                ? entry[sortProps.column!].toLowerCase() || ''
                : +entry[sortProps.column!] || '';
            },
          ],
          sortProps.type
        )
      : data;

    setSortedData(sortedByColumn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, sort.column, sort.type, sortProps.column, sortProps.type]);

  return { sortedData, sortColumns };
};

export default useColumnSort;
