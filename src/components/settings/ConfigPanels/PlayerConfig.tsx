import React, { useEffect, useState } from 'react';
import settings from 'electron-settings';
import { ControlLabel, Form } from 'rsuite';
import { ConfigPanel } from '../styled';
import {
  StyledButton,
  StyledCheckbox,
  StyledInput,
  StyledInputGroup,
  StyledInputNumber,
  StyledPanel,
} from '../../shared/styled';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setPlaybackSetting } from '../../../redux/playQueueSlice';
import ListViewTable from '../../viewtypes/ListViewTable';
import { appendPlaybackFilter } from '../../../redux/configSlice';

const playbackFilterColumns = [
  {
    id: '#',
    dataKey: 'index',
    alignment: 'center',
    resizable: false,
    width: 50,
    label: '#',
  },
  {
    id: 'Filter',
    dataKey: 'filter',
    alignment: 'left',
    resizable: false,
    flexGrow: 2,
    label: 'Filter',
  },
  {
    id: 'Enabled',
    dataKey: 'filterEnabled',
    alignment: 'left',
    resizable: false,
    width: 100,
    label: 'Enabled',
  },
  {
    id: 'Delete',
    dataKey: 'filterDelete',
    alignment: 'left',
    resizable: false,
    width: 100,
    label: 'Delete',
  },
];

const PlayerConfig = () => {
  const dispatch = useAppDispatch();
  const playQueue = useAppSelector((state) => state.playQueue);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const config = useAppSelector((state) => state.config);
  const [newFilter, setNewFilter] = useState('');
  const [globalMediaHotkeys, setGlobalMediaHotkeys] = useState(
    Boolean(settings.getSync('globalMediaHotkeys'))
  );
  const [scrobble, setScrobble] = useState(Boolean(settings.getSync('scrobble')));

  useEffect(() => {
    settings.setSync('playbackFilters', config.playback.filters);
  }, [config.playback.filters]);

  return (
    <ConfigPanel header="Player" bordered>
      <p>
        Configure the number of seconds to skip forwards/backwards by when clicking the seek
        forward/backward buttons.
      </p>
      <br />
      <ControlLabel>Seek forward (s)</ControlLabel>
      <StyledInputNumber
        defaultValue={String(settings.getSync('seekForwardInterval')) || '0'}
        step={0.5}
        min={0}
        max={100}
        width={150}
        onChange={(e: any) => {
          settings.setSync('seekForwardInterval', Number(e));
        }}
      />
      <br />
      <ControlLabel>Seek backward (s)</ControlLabel>
      <StyledInputNumber
        defaultValue={String(settings.getSync('seekBackwardInterval')) || '0'}
        step={0.5}
        min={0}
        max={100}
        width={150}
        onChange={(e: any) => {
          settings.setSync('seekBackwardInterval', Number(e));
        }}
      />
      <br />
      <StyledCheckbox
        defaultChecked={globalMediaHotkeys}
        onChange={(_v: any, e: boolean) => {
          settings.setSync('globalMediaHotkeys', e);
          setGlobalMediaHotkeys(e);
        }}
      >
        Enable global media hotkeys (requires app restart)
      </StyledCheckbox>
      <StyledCheckbox
        defaultChecked={scrobble}
        onChange={(_v: any, e: boolean) => {
          settings.setSync('scrobble', e);
          dispatch(setPlaybackSetting({ setting: 'scrobble', value: e }));
          setScrobble(e);
        }}
      >
        Enable scrobbling
      </StyledCheckbox>
      <br />
      <h6>Filters</h6>
      <p>
        Any song title that matches a filter will be automatically removed when being added to the
        queue.
      </p>
      <p style={{ fontSize: 'smaller' }}>
        * Adding to the queue by double-clicking a song will ignore filters for that one song
      </p>
      <br />
      <StyledPanel bordered bodyFill>
        <Form fluid>
          <StyledInputGroup>
            <StyledInput
              value={newFilter}
              onChange={(e: string) => setNewFilter(e)}
              placeholder="Enter regex string"
            />
            <StyledButton
              type="submit"
              disabled={newFilter === ''}
              onClick={() => {
                dispatch(appendPlaybackFilter({ filter: newFilter, enabled: true }));
                settings.setSync(
                  'playbackFilters',
                  config.playback.filters.concat({
                    filter: newFilter,
                    enabled: true,
                  })
                );
                setNewFilter('');
              }}
            >
              Add
            </StyledButton>
          </StyledInputGroup>
        </Form>

        <ListViewTable
          data={config.playback.filters || []}
          height={200}
          columns={playbackFilterColumns}
          rowHeight={35}
          fontSize={12}
          listType="column"
          cacheImages={{ enabled: false }}
          playQueue={playQueue}
          multiSelect={multiSelect}
          isModal={false}
          miniView={false}
          disableContextMenu
          disableRowClick
          handleRowClick={() => {}}
          handleRowDoubleClick={() => {}}
          config={[]}
          virtualized
        />
      </StyledPanel>
    </ConfigPanel>
  );
};

export default PlayerConfig;
