/* eslint-disable react/no-array-index-key */
import _ from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useInfiniteQuery, useQueryClient } from 'react-query';
import { useHotkeys } from 'react-hotkeys-hook';
import { useHistory } from 'react-router-dom';
import { Icon, Loader, Whisper } from 'rsuite';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setSearchQuery } from '../../redux/miscSlice';
import { apiController } from '../../api/controller';
import {
  StyledButton,
  StyledCheckbox,
  StyledInput,
  StyledInputGroup,
  StyledInputGroupButton,
} from '../shared/styled';
import { Item, Song } from '../../types';
import Popup from '../shared/Popup';

const SearchContainer = styled.div`
  height: 100%;

  .rs-input-group {
    position: sticky;
    top: 0;
    z-index: 60;
  }
  .rs-input {
    border-radius: 0px !important;
  }

  .rs-btn {
    border-radius: 0px !important;
    position: sticky;
    bottom: 0;
    left: 0;
  }

  .search-options {
    width: 100%;

    .rs-checkbox {
      display: inline-block;
    }
  }
`;

const SectionTitle = styled.div`
  background: rgba(50, 50, 50, 0.3);
  display: flex;
  justify-content: space-between;
  user-select: none;
  z-index: 50;

  .rs-btn {
    font-size: 14px;
    line-height: 14px;
    padding: 5px;

    .rs-icon {
      font-size: 12px;
      margin-right: 10px;
    }
  }
`;

const SectionResults = styled.div<{ show: boolean }>`
  display: ${(props) => (props.show ? 'block' : 'none')};

  .rs-btn {
    text-align: center;
  }
`;

const SearchResultContainer = styled.div`
  padding: 5px;
  display: flex;
  overflow: hidden;
  font-size: 13px;

  .cover-art {
    flex-grow: 1;
    width: 50px;
  }

  .item-details {
    flex-grow: 2;
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .item-top,
  .item-bottom {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &:hover {
    cursor: pointer;
    background-color: ${(props) => props.theme.colors.table.selectedRow} !important;
  }
`;

const SearchResult = ({ entry, handleClick, title, details }: any) => {
  return (
    <SearchResultContainer onClick={() => handleClick(entry)}>
      <div className="cover-art">
        <LazyLoadImage src={entry.image} width="40" height="40" />
      </div>
      <div className="item-details">
        <div className="item-top">{title}</div>
        <div className="item-bottom">{details}</div>
      </div>
    </SearchResultContainer>
  );
};

const SearchBar = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const history = useHistory();
  const config = useAppSelector((state) => state.config);
  const folder = useAppSelector((state) => state.folder);
  const queryClient = useQueryClient();
  const searchPopupRef = useRef<any>(null);
  const searchInputRef = useRef<any>(null);
  const [openSearch, setOpenSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [musicFolder, setMusicFolder] = useState({ loaded: false, id: undefined });
  const [searchOptions, setSearchOptions] = useState<{
    global: boolean;
    local: boolean;
    songs: boolean;
    albums: boolean;
    artists: boolean;
  }>(
    JSON.parse(
      localStorage.getItem('search') ||
        '{"global":true,"local":false,"songs":true,"albums":true,"artists":true}'
    )
  );

  useHotkeys('ctrl+f', () => {
    if (history.location?.pathname?.match('/search')) {
      setTimeout(() => {
        const searchInputBar = document.getElementById('local-search-input') as HTMLInputElement;
        searchInputBar?.focus();
        searchInputBar?.select();
      }, 100);
    } else {
      setOpenSearch(true);
      setTimeout(() => {
        const searchInputBar = document.getElementById('global-search-input') as HTMLInputElement;
        searchInputBar?.focus();
        searchInputBar?.select();
      }, 100);
    }
  });

  useHotkeys('escape', () => {
    setOpenSearch(false);
  });

  useEffect(() => {
    if (folder.applied.search) {
      setMusicFolder({ loaded: true, id: folder.musicFolder });
    } else {
      setMusicFolder({ loaded: true, id: undefined });
    }
  }, [folder]);

  const debouncedSearchHandler = useMemo(
    () =>
      _.debounce((e) => {
        setDebouncedSearchQuery(e);
        if (searchOptions.local) {
          dispatch(setSearchQuery(e));
        }
      }, 300),
    [dispatch, searchOptions]
  );

  useEffect(() => {
    if (openSearch) {
      searchPopupRef!.current!.open();
    } else {
      searchPopupRef!.current!.close();
    }
  }, [openSearch]);

  const closeSearch = () => {
    setDebouncedSearchQuery('');
    dispatch(setSearchQuery('')); // Handles the search query sent for local page search
    queryClient.removeQueries(['search']); // Retrieve fresh data on search bar open
    setOpenSearch(false);
  };

  useEffect(() => {
    localStorage.setItem('search', JSON.stringify(searchOptions));
  }, [searchOptions]);

  const {
    data: songResults,
    isLoading: isLoadingSongs,
    isRefetching: isRefetchingSongs,
    fetchNextPage: fetchNextSongPage,
    isFetchingNextPage: isFetchingNextSongPage,
    hasNextPage: hasNextSongPage,
  }: any = useInfiniteQuery(
    ['search', debouncedSearchQuery, { type: Item.Music, count: 3 }, musicFolder.id],
    ({ pageParam = 0 }) =>
      apiController({
        serverType: config.serverType,
        endpoint: 'getSearch',
        args: {
          query: debouncedSearchQuery,
          songCount: 3,
          songOffset: pageParam,
          albumCount: 0,
          artistCount: 0,
          musicFolderId: musicFolder.id,
        },
      }),
    {
      enabled: debouncedSearchQuery !== '' && searchOptions.global && musicFolder.loaded,
      getNextPageParam: (lastPage) => lastPage.song.nextCursor,
      staleTime: 5 * 60 * 1000,
    }
  );

  const {
    data: albumResults,
    isLoading: isLoadingAlbums,
    isRefetching: isRefetchingAlbums,
    fetchNextPage: fetchNextAlbumPage,
    isFetchingNextPage: isFetchingNextAlbumPage,
    hasNextPage: hasNextAlbumPage,
  }: any = useInfiniteQuery(
    ['search', debouncedSearchQuery, { type: Item.Album, count: 3 }, musicFolder.id],
    ({ pageParam = 0 }) =>
      apiController({
        serverType: config.serverType,
        endpoint: 'getSearch',
        args: {
          query: debouncedSearchQuery,
          albumCount: 3,
          albumOffset: pageParam,
          songCount: 0,
          artistCount: 0,
          musicFolderId: musicFolder.id,
        },
      }),
    {
      enabled: debouncedSearchQuery !== '' && searchOptions.global && musicFolder.loaded,
      getNextPageParam: (lastPage) => lastPage.album.nextCursor,
      staleTime: 5 * 60 * 1000,
    }
  );

  const {
    data: artistResults,
    isLoading: isLoadingArtists,
    isRefetching: isRefetchingArtists,
    fetchNextPage: fetchNextArtistPage,
    isFetchingNextPage: isFetchingNextArtistPage,
    hasNextPage: hasNextArtistPage,
  }: any = useInfiniteQuery(
    ['search', debouncedSearchQuery, { type: Item.Artist, count: 3 }, musicFolder.id],
    ({ pageParam = 0 }) =>
      apiController({
        serverType: config.serverType,
        endpoint: 'getSearch',
        args: {
          query: debouncedSearchQuery,
          artistCount: 3,
          artistOffset: pageParam,
          songCount: 0,
          albumCount: 0,
          musicFolderId: musicFolder.id,
        },
      }),
    {
      enabled: debouncedSearchQuery !== '' && searchOptions.global && musicFolder.loaded,
      getNextPageParam: (lastPage) => lastPage.artist.nextCursor,
      staleTime: 5 * 60 * 1000,
    }
  );

  const isLoading = [
    isLoadingSongs,
    isLoadingAlbums,
    isLoadingArtists,
    isRefetchingSongs,
    isRefetchingAlbums,
    isRefetchingArtists,
  ].some((q) => q);

  return (
    <Whisper
      ref={searchPopupRef}
      onClose={closeSearch}
      trigger="none"
      placement="leftStart"
      preventOverflow
      enterable
      speaker={
        <Popup
          style={{
            width: '620px',
            maxHeight: '80vh',
            minHeight: '50px',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '0px',
          }}
        >
          <SearchContainer>
            <StyledInputGroup inside>
              <StyledInput
                ref={searchInputRef}
                placeholder={t('Search')}
                size="sm"
                id="global-search-input"
                onChange={(e: string) => {
                  setSearch(e);
                  debouncedSearchHandler(e);
                }}
                onPressEnter={() => {
                  if (search) {
                    history.push(`/search?query=${search}`);
                  }
                  closeSearch();
                }}
                onKeyDown={(e: KeyboardEvent) => {
                  if (e.key === 'Escape') {
                    closeSearch();
                  }
                }}
                spellCheck="false"
              />
              <StyledInputGroupButton
                height={30}
                appearance="subtle"
                tabIndex={0}
                onClick={closeSearch}
                onKeyDown={(e: KeyboardEvent) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    closeSearch();
                  }
                }}
              >
                {isLoading ? <Loader size="xs" /> : <Icon icon="close" />}
              </StyledInputGroupButton>
            </StyledInputGroup>
            <div className="search-options">
              <StyledCheckbox
                defaultChecked={searchOptions.global}
                onChange={(_v: any, e: boolean) => {
                  setSearchOptions({ ...searchOptions, global: e });
                }}
                checked={searchOptions.global}
              >
                {t('Search library')}
              </StyledCheckbox>
              <StyledCheckbox
                defaultChecked={searchOptions.local}
                onChange={(_v: any, e: boolean) => {
                  setSearchOptions({ ...searchOptions, local: e });
                  dispatch(setSearchQuery(e ? debouncedSearchQuery : ''));
                }}
                checked={searchOptions.local}
              >
                {t('Search page')}
              </StyledCheckbox>
            </div>

            {debouncedSearchQuery !== '' ? (
              <>
                {songResults?.pages[0]?.song.data.length < 1 &&
                albumResults?.pages[0]?.album.data.length < 1 &&
                artistResults?.pages[0]?.artist.data.length < 1 ? (
                  <>No results found</>
                ) : (
                  <>
                    {artistResults?.pages[0]?.artist.data.length > 0 && searchOptions.global && (
                      <>
                        <SectionTitle>
                          <StyledButton
                            size="xs"
                            appearance="subtle"
                            onClick={() =>
                              setSearchOptions({
                                ...searchOptions,
                                artists: !searchOptions.artists,
                              })
                            }
                          >
                            <Icon
                              icon={searchOptions.artists ? 'minus-square-o' : 'plus-square-o'}
                            />
                            {t('Artists')}
                          </StyledButton>

                          <StyledButton
                            size="xs"
                            appearance="subtle"
                            onClick={fetchNextArtistPage}
                            disabled={!hasNextArtistPage}
                            loading={isFetchingNextArtistPage}
                          >
                            {t('Load more')}
                          </StyledButton>
                        </SectionTitle>
                        <SectionResults show={searchOptions.artists}>
                          {artistResults?.pages?.map((group: any, i: number) => (
                            <React.Fragment key={`${i}-artists`}>
                              {group.artist.data.map((entry: any) => (
                                <SearchResult
                                  key={entry.uniqueId}
                                  entry={entry}
                                  handleClick={(lineEntry: Song) =>
                                    history.push(`/library/artist/${lineEntry.id}`)
                                  }
                                  title={<>{entry.title}</>}
                                  details={
                                    <>{entry.albumCount && `${entry.albumCount} ${t(' albums')}`}</>
                                  }
                                />
                              ))}
                            </React.Fragment>
                          ))}
                        </SectionResults>
                      </>
                    )}

                    {albumResults?.pages[0]?.album.data.length > 0 && searchOptions.global && (
                      <>
                        <SectionTitle>
                          <StyledButton
                            size="xs"
                            appearance="subtle"
                            onClick={() =>
                              setSearchOptions({
                                ...searchOptions,
                                albums: !searchOptions.albums,
                              })
                            }
                          >
                            <Icon
                              icon={searchOptions.albums ? 'minus-square-o' : 'plus-square-o'}
                            />
                            {t('Albums')}
                          </StyledButton>
                          <StyledButton
                            size="xs"
                            appearance="subtle"
                            onClick={fetchNextAlbumPage}
                            disabled={!hasNextAlbumPage}
                            loading={isFetchingNextAlbumPage}
                          >
                            {t('Load more')}
                          </StyledButton>
                        </SectionTitle>
                        <SectionResults show={searchOptions.albums}>
                          {albumResults?.pages?.map((group: any, i: number) => (
                            <React.Fragment key={`${i}-albums`}>
                              {group.album.data.map((entry: any) => (
                                <SearchResult
                                  key={entry.uniqueId}
                                  entry={entry}
                                  handleClick={(lineEntry: Song) =>
                                    history.push(`/library/album/${lineEntry.id}`)
                                  }
                                  title={<>{entry.title}</>}
                                  details={
                                    <>
                                      {_.compact([entry.year, entry.albumArtist]).map(
                                        (val, index: number) => (
                                          <React.Fragment key={`${index}-albums-details`}>
                                            {val && (
                                              <>
                                                {index > 0 && ' • '}
                                                {val}
                                              </>
                                            )}
                                          </React.Fragment>
                                        )
                                      )}
                                    </>
                                  }
                                />
                              ))}
                            </React.Fragment>
                          ))}
                        </SectionResults>
                      </>
                    )}

                    {songResults?.pages[0]?.song.data.length > 0 && searchOptions.global && (
                      <>
                        <SectionTitle>
                          <StyledButton
                            size="xs"
                            appearance="subtle"
                            onClick={() =>
                              setSearchOptions({ ...searchOptions, songs: !searchOptions.songs })
                            }
                          >
                            <Icon icon={searchOptions.songs ? 'minus-square-o' : 'plus-square-o'} />
                            {t('Songs')}
                          </StyledButton>
                          <StyledButton
                            size="xs"
                            appearance="subtle"
                            onClick={fetchNextSongPage}
                            disabled={!hasNextSongPage}
                            loading={isFetchingNextSongPage}
                          >
                            {t('Load more')}
                          </StyledButton>
                        </SectionTitle>
                        <SectionResults show={searchOptions.songs}>
                          {songResults?.pages?.map((group: any, i: number) => (
                            <React.Fragment key={`${i}-songs`}>
                              {group.song.data.map((entry: any) => (
                                <SearchResult
                                  key={entry.uniqueId}
                                  entry={entry}
                                  handleClick={(lineEntry: Song) =>
                                    history.push(`/library/album/${lineEntry.albumId}`)
                                  }
                                  title={<>{entry.title}</>}
                                  details={
                                    <>
                                      {_.compact([entry.year, entry.albumArtist, entry.album]).map(
                                        (val, index: number) => (
                                          <React.Fragment key={`${index}-songs-details`}>
                                            {val && (
                                              <>
                                                {index > 0 && ' • '}
                                                {val}
                                              </>
                                            )}
                                          </React.Fragment>
                                        )
                                      )}
                                    </>
                                  }
                                />
                              ))}
                            </React.Fragment>
                          ))}
                        </SectionResults>
                      </>
                    )}

                    <StyledButton
                      size="sm"
                      block
                      appearance="primary"
                      onClick={() => {
                        if (debouncedSearchQuery.trim()) {
                          history.push(`/search?query=${debouncedSearchQuery}`);
                        }
                        closeSearch();
                      }}
                    >
                      {t('View all results')}
                    </StyledButton>
                  </>
                )}
              </>
            ) : (
              <></>
            )}
          </SearchContainer>
        </Popup>
      }
    >
      <span style={{ display: 'inline-block' }}>
        <StyledButton
          aria-label="search"
          onClick={() => {
            setOpenSearch(true);
            setTimeout(() => {
              const searchInput = document.getElementById(
                'global-search-input'
              ) as HTMLInputElement;
              searchInput.focus();
              searchInput.select();
            }, 50);
          }}
          appearance="subtle"
        >
          <Icon icon="search" />
        </StyledButton>
      </span>
    </Whisper>
  );
};

export default SearchBar;
