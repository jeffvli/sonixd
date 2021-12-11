/* eslint-disable react/destructuring-assignment */
import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { RadioGroup } from 'rsuite';
import styled from 'styled-components';
import { useAppDispatch } from '../../redux/hooks';
import {
  StyledCheckbox,
  StyledCheckPicker,
  StyledInputPickerContainer,
  StyledRadio,
} from '../shared/styled';

const FilterHeader = styled.h1`
  font-size: 16px;
  line-height: unset;
`;

const AdvancedFilters = ({ filteredData, originalData, filter, setAdvancedFilters }: any) => {
  const dispatch = useAppDispatch();
  const [availableGenres, setAvailableGenres] = useState<any[]>([]);
  const genreFilterPickerContainerRef = useRef<any>();

  useEffect(() => {
    setAvailableGenres(
      _.orderBy(
        _.uniqBy(
          _.flatten(
            _.map(
              filter.properties.starred || filter.properties.genre.type === 'and'
                ? filteredData
                : originalData,
              'genre'
            )
          ),
          'title'
        ),
        [
          (entry: any) => {
            return typeof entry.title === 'string'
              ? entry.title.toLowerCase() || ''
              : +entry.title || '';
          },
        ]
      )
    );
  }, [filter.properties.genre.type, filter.properties.starred, filteredData, originalData]);

  return (
    <div>
      <FilterHeader>Filters</FilterHeader>
      <StyledCheckbox
        defaultChecked={filter.enabled}
        checked={filter.enabled}
        onChange={(_v: any, e: boolean) => {
          dispatch(setAdvancedFilters({ ...filter, enabled: e }));
        }}
      >
        Enabled
      </StyledCheckbox>
      <StyledCheckbox
        defaultChecked={filter.properties.starred}
        checked={filter.properties.starred}
        onChange={(_v: any, e: boolean) => {
          dispatch(
            setAdvancedFilters({
              ...filter,
              properties: {
                ...filter.properties,
                starred: e,
              },
            })
          );
        }}
      >
        Is favorite
      </StyledCheckbox>
      <br />
      <FilterHeader>Genres</FilterHeader>
      <RadioGroup
        inline
        defaultValue={filter.properties.genre.type}
        onChange={(e: string) => {
          dispatch(
            setAdvancedFilters({
              ...filter,
              properties: {
                ...filter.properties,
                genre: {
                  ...filter.properties.genre,
                  type: e,
                },
              },
            })
          );
        }}
      >
        <StyledRadio value="and">AND</StyledRadio>
        <StyledRadio value="or">OR</StyledRadio>
      </RadioGroup>
      <StyledInputPickerContainer ref={genreFilterPickerContainerRef}>
        <StyledCheckPicker
          container={() => genreFilterPickerContainerRef.current}
          data={availableGenres}
          value={filter.properties.genre.list}
          labelKey="title"
          valueKey="title"
          sticky
          style={{ width: '250px' }}
          onChange={(e: string[]) => {
            dispatch(
              setAdvancedFilters({
                ...filter,
                properties: {
                  ...filter.properties,
                  genre: {
                    ...filter.properties.genre,
                    list: e,
                  },
                },
              })
            );
          }}
        />
      </StyledInputPickerContainer>
    </div>
  );
};

export default AdvancedFilters;
