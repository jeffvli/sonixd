import React from 'react';
import { useAppSelector } from '../../redux/hooks';
import { StyledPopover } from './styled';

const Popup = ({ children, ...rest }: any) => {
  const config = useAppSelector((state) => state.config);

  return (
    <StyledPopover font={config.lookAndFeel.font} {...rest}>
      {children}
    </StyledPopover>
  );
};

export default Popup;
