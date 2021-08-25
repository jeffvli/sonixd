import { useState, useEffect, SetStateAction } from 'react';
import _ from 'lodash';

const useSearchQuery = (
  searchQuery: string,
  data: any[],
  filterProperties: string[]
) => {
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [filterProps] = useState(filterProperties);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery !== '') {
        const matches: SetStateAction<any[]> = [];
        filterProps.map((prop: string) => {
          const filteredDataByProp = data.filter((entry: any) => {
            return entry[prop]
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase());
          });

          return filteredDataByProp.map((entry) => matches.push(entry));
        });

        setFilteredData(_.uniqBy(matches, 'id'));
      } else {
        setFilteredData([]);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [data, filterProps, searchQuery]);

  return filteredData;
};

export default useSearchQuery;
