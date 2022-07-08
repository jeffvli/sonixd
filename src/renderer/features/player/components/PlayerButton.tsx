import { ReactNode } from 'react';
import { UnstyledButton, UnstyledButtonProps } from '@mantine/core';
import { motion } from 'framer-motion';
import styled from 'styled-components';

interface PlayerButtonProps extends UnstyledButtonProps<'button'> {
  children: ReactNode;
}

const StyledPlayerButton = styled(motion.div)`
  display: flex;
  align-items: center;
  overflow: visible;

  svg {
    fill: white;
  }
`;

export const PlayerButton = ({ children, ...rest }: PlayerButtonProps) => {
  return (
    <UnstyledButton {...rest}>
      <StyledPlayerButton whileTap={{ scale: 0.9 }}>
        {children}
      </StyledPlayerButton>
    </UnstyledButton>
  );
};
