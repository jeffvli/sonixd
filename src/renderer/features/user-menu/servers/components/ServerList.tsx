import { Grid } from '@mantine/core';
import { Server } from 'server/types/types';
import styles from './ServerList.module.scss';

interface ServerListProps {
  servers: Server[] | undefined;
}

export const ServerList = ({ servers }: ServerListProps) => {
  return (
    <>
      {servers &&
        servers.map((server) => (
          <div className={styles.container}>
            <Grid align="center" px="sm">
              <Grid.Col span={9}>{server.name || server.url}</Grid.Col>
              <Grid.Col span={3} />
            </Grid>
          </div>
        ))}
    </>
  );
};
