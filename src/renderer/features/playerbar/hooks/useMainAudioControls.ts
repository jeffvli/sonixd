import { Dispatch, useCallback, useEffect } from 'react';
import isElectron from 'is-electron';
import { playerApi, socket } from 'renderer/api/playerApi';
import { usePlayerStore } from 'renderer/store';
import { PlaybackType, PlayerStatus } from '../../../../types';

export const useMainAudioControls = (args: {
  currentTime: number;
  playersRef: any;
  setCurrentTime: Dispatch<number>;
  setDisableNext: Dispatch<boolean>;
  setDisablePrev: Dispatch<boolean>;
}) => {
  const {
    playersRef,
    currentTime,
    setDisableNext,
    setDisablePrev,
    setCurrentTime,
  } = args;

  const settings = usePlayerStore((state) => state.settings);
  const play = usePlayerStore((state) => state.play);
  const pause = usePlayerStore((state) => state.pause);
  const prev = usePlayerStore((state) => state.prev);
  const next = usePlayerStore((state) => state.next);
  const queue = usePlayerStore((state) => state.queue.default);
  const playerStatus = usePlayerStore((state) => state.current.status);
  const currentPlayer = usePlayerStore((state) => state.current.player);
  const setSettings = usePlayerStore((state) => state.setSettings);

  const player1Ref = playersRef?.current?.player1;
  const player2Ref = playersRef?.current?.player2;
  const currentPlayerRef = currentPlayer === 1 ? player1Ref : player2Ref;
  const nextPlayerRef = currentPlayer === 1 ? player2Ref : player1Ref;

  useEffect(() => {
    if (isElectron() && settings.type === PlaybackType.Local) {
      socket.on('queue_player1', () => {
        console.log('SET PLAYER 1');
        const playerData = next();
        socket.emit('queue_player1', playerData.queue.next?.streamUrl);
        setCurrentTime(0);
      });

      return () => {
        socket.off('queue_player1');
      };
    }

    return undefined;
  }, [next, setCurrentTime, settings]);

  useEffect(() => {
    if (isElectron() && settings.type === PlaybackType.Local) {
      socket.on('queue_player2', () => {
        console.log('SET PLAYER 2');
        const playerData = next();
        socket.emit('queue_player2', playerData.queue.next?.streamUrl);
        setCurrentTime(0);
      });

      return () => {
        socket.off('queue_player2');
      };
    }

    return undefined;
  }, [next, setCurrentTime, settings]);

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
    if (settings.type === PlaybackType.Local) {
      playerApi.play();
    } else {
      currentPlayerRef.getInternalPlayer().play();
    }

    play();
  }, [currentPlayerRef, play, settings]);

  const handlePause = useCallback(() => {
    if (settings.type === PlaybackType.Local) {
      playerApi.pause();
    }

    pause();
  }, [pause, settings]);

  const handleStop = useCallback(() => {
    if (settings.type === PlaybackType.Local) {
      playerApi.stop();
    } else {
      stopPlayback();
    }

    pause();
    setCurrentTime(0);
  }, [pause, setCurrentTime, settings, stopPlayback]);

  const handleNextTrack = useCallback(() => {
    const playerData = next();

    if (settings.type === PlaybackType.Local) {
      setDisableNext(true);
      playerApi.next(playerData.queue.current, playerData.queue.next);
      setCurrentTime(0);
      setTimeout(() => setDisableNext(false), 400);
    } else {
      resetPlayers();
    }
    // dispatch(next());
  }, [next, resetPlayers, setCurrentTime, setDisableNext, settings]);

  const handlePrevTrack = useCallback(() => {
    const playerData = prev();

    if (settings.type === PlaybackType.Local) {
      setDisablePrev(true);
      playerApi.previous(playerData.queue.current, playerData.queue.next);
      setCurrentTime(0);
      setTimeout(() => setDisablePrev(false), 400);
    } else {
      resetPlayers();
    }
  }, [prev, resetPlayers, setCurrentTime, setDisablePrev, settings]);

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

      if (settings.type === PlaybackType.Local) {
        playerApi.seek(e);
      } else {
        currentPlayerRef.seekTo(e);
      }
    },
    [currentPlayerRef, setCurrentTime, settings]
  );

  const handleVolumeSlider = useCallback(
    (e: number | any) => {
      // dispatch(setVolume(e));
      if (settings.type === PlaybackType.Local) {
        playerApi.volume(currentTime, e);
      }

      setSettings({ volume: (e / 100) ** 2 });
    },
    [currentTime, setSettings, settings]
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
    handlePlayPause,
    handlePrevTrack,
    handleSeekSlider,
    handleSkipBackward,
    handleSkipForward,
    handleStop,
    handleVolumeSlider,
  };
};
