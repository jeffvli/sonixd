import React, { useState } from 'react';
import { Checkbox, Divider, FlexboxGrid, Panel, Slider } from 'rsuite';
import { useAppSelector } from '../../redux/hooks';
import CustomTooltip from '../shared/CustomTooltip';

const DebugWindow = () => {
  const playQueue = useAppSelector((state) => state.playQueue);
  const player = useAppSelector((state) => state.player);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const [checked, setChecked] = useState(true);
  const [opacity, setOpacity] = useState(100);
  return (
    <Panel
      style={{
        position: 'absolute',
        zIndex: 2,
        bottom: '120px',
        right: '25px',
        padding: '10px',
        maxWidth: '250px',
        background: '#000',
        pointerEvents: checked ? 'all' : 'none',
        opacity: opacity / 100,
      }}
      bordered
    >
      <FlexboxGrid justify="space-between" style={{ alignItems: 'center' }}>
        <FlexboxGrid.Item>
          <h6>Player</h6>
        </FlexboxGrid.Item>
        <CustomTooltip text="Opacity">
          <FlexboxGrid.Item>
            <Slider
              value={opacity}
              onChange={(e) => setOpacity(e)}
              style={{ width: '50px' }}
              min={10}
              max={100}
              tooltip={false}
            />
          </FlexboxGrid.Item>
        </CustomTooltip>

        <CustomTooltip text="Clickable">
          <FlexboxGrid.Item>
            <Checkbox
              style={{
                pointerEvents: 'all',
                padding: '0px !important',
                margin: '0px !important',
              }}
              defaultChecked={checked}
              onChange={() => setChecked(!checked)}
            />
          </FlexboxGrid.Item>
        </CustomTooltip>
      </FlexboxGrid>

      <ul
        style={{
          listStyle: 'none',
          paddingLeft: '0px',
          wordWrap: 'break-word',
        }}
      >
        <li>
          status:{' '}
          <span
            style={{
              color: player.status === 'PLAYING' ? 'lightgreen' : 'orange',
            }}
          >
            {player.status}
          </span>
        </li>
        <li>currentSeek: {player.currentSeek.toFixed(2)}</li>
        <li>currentSeekable: {player.currentSeekable.toFixed(2)}</li>
        <li>volume (global): {playQueue.volume.toFixed(2)}</li>
        <li>repeat: {playQueue.repeat}</li>
        <li>shuffle: {playQueue.shuffle ? 'true' : 'false'}</li>
        <li>isFading: {playQueue.isFading ? 'true' : 'false'}</li>
      </ul>

      <table style={{ tableLayout: 'fixed' }}>
        <tr style={{ textAlign: 'left' }}>
          <th>Player</th>
          <th
            style={{
              color: playQueue.currentPlayer === 1 ? 'lightgreen' : undefined,
            }}
          >
            1
          </th>
          <th
            style={{
              color: playQueue.currentPlayer === 2 ? 'lightgreen' : undefined,
            }}
          >
            2
          </th>
        </tr>
        <tr>
          <td>index</td>
          <td>{playQueue.player1.index}</td>
          <td>{playQueue.player2.index}</td>
        </tr>
        <tr>
          <td style={{ width: '80px' }}>volume</td>
          <td style={{ width: '65px' }}>
            {Number(playQueue.player1.volume).toFixed(2)}
          </td>
          <td style={{ width: '65px' }}>
            {Number(playQueue.player2.volume).toFixed(2)}
          </td>
        </tr>
      </table>

      <Divider />
      <h6>PlayQueue</h6>

      <ul
        style={{
          listStyle: 'none',
          paddingLeft: '0px',
          wordWrap: 'break-word',
        }}
      >
        <li>currentIndex: {playQueue.currentIndex}</li>
        <li>currentSongId: {playQueue.currentSongId}</li>
        <li>entry: {playQueue.entry.length} tracks</li>
        <li>shuffledEntry: {playQueue.shuffledEntry.length} tracks</li>
      </ul>

      <Divider />
      <h6>Multiselect</h6>
      <ul
        style={{
          listStyle: 'none',
          paddingLeft: '0px',
          wordWrap: 'break-word',
        }}
      >
        <li>
          lastSelected: [{multiSelect.lastSelected.rowIndex}]{' '}
          {multiSelect.lastSelected.title}
        </li>
        <li>
          range (start): [{multiSelect.lastRangeSelected.lastSelected.rowIndex}]{' '}
          {multiSelect.lastRangeSelected.lastSelected.title}
        </li>
        <li>
          range (end): [
          {multiSelect.lastRangeSelected.lastRangeSelected.rowIndex}]{' '}
          {multiSelect.lastRangeSelected.lastRangeSelected.title}
        </li>
        <li>selected: {multiSelect.selected.length} rows</li>
      </ul>
    </Panel>
  );
};

export default DebugWindow;
