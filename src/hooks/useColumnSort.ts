/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
import { useState, useEffect } from 'react';
import _ from 'lodash';
import { Item } from '../types';

const ALBUM_COLUMNS = [
  { label: 'Artist', dataKey: 'albumArtist' },
  { label: 'Created', dataKey: 'created' },
  { label: 'Duration', dataKey: 'duration' },
  { label: 'Favorite', dataKey: 'starred' },
  { label: 'Genre', dataKey: 'albumGenre' },
  { label: 'Play Count', dataKey: 'playCount' },
  { label: 'Rating', dataKey: 'userRating' },
  { label: 'Song Count', dataKey: 'songCount' },
  { label: 'Title', dataKey: 'title' },
  { label: 'Year', dataKey: 'year' },
];

const ARTIST_COLUMNS = [
  { label: 'Album Count', dataKey: 'albumCount' },
  { label: 'Duration', dataKey: 'duration' },
  { label: 'Favorite', dataKey: 'starred' },
  { label: 'Rating', dataKey: 'userRating' },
  { label: 'Title', dataKey: 'title' },
];

const MUSIC_COLUMNS = [
  { label: 'Artist', dataKey: 'albumArtist' },
  { label: 'Bitrate', dataKey: 'bitRate' },
  { label: 'Created', dataKey: 'created' },
  { label: 'Duration', dataKey: 'duration' },
  { label: 'Favorite', dataKey: 'starred' },
  { label: 'Genre', dataKey: 'albumGenre' },
  { label: 'Play Count', dataKey: 'playCount' },
  { label: 'Rating', dataKey: 'userRating' },
  { label: 'Size', dataKey: 'size' },
  { label: 'Title', dataKey: 'title' },
  { label: 'Year', dataKey: 'year' },
];

const PLAYLIST_COLUMNS = [
  { label: 'Created', dataKey: 'created' },
  { label: 'Description', dataKey: 'comment' },
  { label: 'Duration', dataKey: 'duration' },
  { label: 'Modified', dataKey: 'changed' },
  { label: 'Owner', dataKey: 'owner' },
  { label: 'Song Count', dataKey: 'songCount' },
  { label: 'Title', dataKey: 'title' },
  { label: 'Visibility', dataKey: 'public' },
];

const GENRE_COLUMNS = [
  { label: 'Album Count', dataKey: 'albumCount' },
  { label: 'Song Count', dataKey: 'songCount' },
  { label: 'Title', dataKey: 'title' },
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
