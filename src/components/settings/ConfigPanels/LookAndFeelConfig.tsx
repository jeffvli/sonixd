import React, { useRef, useState } from 'react';
import _ from 'lodash';
import { ipcRenderer, shell } from 'electron';
import settings from 'electron-settings';
import { Nav, Icon, RadioGroup, Whisper } from 'rsuite';
import { WhisperInstance } from 'rsuite/lib/Whisper';
import { Trans, useTranslation } from 'react-i18next';
import { ConfigPanel } from '../styled';
import {
  StyledInputPicker,
  StyledNavItem,
  StyledInputNumber,
  StyledInputPickerContainer,
  StyledLink,
  StyledInputGroup,
  StyledRadio,
  StyledIconButton,
  StyledToggle,
  StyledButton,
  StyledPopover,
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
import ConfigOption from '../ConfigOption';
import i18n, { Languages } from '../../../i18n/i18n';
import { notifyToast } from '../../shared/toast';

export const ListViewConfigPanel = ({ bordered }: any) => {
  const { t } = useTranslation();
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
    <ConfigPanel header={t('List View')} bordered={bordered}>
      <Nav
        activeKey={config.active.columnSelectorTab}
        onSelect={(e) => dispatch(setActive({ ...config.active, columnSelectorTab: e }))}
      >
        <StyledNavItem eventKey="music">{t('Songs')}</StyledNavItem>
        <StyledNavItem eventKey="album">{t('Albums')}</StyledNavItem>
        <StyledNavItem eventKey="playlist">{t('Playlists')}</StyledNavItem>
        <StyledNavItem eventKey="artist">{t('Artists')}</StyledNavItem>
        <StyledNavItem eventKey="genre">{t('Genres')}</StyledNavItem>
        <StyledNavItem eventKey="mini">{t('Miniplayer')}</StyledNavItem>
      </Nav>
      {config.active.columnSelectorTab === 'music' && (
        <ListViewConfig
          type={t('Songs')}
          defaultColumns={currentSongColumns}
          columnPicker={songColumnPicker}
          columnList={songColumnListAuto}
          settingsConfig={{
            columnList: 'musicListColumns',
            rowHeight: 'musicListRowHeight',
            fontSize: 'musicListFontSize',
          }}
          disabledItemValues={config.serverType === Server.Jellyfin ? [t('Rating')] : []}
        />
      )}

      {config.active.columnSelectorTab === 'album' && (
        <ListViewConfig
          type={t('Albums')}
          defaultColumns={currentAlbumColumns}
          columnPicker={albumColumnPicker}
          columnList={albumColumnListAuto}
          settingsConfig={{
            columnList: 'albumListColumns',
            rowHeight: 'albumListRowHeight',
            fontSize: 'albumListFontSize',
          }}
          disabledItemValues={
            config.serverType === Server.Jellyfin ? [t('Rating'), t('Play Count')] : []
          }
        />
      )}

      {config.active.columnSelectorTab === 'playlist' && (
        <ListViewConfig
          type={t('Playlists')}
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
              ? [t('Modified'), t('Owner'), t('Track Count'), t('Visibility')]
              : []
          }
        />
      )}

      {config.active.columnSelectorTab === 'artist' && (
        <ListViewConfig
          type={t('Artists')}
          defaultColumns={currentArtistColumns}
          columnPicker={artistColumnPicker}
          columnList={artistColumnListAuto}
          settingsConfig={{
            columnList: 'artistListColumns',
            rowHeight: 'artistListRowHeight',
            fontSize: 'artistListFontSize',
          }}
          disabledItemValues={
            config.serverType === Server.Jellyfin
              ? [t('Album Count'), t('Rating')]
              : [t('Duration')]
          }
        />
      )}

      {config.active.columnSelectorTab === 'genre' && (
        <ListViewConfig
          type={t('Genres')}
          defaultColumns={currentGenreColumns}
          columnPicker={genreColumnPicker}
          columnList={genreColumnListAuto}
          settingsConfig={{
            columnList: 'genreListColumns',
            rowHeight: 'genreListRowHeight',
            fontSize: 'genreListFontSize',
          }}
          disabledItemValues={
            config.serverType === Server.Jellyfin ? [t('Album Count'), t('Track Count')] : []
          }
        />
      )}

      {config.active.columnSelectorTab === 'mini' && (
        <ListViewConfig
          type={t('Mini-player')}
          defaultColumns={currentMiniColumns}
          columnPicker={songColumnPicker}
          columnList={songColumnListAuto}
          settingsConfig={{
            columnList: 'miniListColumns',
            rowHeight: 'miniListRowHeight',
            fontSize: 'miniListFontSize',
          }}
          disabledItemValues={config.serverType === Server.Jellyfin ? [t('Rating')] : []}
        />
      )}

      <ConfigOption
        name={t('Highlight On Hover')}
        description={t('Highlights the list view row when hovering it with the mouse.')}
        option={
          <StyledToggle
            defaultChecked={highlightOnRowHoverChk}
            checked={highlightOnRowHoverChk}
            onChange={(e: boolean) => {
              settings.setSync('highlightOnRowHover', e);
              dispatch(
                setMiscSetting({
                  setting: 'highlightOnRowHover',
                  value: e,
                })
              );
              setHighlightOnRowHoverChk(e);
            }}
          />
        }
      />
    </ConfigPanel>
  );
};

export const GridViewConfigPanel = ({ bordered }: any) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const config = useAppSelector((state) => state.config);

  return (
    <ConfigPanel header={t('Grid View')} bordered={bordered}>
      <ConfigOption
        name={t('Card Size')}
        description={t('The width and height in pixels (px) of each grid view card.')}
        option={
          <StyledInputNumber
            defaultValue={config.lookAndFeel.gridView.cardSize}
            step={1}
            min={100}
            max={350}
            width={125}
            onChange={(e: any) => {
              settings.setSync('gridCardSize', Number(e));
              dispatch(setGridCardSize({ size: Number(e) }));
            }}
          />
        }
      />

      <ConfigOption
        name={t('Gap Size')}
        description={t('The gap in pixels (px) of the grid view layout.')}
        option={
          <StyledInputNumber
            defaultValue={config.lookAndFeel.gridView.gapSize}
            step={1}
            min={0}
            max={100}
            width={125}
            onChange={(e: any) => {
              settings.setSync('gridGapSize', Number(e));
              dispatch(setGridGapSize({ size: Number(e) }));
            }}
          />
        }
      />

      <ConfigOption
        name={t('Grid Alignment')}
        description={t('The alignment of cards in the grid view layout.')}
        option={
          <RadioGroup
            name="gridAlignemntRadioList"
            inline
            defaultValue={config.lookAndFeel.gridView.alignment}
            value={config.lookAndFeel.gridView.alignment}
            onChange={(e: string) => {
              dispatch(setGridAlignment({ alignment: e }));
              settings.setSync('gridAlignment', e);
            }}
          >
            <StyledRadio value="flex-start">{t('Left')}</StyledRadio>
            <StyledRadio value="center">{t('Center')}</StyledRadio>
          </RadioGroup>
        }
      />
    </ConfigPanel>
  );
};

export const ThemeConfigPanel = ({ bordered }: any) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [dynamicBackgroundChk, setDynamicBackgroundChk] = useState(
    Boolean(settings.getSync('dynamicBackground'))
  );

  const [selectedTheme, setSelectedTheme] = useState(String(settings.getSync('theme')));
  const languagePickerContainerRef = useRef(null);
  const themePickerContainerRef = useRef(null);
  const fontPickerContainerRef = useRef(null);
  const titleBarPickerContainerRef = useRef(null);
  const startPagePickerContainerRef = useRef(null);
  const titleBarRestartWhisper = React.createRef<WhisperInstance>();
  const [themeList, setThemeList] = useState(
    _.concat(settings.getSync('themes'), settings.getSync('themesDefault'))
  );

  return (
    <ConfigPanel header={t('Look & Feel')} bordered={bordered}>
      <ConfigOption
        name={t('Language')}
        description={t('The application language.')}
        option={
          <StyledInputPickerContainer ref={languagePickerContainerRef}>
            <StyledInputPicker
              container={() => languagePickerContainerRef.current}
              data={Languages}
              width={200}
              cleanable={false}
              defaultValue={String(settings.getSync('language'))}
              placeholder={t('Select')}
              onChange={(e: string) => {
                i18n.changeLanguage(e, (err) => {
                  if (err) {
                    notifyToast('error', 'Error while changing the language');
                  }
                });
                settings.setSync('language', e);
              }}
            />
          </StyledInputPickerContainer>
        }
      />

      <ConfigOption
        name={
          <>
            {t('Theme')}{' '}
            <StyledIconButton
              size="xs"
              icon={<Icon icon="refresh" />}
              onClick={() => {
                dispatch(setTheme('defaultDark'));
                dispatch(setTheme(selectedTheme));
                setThemeList(
                  _.concat(settings.getSync('themes'), settings.getSync('themesDefault'))
                );
              }}
            />
          </>
        }
        description={
          <Trans>
            The application theme. Want to create your own themes? Check out the documentation{' '}
            <StyledLink
              onClick={() => shell.openExternal('https://github.com/jeffvli/sonixd/discussions/61')}
            >
              here
            </StyledLink>
            .
          </Trans>
        }
        option={
          <StyledInputPickerContainer ref={themePickerContainerRef}>
            <StyledInputGroup>
              <StyledInputPicker
                container={() => themePickerContainerRef.current}
                data={themeList}
                labelKey="label"
                valueKey="value"
                cleanable={false}
                width={200}
                defaultValue={selectedTheme}
                placeholder={t('Select')}
                onChange={(e: string) => {
                  settings.setSync('theme', e);
                  setSelectedTheme(e);
                  dispatch(setTheme(e));
                }}
              />
            </StyledInputGroup>
          </StyledInputPickerContainer>
        }
      />

      <ConfigOption
        name={t('Font')}
        description={t('The application font.')}
        option={
          <StyledInputPickerContainer ref={fontPickerContainerRef}>
            <StyledInputPicker
              container={() => fontPickerContainerRef.current}
              data={Fonts}
              groupBy="role"
              width={200}
              cleanable={false}
              defaultValue={String(settings.getSync('font'))}
              placeholder={t('Select')}
              onChange={(e: string) => {
                settings.setSync('font', e);
                dispatch(setFont(e));
              }}
            />
          </StyledInputPickerContainer>
        }
      />

      <ConfigOption
        name={t('Titlebar Style')}
        description={t('The titlebar style (requires app restart). ')}
        option={
          <StyledInputPickerContainer ref={titleBarPickerContainerRef}>
            <Whisper
              ref={titleBarRestartWhisper}
              trigger="none"
              placement="auto"
              speaker={
                <StyledPopover title={t('Restart?')}>
                  <div>{t('Do you want to restart the application now?')}</div>
                  <strong>{t('This is highly recommended!')}</strong>
                  <div>
                    <StyledButton
                      id="titlebar-restart-button"
                      size="sm"
                      onClick={() => {
                        ipcRenderer.send('reload');
                      }}
                      appearance="primary"
                    >
                      {t('Yes')}
                    </StyledButton>
                  </div>
                </StyledPopover>
              }
            >
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
                  {
                    label: t('Native'),
                    value: 'native',
                  },
                ]}
                cleanable={false}
                defaultValue={String(settings.getSync('titleBarStyle'))}
                width={200}
                placeholder={t('Select')}
                onChange={(e: string) => {
                  settings.setSync('titleBarStyle', e);
                  dispatch(setMiscSetting({ setting: 'titleBar', value: e }));
                  titleBarRestartWhisper.current?.open();
                }}
              />
            </Whisper>
          </StyledInputPickerContainer>
        }
      />

      <ConfigOption
        name={t('Dynamic Background')}
        description={t('Sets a dynamic background based on the currently playing song.')}
        option={
          <StyledToggle
            defaultChecked={dynamicBackgroundChk}
            checked={dynamicBackgroundChk}
            onChange={(e: boolean) => {
              settings.setSync('dynamicBackground', e);
              dispatch(setDynamicBackground(e));
              setDynamicBackgroundChk(e);
            }}
          />
        }
      />

      <ConfigOption
        name={t('Start page')}
        description={t('Page Sonixd will display on start.')}
        option={
          <StyledInputPickerContainer ref={startPagePickerContainerRef}>
            <StyledInputPicker
              container={() => startPagePickerContainerRef.current}
              data={[
                {
                  label: t('Dashboard'),
                  value: '/',
                },
                {
                  label: t('Playlists'),
                  value: '/playlist',
                },
                {
                  label: t('Favorites'),
                  value: '/starred',
                },
                {
                  label: t('Albums'),
                  value: '/library/album',
                },
                {
                  label: t('Artists'),
                  value: '/library/artist',
                },
                {
                  label: t('Genres'),
                  value: '/library/genre',
                },
                {
                  label: t('Folders'),
                  value: '/library/folder',
                },
              ]}
              cleanable={false}
              defaultValue={String(settings.getSync('startPage'))}
              width={200}
              placeholder={t('Select')}
              onChange={(e: string) => {
                settings.setSync('startPage', e);
              }}
            />
          </StyledInputPickerContainer>
        }
      />
    </ConfigPanel>
  );
};

const LookAndFeelConfig = () => {
  return (
    <>
      <ThemeConfigPanel />
      <ListViewConfigPanel />
      <GridViewConfigPanel />
    </>
  );
};

export default LookAndFeelConfig;
