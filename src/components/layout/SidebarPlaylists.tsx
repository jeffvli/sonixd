import React from 'react';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { AutoSizer } from 'react-virtualized';
import { FixedSizeList as List } from 'react-window';
import styled from 'styled-components';
import { apiController } from '../../api/controller';
import { useAppSelector } from '../../redux/hooks';
import CenterLoader from '../loader/CenterLoader';
import { StyledButton } from '../shared/styled';

const ListItemContainer = styled.div`
  .rs-btn {
    padding-left: 20px;
    padding-right: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    text-align: left;
    color: ${(props) => props.theme.colors.layout.sideBar.button.color} !important;

    &:hover {
      color: ${(props) => props.theme.colors.layout.sideBar.button.colorHover} !important;
    }

    &:focus-visible {
      color: ${(props) => props.theme.colors.layout.sideBar.button.colorHover} !important;
    }
  }
`;

const PlaylistRow = ({ data, index, style }: any) => {
  const history = useHistory();

  return (
    <ListItemContainer style={style}>
      <StyledButton
        block
        appearance="subtle"
        onClick={() => history.push(`/playlist/${data[index].id}`)}
      >
        {data[index].title}
      </StyledButton>
    </ListItemContainer>
  );
};

const SidebarPlaylists = ({ width }: any) => {
  const config = useAppSelector((state) => state.config);

  const { isLoading, data: playlists }: any = useQuery(['playlists'], () =>
    apiController({ serverType: config.serverType, endpoint: 'getPlaylists' })
  );

  return (
    <AutoSizer>
      {({ height }: any) => (
        <>
          {isLoading ? (
            <CenterLoader absolute />
          ) : (
            <List
              height={height - 25}
              itemCount={playlists?.length}
              itemSize={25}
              width={width}
              itemData={playlists}
            >
              {PlaylistRow}
            </List>
          )}
        </>
      )}
    </AutoSizer>
  );
};

export default SidebarPlaylists;
