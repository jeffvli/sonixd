import React, { useRef, useState } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
import { ipcRenderer, shell } from 'electron';
import settings from 'electron-settings';
import { Nav, Icon, RadioGroup, Whisper, Divider } from 'rsuite';
import { WhisperInstance } from 'rsuite/lib/Whisper';
import { Trans, useTranslation } from 'react-i18next';
import { ConfigOptionDescription, ConfigPanel } from '../styled';
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
  StyledCheckbox,
  StyledCheckPicker,
} from '../../shared/styled';
import ListViewConfig from './ListViewConfig';
import Fonts from '../Fonts';
import { ALBUM_SORT_TYPES } from '../../library/AlbumList';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setTheme, setDynamicBackground, setMiscSetting } from '../../../redux/miscSlice';
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
  setFont,
  setGridAlignment,
  setGridCardSize,
  setGridGapSize,
  setSidebar,
} from '../../../redux/configSlice';
import { Item, Playlist, Server } from '../../../types';
import ConfigOption from '../ConfigOption';
import i18n, { Languages } from '../../../i18n/i18n';
import { notifyToast } from '../../shared/toast';
import { setPagination } from '../../../redux/viewSlice';
import { MUSIC_SORT_TYPES } from '../../library/MusicList';
import Popup from '../../shared/Popup';
import { apiController } from '../../../api/controller';

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
  const config = useAppSelector((state) => state.config);
  const [dynamicBackgroundChk, setDynamicBackgroundChk] = useState(
    Boolean(settings.getSync('dynamicBackground'))
  );

  const [selectedTheme, setSelectedTheme] = useState(String(settings.getSync('theme')));
  const languagePickerContainerRef = useRef(null);
  const themePickerContainerRef = useRef(null);
  const fontPickerContainerRef = useRef(null);
  const titleBarPickerContainerRef = useRef(null);
  const startPagePickerContainerRef = useRef(null);
  const albumSortDefaultPickerContainerRef = useRef(null);
  const musicSortDefaultPickerContainerRef = useRef(null);
  const sidebarPickerContainerRef = useRef(null);
  const titleBarRestartWhisper = React.createRef<WhisperInstance>();
  const [themeList, setThemeList] = useState(
    _.concat(settings.getSync('themes'), settings.getSync('themesDefault'))
  );

  const { data: playlists }: any = useQuery(['playlists'], () =>
    apiController({ serverType: config.serverType, endpoint: 'getPlaylists' })
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
        description={t('The titlebar style (requires app restart).')}
        option={
          <StyledInputPickerContainer ref={titleBarPickerContainerRef}>
            <Whisper
              ref={titleBarRestartWhisper}
              trigger="none"
              placement="auto"
              speaker={
                <Popup title={t('Restart?')}>
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
                </Popup>
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

      <Divider />

      <ConfigOption
        name={t('Start page')}
        description={t('Page Sonixd will display on start.')}
        option={
          <StyledInputPickerContainer ref={startPagePickerContainerRef}>
            <StyledInputPicker
              container={() => startPagePickerContainerRef.current}
              data={_.concat(
                [
                  {
                    label: t('Now Playing'),
                    value: '/nowplaying',
                    role: 'Default',
                  },
                  {
                    label: t('Dashboard'),
                    value: '/',
                    role: 'Default',
                  },
                  {
                    label: t('Playlists'),
                    value: '/playlist',
                    role: 'Default',
                  },
                  {
                    label: t('Favorites'),
                    value: '/starred',
                    role: 'Default',
                  },
                  {
                    label: t('Albums'),
                    value: '/library/album',
                    role: 'Default',
                  },
                  {
                    label: t('Artists'),
                    value: '/library/artist',
                    role: 'Default',
                  },
                  {
                    label: t('Genres'),
                    value: '/library/genre',
                    role: 'Default',
                  },
                  {
                    label: t('Folders'),
                    value: '/library/folder',
                    role: 'Default',
                  },
                ],
                playlists?.map((pl: Playlist) => {
                  return { label: pl.title, value: `/playlist/${pl.id}`, role: t('Playlists') };
                })
              )}
              cleanable={false}
              groupBy="role"
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

      <ConfigOption
        name={t('Default Album Sort')}
        description={t('The default album page sort selection on application startup.')}
        option={
          <StyledInputPickerContainer ref={albumSortDefaultPickerContainerRef}>
            <StyledInputPicker
              container={() => albumSortDefaultPickerContainerRef.current}
              data={ALBUM_SORT_TYPES}
              disabledItemValues={
                config.serverType === Server.Jellyfin ? ['frequent', 'recent'] : []
              }
              cleanable={false}
              defaultValue={String(settings.getSync('albumSortDefault'))}
              width={200}
              onChange={(e: string) => {
                settings.setSync('albumSortDefault', e);
              }}
            />
          </StyledInputPickerContainer>
        }
      />
      {config.serverType === Server.Jellyfin && (
        <ConfigOption
          name={t('Default Song Sort')}
          description={t('The default song page sort selection on application startup.')}
          option={
            <StyledInputPickerContainer ref={musicSortDefaultPickerContainerRef}>
              <StyledInputPicker
                container={() => musicSortDefaultPickerContainerRef.current}
                data={MUSIC_SORT_TYPES}
                cleanable={false}
                defaultValue={String(settings.getSync('musicSortDefault'))}
                width={200}
                onChange={(e: string) => {
                  settings.setSync('musicSortDefault', e);
                }}
              />
            </StyledInputPickerContainer>
          }
        />
      )}
      <ConfigOption
        name={t('Default to Album List on Artist Page')}
        description={t(
          'Enabling this will open the Artist page to their list of albums instead of the main page.'
        )}
        option={
          <StyledToggle
            defaultChecked={Boolean(settings.getSync('artistPageLegacy'))}
            onChange={(e: boolean) => {
              settings.setSync('artistPageLegacy', e);
            }}
          />
        }
      />
      <ConfigOption
        name={t('Sidebar')}
        option={
          <StyledInputPickerContainer ref={sidebarPickerContainerRef}>
            <StyledCheckPicker
              container={() => sidebarPickerContainerRef.current}
              data={[
                {
                  label: i18n.t('Dashboard'),
                  value: 'dashboard',
                },
                {
                  label: i18n.t('Now Playing'),
                  value: 'nowplaying',
                },
                {
                  label: i18n.t('Playlists'),
                  value: 'playlists',
                },
                {
                  label: i18n.t('Favorites'),
                  value: 'favorites',
                },
                {
                  label: i18n.t('Songs'),
                  value: 'songs',
                },
                {
                  label: i18n.t('Albums'),
                  value: 'albums',
                },
                {
                  label: i18n.t('Artists'),
                  value: 'artists',
                },
                {
                  label: i18n.t('Genres'),
                  value: 'genres',
                },
                {
                  label: i18n.t('Folders'),
                  value: 'folders',
                },
                {
                  label: i18n.t('Config'),
                  value: 'config',
                },
                {
                  label: i18n.t('Collapse'),
                  value: 'collapse',
                },
                {
                  label: i18n.t('Playlist List'),
                  value: 'playlistList',
                },
              ]}
              searchable={false}
              cleanable={false}
              defaultValue={config.lookAndFeel.sidebar.selected}
              width={250}
              disabledItemValues={config.serverType === Server.Subsonic ? ['songs'] : []}
              onChange={(e: string) => {
                settings.setSync('sidebar.selected', e);
                dispatch(setSidebar({ selected: e }));
              }}
            />
          </StyledInputPickerContainer>
        }
      />
    </ConfigPanel>
  );
};

export const PaginationConfigPanel = ({ bordered }: any) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const view = useAppSelector((state) => state.view);
  const config = useAppSelector((state) => state.config);

  return (
    <ConfigPanel header={t('Pagination')} bordered={bordered}>
      <ConfigOptionDescription>
        {t(
          'The number of items that will be retrieved per page. Setting this to 0 will disable pagination.'
        )}
      </ConfigOptionDescription>
      {config.serverType === Server.Jellyfin && (
        <ConfigOption
          name={t('Items per page (Songs)')}
          option={
            <>
              <StyledInputNumber
                defaultValue={view.music.pagination.recordsPerPage}
                step={1}
                min={0}
                width={125}
                onChange={(e: number) => {
                  dispatch(
                    setPagination({
                      listType: Item.Music,
                      data: { activePage: 1, recordsPerPage: Number(e) },
                    })
                  );
                  settings.setSync('pagination.music.recordsPerPage', Number(e));
                }}
              />
              {config.serverType === Server.Jellyfin && (
                <StyledCheckbox
                  defaultChecked={settings.getSync('pagination.music.serverSide')}
                  checked={view.music.pagination.serverSide}
                  onChange={(_v: any, e: boolean) => {
                    settings.setSync('pagination.music.serverSide', e);
                    dispatch(setPagination({ listType: Item.Music, data: { serverSide: e } }));
                  }}
                >
                  {t('Server-side')}
                </StyledCheckbox>
              )}
            </>
          }
        />
      )}

      <ConfigOption
        name={t('Items per page (Albums)')}
        option={
          <>
            <StyledInputNumber
              defaultValue={view.album.pagination.recordsPerPage}
              step={1}
              min={0}
              width={125}
              onChange={(e: number) => {
                dispatch(
                  setPagination({
                    listType: Item.Album,
                    data: { activePage: 1, recordsPerPage: Number(e) },
                  })
                );
                settings.setSync('pagination.album.recordsPerPage', Number(e));
              }}
            />
            {config.serverType === Server.Jellyfin && (
              <StyledCheckbox
                defaultChecked={settings.getSync('pagination.album.serverSide')}
                checked={view.album.pagination.serverSide}
                onChange={(_v: any, e: boolean) => {
                  settings.setSync('pagination.album.serverSide', e);
                  dispatch(setPagination({ listType: Item.Album, data: { serverSide: e } }));
                }}
              >
                {t('Server-side')}
              </StyledCheckbox>
            )}
          </>
        }
      />
    </ConfigPanel>
  );
};

const LookAndFeelConfig = ({ bordered }: any) => {
  return (
    <>
      <ThemeConfigPanel bordered={bordered} />
      <ListViewConfigPanel bordered={bordered} />
      <GridViewConfigPanel bordered={bordered} />
      <PaginationConfigPanel bordered={bordered} />
    </>
  );
};

export default LookAndFeelConfig;
