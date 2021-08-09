import React from 'react';
import { ButtonToolbar, ButtonGroup, IconButton, Icon } from 'rsuite';

const ViewTypeButtons = ({ handleListClick, handleGridClick }: any) => {
  return (
    <ButtonToolbar>
      <ButtonGroup>
        <IconButton
          icon={<Icon icon="list" />}
          appearance="subtle"
          onClick={() => {
            handleListClick();
            localStorage.setItem('viewType', 'list');
          }}
        />
        <IconButton
          icon={<Icon icon="th-large" />}
          appearance="subtle"
          onClick={() => {
            handleGridClick();
            localStorage.setItem('viewType', 'grid');
          }}
        />
      </ButtonGroup>
    </ButtonToolbar>
  );
};

export default ViewTypeButtons;
