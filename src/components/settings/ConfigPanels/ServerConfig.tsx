import React, { useRef } from 'react';
import settings from 'electron-settings';
import { useQuery } from 'react-query';
import { CheckboxGroup } from 'rsuite';
import { ConfigPanel } from '../styled';
import { StyledCheckbox, StyledInputPicker, StyledInputPickerContainer } from '../../shared/styled';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setAppliedFolderViews, setMusicFolder } from '../../../redux/folderSlice';
import { apiController } from '../../../api/controller';

const ServerConfig = () => {
  const dispatch = useAppDispatch();
  const folder = useAppSelector((state) => state.folder);
  const config = useAppSelector((state) => state.config);
  const { isLoading, data: musicFolders } = useQuery(['musicFolders'], () =>
    apiController({ serverType: config.serverType, endpoint: 'getMusicFolders' })
  );
  const musicFolderPickerContainerRef = useRef(null);

  return (
    <ConfigPanel header="Server" bordered>
      <p>
        Select a music folder (leaving this blank will use all folders). If no songs are found in
        the music folder, you may need to rescan your library. If you select a music folder and
        switch servers, you will need to reset this setting or else an incorrect music folder filter
        may be applied.
      </p>
      <br />
      <StyledInputPickerContainer ref={musicFolderPickerContainerRef}>
        <StyledInputPicker
          container={() => musicFolderPickerContainerRef.current}
          data={isLoading ? [] : musicFolders}
          defaultValue={folder.musicFolder}
          valueKey="id"
          labelKey="title"
          onChange={(e: any) => {
            settings.setSync('musicFolder.id', e);
            dispatch(setMusicFolder(e));
          }}
        />
      </StyledInputPickerContainer>

      <div>
        <br />
        <p>Select which pages to apply music folder filtering to:</p>
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
      </div>
    </ConfigPanel>
  );
};

export default ServerConfig;
