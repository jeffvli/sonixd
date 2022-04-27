import { Stack, Text } from '@mantine/core';
import clsx from 'clsx';
import { LazyLoadImage as Image } from 'react-lazy-load-image-component';
import { Link } from 'react-router-dom';

import { Song } from 'types';

import styles from './LeftControls.module.scss';

interface LeftControlsProps {
  song: Song;
}

const LeftControls = ({ song }: LeftControlsProps) => {
  const secondaryTextStyles = clsx(styles.text, styles.secondary);

  return (
    <div className={styles.wrapper}>
      <div className={styles.image}>
        <Image height={80} src={song?.image} width={80} />
      </div>
      <Stack className={styles.stack} spacing="xs">
        <div className={styles.text}>
          <Text<typeof Link> component={Link} to="/nowplaying">
            {song?.title || 'N/a'}
          </Text>
        </div>
        <div className={secondaryTextStyles}>
          <Text<typeof Link> component={Link} to="/nowplaying">
            {song?.artist?.map((artist) => artist?.title) || 'N/a'}
          </Text>
        </div>
        <div className={secondaryTextStyles}>
          <Text<typeof Link> component={Link} to="/nowplaying">
            {song?.album || 'N/a'}
          </Text>
        </div>
      </Stack>
    </div>
  );
};

export default LeftControls;
