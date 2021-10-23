import React from 'react';
import settings from 'electron-settings';
import { useQuery } from 'react-query';
import { ConfigPanel } from '../styled';
import { StyledInputPicker } from '../../shared/styled';
import { useAppDispatch } from '../../../redux/hooks';
import { getMusicFolders } from '../../../api/api';
import { setMusicFolder } from '../../../redux/folderSlice';

const ServerConfig = () => {
  const dispatch = useAppDispatch();
  const { isLoading, data: musicFolders } = useQuery(['musicFolders'], getMusicFolders);

  return (
    <ConfigPanel header="Server" bordered>
      <p>Select your music folder</p>
      <br />

      <StyledInputPicker
        data={!isLoading && musicFolders}
        defaultValue={settings.getSync('musicFolder') || 0}
        valueKey="id"
        labelKey="name"
        cleanable={false}
        onChange={(e: any) => {
          settings.setSync('musicFolder', e);
          dispatch(setMusicFolder(e));
        }}
      />
    </ConfigPanel>
  );
};

export default ServerConfig;
