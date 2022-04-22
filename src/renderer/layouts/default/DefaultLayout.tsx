import { Container, createStyles } from '@mantine/core';
import isElectron from 'is-electron';
import { Outlet } from 'react-router-dom';
import * as Space from 'react-spaces';
import PlayerBar from './playerbar/PlayerBar';
import Sidebar from './sidebar/Sidebar';
import WindowControls from './window-controls/WindowControls';

const useStyles = createStyles((theme) => ({
  wrapper: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.layout[0]
        : theme.colors.layout[0],
    height: '100%',
  },
  draggable: {
    display: 'flex',
    height: '50px',
    zIndex: 100,
    '-webkit-user-select': 'none',
    '-webkit-app-region': 'drag',
  },

  winWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    display: 'flex',
    height: '35px',
    width: '130px',
    zIndex: 200,
    '-webkit-app-region': 'no-drag',
  },
  winButton: {
    height: '100%',
    padding: '10px',
    flexGrow: 1,
    textAlign: 'center',
    userSelect: 'none',
    '-webkit-app-region': 'no-drag',

    '&:hover': {
      backgroundColor: 'rgba(150, 150, 150, .5)',
    },
  },
}));

const DefaultLayout = () => {
  const { classes } = useStyles();

  return (
    <>
      <Space.ViewPort>
        <Space.Fill>
          <Sidebar />
          <Space.Fill>
            <Container className={classes.wrapper} px="sm" fluid>
              {isElectron() && (
                <>
                  <div className={classes.draggable} />
                  <WindowControls />
                </>
              )}
              <Outlet />
            </Container>
          </Space.Fill>
        </Space.Fill>
        <PlayerBar />
      </Space.ViewPort>
    </>
  );
};

export default DefaultLayout;
