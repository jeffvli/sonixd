import React, { useRef, useState } from 'react';
import _ from 'lodash';
import { shell } from 'electron';
import settings from 'electron-settings';
import { ControlLabel, Nav, Icon, RadioGroup } from 'rsuite';
import { ConfigPanel } from '../styled';
import {
  StyledInputPicker,
  StyledNavItem,
  StyledInputNumber,
  StyledCheckbox,
  StyledInputPickerContainer,
  StyledLink,
  StyledInputGroup,
  StyledInputGroupButton,
  StyledRadio,
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
import {
  setActive,
  setGridAlignment,
  setGridCardSize,
  setGridGapSize,
} from '../../../redux/configSlice';
import { Server } from '../../../types';

export const ListViewConfigPanel = ({ bordered }: any) => {
  const dispatch = useAppDispatch();
  const config = useAppSelector((state) => state.config);

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
    <ConfigPanel header="List-View" bordered={bordered}>
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
          disabledItemValues={config.serverType === Server.Jellyfin ? ['Path'] : []}
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
          disabledItemValues={config.serverType === Server.Jellyfin ? ['Rating', 'Play Count'] : []}
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
          disabledItemValues={
            config.serverType === Server.Jellyfin
              ? ['Modified', 'Owner', 'Track Count', 'Visibility']
              : []
          }
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
          disabledItemValues={
            config.serverType === Server.Jellyfin ? ['Album Count', 'Rating'] : ['Duration']
          }
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
          disabledItemValues={
            config.serverType === Server.Jellyfin ? ['Album Count', 'Track Count'] : []
          }
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
          disabledItemValues={config.serverType === Server.Jellyfin ? ['Path'] : []}
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
  );
};

export const GridViewConfigPanel = ({ bordered }: any) => {
  const dispatch = useAppDispatch();
  const config = useAppSelector((state) => state.config);

  return (
    <ConfigPanel header="Grid-View" bordered={bordered}>
      <ControlLabel>Card size (px)</ControlLabel>
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
      <br />
      <ControlLabel>Gap size (px)</ControlLabel>
      <StyledInputNumber
        defaultValue={config.lookAndFeel.gridView.gapSize}
        step={1}
        min={0}
        max={100}
        width={150}
        onChange={(e: any) => {
          settings.setSync('gridGapSize', Number(e));
          dispatch(setGridGapSize({ size: Number(e) }));
        }}
      />
      <br />
      <ControlLabel>Grid alignment</ControlLabel>
      <RadioGroup
        name="gridAlignemntRadioList"
        appearance="default"
        defaultValue={config.lookAndFeel.gridView.alignment}
        value={config.lookAndFeel.gridView.alignment}
        onChange={(e: string) => {
          dispatch(setGridAlignment({ alignment: e }));
          settings.setSync('gridAlignment', e);
        }}
      >
        <StyledRadio value="flex-start">Left</StyledRadio>
        <StyledRadio value="center">Center</StyledRadio>
      </RadioGroup>
    </ConfigPanel>
  );
};

const LookAndFeelConfig = () => {
  const dispatch = useAppDispatch();
  const [dynamicBackgroundChk, setDynamicBackgroundChk] = useState(
    Boolean(settings.getSync('dynamicBackground'))
  );

  const [selectedTheme, setSelectedTheme] = useState(String(settings.getSync('theme')));
  const themePickerContainerRef = useRef(null);
  const fontPickerContainerRef = useRef(null);
  const titleBarPickerContainerRef = useRef(null);
  const [themeList, setThemeList] = useState(
    _.concat(settings.getSync('themes'), settings.getSync('themesDefault'))
  );

  return (
    <>
      <ConfigPanel header="Look & Feel" bordered>
        <p>
          <StyledLink
            onClick={() => shell.openExternal('https://github.com/jeffvli/sonixd/discussions/61')}
          >
            Check out the theming documentation! <Icon icon="external-link" />
          </StyledLink>
        </p>
        <br />
        <StyledInputPickerContainer ref={themePickerContainerRef}>
          <ControlLabel>Theme</ControlLabel>
          <br />
          <StyledInputGroup>
            <StyledInputPicker
              container={() => themePickerContainerRef.current}
              data={themeList}
              labelKey="label"
              valueKey="value"
              cleanable={false}
              defaultValue={selectedTheme}
              onChange={(e: string) => {
                settings.setSync('theme', e);
                setSelectedTheme(e);
                dispatch(setTheme(e));
              }}
            />
            <StyledInputGroupButton
              onClick={() => {
                dispatch(setTheme('defaultDark'));
                dispatch(setTheme(selectedTheme));
                setThemeList(
                  _.concat(settings.getSync('themes'), settings.getSync('themesDefault'))
                );
              }}
            >
              <Icon icon="refresh" />
            </StyledInputGroupButton>
          </StyledInputGroup>
        </StyledInputPickerContainer>
        <br />
        <StyledInputPickerContainer ref={fontPickerContainerRef}>
          <ControlLabel>Font</ControlLabel>
          <br />
          <StyledInputPicker
            container={() => fontPickerContainerRef.current}
            data={Fonts}
            groupBy="role"
            cleanable={false}
            defaultValue={String(settings.getSync('font'))}
            onChange={(e: string) => {
              settings.setSync('font', e);
              dispatch(setFont(e));
            }}
          />
        </StyledInputPickerContainer>
        <br />
        <StyledInputPickerContainer ref={titleBarPickerContainerRef}>
          <ControlLabel>Titlebar style (requires app restart)</ControlLabel>
          <br />
          <StyledInputPicker
            container={() => titleBarPickerContainerRef.current}
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
        </StyledInputPickerContainer>
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

      <ListViewConfigPanel bordered />
      <GridViewConfigPanel bordered />
    </>
  );
};

export default LookAndFeelConfig;
