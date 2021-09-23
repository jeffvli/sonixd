import React from 'react';
import styled from 'styled-components';
import { FlexboxGrid, Tag, ButtonToolbar } from 'rsuite';
import { useAppSelector } from '../../redux/hooks';

import {
  DeselectAllButton,
  MoveDownButton,
  MoveManualButton,
  MoveUpButton,
} from './SelectionButtons';

const StyledDiv = styled.div`
  background-color: #000000;
  padding: 5px;
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  width: 600px;
  box-shadow: 0 0 20px #000;
`;

const StyledTag = styled(Tag)`
  color: #cacbd0;
  background: transparent;
`;

const SelectionBar = ({ children, handleUpClick, handleDownClick, handleManualClick }: any) => {
  const multiSelect = useAppSelector((state) => state.multiSelect);

  return (
    <StyledDiv>
      <FlexboxGrid>
        <FlexboxGrid.Item colspan={8} style={{ textAlign: 'left' }}>
          <StyledTag>{multiSelect.selected.length} selected</StyledTag>
        </FlexboxGrid.Item>
        <FlexboxGrid.Item colspan={8} style={{ textAlign: 'center' }}>
          <ButtonToolbar>{children}</ButtonToolbar>
        </FlexboxGrid.Item>
        <FlexboxGrid.Item colspan={8} style={{ textAlign: 'right' }}>
          <ButtonToolbar>
            <MoveUpButton handleClick={handleUpClick} />
            <MoveDownButton handleClick={handleDownClick} />
            <MoveManualButton handleClick={handleManualClick} />
            <DeselectAllButton />
          </ButtonToolbar>
        </FlexboxGrid.Item>
      </FlexboxGrid>
    </StyledDiv>
  );
};

export default SelectionBar;
