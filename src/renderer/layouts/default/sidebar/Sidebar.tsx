import { Container, createStyles } from '@mantine/core';
import * as Space from 'react-spaces';

const useStyles = createStyles((theme) => ({
  wrapper: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.layout[1]
        : theme.colors.layout[1],
    width: '100%',
    height: '100%',
  },
}));

const Sidebar = () => {
  const { classes } = useStyles();

  return (
    <Space.Left resizable minimumSize={65} maximumSize={350} size={150}>
      <Container color="dark" className={classes.wrapper}>
        Sidebar
      </Container>
    </Space.Left>
  );
};

export default Sidebar;
