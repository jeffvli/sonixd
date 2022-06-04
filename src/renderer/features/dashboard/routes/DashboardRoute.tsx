import { Button } from '@mantine/core';
// import io from 'socket.io-client';
import { playerApi } from 'renderer/api/playerApi';
// import { useAppDispatch } from 'renderer/hooks';
// import { queue } from 'renderer/store/playerSlice';
// import { Play } from 'types';

// const socket = io('http://localhost:5000');
export const DashboardRoute = () => {
  // const dispatch = useAppDispatch();
  // socket.on('play', (data) => {
  //   console.log(data);
  // });

  // const { data } = useAlbum(100);

  // useEffect(() => {
  //   if (data) {
  //     console.log('data', data);
  //     dispatch(queue({ data: data.data.songs, type: Play.Now }));
  //   }
  // }, [data, dispatch]);

  return (
    <>
      <Button onClick={() => playerApi.play()}>Play</Button>
      <Button onClick={() => playerApi.pause()}>Stop</Button>
      <Button onClick={() => playerApi.info()}>Info</Button>
      {/* <Button onClick={() => socket.emit('message', 'message')}>emit</Button> */}
    </>
  );
};
