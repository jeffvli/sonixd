import React from 'react';
import { ButtonGroup, Icon } from 'rsuite';
import settings from 'electron-settings';
import { StyledButton } from '../shared/styled';

const ViewTypeButtons = ({ handleListClick, handleGridClick, viewTypeSetting }: any) => {
  return (
    <ButtonGroup>
      <StyledButton
        size="sm"
        appearance="subtle"
        onClick={async () => {
          handleListClick();
          localStorage.setItem(`${viewTypeSetting}ViewType`, 'list');
          settings.setSync(`${viewTypeSetting}ViewType`, 'list');
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
          settings.setSync(`${viewTypeSetting}ViewType`, 'grid');
        }}
      >
        <Icon icon="th-large" />
      </StyledButton>
    </ButtonGroup>
  );
};

export default ViewTypeButtons;
