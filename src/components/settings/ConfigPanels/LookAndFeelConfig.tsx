import React, { useState } from 'react';
import settings from 'electron-settings';
import { RadioGroup, ControlLabel, Nav } from 'rsuite';
import { ConfigPanel } from '../styled';
import {
  StyledRadio,
  StyledInputPicker,
  StyledNavItem,
  StyledInputNumber,
  StyledCheckbox,
} from '../../shared/styled';
import ListViewConfig from './ListViewConfig';
import { Fonts } from '../Fonts';
import { useAppDispatch } from '../../../redux/hooks';
import { setTheme, setFont, setDynamicBackground, setMiscSetting } from '../../../redux/miscSlice';
import {
  songColumnPicker,
  songColumnList,
  songColumnListAuto,
  albumColumnPicker,
  albumColumnList,
  albumColumnListAuto,
  playlistColumnPicker,
  playlistColumnList,
  playlistColumnListAuto,
  artistColumnPicker,
  artistColumnList,
  artistColumnListAuto,
  genreColumnPicker,
  genreColumnList,
  genreColumnListAuto,
} from '../ListViewColumns';

const LookAndFeelConfig = () => {
  const dispatch = useAppDispatch();
  const [currentLAFTab, setCurrentLAFTab] = useState('songList');
  const [resizableColumn, setResizableColumn] = useState(false);
  const [dynamicBackgroundChk, setDynamicBackgroundChk] = useState(
    Boolean(settings.getSync('dynamicBackground'))
  );
  const [highlightOnRowHoverChk, setHighlightOnRowHoverChk] = useState(
    Boolean(settings.getSync('highlightOnRowHover'))
  );

  const songCols: any = settings.getSync('musicListColumns');
  const albumCols: any = settings.getSync('albumListColumns');
  const playlistCols: any = settings.getSync('playlistListColumns');
  const artistCols: any = settings.getSync('artistListColumns');
  const miniCols: any = settings.getSync('miniListColumns');
  const genreCols: any = settings.getSync('genreListColumns');
  const currentSongColumns = songCols?.map((column: any) => column.label) || [];
  const currentAlbumColumns = albumCols?.map((column: any) => column.label) || [];
  const currentPlaylistColumns = playlistCols?.map((column: any) => column.label) || [];
  const currentArtistColumns = artistCols?.map((column: any) => column.label) || [];
  const currentMiniColumns = miniCols?.map((column: any) => column.label) || [];
  const currentGenreColumns = genreCols?.map((column: any) => column.label) || [];

  return (
    <>
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
            cleanable={false}
            defaultValue={String(settings.getSync('font'))}
            onChange={(e: string) => {
              settings.setSync('font', e);
              dispatch(setFont(e));
            }}
          />
        </div>
        <br />
        <div>
          <ControlLabel>Titlebar style (requires app restart)</ControlLabel>
          <br />
          <StyledInputPicker
            data={[
              {
                label: 'macOS',
                value: 'mac',
              },
              {
                label: 'Windows',
                value: 'windows',
              },
            ]}
            cleanable={false}
            defaultValue={String(settings.getSync('titleBarStyle'))}
            onChange={(e: string) => {
              settings.setSync('titleBarStyle', e);
              dispatch(setMiscSetting({ setting: 'titleBar', value: e }));
            }}
          />
        </div>
        <br />
        <StyledCheckbox
          defaultChecked={dynamicBackgroundChk}
          checked={dynamicBackgroundChk}
          onChange={(_v: any, e: boolean) => {
            settings.setSync('dynamicBackground', e);
            dispatch(setDynamicBackground(e));
            setDynamicBackgroundChk(e);
          }}
        >
          Enable dynamic background
        </StyledCheckbox>
      </ConfigPanel>
      <ConfigPanel header="List-View" bordered>
        <Nav activeKey={currentLAFTab} onSelect={(e) => setCurrentLAFTab(e)}>
          <StyledNavItem eventKey="songList">Songs</StyledNavItem>
          <StyledNavItem eventKey="albumList">Albums</StyledNavItem>
          <StyledNavItem eventKey="playlistList">Playlists</StyledNavItem>
          <StyledNavItem eventKey="artistList">Artists</StyledNavItem>
          <StyledNavItem eventKey="genreList">Genres</StyledNavItem>
          <StyledNavItem eventKey="miniList">Miniplayer</StyledNavItem>
        </Nav>
        {currentLAFTab === 'songList' && (
          <ListViewConfig
            title="Song List"
            defaultColumns={currentSongColumns}
            columnPicker={songColumnPicker}
            columnList={resizableColumn ? songColumnList : songColumnListAuto}
            settingsConfig={{
              columnList: 'musicListColumns',
              rowHeight: 'musicListRowHeight',
              fontSize: 'musicListFontSize',
            }}
          />
        )}

        {currentLAFTab === 'albumList' && (
          <ListViewConfig
            title="Album List"
            defaultColumns={currentAlbumColumns}
            columnPicker={albumColumnPicker}
            columnList={resizableColumn ? albumColumnList : albumColumnListAuto}
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
            columnList={resizableColumn ? playlistColumnList : playlistColumnListAuto}
            settingsConfig={{
              columnList: 'playlistListColumns',
              rowHeight: 'playlistListRowHeight',
              fontSize: 'playlistListFontSize',
            }}
          />
        )}

        {currentLAFTab === 'artistList' && (
          <ListViewConfig
            title="Artist List"
            defaultColumns={currentArtistColumns}
            columnPicker={artistColumnPicker}
            columnList={resizableColumn ? artistColumnList : artistColumnListAuto}
            settingsConfig={{
              columnList: 'artistListColumns',
              rowHeight: 'artistListRowHeight',
              fontSize: 'artistListFontSize',
            }}
          />
        )}

        {currentLAFTab === 'genreList' && (
          <ListViewConfig
            title="Genre List"
            defaultColumns={currentGenreColumns}
            columnPicker={genreColumnPicker}
            columnList={resizableColumn ? genreColumnList : genreColumnListAuto}
            settingsConfig={{
              columnList: 'genreListColumns',
              rowHeight: 'genreListRowHeight',
              fontSize: 'genreListFontSize',
            }}
          />
        )}

        {currentLAFTab === 'miniList' && (
          <ListViewConfig
            title="Miniplayer List"
            defaultColumns={currentMiniColumns}
            columnPicker={songColumnPicker}
            columnList={resizableColumn ? songColumnList : songColumnListAuto}
            settingsConfig={{
              columnList: 'miniListColumns',
              rowHeight: 'miniListRowHeight',
              fontSize: 'miniListFontSize',
            }}
          />
        )}

        <br />
        <StyledCheckbox
          defaultChecked={highlightOnRowHoverChk}
          checked={highlightOnRowHoverChk}
          onChange={(_v: any, e: boolean) => {
            settings.setSync('highlightOnRowHover', e);
            dispatch(
              setMiscSetting({
                setting: 'highlightOnRowHover',
                value: e,
              })
            );
            setHighlightOnRowHoverChk(e);
          }}
        >
          Show highlight on row hover
        </StyledCheckbox>
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
    </>
  );
};

export default LookAndFeelConfig;
