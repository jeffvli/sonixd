import React, { useEffect, useRef, useState } from 'react';
import { nanoid } from 'nanoid/non-secure';
import settings from 'electron-settings';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n/i18n';
import {
  StyledCheckPicker,
  StyledInputNumber,
  StyledInputPickerContainer,
  StyledPanel,
} from '../../shared/styled';
import ListViewTable from '../../viewtypes/ListViewTable';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setIsDragging } from '../../../redux/multiSelectSlice';
import {
  ColumnList,
  moveToIndex,
  setColumnList,
  setFontSize,
  setRowHeight,
} from '../../../redux/configSlice';
import ConfigOption from '../ConfigOption';
import useListClickHandler from '../../../hooks/useListClickHandler';

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
    id: i18n.t('Column'),
    dataKey: 'label',
    alignment: 'left',
    resizable: false,
    flexGrow: 2,
    label: i18n.t('Column'),
  },
  {
    id: i18n.t('Resizable'),
    dataKey: 'columnResizable',
    alignment: 'left',
    resizable: false,
    width: 100,
    label: i18n.t('Resizable'),
  },
];

const ListViewConfig = ({
  type,
  defaultColumns,
  columnPicker,
  columnList,
  settingsConfig,
  disabledItemValues,
}: any) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const playQueue = useAppSelector((state) => state.playQueue);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const config = useAppSelector((state) => state.config);
  const [selectedColumns, setSelectedColumns] = useState<any[]>([]);
  const columnListType = settingsConfig.columnList.split('List')[0];
  const columnPickerContainerRef = useRef(null);

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

  const { handleRowClick } = useListClickHandler({});

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
        <StyledPanel>
          <StyledInputPickerContainer ref={columnPickerContainerRef}>
            <StyledCheckPicker
              container={() => columnPickerContainerRef.current}
              data={columnPicker}
              defaultValue={defaultColumns}
              value={selectedColumns}
              disabledItemValues={disabledItemValues.filter((col: string) => {
                return !selectedColumns.includes(col);
              })}
              sticky
              searchable={false}
              style={{ width: '100%' }}
              maxHeight={250}
              onChange={(e: any) => {
                const columns: any[] = [];
                if (e) {
                  const availableCols = columnPicker.map((col: any) => col.label);

                  e.forEach((selected: string) => {
                    if (availableCols.includes(selected)) {
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
          </StyledInputPickerContainer>
          <ListViewTable
            data={config.lookAndFeel.listView[columnListType].columns || []}
            height={200}
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
          <p style={{ fontSize: 'smaller' }}>
            {t('* Drag & drop rows from the # column to re-order')}
          </p>
        </StyledPanel>
      </div>

      <ConfigOption
        name={t('Row Height {{type}}', { type })}
        description={t('The height in pixels (px) of each row in the list view.')}
        option={
          <StyledInputNumber
            defaultValue={config.lookAndFeel.listView[columnListType]?.rowHeight || 40}
            step={1}
            min={15}
            max={250}
            width={125}
            onChange={(e: number) => {
              settings.setSync(settingsConfig.rowHeight, Number(e));
              dispatch(setRowHeight({ listType: columnListType, height: Number(e) }));
            }}
          />
        }
      />

      <ConfigOption
        name={t('Font Size {{type}}', { type })}
        description={t('The height in pixels (px) of each row in the list view.')}
        option={
          <StyledInputNumber
            defaultValue={config.lookAndFeel.listView[columnListType]?.fontSize || 12}
            step={0.5}
            min={1}
            max={100}
            width={125}
            onChange={(e: number) => {
              settings.setSync(settingsConfig.fontSize, Number(e));
              dispatch(setFontSize({ listType: columnListType, size: Number(e) }));
            }}
          />
        }
      />
    </div>
  );
};

export default ListViewConfig;
