import React, { useEffect, useState } from 'react';
import { nanoid } from 'nanoid/non-secure';
import settings from 'electron-settings';
import { TagPicker, ControlLabel, Panel } from 'rsuite';
import { StyledInputNumber } from '../../shared/styled';
import ListViewTable from '../../viewtypes/ListViewTable';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  setIsDragging,
  setRangeSelected,
  toggleRangeSelected,
  toggleSelected,
} from '../../../redux/multiSelectSlice';
import {
  ColumnList,
  moveToIndex,
  setColumnList,
  setFontSize,
  setRowHeight,
} from '../../../redux/configSlice';

const columnSelectorColumns = [
  {
    id: '#',
    dataKey: 'index',
    alignment: 'center',
    resizable: false,
    width: 50,
    label: '#',
  },
  {
    id: 'Column',
    dataKey: 'label',
    alignment: 'left',
    resizable: false,
    flexGrow: 2,
    label: 'Column',
  },
  {
    id: 'Resizable',
    dataKey: 'columnResizable',
    alignment: 'left',
    resizable: false,
    width: 100,
    label: 'Resizable',
  },
];

const ListViewConfig = ({ defaultColumns, columnPicker, columnList, settingsConfig }: any) => {
  const dispatch = useAppDispatch();
  const playQueue = useAppSelector((state) => state.playQueue);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const config = useAppSelector((state) => state.config);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const columnListType = settingsConfig.columnList.split('List')[0];

  useEffect(() => {
    const cols = config.lookAndFeel.listView[columnListType].columns.map((col: any) => {
      return col.label;
    });

    setSelectedColumns(cols);

    settings.setSync(
      settingsConfig.columnList,
      config.lookAndFeel.listView[columnListType].columns
    );
  }, [columnListType, config.lookAndFeel.listView, settingsConfig.columnList]);

  let timeout: any = null;
  const handleRowClick = (e: any, rowData: any) => {
    if (timeout === null) {
      timeout = window.setTimeout(() => {
        timeout = null;

        if (e.ctrlKey) {
          dispatch(toggleSelected(rowData));
        } else if (e.shiftKey) {
          dispatch(setRangeSelected(rowData));
          dispatch(toggleRangeSelected(config.lookAndFeel.listView[columnListType].columns));
        }
      }, 100);
    }
  };

  const handleDragEnd = (listType: ColumnList) => {
    if (multiSelect.isDragging) {
      dispatch(
        moveToIndex({
          entries: multiSelect.selected,
          moveBeforeId: multiSelect.currentMouseOverId,
          listType,
        })
      );
      dispatch(setIsDragging(false));
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div>
        <Panel bordered bodyFill>
          <TagPicker
            data={columnPicker}
            defaultValue={defaultColumns}
            value={selectedColumns}
            style={{ width: '100%' }}
            onChange={(e) => {
              const columns: any[] = [];
              if (e) {
                e.forEach((selected: string) => {
                  const alreadySelectedColumn = config.lookAndFeel.listView[
                    columnListType
                  ].columns.find((column: any) => column.label === selected);

                  if (alreadySelectedColumn) {
                    return columns.push(alreadySelectedColumn);
                  }

                  const selectedColumn = columnList.find(
                    (column: any) => column.label === selected
                  );

                  if (selectedColumn) {
                    return columns.push({ ...selectedColumn.value, uniqueId: nanoid() });
                  }

                  return null;
                });
              }

              const cleanColumns = columns.map((col) => {
                const { uniqueId, ...rest } = col;
                return rest;
              });

              dispatch(setColumnList({ listType: columnListType, entries: columns }));
              settings.setSync(settingsConfig.columnList, cleanColumns);
            }}
            labelKey="label"
            valueKey="label"
          />

          <ListViewTable
            data={config.lookAndFeel.listView[columnListType].columns || []}
            height={300}
            handleRowClick={handleRowClick}
            handleRowDoubleClick={() => {}}
            handleDragEnd={() => handleDragEnd(columnListType)}
            columns={columnSelectorColumns}
            rowHeight={35}
            fontSize={12}
            listType="column"
            cacheImages={{ enabled: false }}
            playQueue={playQueue}
            multiSelect={multiSelect}
            isModal={false}
            miniView={false}
            dnd
            disableContextMenu
            config={{ option: columnListType, columnList }}
            virtualized
          />
        </Panel>
      </div>

      <br />
      <div>
        <ControlLabel>Row height</ControlLabel>
        <StyledInputNumber
          defaultValue={config.lookAndFeel.listView[columnListType]?.rowHeight || 40}
          step={1}
          min={15}
          max={250}
          width={150}
          onChange={(e: number) => {
            settings.setSync(settingsConfig.rowHeight, Number(e));
            dispatch(setRowHeight({ listType: columnListType, height: Number(e) }));
          }}
        />
      </div>
      <br />
      <div>
        <ControlLabel>Font size</ControlLabel>
        <StyledInputNumber
          defaultValue={config.lookAndFeel.listView[columnListType]?.fontSize || 12}
          step={0.5}
          min={1}
          max={100}
          width={150}
          onChange={(e: number) => {
            settings.setSync(settingsConfig.fontSize, Number(e));
            dispatch(setFontSize({ listType: columnListType, size: Number(e) }));
          }}
        />
      </div>
    </div>
  );
};

export default ListViewConfig;
