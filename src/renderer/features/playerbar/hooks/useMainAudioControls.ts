import { Dispatch, useCallback } from 'react';

import { useAppDispatch } from 'renderer/hooks/redux';
import { next, pause, play, prev } from 'renderer/store/playerSlice';

import { PlayerStatus, Song } from '../../../../types';

const useMainAudioControls = (args: {
  playersRef: any;
  playerStatus: PlayerStatus;
  queue: Song[];
  currentPlayer: 1 | 2;
  setCurrentTime: Dispatch<number>;
}) => {
  const { playersRef, playerStatus, queue, currentPlayer, setCurrentTime } =
    args;

  const dispatch = useAppDispatch();
  const player1Ref = playersRef?.current?.player1;
  const player2Ref = playersRef?.current?.player2;
  const currentPlayerRef = currentPlayer === 1 ? player1Ref : player2Ref;
  const nextPlayerRef = currentPlayer === 1 ? player2Ref : player1Ref;

  const resetPlayers = useCallback(() => {
    player1Ref.getInternalPlayer().currentTime = 0;
    player2Ref.getInternalPlayer().currentTime = 0;
    player1Ref.getInternalPlayer().pause();
    player2Ref.getInternalPlayer().pause();
  }, [player1Ref, player2Ref]);

  const resetNextPlayer = useCallback(() => {
    currentPlayerRef.getInternalPlayer().volume = 0.1;
    nextPlayerRef.getInternalPlayer().currentTime = 0;
    nextPlayerRef.getInternalPlayer().pause();
  }, [currentPlayerRef, nextPlayerRef]);

  const stopPlayback = useCallback(() => {
    player1Ref.getInternalPlayer().pause();
    player2Ref.getInternalPlayer().pause();
    resetPlayers();
  }, [player1Ref, player2Ref, resetPlayers]);

  const handlePlay = useCallback(() => {
    dispatch(play());
  }, [dispatch]);

  const handlePause = useCallback(() => {
    dispatch(pause());
  }, [dispatch]);

  const handleStop = useCallback(() => {
    dispatch(pause());
    stopPlayback();
    setCurrentTime(0);
  }, [dispatch, setCurrentTime, stopPlayback]);

  const handleNextTrack = useCallback(() => {
    resetPlayers();
    dispatch(next());
  }, [dispatch, resetPlayers]);

  const handlePrevTrack = useCallback(() => {
    resetPlayers();
    dispatch(prev());
  }, [dispatch, resetPlayers]);

  const handlePlayPause = useCallback(() => {
    if (queue) {
      if (playerStatus === PlayerStatus.Paused) {
        return handlePlay();
      }

      return handlePause();
    }

    return null;
  }, [handlePause, handlePlay, playerStatus, queue]);

  const handleSkipBackward = useCallback(() => {
    const skipBackwardSec = 5;
    const newTime = currentPlayerRef.getCurrentTime() - skipBackwardSec;

    resetNextPlayer();
    setCurrentTime(newTime);
    currentPlayerRef.seekTo(newTime);
  }, [currentPlayerRef, resetNextPlayer, setCurrentTime]);

  const handleSkipForward = useCallback(() => {
    const skipForwardSec = 5;
    const checkNewTime = currentPlayerRef.getCurrentTime() + skipForwardSec;

    const songDuration = currentPlayerRef.player.player.duration;

    const newTime =
      checkNewTime >= songDuration ? songDuration - 1 : checkNewTime;

    resetNextPlayer();
    setCurrentTime(newTime);
    currentPlayerRef.seekTo(newTime);
  }, [currentPlayerRef, resetNextPlayer, setCurrentTime]);

  const handleSeekSlider = useCallback(
    (e: number | any) => {
      setCurrentTime(e);
      currentPlayerRef.seekTo(e);
    },
    [currentPlayerRef, setCurrentTime]
  );

  // useEffect(() => {
  //   ipcRenderer.on('player-next-track', () => {
  //     handleNextTrack();
  //   });

  //   ipcRenderer.on('player-prev-track', () => {
  //     handlePrevTrack();
  //   });

  //   ipcRenderer.on('player-play-pause', () => {
  //     handlePlayPause();
  //   });

  //   ipcRenderer.on('player-play', () => {
  //     handlePlay();
  //   });

  //   ipcRenderer.on('player-pause', () => {
  //     handlePause();
  //   });

  //   ipcRenderer.on('player-stop', () => {
  //     handleStop();
  //   });

  //   ipcRenderer.on('player-shuffle', () => {
  //     handleShuffle();
  //   });

  //   ipcRenderer.on('player-repeat', () => {
  //     handleRepeat();
  //   });

  //   ipcRenderer.on('save-queue-state', (_event, path: string) => {
  //     handleSaveQueue(path);
  //   });

  //   ipcRenderer.on('restore-queue-state', (_event, path: string) => {
  //     handleRestoreQueue(path);
  //   });

  //   return () => {
  //     ipcRenderer.removeAllListeners('player-next-track');
  //     ipcRenderer.removeAllListeners('player-prev-track');
  //     ipcRenderer.removeAllListeners('player-play-pause');
  //     ipcRenderer.removeAllListeners('player-play');
  //     ipcRenderer.removeAllListeners('player-pause');
  //     ipcRenderer.removeAllListeners('player-stop');
  //     ipcRenderer.removeAllListeners('player-shuffle');
  //     ipcRenderer.removeAllListeners('player-repeat');
  //     ipcRenderer.removeAllListeners('save-queue-state');
  //     ipcRenderer.removeAllListeners('restore-queue-state');
  //   };
  // }, [
  //   handleNextTrack,
  //   handlePause,
  //   handlePlay,
  //   handlePlayPause,
  //   handlePrevTrack,
  //   handleRepeat,
  //   handleShuffle,
  //   handleStop,
  //   handleSaveQueue,
  //   handleRestoreQueue,
  // ]);

  // useEffect(() => {
  //   ipcRenderer.on('current-position-request', (_event, arg) => {
  //     if (arg.currentPlayer === 1) {
  //       ipcRenderer.send(
  //         'seeked',
  //         Math.floor(
  //           playersRef.current.player1.audioEl.current.currentTime * 1000000
  //         )
  //       );
  //     } else {
  //       ipcRenderer.send(
  //         'seeked',
  //         Math.floor(
  //           playersRef.current.player2.audioEl.current.currentTime * 1000000
  //         )
  //       );
  //     }
  //   });

  //   ipcRenderer.on('position-request', (_event, arg) => {
  //     const newPosition = Math.floor(arg.position / 1000000);

  //     if (arg.currentPlayer === 1) {
  //       playersRef.current.player1.audioEl.current.currentTime = newPosition;
  //     } else {
  //       playersRef.current.player2.audioEl.current.currentTime = newPosition;
  //     }

  //     ipcRenderer.send('seeked', arg.position);
  //   });

  //   ipcRenderer.on('seek-request', (_event, arg) => {
  //     let newPosition;
  //     if (arg.currentPlayer === 1) {
  //       newPosition =
  //         playersRef.current.player1.audioEl.current.currentTime +
  //         arg.offset / 1000000;
  //       setCurrentTime(newPosition);
  //       ipcRenderer.send('seeked', newPosition * 1000000);
  //     } else {
  //       newPosition =
  //         playersRef.current.player2.audioEl.current.currentTime +
  //         arg.offset / 1000000;
  //       setCurrentTime(newPosition);
  //       ipcRenderer.send('seeked', newPosition * 1000000);
  //     }
  //   });

  //   return () => {
  //     ipcRenderer.removeAllListeners('current-position-request');
  //     ipcRenderer.removeAllListeners('position-request');
  //     ipcRenderer.removeAllListeners('seek-request');
  //   };
  // }, [playersRef, setCurrentTime]);

  return {
    handleNextTrack,
    handlePrevTrack,
    handlePlayPause,
    handleSkipForward,
    handleSkipBackward,
    handleSeekSlider,
    handleStop,
  };
};

export default useMainAudioControls;
