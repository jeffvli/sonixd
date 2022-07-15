import { useState, useEffect } from 'react';
import _ from 'lodash';
import { AdvancedFilters } from '../redux/viewSlice';

const useAdvancedFilter = (data: any[], filters: AdvancedFilters) => {
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [byStarredData, setByStarredData] = useState<any[]>([]);
  const [byGenreData, setByGenreData] = useState<any[]>([]);
  const [byArtistData, setByArtistData] = useState<any[]>([]);
  const [byArtistBaseData, setByArtistBaseData] = useState<any[]>([]);
  const [byYearData, setByYearData] = useState<any[]>([]);

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

      const filteredByNotStarred = filterProps.properties.notStarred
        ? (data || []).filter((entry) => {
            return entry.starred === null || entry.starred === undefined;
          })
        : data;

      const starFilter = filterProps.properties.starred ? filteredByStarred : filteredByNotStarred;

      // Genre filter
      const genreRegex = new RegExp(filterProps.properties?.genre?.list.join('|'), 'i');
      const filteredByGenres =
        filterProps.properties.genre.list.length > 0
          ? (starFilter || []).filter((entry) => {
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
          : starFilter;

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

      // Instead of filtering from the previous (genre), start from the starred filter
      const filteredByArtistsBase =
        filterProps.properties.artist.list.length > 0
          ? (starFilter || []).filter((entry) => {
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
          : starFilter;

      const filteredByYear = !(
        filterProps.properties.year.from === 0 && filterProps.properties.year.to === 0
      )
        ? (filteredByArtists || []).filter((entry) => {
            if (filterProps.properties.year.from !== 0 && filterProps.properties.year.to === 0) {
              return entry.year && entry.year >= filterProps.properties.year.from;
            }

            if (filterProps.properties.year.from === 0 && filterProps.properties.year.to !== 0) {
              return entry.year && entry.year <= filterProps.properties.year.to;
            }

            if (filterProps.properties.year.from !== 0 && filterProps.properties.year.to !== 0) {
              return (
                entry.year &&
                entry.year >= filterProps.properties.year.from &&
                entry.year <= filterProps.properties.year.to
              );
            }
            return undefined;
          })
        : filteredByArtists;

      setByStarredData(_.compact(_.uniqBy(starFilter, 'uniqueId')));
      setByGenreData(_.compact(_.uniqBy(filteredByGenres, 'uniqueId')));
      setByArtistData(_.compact(_.uniqBy(filteredByArtists, 'uniqueId')));
      setByArtistBaseData(_.compact(_.uniqBy(filteredByArtistsBase, 'uniqueId')));
      setByYearData(_.compact(_.uniqBy(filteredByYear, 'uniqueId')));
      setFilteredData(_.compact(_.uniqBy(filteredByYear, 'uniqueId')));
    } else {
      setFilteredData(data);
    }
  }, [data, filterProps, filters]);

  return { filteredData, byStarredData, byGenreData, byArtistData, byArtistBaseData, byYearData };
};

export default useAdvancedFilter;
