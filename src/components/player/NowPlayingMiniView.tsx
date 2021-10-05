import React, { useEffect, useRef } from 'react';
import settings from 'electron-settings';
import { ButtonToolbar, FlexboxGrid, Icon } from 'rsuite';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  toggleSelected,
  setRangeSelected,
  toggleRangeSelected,
  clearSelected,
  setIsDragging,
} from '../../redux/multiSelectSlice';
import {
  setPlayerVolume,
  setPlayerIndex,
  fixPlayer2Index,
  moveUp,
  moveDown,
  clearPlayQueue,
  shuffleInPlace,
  toggleShuffle,
  moveToIndex,
  setPlaybackSetting,
  removeFromPlayQueue,
  setStar,
} from '../../redux/playQueueSlice';
import { resetPlayer, setStatus } from '../../redux/playerSlice';
import ListViewType from '../viewtypes/ListViewType';
import GenericPage from '../layout/GenericPage';
import { StyledCheckbox, StyledIconButton } from '../shared/styled';
import { MiniViewContainer } from './styled';
import { DeselectAllButton, MoveDownButton, MoveUpButton } from '../selectionbar/SelectionButtons';
import { getCurrentEntryList } from '../../shared/utils';
import { star, unstar } from '../../api/api';

const NowPlayingMiniView = () => {
  const tableRef = useRef<any>();
  const dispatch = useAppDispatch();
  const playQueue = useAppSelector((state) => state.playQueue);
  const multiSelect = useAppSelector((state) => state.multiSelect);

  useHotkeys(
    'del',
    () => {
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
        const rowHeight = Number(settings.getSync('miniListRowHeight'));
        tableRef?.current?.table.current.scrollTop(
          rowHeight * playQueue.currentIndex - rowHeight * 2 > 0
            ? rowHeight * playQueue.currentIndex - rowHeight * 2
            : 0
        );
      }, 100);
    }
  }, [playQueue.currentIndex, tableRef, playQueue.displayQueue, playQueue.scrollWithCurrentSong]);

  let timeout: any = null;
  const handleRowClick = (e: any, rowData: any) => {
    if (timeout === null) {
      timeout = window.setTimeout(() => {
        timeout = null;

        if (e.ctrlKey) {
          dispatch(toggleSelected(rowData));
        } else if (e.shiftKey) {
          dispatch(setRangeSelected(rowData));
          dispatch(toggleRangeSelected(playQueue[getCurrentEntryList(playQueue)]));
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

  const handleUpClick = () => {
    dispatch(moveUp({ selectedEntries: multiSelect.selected }));
  };

  const handleDownClick = () => {
    dispatch(moveDown({ selectedEntries: multiSelect.selected }));
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

  const handleRowFavorite = async (rowData: any) => {
    if (!rowData.starred) {
      await star(rowData.id, 'music');
      dispatch(setStar({ id: [rowData.id], type: 'star' }));
    } else {
      await unstar(rowData.id, 'music');
      dispatch(setStar({ id: [rowData.id], type: 'unstar' }));
    }
  };

  return (
    <>
      {playQueue.displayQueue && (
        <MiniViewContainer
          id="miniview-container"
          display={playQueue.displayQueue ? 'true' : 'false'}
        >
          <GenericPage
            hideDivider
            padding="0px"
            header={
              <>
                <FlexboxGrid justify="space-between" align="middle" style={{ height: '50px' }}>
                  <FlexboxGrid.Item>
                    <ButtonToolbar>
                      <StyledIconButton
                        size="sm"
                        icon={<Icon icon="trash2" />}
                        onClick={() => {
                          dispatch(clearPlayQueue());
                          dispatch(setStatus('PAUSED'));
                          // Needs a timeout otherwise the seek may still update after the pause due to
                          // the delay timeout
                          setTimeout(() => dispatch(resetPlayer()), 200);
                        }}
                      />
                      <StyledIconButton
                        size="sm"
                        icon={<Icon icon="random" />}
                        onClick={() => {
                          if (playQueue.shuffle) {
                            dispatch(shuffleInPlace());
                          } else {
                            dispatch(toggleShuffle());
                          }
                        }}
                      />
                      {multiSelect.selected.length > 0 && (
                        <>
                          <MoveUpButton
                            handleClick={() => {
                              dispatch(moveUp({ selectedEntries: multiSelect.selected }));

                              if (playQueue.currentPlayer === 1) {
                                dispatch(fixPlayer2Index());
                              }
                            }}
                          />
                          <MoveDownButton
                            handleClick={() => {
                              dispatch(moveDown({ selectedEntries: multiSelect.selected }));

                              if (playQueue.currentPlayer === 1) {
                                dispatch(fixPlayer2Index());
                              }
                            }}
                          />
                          <DeselectAllButton />
                        </>
                      )}
                    </ButtonToolbar>
                  </FlexboxGrid.Item>

                  <FlexboxGrid.Item>
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
                    />
                  </FlexboxGrid.Item>
                </FlexboxGrid>
              </>
            }
          >
            <ListViewType
              ref={tableRef}
              data={playQueue[getCurrentEntryList(playQueue)]}
              currentIndex={playQueue.currentIndex}
              tableColumns={settings.getSync('miniListColumns')}
              handleRowClick={handleRowClick}
              handleRowDoubleClick={handleRowDoubleClick}
              handleUpClick={handleUpClick}
              handleDownClick={handleDownClick}
              handleDragEnd={handleDragEnd}
              virtualized
              rowHeight={Number(settings.getSync('miniListRowHeight'))}
              fontSize={Number(settings.getSync('miniListFontSize'))}
              cacheImages={{
                enabled: settings.getSync('cacheImages'),
                cacheType: 'album',
                cacheIdProperty: 'albumId',
              }}
              listType="music"
              miniView
              nowPlaying
              dnd
              disabledContextMenuOptions={['deletePlaylist']}
              handleFavorite={handleRowFavorite}
            />
          </GenericPage>
        </MiniViewContainer>
      )}
    </>
  );
};

export default NowPlayingMiniView;
