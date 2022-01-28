import React, { useRef } from 'react';
import settings from 'electron-settings';
import { useQuery } from 'react-query';
import { CheckboxGroup } from 'rsuite';
import { useTranslation } from 'react-i18next';
import { ConfigOptionDescription, ConfigOptionInput, ConfigPanel } from '../styled';
import { StyledCheckbox, StyledInputPicker, StyledInputPickerContainer } from '../../shared/styled';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setAppliedFolderViews, setMusicFolder } from '../../../redux/folderSlice';
import { apiController } from '../../../api/controller';
import { Folder, Server } from '../../../types';
import ConfigOption from '../ConfigOption';
import CenterLoader from '../../loader/CenterLoader';

const ServerConfig = ({ bordered }: any) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const folder = useAppSelector((state) => state.folder);
  const config = useAppSelector((state) => state.config);
  const { isLoading, data: musicFolders } = useQuery(['musicFolders'], () =>
    apiController({ serverType: config.serverType, endpoint: 'getMusicFolders' })
  );
  const musicFolderPickerContainerRef = useRef(null);

  if (isLoading) {
    return <CenterLoader />;
  }

  return (
    <ConfigPanel bordered={bordered} header={t('Server')}>
      <ConfigOption
        name={t('Media Folder')}
        description={t(
          'Sets the parent media folder your audio files are located in. Leaving this blank will use all media folders.'
        )}
        option={
          <StyledInputPickerContainer ref={musicFolderPickerContainerRef}>
            <StyledInputPicker
              container={() => musicFolderPickerContainerRef.current}
              data={musicFolders}
              defaultValue={folder.musicFolder}
              valueKey="id"
              labelKey="title"
              width={200}
              placeholder={t('Select')}
              onChange={(e: string) => {
                const selectedFolder = musicFolders.find((f: Folder) => f.id === e);
                settings.setSync('musicFolder.id', e);
                settings.setSync('musicFolder.name', selectedFolder?.title);
                dispatch(setMusicFolder({ id: e, name: selectedFolder?.title }));
              }}
            />
          </StyledInputPickerContainer>
        }
      />

      <ConfigOptionDescription>
        {t('Select which pages to apply media folder filtering to:')}
      </ConfigOptionDescription>
      <ConfigOptionInput>
        <CheckboxGroup>
          <StyledCheckbox
            defaultChecked={folder.applied.albums}
            onChange={(_v: any, e: boolean) => {
              dispatch(setAppliedFolderViews({ ...folder.applied, albums: e }));
              settings.setSync('musicFolder.albums', e);
            }}
          >
            {t('Albums')}
          </StyledCheckbox>
          <StyledCheckbox
            defaultChecked={folder.applied.artists}
            onChange={(_v: any, e: boolean) => {
              dispatch(setAppliedFolderViews({ ...folder.applied, artists: e }));
              settings.setSync('musicFolder.artists', e);
            }}
          >
            {t('Artists')}
          </StyledCheckbox>
          <StyledCheckbox
            defaultChecked={folder.applied.dashboard}
            onChange={(_v: any, e: boolean) => {
              dispatch(setAppliedFolderViews({ ...folder.applied, dashboard: e }));
              settings.setSync('musicFolder.dashboard', e);
            }}
          >
            {t('Dashboard')}
          </StyledCheckbox>
          <StyledCheckbox
            defaultChecked={folder.applied.starred}
            onChange={(_v: any, e: boolean) => {
              dispatch(setAppliedFolderViews({ ...folder.applied, starred: e }));
              settings.setSync('musicFolder.starred', e);
            }}
          >
            {t('Favorites')}
          </StyledCheckbox>
          <StyledCheckbox
            defaultChecked={folder.applied.search}
            onChange={(_v: any, e: boolean) => {
              dispatch(setAppliedFolderViews({ ...folder.applied, search: e }));
              settings.setSync('musicFolder.search', e);
            }}
          >
            {t('Search')}
          </StyledCheckbox>
          {config.serverType === Server.Jellyfin && (
            <StyledCheckbox
              defaultChecked={folder.applied.music}
              onChange={(_v: any, e: boolean) => {
                dispatch(setAppliedFolderViews({ ...folder.applied, music: e }));
                settings.setSync('musicFolder.music', e);
              }}
            >
              {t('Songs')}
            </StyledCheckbox>
          )}
        </CheckboxGroup>
      </ConfigOptionInput>
    </ConfigPanel>
  );
};

export default ServerConfig;
