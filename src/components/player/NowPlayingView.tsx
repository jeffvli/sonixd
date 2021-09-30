import React, { useEffect, useRef, useState } from 'react';
import settings from 'electron-settings';
import { ButtonToolbar } from 'rsuite';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import useSearchQuery from '../../hooks/useSearchQuery';
import {
  setPlayerIndex,
  setPlayerVolume,
  fixPlayer2Index,
  clearPlayQueue,
  shuffleInPlace,
  toggleShuffle,
  moveToIndex,
  setPlaybackSetting,
  removeFromPlayQueue,
} from '../../redux/playQueueSlice';
import {
  toggleSelected,
  setRangeSelected,
  toggleRangeSelected,
  clearSelected,
  setIsDragging,
} from '../../redux/multiSelectSlice';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import ListViewType from '../viewtypes/ListViewType';
import PageLoader from '../loader/PageLoader';
import { resetPlayer, setStatus } from '../../redux/playerSlice';
import { ClearQueueButton, ShuffleButton } from '../shared/ToolbarButtons';
import { StyledCheckbox } from '../shared/styled';
import { getCurrentEntryList } from '../../shared/utils';

const NowPlayingView = () => {
  const tableRef = useRef<any>();
  const dispatch = useAppDispatch();
  const playQueue = useAppSelector((state) => state.playQueue);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const [searchQuery, setSearchQuery] = useState('');
  const filteredData = useSearchQuery(searchQuery, playQueue.entry, ['title', 'artist', 'album']);

  useHotkeys(
    'del',
    (e: KeyboardEvent) => {
      e.preventDefault();
      if (multiSelect.selected.length === playQueue.entry.length) {
        // Clear the queue instead of removing individually
        dispatch(clearPlayQueue());
        dispatch(setStatus('PAUSED'));
        setTimeout(() => dispatch(resetPlayer()), 200);
      } else {
        dispatch(removeFromPlayQueue({ entries: multiSelect.selected }));
        if (playQueue.currentPlayer === 1) {
          dispatch(fixPlayer2Index());
        }
      }
    },
    [multiSelect.selected]
  );

  useEffect(() => {
    if (playQueue.scrollWithCurrentSong) {
      setTimeout(() => {
        const rowHeight = Number(settings.getSync('musicListRowHeight'));
        tableRef?.current?.table.current?.scrollTop(
          rowHeight * playQueue.currentIndex - rowHeight * 2 > 0
            ? rowHeight * playQueue.currentIndex - rowHeight * 2
            : 0
        );
      }, 100);
    }
  }, [playQueue.currentIndex, playQueue.scrollWithCurrentSong, tableRef]);

  let timeout: any = null;
  const handleRowClick = (e: any, rowData: any) => {
    if (timeout === null) {
      timeout = window.setTimeout(() => {
        timeout = null;

        if (e.ctrlKey) {
          dispatch(toggleSelected(rowData));
        } else if (e.shiftKey) {
          dispatch(setRangeSelected(rowData));
          if (searchQuery !== '') {
            dispatch(toggleRangeSelected(filteredData));
          } else {
            dispatch(toggleRangeSelected(playQueue[getCurrentEntryList(playQueue)]));
          }
        }
      }, 100);
    }
  };

  const handleRowDoubleClick = (rowData: any) => {
    window.clearTimeout(timeout);
    timeout = null;

    // Reset volumes when changing to a new track
    dispatch(setPlayerVolume({ player: 1, volume: playQueue.volume }));
    dispatch(setPlayerVolume({ player: 2, volume: 0 }));

    dispatch(clearSelected());
    dispatch(resetPlayer());
    dispatch(setPlayerIndex(rowData));
    dispatch(fixPlayer2Index());
    dispatch(setStatus('PLAYING'));
  };

  const handleDragEnd = () => {
    if (multiSelect.isDragging) {
      dispatch(
        moveToIndex({
          entries: multiSelect.selected,
          moveBeforeId: multiSelect.currentMouseOverId,
        })
      );
      dispatch(setIsDragging(false));
      if (playQueue.currentPlayer === 1) {
        dispatch(fixPlayer2Index());
      }
    }
  };

  return (
    <GenericPage
      hideDivider
      header={
        <GenericPageHeader
          title="Now Playing"
          subtitle={
            <>
              <ButtonToolbar>
                <ClearQueueButton
                  size="sm"
                  width={100}
                  onClick={() => {
                    dispatch(clearPlayQueue());
                    dispatch(setStatus('PAUSED'));
                    // Needs a timeout otherwise the seek may still update after the pause due to
                    // the delay timeout
                    setTimeout(() => dispatch(resetPlayer()), 200);
                  }}
                />
                <ShuffleButton
                  size="sm"
                  width={100}
                  onClick={() => {
                    if (playQueue.shuffle) {
                      dispatch(shuffleInPlace());
                    } else {
                      dispatch(toggleShuffle());
                    }
                  }}
                />
              </ButtonToolbar>
            </>
          }
          subsidetitle={
            <StyledCheckbox
              defaultChecked={playQueue.scrollWithCurrentSong}
              checked={playQueue.scrollWithCurrentSong}
              onChange={() => {
                settings.setSync(
                  'scrollWithCurrentSong',
                  !settings.getSync('scrollWithCurrentSong')
                );
                dispatch(
                  setPlaybackSetting({
                    setting: 'scrollWithCurrentSong',
                    value: !playQueue.scrollWithCurrentSong,
                  })
                );
              }}
            >
              Auto scroll
            </StyledCheckbox>
          }
          searchQuery={searchQuery}
          handleSearch={(e: any) => setSearchQuery(e)}
          clearSearchQuery={() => setSearchQuery('')}
          showSearchBar
        />
      }
    >
      {!playQueue ? (
        <PageLoader />
      ) : (
        <ListViewType
          ref={tableRef}
          data={searchQuery !== '' ? filteredData : playQueue[getCurrentEntryList(playQueue)]}
          currentIndex={playQueue.currentIndex}
          tableColumns={settings.getSync('musicListColumns')}
          handleRowClick={handleRowClick}
          handleRowDoubleClick={handleRowDoubleClick}
          handleDragEnd={handleDragEnd}
          virtualized
          rowHeight={Number(settings.getSync('musicListRowHeight'))}
          fontSize={Number(settings.getSync('musicListFontSize'))}
          cacheImages={{
            enabled: settings.getSync('cacheImages'),
            cacheType: 'album',
            cacheIdProperty: 'albumId',
          }}
          listType="music"
          nowPlaying
          dnd
          disabledContextMenuOptions={['deletePlaylist']}
        />
      )}
    </GenericPage>
  );
};

export default NowPlayingView;
