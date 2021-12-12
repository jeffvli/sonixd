/* eslint-disable react/destructuring-assignment */
import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { ButtonToolbar, Icon, RadioGroup } from 'rsuite';
import styled from 'styled-components';
import { useAppDispatch } from '../../redux/hooks';
import {
  StyledCheckbox,
  StyledCheckPicker,
  StyledIconButton,
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
  const [availableArtists, setAvailableArtists] = useState<any[]>([]);
  const [genreListData, setGenreListData] = useState<any[]>([]);
  const [artistListData, setArtistListData] = useState<any[]>([]);
  const genreFilterPickerContainerRef = useRef<any>();
  const artistFilterPickerContainerRef = useRef<any>();

  // Filter flow from TOP to BOTTOM (see useAdvancedFilter hook)
  // 1. byStarredData
  // 2. byGenreData
  // 3. byArtistData
  // 4. filteredData

  useEffect(() => {
    if (filter.properties.artist.type === 'and') {
      return setArtistListData(filteredData.byArtistData);
    }

    if (filter.properties.starred) {
      return setArtistListData(filteredData.byGenreData);
    }

    if (filter.properties.artist.type === 'or') {
      return setArtistListData(filteredData.byGenreData);
    }

    return setArtistListData(originalData);
  }, [
    filter.properties.artist.list.length,
    filter.properties.artist.type,
    filter.properties.starred,
    filteredData.byArtistData,
    filteredData.byGenreData,
    originalData,
  ]);

  useEffect(() => {
    if (filter.properties.starred) {
      if (filter.properties.genre.type === 'and') {
        return setGenreListData(filteredData.filteredData);
      }
      return setGenreListData(filteredData.byArtistData);
    }

    if (filter.properties.artist.list.length > 0) {
      if (filter.properties.genre.type === 'and') {
        return setGenreListData(filteredData.filteredData);
      }
      return setGenreListData(filteredData.byArtistBaseData);
    }

    if (filter.properties.genre.list.length > 0) {
      if (filter.properties.genre.type === 'and') {
        return setGenreListData(filteredData.byGenreData);
      }
    }

    return setGenreListData(originalData);
  }, [
    filter.properties.artist.list.length,
    filter.properties.genre.list.length,
    filter.properties.genre.type,
    filter.properties.starred,
    filteredData,
    originalData,
  ]);

  useEffect(() => {
    const allGenres = _.flatten(_.map(genreListData, 'genre'));
    const counts = _.countBy(allGenres, 'title');
    const uniqueGenres = _.orderBy(_.uniqBy(allGenres, 'title'), [
      (entry: any) => {
        return typeof entry.title === 'string'
          ? entry.title.toLowerCase() || ''
          : +entry.title || '';
      },
    ]);

    setAvailableGenres(
      uniqueGenres.map((genre) => {
        return {
          id: genre.id,
          title: genre.title,
          count: counts[genre.title],
        };
      })
    );
  }, [genreListData]);

  useEffect(() => {
    const allArtists = _.flatten(_.map(artistListData, 'artist'));
    const counts = _.countBy(allArtists, 'id');
    const uniqueArtists = _.orderBy(_.uniqBy(allArtists, 'id'), [
      (entry: any) => {
        return typeof entry.title === 'string'
          ? entry.title.toLowerCase() || ''
          : +entry.title || '';
      },
    ]);

    setAvailableArtists(
      uniqueArtists.map((artist) => {
        return {
          id: artist.id,
          title: artist.title,
          count: counts[artist.id],
        };
      })
    );
  }, [artistListData]);

  return (
    <div>
      <FilterHeader>Filters</FilterHeader>
      <StyledCheckbox
        defaultChecked={filter.enabled}
        checked={filter.enabled}
        onChange={(_v: any, e: boolean) => {
          dispatch(setAdvancedFilters({ filter: 'enabled', value: e }));
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
              filter: 'starred',
              value: e,
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
            setAdvancedFilters({ filter: 'genre', value: { ...filter.properties.genre, type: e } })
          );
        }}
      >
        <StyledRadio value="and">AND</StyledRadio>
        <StyledRadio value="or">OR</StyledRadio>
      </RadioGroup>
      <StyledInputPickerContainer ref={genreFilterPickerContainerRef}>
        <ButtonToolbar>
          <StyledCheckPicker
            container={() => genreFilterPickerContainerRef.current}
            data={availableGenres}
            value={filter.properties.genre.list}
            labelKey="title"
            valueKey="title"
            virtualized
            cleanable={false}
            renderMenuItem={(label: string, item: any) => {
              return (
                <div>
                  {label} ({item.count || 0})
                </div>
              );
            }}
            sticky
            style={{ width: '250px' }}
            onChange={(e: string[]) => {
              dispatch(
                setAdvancedFilters({
                  filter: 'genre',
                  value: { ...filter.properties.genre, list: e },
                })
              );
            }}
          />
          <StyledIconButton
            appearance={filter.properties.genre.list.length > 0 ? 'primary' : 'subtle'}
            disabled={filter.properties.genre.list.length === 0}
            size="xs"
            icon={<Icon icon="close" />}
            onClick={() => {
              dispatch(
                setAdvancedFilters({
                  filter: 'genre',
                  value: { ...filter.properties.genre, list: [] },
                })
              );
            }}
          />
        </ButtonToolbar>
      </StyledInputPickerContainer>
      <br />
      <FilterHeader>Artists</FilterHeader>
      <RadioGroup
        inline
        defaultValue={filter.properties.artist.type}
        onChange={(e: string) => {
          dispatch(
            setAdvancedFilters({
              filter: 'artist',
              value: { ...filter.properties.artist, type: e },
            })
          );
        }}
      >
        <StyledRadio value="and">AND</StyledRadio>
        <StyledRadio value="or">OR</StyledRadio>
      </RadioGroup>
      <StyledInputPickerContainer ref={artistFilterPickerContainerRef}>
        <ButtonToolbar>
          <StyledCheckPicker
            container={() => artistFilterPickerContainerRef.current}
            data={availableArtists}
            value={filter.properties.artist.list}
            labelKey="title"
            valueKey="id"
            virtualized
            cleanable={false}
            renderMenuItem={(label: string, item: any) => {
              return (
                <div>
                  {label} ({item.count || 0})
                </div>
              );
            }}
            sticky
            style={{ width: '250px' }}
            onChange={(e: string[]) => {
              dispatch(
                setAdvancedFilters({
                  filter: 'artist',
                  value: { ...filter.properties.artist, list: e },
                })
              );
            }}
          />
          <StyledIconButton
            appearance={filter.properties.artist.list.length > 0 ? 'primary' : 'subtle'}
            disabled={filter.properties.artist.list.length === 0}
            size="xs"
            icon={<Icon icon="close" />}
            onClick={() => {
              dispatch(
                setAdvancedFilters({
                  filter: 'artist',
                  value: { ...filter.properties.artist, list: [] },
                })
              );
            }}
          />
        </ButtonToolbar>
      </StyledInputPickerContainer>
    </div>
  );
};

export default AdvancedFilters;
