import { ReactNode } from 'react';
import { Group } from '@mantine/core';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import { ArrowNarrowLeft, ArrowNarrowRight } from 'tabler-icons-react';
import { IconButton } from 'renderer/components';

interface TitlebarProps {
  children?: ReactNode;
}

const TitlebarContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  width: 100%;
  height: 100%;
  -webkit-app-region: no-drag;
`;

const Left = styled.div`
  flex: auto;
`;

const Right = styled.div`
  flex: auto;
  -webkit-app-region: drag;
`;

export const Titlebar = ({ children }: TitlebarProps) => {
  const navigate = useNavigate();

  return (
    <>
      <TitlebarContainer>
        <Left>
          <Group spacing="xs">
            <IconButton
              icon={<ArrowNarrowLeft size={30} strokeWidth={1.5} />}
              radius="xl"
              size={40}
              variant="hover"
              onClick={() => navigate(-1)}
            />
            <IconButton
              icon={<ArrowNarrowRight size={30} strokeWidth={1.5} />}
              radius="xl"
              size={40}
              variant="hover"
              onClick={() => navigate(1)}
            />
          </Group>
        </Left>
        <Right>{children}</Right>
      </TitlebarContainer>
    </>
  );
};

Titlebar.defaultProps = {
  children: <></>,
};
