import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { ButtonToolbar, ControlLabel, Divider, FlexboxGrid, RadioGroup } from 'rsuite';
import styled from 'styled-components';
import { useAppDispatch } from '../../redux/hooks';
import {
  StyledButton,
  StyledCheckbox,
  StyledCheckPicker,
  StyledInputNumber,
  StyledInputPickerContainer,
  StyledRadio,
} from '../shared/styled';

const FilterHeader = styled.div`
  font-size: 16px;
  font-weight: bold;
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
  // 4. byYearData
  // 5. filteredData <- Same as previous (byYearData)

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
            data={_.concat(
              availableGenres,
              _.compact(
                filter.properties.genre.list.map((genre: any) => {
                  if (!_.includes(_.map(availableGenres, 'title'), genre)) {
                    return { title: genre };
                  }

                  return undefined;
                })
              )
            )}
            value={filter.properties.genre.list}
            labelKey="title"
            valueKey="title"
            virtualized
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
            data={_.concat(
              availableArtists,
              _.compact(
                filter.properties.artist.list.map((artistId: any) => {
                  if (!_.includes(_.map(availableArtists, 'id'), artistId)) {
                    return { title: artistId, id: artistId };
                  }

                  return undefined;
                })
              )
            )}
            value={filter.properties.artist.list}
            labelKey="title"
            valueKey="id"
            virtualized
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
        </ButtonToolbar>
      </StyledInputPickerContainer>
      <FilterHeader>
        <FlexboxGrid justify="space-between">
          <FlexboxGrid.Item>Years</FlexboxGrid.Item>
          <FlexboxGrid.Item>
            <StyledButton
              size="xs"
              appearance="primary"
              onClick={() => {
                dispatch(
                  setAdvancedFilters({
                    filter: 'year',
                    value: { from: 0, to: 0 },
                  })
                );
              }}
            >
              Reset
            </StyledButton>
          </FlexboxGrid.Item>
        </FlexboxGrid>
      </FilterHeader>
      <FlexboxGrid justify="space-between">
        <FlexboxGrid.Item>
          <ControlLabel>From</ControlLabel>
          <StyledInputNumber
            width={100}
            min={0}
            max={3000}
            step={1}
            defaultValue={filter.properties.year.from}
            value={filter.properties.year.from}
            onChange={(e: number) => {
              dispatch(
                setAdvancedFilters({
                  filter: 'year',
                  value: { ...filter.properties.year, from: Number(e) },
                })
              );
            }}
          />
        </FlexboxGrid.Item>
        <FlexboxGrid.Item>
          <ControlLabel>To</ControlLabel>
          <StyledInputNumber
            width={100}
            min={0}
            max={3000}
            step={1}
            defaultValue={filter.properties.year.to}
            value={filter.properties.year.to}
            onChange={(e: number) => {
              dispatch(
                setAdvancedFilters({
                  filter: 'year',
                  value: { ...filter.properties.year, to: Number(e) },
                })
              );
            }}
          />
        </FlexboxGrid.Item>
      </FlexboxGrid>
    </div>
  );
};

export default AdvancedFilters;
