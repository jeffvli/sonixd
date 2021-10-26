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
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setTheme, setFont, setDynamicBackground, setMiscSetting } from '../../../redux/miscSlice';
import {
  songColumnPicker,
  songColumnListAuto,
  albumColumnPicker,
  albumColumnListAuto,
  playlistColumnPicker,
  playlistColumnListAuto,
  artistColumnPicker,
  artistColumnListAuto,
  genreColumnPicker,
  genreColumnListAuto,
} from '../ListViewColumns';
import { setActive, setGridCardSize } from '../../../redux/configSlice';

const LookAndFeelConfig = () => {
  const dispatch = useAppDispatch();
  const config = useAppSelector((state) => state.config);
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
        <Nav
          activeKey={config.active.columnSelectorTab}
          onSelect={(e) => dispatch(setActive({ ...config.active, columnSelectorTab: e }))}
        >
          <StyledNavItem eventKey="music">Songs</StyledNavItem>
          <StyledNavItem eventKey="album">Albums</StyledNavItem>
          <StyledNavItem eventKey="playlist">Playlists</StyledNavItem>
          <StyledNavItem eventKey="artist">Artists</StyledNavItem>
          <StyledNavItem eventKey="genre">Genres</StyledNavItem>
          <StyledNavItem eventKey="mini">Miniplayer</StyledNavItem>
        </Nav>
        {config.active.columnSelectorTab === 'music' && (
          <ListViewConfig
            title="Song List"
            defaultColumns={currentSongColumns}
            columnPicker={songColumnPicker}
            columnList={songColumnListAuto}
            settingsConfig={{
              columnList: 'musicListColumns',
              rowHeight: 'musicListRowHeight',
              fontSize: 'musicListFontSize',
            }}
          />
        )}

        {config.active.columnSelectorTab === 'album' && (
          <ListViewConfig
            title="Album List"
            defaultColumns={currentAlbumColumns}
            columnPicker={albumColumnPicker}
            columnList={albumColumnListAuto}
            settingsConfig={{
              columnList: 'albumListColumns',
              rowHeight: 'albumListRowHeight',
              fontSize: 'albumListFontSize',
            }}
          />
        )}

        {config.active.columnSelectorTab === 'playlist' && (
          <ListViewConfig
            title="Playlist List"
            defaultColumns={currentPlaylistColumns}
            columnPicker={playlistColumnPicker}
            columnList={playlistColumnListAuto}
            settingsConfig={{
              columnList: 'playlistListColumns',
              rowHeight: 'playlistListRowHeight',
              fontSize: 'playlistListFontSize',
            }}
          />
        )}

        {config.active.columnSelectorTab === 'artist' && (
          <ListViewConfig
            title="Artist List"
            defaultColumns={currentArtistColumns}
            columnPicker={artistColumnPicker}
            columnList={artistColumnListAuto}
            settingsConfig={{
              columnList: 'artistListColumns',
              rowHeight: 'artistListRowHeight',
              fontSize: 'artistListFontSize',
            }}
          />
        )}

        {config.active.columnSelectorTab === 'genre' && (
          <ListViewConfig
            title="Genre List"
            defaultColumns={currentGenreColumns}
            columnPicker={genreColumnPicker}
            columnList={genreColumnListAuto}
            settingsConfig={{
              columnList: 'genreListColumns',
              rowHeight: 'genreListRowHeight',
              fontSize: 'genreListFontSize',
            }}
          />
        )}

        {config.active.columnSelectorTab === 'mini' && (
          <ListViewConfig
            title="Miniplayer List"
            defaultColumns={currentMiniColumns}
            columnPicker={songColumnPicker}
            columnList={songColumnListAuto}
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
          defaultValue={config.lookAndFeel.gridView.cardSize}
          step={1}
          min={100}
          max={350}
          width={150}
          onChange={(e: any) => {
            settings.setSync('gridCardSize', Number(e));
            dispatch(setGridCardSize({ size: Number(e) }));
          }}
        />
      </ConfigPanel>
    </>
  );
};

export default LookAndFeelConfig;
