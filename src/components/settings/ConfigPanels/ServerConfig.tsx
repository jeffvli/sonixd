import React, { useRef } from 'react';
import settings from 'electron-settings';
import { useQuery } from 'react-query';
import { CheckboxGroup } from 'rsuite';
import { ConfigOptionDescription, ConfigOptionInput, ConfigPanel } from '../styled';
import { StyledCheckbox, StyledInputPicker, StyledInputPickerContainer } from '../../shared/styled';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setAppliedFolderViews, setMusicFolder } from '../../../redux/folderSlice';
import { apiController } from '../../../api/controller';
import { Folder } from '../../../types';
import PageLoader from '../../loader/PageLoader';
import ConfigOption from '../ConfigOption';

const ServerConfig = () => {
  const dispatch = useAppDispatch();
  const folder = useAppSelector((state) => state.folder);
  const config = useAppSelector((state) => state.config);
  const { isLoading, data: musicFolders } = useQuery(['musicFolders'], () =>
    apiController({ serverType: config.serverType, endpoint: 'getMusicFolders' })
  );
  const musicFolderPickerContainerRef = useRef(null);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <ConfigPanel header="Server">
      <ConfigOption
        name="Media Folder"
        description="Sets the parent media folder your audio files are located in. Leaving this blank will use all media folders."
        option={
          <StyledInputPickerContainer ref={musicFolderPickerContainerRef}>
            <StyledInputPicker
              container={() => musicFolderPickerContainerRef.current}
              data={musicFolders}
              defaultValue={folder.musicFolder}
              valueKey="id"
              labelKey="title"
              width={200}
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
        Select which pages to apply media folder filtering to:
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
            Albums
          </StyledCheckbox>
          <StyledCheckbox
            defaultChecked={folder.applied.artists}
            onChange={(_v: any, e: boolean) => {
              dispatch(setAppliedFolderViews({ ...folder.applied, artists: e }));
              settings.setSync('musicFolder.artists', e);
            }}
          >
            Artists
          </StyledCheckbox>
          <StyledCheckbox
            defaultChecked={folder.applied.dashboard}
            onChange={(_v: any, e: boolean) => {
              dispatch(setAppliedFolderViews({ ...folder.applied, dashboard: e }));
              settings.setSync('musicFolder.dashboard', e);
            }}
          >
            Dashboard
          </StyledCheckbox>
          <StyledCheckbox
            defaultChecked={folder.applied.starred}
            onChange={(_v: any, e: boolean) => {
              dispatch(setAppliedFolderViews({ ...folder.applied, starred: e }));
              settings.setSync('musicFolder.starred', e);
            }}
          >
            Favorites
          </StyledCheckbox>
          <StyledCheckbox
            defaultChecked={folder.applied.search}
            onChange={(_v: any, e: boolean) => {
              dispatch(setAppliedFolderViews({ ...folder.applied, search: e }));
              settings.setSync('musicFolder.search', e);
            }}
          >
            Search
          </StyledCheckbox>
        </CheckboxGroup>
      </ConfigOptionInput>
    </ConfigPanel>
  );
};

export default ServerConfig;
