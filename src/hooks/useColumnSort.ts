/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
import { useState, useEffect } from 'react';
import _ from 'lodash';
import i18next from 'i18next';
import { Item } from '../types';

const ALBUM_COLUMNS = [
  { label: i18next.t('Artist'), dataKey: 'albumArtist' },
  { label: i18next.t('Created'), dataKey: 'created' },
  { label: i18next.t('Duration'), dataKey: 'duration' },
  { label: i18next.t('Favorite'), dataKey: 'starred' },
  { label: i18next.t('Genre'), dataKey: 'albumGenre' },
  { label: i18next.t('Play Count'), dataKey: 'playCount' },
  { label: i18next.t('Rating'), dataKey: 'userRating' },
  { label: i18next.t('Song Count'), dataKey: 'songCount' },
  { label: i18next.t('Title'), dataKey: 'title' },
  { label: i18next.t('Year'), dataKey: 'year' },
];

const ARTIST_COLUMNS = [
  { label: i18next.t('Album Count'), dataKey: 'albumCount' },
  { label: i18next.t('Duration'), dataKey: 'duration' },
  { label: i18next.t('Favorite'), dataKey: 'starred' },
  { label: i18next.t('Rating'), dataKey: 'userRating' },
  { label: i18next.t('Title'), dataKey: 'title' },
];

const MUSIC_COLUMNS = [
  { label: i18next.t('Artist'), dataKey: 'albumArtist' },
  { label: i18next.t('Bitrate'), dataKey: 'bitRate' },
  { label: i18next.t('Created'), dataKey: 'created' },
  { label: i18next.t('Duration'), dataKey: 'duration' },
  { label: i18next.t('Favorite'), dataKey: 'starred' },
  { label: i18next.t('Genre'), dataKey: 'albumGenre' },
  { label: i18next.t('Play Count'), dataKey: 'playCount' },
  { label: i18next.t('Rating'), dataKey: 'userRating' },
  { label: i18next.t('Size'), dataKey: 'size' },
  { label: i18next.t('Title'), dataKey: 'title' },
  { label: i18next.t('Year'), dataKey: 'year' },
];

const PLAYLIST_COLUMNS = [
  { label: i18next.t('Created'), dataKey: 'created' },
  { label: i18next.t('Description'), dataKey: 'comment' },
  { label: i18next.t('Duration'), dataKey: 'duration' },
  { label: i18next.t('Modified'), dataKey: 'changed' },
  { label: i18next.t('Owner'), dataKey: 'owner' },
  { label: i18next.t('Song Count'), dataKey: 'songCount' },
  { label: i18next.t('Title'), dataKey: 'title' },
  { label: i18next.t('Visibility'), dataKey: 'public' },
];

const GENRE_COLUMNS = [
  { label: i18next.t('Album Count'), dataKey: 'albumCount' },
  { label: i18next.t('Song Count'), dataKey: 'songCount' },
  { label: i18next.t('Title'), dataKey: 'title' },
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
