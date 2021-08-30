import React from 'react';
import { ButtonToolbar, ButtonGroup, IconButton, Icon } from 'rsuite';
import settings from 'electron-settings';

const ViewTypeButtons = ({
  handleListClick,
  handleGridClick,
  viewTypeSetting,
}: any) => {
  return (
    <ButtonToolbar>
      <ButtonGroup>
        <IconButton
          icon={<Icon icon="list" />}
          appearance="subtle"
          onClick={async () => {
            handleListClick();
            localStorage.setItem(`${viewTypeSetting}ViewType`, 'list');
            settings.setSync(`${viewTypeSetting}ViewType`, 'list');
          }}
        />
        <IconButton
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
