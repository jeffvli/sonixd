import { useState, useEffect } from 'react';
import _ from 'lodash';
import { AdvancedFilters } from '../redux/albumSlice';

const useAdvancedFilter = (data: any[], filters: AdvancedFilters) => {
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [byStarredData, setByStarredData] = useState<any[]>([]);
  const [byGenreData, setByGenreData] = useState<any[]>([]);
  const [byArtistData, setByArtistData] = useState<any[]>([]);

  const [filterProps, setFilterProps] = useState(filters);

  useEffect(() => {
    setFilterProps(filters);
    if (filterProps.enabled) {
      // Favorite/Star filter
      const filteredByStarred = filterProps.properties.starred
        ? (data || []).filter((entry) => {
            return entry.starred !== undefined;
          })
        : data;

      // Genre filter
      const genreRegex = new RegExp(filterProps.properties?.genre?.list.join('|'), 'i');
      const filteredByGenres =
        filterProps.properties.genre.list.length > 0
          ? (filteredByStarred || []).filter((entry) => {
              const entryGenres = _.map(entry.genre, 'title');

              if (filterProps.properties.genre.type === 'or') {
                return entryGenres.some((genre) => genre.match(genreRegex));
              }

              const matches = [];
              for (let i = 0; i < filterProps.properties.genre.list.length; i += 1) {
                if (entryGenres.includes(filterProps.properties.genre.list[i])) {
                  matches.push(entry);
                }
              }

              return matches.length === filterProps.properties.genre.list.length;
            })
          : filteredByStarred;

      const artistRegex = new RegExp(filterProps.properties?.artist?.list.join('|'), 'i');

      const filteredByArtists =
        filterProps.properties.artist.list.length > 0
          ? (filteredByGenres || []).filter((entry) => {
              const entryArtistIds = _.map(entry.artist, 'id');

              if (filterProps.properties.artist.type === 'or') {
                return entryArtistIds.some((artistId) => artistId.match(artistRegex));
              }

              const matches = [];
              for (let i = 0; i < filterProps.properties.artist.list.length; i += 1) {
                if (entryArtistIds.includes(filterProps.properties.artist.list[i])) {
                  matches.push(entry);
                }
              }

              return matches.length === filterProps.properties.artist.list.length;
            })
          : filteredByGenres;

      setByStarredData(_.compact(_.uniqBy(filteredByStarred, 'uniqueId')));
      setByGenreData(_.compact(_.uniqBy(filteredByGenres, 'uniqueId')));
      setByArtistData(_.compact(_.uniqBy(filteredByArtists, 'uniqueId')));
      setFilteredData(_.compact(_.uniqBy(filteredByArtists, 'uniqueId')));
    } else {
      setFilteredData(data);
    }
  }, [data, filterProps, filters]);

  return { filteredData, byStarredData, byGenreData, byArtistData };
};

export default useAdvancedFilter;
