import React, { useState, useEffect, useRef } from 'react';
import settings from 'electron-settings';
import { ButtonToolbar, FlexboxGrid, Icon } from 'rsuite';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  toggleSelected,
  setRangeSelected,
  toggleRangeSelected,
  setSelected,
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
} from '../../redux/playQueueSlice';
import { resetPlayer, setStatus } from '../../redux/playerSlice';
import ListViewType from '../viewtypes/ListViewType';
import GenericPage from '../layout/GenericPage';
import { StyledCheckbox, StyledIconButton } from '../shared/styled';
import { MiniViewContainer } from './styled';
import {
  DeselectAllButton,
  MoveDownButton,
  MoveManualButton,
  MoveUpButton,
} from '../selectionbar/SelectionButtons';

const NowPlayingMiniView = () => {
  const tableRef = useRef<any>();
  const dispatch = useAppDispatch();
  const playQueue = useAppSelector((state) => state.playQueue);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const [scrollWithCurrent, setScrollWithCurrent] = useState(
    Boolean(settings.getSync('scrollWithCurrentSong'))
  );

  useEffect(() => {
    if (scrollWithCurrent) {
      setTimeout(() => {
        const rowHeight = Number(settings.getSync('miniListRowHeight'));
        tableRef?.current?.table.current.scrollTop(
          rowHeight * playQueue.currentIndex - rowHeight > 0
            ? rowHeight * playQueue.currentIndex - rowHeight
            : 0
        );
      }, 100);
    }
  }, [
    playQueue.currentIndex,
    scrollWithCurrent,
    tableRef,
    playQueue.displayQueue,
  ]);

  let timeout: any = null;
  const handleRowClick = (e: any, rowData: any) => {
    if (timeout === null) {
      timeout = window.setTimeout(() => {
        timeout = null;

        if (e.ctrlKey) {
          dispatch(toggleSelected(rowData));
        } else if (e.shiftKey) {
          dispatch(setRangeSelected(rowData));
          dispatch(
            toggleRangeSelected(
              playQueue.shuffle ? playQueue.shuffledEntry : playQueue.entry
            )
          );
        } else {
          dispatch(setSelected(rowData));
        }
      }, 300);
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
    const selectedIndexes: any[] = [];
    multiSelect.selected.map((selected: any) => {
      return selectedIndexes.push(
        playQueue.entry.findIndex((item: any) => item.id === selected.id)
      );
    });
    dispatch(moveUp(selectedIndexes));
  };

  const handleDownClick = () => {
    const selectedIndexes: any[] = [];
    multiSelect.selected.map((selected: any) => {
      return selectedIndexes.push(
        playQueue.entry.findIndex((item: any) => item.id === selected.id)
      );
    });
    dispatch(moveDown(selectedIndexes));
  };

  const handleMouseUp = () => {
    if (multiSelect.isDragging) {
      dispatch(
        moveToIndex({
          entries: multiSelect.selected,
          moveBeforeId: multiSelect.currentMouseOverId,
        })
      );
      dispatch(setIsDragging(false));
      dispatch(fixPlayer2Index());
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
                <FlexboxGrid
                  justify="space-between"
                  align="middle"
                  style={{ height: '50px' }}
                >
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
                    </ButtonToolbar>
                  </FlexboxGrid.Item>
                  {multiSelect.selected.length > 0 && (
                    <FlexboxGrid.Item>
                      <ButtonToolbar>
                        <MoveUpButton />
                        <MoveDownButton />
                        <MoveManualButton />
                        <DeselectAllButton />
                      </ButtonToolbar>
                    </FlexboxGrid.Item>
                  )}
                  <FlexboxGrid.Item>
                    <StyledCheckbox
                      defaultChecked={scrollWithCurrent}
                      onChange={() => {
                        settings.setSync(
                          'scrollWithCurrentSong',
                          !settings.getSync('scrollWithCurrentSong')
                        );
                        setScrollWithCurrent(!scrollWithCurrent);
                      }}
                    />
                  </FlexboxGrid.Item>
                </FlexboxGrid>
              </>
            }
          >
            <ListViewType
              ref={tableRef}
              data={
                playQueue.shuffle ? playQueue.shuffledEntry : playQueue.entry
              }
              currentIndex={playQueue.currentIndex}
              tableColumns={settings.getSync('miniListColumns')}
              handleRowClick={handleRowClick}
              handleRowDoubleClick={handleRowDoubleClick}
              handleUpClick={handleUpClick}
              handleDownClick={handleDownClick}
              handleMouseUp={handleMouseUp}
              virtualized
              rowHeight={Number(settings.getSync('miniListRowHeight'))}
              fontSize={Number(settings.getSync('miniListFontSize'))}
              cacheImages={{
                enabled: settings.getSync('cacheImages'),
                cacheType: 'album',
                cacheIdProperty: 'albumId',
              }}
              listType="mini"
              nowPlaying
              miniView
            />
          </GenericPage>
        </MiniViewContainer>
      )}
    </>
  );
};

export default NowPlayingMiniView;
