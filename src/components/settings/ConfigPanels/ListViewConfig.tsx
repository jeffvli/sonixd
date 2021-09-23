import React from 'react';
import settings from 'electron-settings';
import { TagPicker, ControlLabel } from 'rsuite';
import { StyledInputNumber } from '../../shared/styled';

const ListViewConfig = ({ defaultColumns, columnPicker, columnList, settingsConfig }: any) => {
  return (
    <div style={{ width: '100%' }}>
      <br />
      <TagPicker
        data={columnPicker}
        defaultValue={defaultColumns}
        style={{ width: '500px' }}
        onChange={(e) => {
          const columns: any[] = [];

          if (e) {
            e.map((selected: string) => {
              const selectedColumn = columnList.find((column: any) => column.label === selected);
              if (selectedColumn) {
                return columns.push(selectedColumn.value);
              }

              return null;
            });
          }

          settings.setSync(settingsConfig.columnList, columns);
        }}
        labelKey="label"
        valueKey="label"
      />
      <div style={{ marginTop: '20px' }}>
        <ControlLabel>Row height</ControlLabel>
        <StyledInputNumber
          defaultValue={String(settings.getSync(settingsConfig.rowHeight)) || '0'}
          step={1}
          min={15}
          max={100}
          width={150}
          onChange={(e: any) => {
            settings.setSync(settingsConfig.rowHeight, e);
          }}
        />
      </div>
      <div style={{ marginTop: '20px' }}>
        <ControlLabel>Font size</ControlLabel>
        <StyledInputNumber
          defaultValue={String(settings.getSync(settingsConfig.fontSize)) || '0'}
          step={0.5}
          min={1}
          max={100}
          width={150}
          onChange={(e: any) => {
            settings.setSync(settingsConfig.fontSize, e);
          }}
        />
      </div>
    </div>
  );
};

export default ListViewConfig;
