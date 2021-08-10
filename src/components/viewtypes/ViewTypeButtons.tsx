import React from 'react';
import { ButtonToolbar, ButtonGroup, IconButton, Icon } from 'rsuite';
import settings from 'electron-settings';

const ViewTypeButtons = ({ handleListClick, handleGridClick }: any) => {
  return (
    <ButtonToolbar>
      <ButtonGroup>
        <IconButton
          icon={<Icon icon="list" />}
          appearance="subtle"
          onClick={async () => {
            handleListClick();
            localStorage.setItem('viewType', 'list');
            settings.setSync('viewType', 'list');
          }}
        />
        <IconButton
          icon={<Icon icon="th-large" />}
          appearance="subtle"
          onClick={async () => {
            handleGridClick();
            localStorage.setItem('viewType', 'grid');
            settings.setSync('viewType', 'grid');
          }}
        />
      </ButtonGroup>
    </ButtonToolbar>
  );
};

export default ViewTypeButtons;
