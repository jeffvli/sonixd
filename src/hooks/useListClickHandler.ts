import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { clearSelected, setSelected, toggleSelected } from '../redux/multiSelectSlice';
import { setStatus } from '../redux/playerSlice';
import { fixPlayer2Index, setPlayerIndex } from '../redux/playQueueSlice';
import { sliceRangeByUniqueId } from '../shared/utils';

const useListClickHandler = (options?: { singleClick?: any; doubleClick?: any }) => {
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

  return { handleRowClick, handleRowDoubleClick };
};

export default useListClickHandler;
