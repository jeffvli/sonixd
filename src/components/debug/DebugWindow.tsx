import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Button, Checkbox, Divider, FlexboxGrid, Panel, Slider } from 'rsuite';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import CustomTooltip from '../shared/CustomTooltip';
import { setFadeData } from '../../redux/playQueueSlice';

const DebugWindow = ({ ...rest }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const playQueue = useAppSelector((state) => state.playQueue);
  const player = useAppSelector((state) => state.player);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const [checked, setChecked] = useState(true);
  const [opacity, setOpacity] = useState(60);

  const fadeChartData = {
    labels: playQueue.player1.fadeData.timeData,
    datasets: [
      {
        label: 'Player 1',
        data: playQueue.player1.fadeData.volumeData,
        fill: false,
        backgroundColor: 'rgb(0, 150, 0)',
        borderColor: 'rgba(0, 150, 0, 0.2)',
      },
      {
        label: 'Player 2',
        data: playQueue.player2.fadeData.volumeData,
        fill: false,
        backgroundColor: 'rgb(150, 0, 0)',
        borderColor: 'rgba(150, 0, 0, 0.2)',
      },
    ],
  };

  return (
    <Panel
      style={{
        position: 'absolute',
        zIndex: 2,
        bottom: '8%',
        right: '20px',
        padding: '10px',
        width: '400px',
        height: '70%',
        background: '#000',
        pointerEvents: checked ? 'all' : 'none',
        opacity: opacity / 100,
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
      bordered
    >
      <FlexboxGrid
        style={{
          alignItems: 'center',
          position: 'fixed',
        }}
      >
        <h5 style={{ paddingRight: '10px' }}>Debug</h5>
        <CustomTooltip text={t('Clickable')}>
          <FlexboxGrid.Item>
            <Checkbox
              style={{
                pointerEvents: 'all',
                paddingRight: '10px',
                padding: '0px !important',
                margin: '0px !important',
              }}
              defaultChecked={checked}
              onChange={() => setChecked(!checked)}
            />
          </FlexboxGrid.Item>
        </CustomTooltip>
        <CustomTooltip text={t('Opacity')}>
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
      </FlexboxGrid>

      <div style={{ paddingTop: '40px' }}>
        <h6>Player</h6>

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
          <li>volume (global): {playQueue.volume.toFixed(2)}</li>
          <li>actual volume: {(playQueue.volume ** 2).toFixed(2)}</li>
          <li>volumeFade: {playQueue.volumeFade ? 'true' : 'false'}</li>
          <li>shuffle: {playQueue.shuffle ? 'true' : 'false'}</li>
          <li>repeat: {playQueue.repeat}</li>
          <li>isFading: {playQueue.isFading ? 'true' : 'false'}</li>
          <li>currentEntryList: {rest.currentEntryList}</li>
          <li>fadeDuration: {playQueue.fadeDuration}</li>
          <li>fadeType: {playQueue.fadeType}</li>
          <li>pollingInterval: {playQueue.pollingInterval}</li>
        </ul>

        <table style={{ tableLayout: 'fixed', textAlign: 'center' }}>
          <tbody>
            <tr>
              <th style={{ textAlign: 'left' }}>Player [{playQueue.currentPlayer}]</th>
              <th
                style={{
                  color: 'rgb(0, 150, 0)',
                }}
              >
                1
              </th>
              <th
                style={{
                  color: 'rgb(150, 0, 0)',
                }}
              >
                2
              </th>
            </tr>
            <tr>
              <td style={{ textAlign: 'left' }}>index</td>
              <td>{playQueue.player1.index}</td>
              <td>{playQueue.player2.index}</td>
            </tr>
            <tr>
              <td style={{ width: '80px', textAlign: 'left' }}>volume</td>
              <td style={{ width: '65px' }}>{Number(playQueue.player1.volume).toFixed(2)}</td>
              <td style={{ width: '65px' }}>{Number(playQueue.player2.volume).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <br />
        <FlexboxGrid justify="space-between">
          <FlexboxGrid.Item>
            <h6>Volume fade</h6>
          </FlexboxGrid.Item>
          <FlexboxGrid.Item>
            <Button size="xs" onClick={() => dispatch(setFadeData({ clear: true }))}>
              Reset
            </Button>
          </FlexboxGrid.Item>
        </FlexboxGrid>

        <Line
          data={fadeChartData}
          options={{
            scales: {
              yAxes: {
                min: 0,
              },
            },
            plugins: {
              title: {
                display: true,
                text: `${playQueue.player1.fadeData.volumeData.length} fades`,
                position: 'bottom',
              },
              legend: {
                display: false,
              },
            },
            animation: false,
          }}
        />

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
          <li>sortedEntry: {playQueue.sortedEntry.length} tracks</li>
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
          <li>selected: {multiSelect.selected.length} rows</li>
          <li>lastSelected: {multiSelect.lastSelected.title}</li>
          <li>range (start): {multiSelect.lastRangeSelected.lastSelected.title}</li>
          <li>range (end): {multiSelect.lastRangeSelected.lastRangeSelected.title}</li>
          <li>
            currentMouseOverId (drop): [{multiSelect.currentMouseOverIndex}]{' '}
            {multiSelect.currentMouseOverId}
          </li>
          <li>isDragging: {multiSelect.isDragging ? 'true' : 'false'}</li>
          <li>isSelectDragging: {multiSelect.isSelectDragging ? 'true' : 'false'}</li>
        </ul>
      </div>
    </Panel>
  );
};

export default DebugWindow;
