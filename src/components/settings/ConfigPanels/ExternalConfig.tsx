import React from 'react';
import settings from 'electron-settings';
import { Icon, RadioGroup } from 'rsuite';
import { ConfigOptionDescription, ConfigPanel } from '../styled';
import {
  StyledInput,
  StyledInputGroup,
  StyledInputGroupButton,
  StyledInputNumber,
  StyledRadio,
  StyledToggle,
} from '../../shared/styled';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setOBS } from '../../../redux/configSlice';
import ConfigOption from '../ConfigOption';

const dialog: any = process.env.NODE_ENV === 'test' ? '' : require('electron').remote.dialog;

const ExternalConfig = () => {
  const dispatch = useAppDispatch();
  const config = useAppSelector((state) => state.config);

  return (
    <ConfigPanel header="External">
      <ConfigOptionDescription>
        Config for integration with external programs.
      </ConfigOptionDescription>
      <ConfigPanel header="OBS (Open Broadcaster Software)" collapsible $noBackground>
        <ConfigOption
          name={
            <>
              Scrobbling
              <RadioGroup
                inline
                defaultValue={config.external.obs.type}
                value={config.external.obs.type}
                onChange={(e: string) => {
                  settings.setSync('obs.type', e);
                  dispatch(setOBS({ ...config.external.obs, type: e }));
                }}
              >
                <StyledRadio value="local">Local</StyledRadio>
                <StyledRadio value="web">Web</StyledRadio>
              </RadioGroup>
            </>
          }
          description="If local, scrobbles the currently playing song to local .txt files. If web, scrobbles the currently playing song to Tuna plugin's webserver."
          option={
            <>
              <StyledToggle
                defaultChecked={config.external.obs.enabled}
                checked={config.external.obs.enabled}
                onChange={(e: boolean) => {
                  settings.setSync('obs.enabled', e);
                  dispatch(setOBS({ ...config.external.obs, enabled: e }));
                }}
              />
            </>
          }
        />
        <ConfigOption
          name="Polling Interval"
          description="The number in milliseconds (ms) between each poll when metadata is sent."
          option={
            <StyledInputNumber
              defaultValue={config.external.obs.pollingInterval}
              value={config.external.obs.pollingInterval}
              step={1}
              min={100}
              max={25000}
              width={125}
              onChange={(e: number) => {
                settings.setSync('obs.pollingInterval', e);
                dispatch(setOBS({ ...config.external.obs, pollingInterval: e }));
              }}
            />
          }
        />

        {config.external.obs.type === 'web' ? (
          <ConfigOption
            name="Tuna Webserver Url"
            description="The full URL to the Tuna webserver."
            option={
              <StyledInput
                width={200}
                placeholder="http://localhost:1608"
                value={config.external.obs.url}
                onChange={(e: string) => {
                  settings.setSync('obs.url', e);
                  dispatch(setOBS({ ...config.external.obs, url: e }));
                }}
              />
            }
          />
        ) : (
          <ConfigOption
            name="File Path"
            description="The full path to the directory where song metadata will be created."
            option={
              <StyledInputGroup>
                <StyledInput disabled width={200} value={config.external.obs.path} />
                <StyledInputGroupButton
                  onClick={() => {
                    const path = dialog.showOpenDialogSync({
                      properties: ['openFile', 'openDirectory'],
                    });

                    if (path) {
                      settings.setSync('obs.path', path[0]);
                      dispatch(setOBS({ ...config.external.obs, path: path[0] }));
                    }
                  }}
                >
                  <Icon icon="folder-open" />
                </StyledInputGroupButton>
              </StyledInputGroup>
            }
          />
        )}
      </ConfigPanel>
    </ConfigPanel>
  );
};

export default ExternalConfig;
