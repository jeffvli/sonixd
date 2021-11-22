import { useState, useEffect, SetStateAction } from 'react';
import _ from 'lodash';

const useSearchQuery = (searchQuery: string, data: any[], filterProperties: string[]) => {
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [filterProps] = useState(filterProperties);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery !== '') {
        const matches: SetStateAction<any[]> = [];
        filterProps.map((prop: string) => {
          const filteredDataByProp = data.filter((entry: any) => {
            if (prop.match('artist')) {
              return String(entry.albumArtist)?.toLowerCase().includes(searchQuery.toLowerCase());
            }

            if (prop.match('genre') && entry.genre) {
              return String(entry.genre[0]?.title)
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase());
            }

            return String(entry[prop])?.toLowerCase().includes(searchQuery.toLowerCase());
          });

          return filteredDataByProp.map((entry) => matches.push(entry));
        });

        setFilteredData(_.uniqBy(matches, 'uniqueId'));
      } else {
        setFilteredData([]);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [data, filterProps, searchQuery]);

  return filteredData;
};

export default useSearchQuery;
