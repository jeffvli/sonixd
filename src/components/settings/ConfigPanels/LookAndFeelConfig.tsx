import React, { useState } from 'react';
import settings from 'electron-settings';
import { RadioGroup, ControlLabel, Nav } from 'rsuite';
import { ConfigPanel } from '../styled';
import {
  StyledRadio,
  StyledInputPicker,
  StyledNavItem,
  StyledInputNumber,
} from '../../shared/styled';
import ListViewConfig from './ListViewConfig';
import { Fonts } from '../Fonts';
import { useAppDispatch } from '../../../redux/hooks';
import { setTheme, setFont } from '../../../redux/miscSlice';
import {
  songColumnPicker,
  songColumnList,
  albumColumnPicker,
  albumColumnList,
  playlistColumnPicker,
  playlistColumnList,
} from '../ListViewColumns';

const LookAndFeelConfig = () => {
  const dispatch = useAppDispatch();
  const [currentLAFTab, setCurrentLAFTab] = useState('songList');

  const songCols: any = settings.getSync('songListColumns');
  const albumCols: any = settings.getSync('albumListColumns');
  const playlistCols: any = settings.getSync('playlistListColumns');
  const miniCols: any = settings.getSync('miniListColumns');
  const currentSongColumns = songCols?.map((column: any) => column.label) || [];
  const currentAlbumColumns =
    albumCols?.map((column: any) => column.label) || [];
  const currentPlaylistColumns =
    playlistCols?.map((column: any) => column.label) || [];
  const currentMiniColumns = miniCols?.map((column: any) => column.label) || [];

  return (
    <ConfigPanel header="Look & Feel" bordered>
      <div style={{ width: '300px' }}>
        <p>Select the main application theme.</p>
        <RadioGroup
          name="themeRadioList"
          appearance="default"
          defaultValue={String(settings.getSync('theme'))}
          onChange={(e) => {
            settings.setSync('theme', e);
            dispatch(setTheme(e));
          }}
        >
          <StyledRadio value="defaultDark">Default Dark</StyledRadio>
          <StyledRadio value="defaultLight">Default Light</StyledRadio>
        </RadioGroup>
        <br />
        <ControlLabel>Font</ControlLabel>
        <br />
        <StyledInputPicker
          data={Fonts}
          groupBy="role"
          defaultValue={String(settings.getSync('font'))}
          onChange={(e: string) => {
            settings.setSync('font', e);
            dispatch(setFont(e));
          }}
        />
      </div>
      <br />
      <ConfigPanel header="List-View" bordered>
        <p>Select the columns you want displayed on pages with a list-view.</p>
        <Nav
          style={{ paddingTop: '10px' }}
          activeKey={currentLAFTab}
          onSelect={(e) => setCurrentLAFTab(e)}
        >
          <StyledNavItem eventKey="songList">Song List</StyledNavItem>
          <StyledNavItem eventKey="albumList">Album List</StyledNavItem>
          <StyledNavItem eventKey="playlistList">Playlist List</StyledNavItem>
          <StyledNavItem eventKey="miniList">Miniplayer List</StyledNavItem>
        </Nav>
        {currentLAFTab === 'songList' && (
          <ListViewConfig
            title="Song List"
            defaultColumns={currentSongColumns}
            columnPicker={songColumnPicker}
            columnList={songColumnList}
            settingsConfig={{
              columnList: 'songListColumns',
              rowHeight: 'songListRowHeight',
              fontSize: 'songListFontSize',
            }}
          />
        )}

        {currentLAFTab === 'albumList' && (
          <ListViewConfig
            title="Album List"
            defaultColumns={currentAlbumColumns}
            columnPicker={albumColumnPicker}
            columnList={albumColumnList}
            settingsConfig={{
              columnList: 'albumListColumns',
              rowHeight: 'albumListRowHeight',
              fontSize: 'albumListFontSize',
            }}
          />
        )}

        {currentLAFTab === 'playlistList' && (
          <ListViewConfig
            title="Playlist List"
            defaultColumns={currentPlaylistColumns}
            columnPicker={playlistColumnPicker}
            columnList={playlistColumnList}
            settingsConfig={{
              columnList: 'playlistListColumns',
              rowHeight: 'playlistListRowHeight',
              fontSize: 'playlistListFontSize',
            }}
          />
        )}
        {currentLAFTab === 'miniList' && (
          <ListViewConfig
            title="Miniplayer List"
            defaultColumns={currentMiniColumns}
            columnPicker={songColumnPicker}
            columnList={songColumnList}
            settingsConfig={{
              columnList: 'miniListColumns',
              rowHeight: 'miniListRowHeight',
              fontSize: 'miniListFontSize',
            }}
          />
        )}
      </ConfigPanel>
      <ConfigPanel header="Grid-View" bordered>
        <ControlLabel>Card size</ControlLabel>
        <StyledInputNumber
          defaultValue={String(settings.getSync('gridCardSize'))}
          step={1}
          min={100}
          max={350}
          width={150}
          onChange={(e: any) => {
            settings.setSync('gridCardSize', Number(e));
          }}
        />
      </ConfigPanel>
    </ConfigPanel>
  );
};

export default LookAndFeelConfig;
