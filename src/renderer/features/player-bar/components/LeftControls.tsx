import { Box, createStyles, Stack, Text } from '@mantine/core';
import { LazyLoadImage as Image } from 'react-lazy-load-image-component';
import { Link } from 'react-router-dom';

import { Song } from 'types';

const useStyles = createStyles(() => ({
  wrapper: {
    display: 'flex',
    height: '100%',
    width: '100%',
  },
  image: {
    minWidth: '100px',
    width: '100px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stack: {
    margin: '10px 0',
    width: '100%',
  },
  info: {
    height: '100%',
    width: 'calc(100% - 100px)',
    alignItems: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  grid: {
    margin: '0',
    height: '100%',
  },
}));

interface LeftControlsProps {
  song: Song;
}

const LeftControls = ({ song }: LeftControlsProps) => {
  const { classes } = useStyles();

  return (
    <Box className={classes.wrapper}>
      <Box className={classes.image}>
        <Image src={song?.image} height={80} width={80} />
      </Box>
      <Stack className={classes.stack} align="stretch" spacing="xs">
        <Box className={classes.info}>
          <Text<typeof Link> component={Link} to="/nowplaying">
            {song?.title || 'N/a'}
          </Text>
        </Box>
        <Box className={classes.info}>
          <Text<typeof Link> component={Link} to="/nowplaying">
            {song?.artist?.map((artist) => artist?.title) || 'N/a'}
          </Text>
        </Box>
        <Box className={classes.info}>
          <Text<typeof Link> component={Link} to="/nowplaying">
            {song?.album || 'N/a'}
          </Text>
        </Box>
      </Stack>
    </Box>
  );
};

export default LeftControls;
