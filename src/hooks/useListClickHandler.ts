import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  clearSelected,
  setIsDragging,
  setSelected,
  toggleSelected,
} from '../redux/multiSelectSlice';
import { setStatus } from '../redux/playerSlice';
import { fixPlayer2Index, moveToIndex, setPlayerIndex } from '../redux/playQueueSlice';
import { moveToIndex as moveToIndexPlaylist } from '../redux/playlistSlice';
import { moveToIndex as moveToIndexConfig } from '../redux/configSlice';
import { moveSelectedToIndex, sliceRangeByUniqueId } from '../shared/utils';

const useListClickHandler = (options?: {
  singleClick?: any;
  doubleClick?: any;
  dnd?: 'playQueue' | 'playlist' | 'config';
}) => {
  const dispatch = useAppDispatch();
  const multiSelect = useAppSelector((state) => state.multiSelect);

  let timeout: any = null;
  const handleRowClick = (e: any, rowData: any, tableData: any) => {
    if (timeout === null) {
      timeout = window.setTimeout(() => {
        timeout = null;

        if (!options?.singleClick) {
          if (e.ctrlKey) {
            dispatch(toggleSelected(rowData));
          } else if (e.shiftKey) {
            dispatch(
              setSelected(
                sliceRangeByUniqueId(tableData, multiSelect.lastSelected.uniqueId, rowData.uniqueId)
              )
            );
          }
        } else {
          options.singleClick(e, rowData, tableData);
        }
      }, 100);
    }
  };

  const handleRowDoubleClick = (rowData: any, e?: any) => {
    window.clearTimeout(timeout);
    timeout = null;

    dispatch(clearSelected());

    if (!options?.doubleClick) {
      dispatch(setPlayerIndex(rowData));
      dispatch(fixPlayer2Index());
      dispatch(setStatus('PLAYING'));
    } else {
      options.doubleClick(rowData, e);
    }
  };

  const handleDragEnd = (entries: any) => {
    if (multiSelect.isDragging) {
      const reorderedQueue = moveSelectedToIndex(
        entries,
        multiSelect.selected,
        multiSelect.currentMouseOverId
      );

      if (options?.dnd === 'playQueue') {
        dispatch(moveToIndex(reorderedQueue));
      }

      if (options?.dnd === 'playlist') {
        dispatch(moveToIndexPlaylist(reorderedQueue));
      }

      if (options?.dnd === 'config') {
        dispatch(moveToIndexConfig(reorderedQueue));
      }

      dispatch(setIsDragging(false));
    }
  };

  return { handleRowClick, handleRowDoubleClick, handleDragEnd };
};

export default useListClickHandler;
