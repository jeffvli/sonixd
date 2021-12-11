import { useState, useEffect } from 'react';
import _ from 'lodash';

interface AdvancedFilters {
  enabled: boolean;
  properties: {
    starred: boolean;
    genre: {
      list: any[];
      type: 'or' | 'and';
    };
  };
}

const useAdvancedFilter = (data: any[], filters: AdvancedFilters) => {
  const [filteredData, setFilteredData] = useState<any[]>([]);
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

      setFilteredData(_.compact(_.uniqBy(filteredByGenres, 'uniqueId')));
    } else {
      setFilteredData(data);
    }
  }, [data, filterProps, filters]);

  return filteredData;
};

export default useAdvancedFilter;
