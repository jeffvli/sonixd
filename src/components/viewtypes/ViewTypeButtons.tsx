import React from 'react';
import { ButtonToolbar, ButtonGroup, Icon } from 'rsuite';
import settings from 'electron-settings';
import { StyledIconButton } from '../shared/styled';

const ViewTypeButtons = ({ handleListClick, handleGridClick, viewTypeSetting }: any) => {
  return (
    <ButtonToolbar>
      <ButtonGroup>
        <StyledIconButton
          icon={<Icon icon="list" />}
          appearance="subtle"
          onClick={async () => {
            handleListClick();
            localStorage.setItem(`${viewTypeSetting}ViewType`, 'list');
            settings.setSync(`${viewTypeSetting}ViewType`, 'list');
          }}
        />
        <StyledIconButton
          icon={<Icon icon="th-large" />}
          appearance="subtle"
          onClick={async () => {
            handleGridClick();
            localStorage.setItem(`${viewTypeSetting}ViewType`, 'grid');
            settings.setSync(`${viewTypeSetting}ViewType`, 'grid');
          }}
        />
      </ButtonGroup>
    </ButtonToolbar>
  );
};

export default ViewTypeButtons;
