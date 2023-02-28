import React from 'react';
import { ButtonGroup, Icon } from 'rsuite';
import { StyledButton } from '../shared/styled';
import { settings } from '../shared/setDefaultSettings';

const ViewTypeButtons = ({ handleListClick, handleGridClick, viewTypeSetting }: any) => {
  return (
    <ButtonGroup>
      <StyledButton
        size="sm"
        appearance="subtle"
        onClick={async () => {
          handleListClick();
          localStorage.setItem(`${viewTypeSetting}ViewType`, 'list');
          settings.set(`${viewTypeSetting}ViewType`, 'list');
        }}
      >
        <Icon icon="list" />
      </StyledButton>
      <StyledButton
        size="sm"
        appearance="subtle"
        onClick={async () => {
          handleGridClick();
          localStorage.setItem(`${viewTypeSetting}ViewType`, 'grid');
          settings.set(`${viewTypeSetting}ViewType`, 'grid');
        }}
      >
        <Icon icon="th-large" />
      </StyledButton>
    </ButtonGroup>
  );
};

export default ViewTypeButtons;
