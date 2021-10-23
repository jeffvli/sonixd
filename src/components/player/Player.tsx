import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
} from 'react';
import { ipcRenderer } from 'electron';
import settings from 'electron-settings';
import ReactAudioPlayer from 'react-audio-player';
import { Helmet } from 'react-helmet-async';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  incrementCurrentIndex,
  incrementPlayerIndex,
  setCurrentPlayer,
  setPlayerVolume,
  setIsFading,
  setAutoIncremented,
  fixPlayer2Index,
  setCurrentIndex,
  setFadeData,
  setPlayerSrc,
} from '../../redux/playQueueSlice';
import { setCurrentSeek } from '../../redux/playerSlice';
import cacheSong from '../shared/cacheSong';
import { isCached } from '../../shared/utils';
import { scrobble } from '../../api/api';

const gaplessListenHandler = (
  currentPlayerRef: any,
  nextPlayerRef: any,
  playQueue: any,
  currentPlayer: number,
  dispatch: any,
  pollingInterval: number,
  shouldScrobble: boolean,
  scrobbled: boolean,
  setScrobbled: any
) => {
  const currentSeek = currentPlayerRef.current?.audioEl.current?.currentTime || 0;
  const duration = currentPlayerRef.current?.audioEl.current?.duration;

  if (playQueue.currentPlayer === currentPlayer) {
    dispatch(
      setCurrentSeek({
        seek: currentSeek,
      })
    );
  }

  // Add a bit of leeway for the second track to start since the
  // seek value doesn't always reach the duration
  const durationPadding = pollingInterval <= 10 ? 0.12 : pollingInterval <= 20 ? 0.13 : 0.15;
  if (currentSeek + durationPadding >= duration) {
    nextPlayerRef.current.audioEl.current.play();
  }

  // Conditions for scrobbling gapless track
  // 1. Scrobble enabled in settings
  // 2. Not already scrobbled
  // 3. Track reached past 4 minutes or past the 90% mark
  // 4. Not in the last 2 seconds of the track (gapless player starts second track before first ends)
  // Step 4 sets the scrobbled value to false again which would trigger a second scrobble
  if (
    shouldScrobble &&
    !scrobbled &&
    (currentSeek >= 240 || currentSeek >= duration * 0.9) &&
    currentSeek <= duration - 2
  ) {
    setScrobbled(true);
    scrobble({ id: playQueue.currentSongId, submission: true });
  }
};

const listenHandler = (
  currentPlayerRef: any,
  nextPlayerRef: any,
  playQueue: any,
  currentEntryList: any,
  dispatch: any,
  player: number,
  fadeDuration: number,
  fadeType: string,
  volumeFade: boolean,
  debug: boolean,
  shouldScrobble: boolean,
  scrobbled: boolean,
  setScrobbled: any
) => {
  const currentSeek = currentPlayerRef.current?.audioEl.current?.currentTime || 0;
  const duration = currentPlayerRef.current?.audioEl.current?.duration;
  const fadeAtTime = duration - fadeDuration;

  // Fade only if repeat is 'all' or if not on the last track
  if (
    playQueue[`player${player}`].index + 1 < playQueue[currentEntryList].length ||
    playQueue.repeat === 'all'
  ) {
    // Detect to start fading when seek is greater than the fade time
    if (currentSeek >= fadeAtTime) {
      if (volumeFade) {
        nextPlayerRef.current.audioEl.current.play();
        dispatch(setIsFading(true));

        const timeLeft = duration - currentSeek;
        let currentPlayerVolumeCalculation;
        let nextPlayerVolumeCalculation;
        let percentageOfFadeLeft;
        let n;
        switch (fadeType) {
          case 'equalPower':
            // https://dsp.stackexchange.com/a/14755
            percentageOfFadeLeft = (timeLeft / fadeDuration) * 2;
            currentPlayerVolumeCalculation =
              Math.sqrt(0.5 * percentageOfFadeLeft) * playQueue.volume;
            nextPlayerVolumeCalculation =
              Math.sqrt(0.5 * (2 - percentageOfFadeLeft)) * playQueue.volume;
            break;
          case 'linear':
            currentPlayerVolumeCalculation = (timeLeft / fadeDuration) * playQueue.volume;
            nextPlayerVolumeCalculation =
              ((fadeDuration - timeLeft) / fadeDuration) * playQueue.volume;
            break;
          case 'dipped':
            // https://math.stackexchange.com/a/4622
            percentageOfFadeLeft = timeLeft / fadeDuration;
            currentPlayerVolumeCalculation = percentageOfFadeLeft ** 2 * playQueue.volume;
            nextPlayerVolumeCalculation = (percentageOfFadeLeft - 1) ** 2 * playQueue.volume;
            break;
          case fadeType.match(/constantPower.*/)?.input:
            // https://math.stackexchange.com/a/26159
            n =
              fadeType === 'constantPower'
                ? 0
                : fadeType === 'constantPowerSlowFade'
                ? 1
                : fadeType === 'constantPowerSlowCut'
                ? 3
                : 10;

            percentageOfFadeLeft = timeLeft / fadeDuration;
            currentPlayerVolumeCalculation =
              Math.cos((Math.PI / 4) * ((2 * percentageOfFadeLeft - 1) ** (2 * n + 1) - 1)) *
              playQueue.volume;
            nextPlayerVolumeCalculation =
              Math.cos((Math.PI / 4) * ((2 * percentageOfFadeLeft - 1) ** (2 * n + 1) + 1)) *
              playQueue.volume;
            break;

          default:
            currentPlayerVolumeCalculation = (timeLeft / fadeDuration) * playQueue.volume;
            nextPlayerVolumeCalculation =
              ((fadeDuration - timeLeft) / fadeDuration) * playQueue.volume;
            break;
        }

        const currentPlayerVolume =
          currentPlayerVolumeCalculation >= 0 ? currentPlayerVolumeCalculation : 0;

        const nextPlayerVolume =
          nextPlayerVolumeCalculation <= playQueue.volume
            ? nextPlayerVolumeCalculation
            : playQueue.volume;

        if (player === 1) {
          dispatch(setPlayerVolume({ player: 1, volume: currentPlayerVolume }));
          dispatch(setPlayerVolume({ player: 2, volume: nextPlayerVolume }));
          if (debug) {
            dispatch(
              setFadeData({
                player: 1,
                time: timeLeft,
                volume: currentPlayerVolume,
              })
            );
            dispatch(
              setFadeData({
                player: 2,
                time: timeLeft,
                volume: nextPlayerVolume,
              })
            );
          }
        } else {
          dispatch(setPlayerVolume({ player: 2, volume: currentPlayerVolume }));
          dispatch(setPlayerVolume({ player: 1, volume: nextPlayerVolume }));
          if (debug) {
            dispatch(
              setFadeData({
                player: 2,
                time: timeLeft,
                volume: currentPlayerVolume,
              })
            );
            dispatch(
              setFadeData({
                player: 1,
                time: timeLeft,
                volume: nextPlayerVolume,
              })
            );
          }
        }
      } else {
        if (player === 1) {
          dispatch(setPlayerVolume({ player: 2, volume: playQueue.volume }));
        } else {
          dispatch(setPlayerVolume({ player: 1, volume: playQueue.volume }));
        }
        nextPlayerRef.current.audioEl.current.play();
        dispatch(setIsFading(true));
      }
    }
  }
  if (playQueue.currentPlayer === player) {
    dispatch(setCurrentSeek({ seek: currentSeek }));
  }

  // Conditions for scrobbling fading track
  // 1. Scrobble enabled in settings
  // 2. Not already scrobbled
  // 3. Track reached past 4 minutes or past the fadeAtTime - 15 seconds
  // 4. The track is not fading
  if (
    shouldScrobble &&
    !scrobbled &&
    (currentSeek >= 240 || currentSeek >= fadeAtTime - 15) &&
    currentSeek <= fadeAtTime
  ) {
    setScrobbled(true);
    scrobble({ id: playQueue.currentSongId, submission: true });
  }
};

const Player = ({ currentEntryList, children }: any, ref: any) => {
  const dispatch = useAppDispatch();
  const player1Ref = useRef<any>();
  const player2Ref = useRef<any>();
  const playQueue = useAppSelector((state) => state.playQueue);
  const player = useAppSelector((state) => state.player);
  const misc = useAppSelector((state) => state.misc);
  const cacheSongs = settings.getSync('cacheSongs');
  const [title] = useState('');
  const [scrobbled, setScrobbled] = useState(false);

  const getSrc1 = useCallback(() => {
    const cachedSongPath = `${misc.imageCachePath}/${
      playQueue[currentEntryList][playQueue.player1.index]?.id
    }.mp3`;
    return isCached(cachedSongPath)
      ? cachedSongPath
      : playQueue[currentEntryList][playQueue.player1.index]?.streamUrl;
  }, [misc.imageCachePath, currentEntryList, playQueue]);

  const getSrc2 = useCallback(() => {
    const cachedSongPath = `${misc.imageCachePath}/${
      playQueue[currentEntryList][playQueue.player2.index]?.id
    }.mp3`;
    return isCached(cachedSongPath)
      ? cachedSongPath
      : playQueue[currentEntryList][playQueue.player2.index]?.streamUrl;
  }, [misc.imageCachePath, currentEntryList, playQueue]);

  useImperativeHandle(ref, () => ({
    get player1() {
      return player1Ref.current;
    },
    get player2() {
      return player2Ref.current;
    },
  }));

  useEffect(() => {
    if (player.status === 'PLAYING') {
      setTimeout(() => {
        if (playQueue.currentPlayer === 1) {
          try {
            player1Ref.current.audioEl.current.play();
          } catch (err) {
            console.log(err);
          }
        } else {
          try {
            player2Ref.current.audioEl.current.play();
          } catch (err) {
            console.log(err);
          }
        }
      }, 100);
    } else {
      // Hacky way to stop the player on quick polling intervals due to the fader continuously calling the play function
      setTimeout(() => {
        for (let i = 0; i <= 100; i += 1) {
          player1Ref.current.audioEl.current.pause();
        }
      }, 100);

      setTimeout(() => {
        for (let i = 0; i <= 100; i += 1) {
          player2Ref.current.audioEl.current.pause();
        }
      }, 100);
    }
  }, [playQueue.currentPlayer, player.status]);

  useEffect(() => {
    // Adding a small delay when setting the track src helps to not break the player when we're modifying
    // the currentSongIndex such as when sorting the table, shuffling, or drag and dropping rows.
    // It can also prevent loading unneeded tracks when rapidly incrementing/decrementing the player.
    if (playQueue[currentEntryList].length > 0 && !playQueue.isFading) {
      const timer1 = setTimeout(() => {
        dispatch(setPlayerSrc({ player: 1, src: getSrc1() }));
      }, 100);

      const timer2 = setTimeout(() => {
        dispatch(setPlayerSrc({ player: 2, src: getSrc2() }));
      }, 100);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }

    if (playQueue[currentEntryList].length > 0) {
      // If fading, just instantly switch the track, otherwise the player breaks
      // from the timeout due to the listen handlers that run during the fade
      // If switching to the NowPlayingView while on player1 and fading, dispatching
      // the src for player1 will cause the player to break

      dispatch(setPlayerSrc({ player: 1, src: getSrc1() }));
      dispatch(setPlayerSrc({ player: 2, src: getSrc2() }));
    }

    return undefined;
  }, [currentEntryList, dispatch, getSrc1, getSrc2, playQueue]);

  const handleListenPlayer1 = useCallback(() => {
    listenHandler(
      player1Ref,
      player2Ref,
      playQueue,
      currentEntryList,
      dispatch,
      1,
      playQueue.fadeDuration,
      playQueue.fadeType,
      playQueue.volumeFade,
      playQueue.showDebugWindow,
      playQueue.scrobble,
      scrobbled,
      setScrobbled
    );
  }, [currentEntryList, dispatch, playQueue, scrobbled]);

  const handleListenPlayer2 = useCallback(() => {
    listenHandler(
      player2Ref,
      player1Ref,
      playQueue,
      currentEntryList,
      dispatch,
      2,
      playQueue.fadeDuration,
      playQueue.fadeType,
      playQueue.volumeFade,
      playQueue.showDebugWindow,
      playQueue.scrobble,
      scrobbled,
      setScrobbled
    );
  }, [currentEntryList, dispatch, playQueue, scrobbled]);

  const handleOnEndedPlayer1 = useCallback(() => {
    player1Ref.current.audioEl.current.currentTime = 0;
    if (cacheSongs) {
      cacheSong(
        `${playQueue[currentEntryList][playQueue.player1.index].id}.mp3`,
        playQueue[currentEntryList][playQueue.player1.index].streamUrl.replace(/stream/, 'download')
      );
    }
    if (playQueue.repeat === 'none' && playQueue.player1.index > playQueue.player2.index) {
      dispatch(fixPlayer2Index());
      setTimeout(() => {
        player1Ref.current.audioEl.current.pause();
        player2Ref.current.audioEl.current.pause();
      }, 200);
    } else {
      if (!playQueue.autoIncremented) {
        dispatch(incrementCurrentIndex('none'));
        dispatch(setCurrentIndex(playQueue[currentEntryList][playQueue.player2.index]));
        dispatch(setAutoIncremented(true));
      }
      if (playQueue[currentEntryList].length > 1 || playQueue.repeat === 'all') {
        dispatch(setCurrentPlayer(2));
        dispatch(incrementPlayerIndex(1));
        if (playQueue.fadeDuration !== 0) {
          dispatch(setPlayerVolume({ player: 1, volume: 0 }));
          dispatch(setPlayerVolume({ player: 2, volume: playQueue.volume }));
          dispatch(setIsFading(false));
        }

        dispatch(setAutoIncremented(false));
      }
    }
  }, [cacheSongs, currentEntryList, dispatch, playQueue]);

  const handleOnEndedPlayer2 = useCallback(() => {
    player2Ref.current.audioEl.current.currentTime = 0;
    if (cacheSongs) {
      cacheSong(
        `${playQueue[currentEntryList][playQueue.player2.index].id}.mp3`,
        playQueue[currentEntryList][playQueue.player2.index].streamUrl.replace(/stream/, 'download')
      );
    }
    if (playQueue.repeat === 'none' && playQueue.player2.index > playQueue.player1.index) {
      dispatch(fixPlayer2Index());
      setTimeout(() => {
        player1Ref.current.audioEl.current.pause();
        player2Ref.current.audioEl.current.pause();
      }, 200);
    } else {
      if (!playQueue.autoIncremented) {
        dispatch(incrementCurrentIndex('none'));
        dispatch(setCurrentIndex(playQueue[currentEntryList][playQueue.player1.index]));
        dispatch(setAutoIncremented(true));
      }
      if (playQueue[currentEntryList].length > 1 || playQueue.repeat === 'all') {
        dispatch(setCurrentPlayer(1));
        dispatch(incrementPlayerIndex(2));
        if (playQueue.fadeDuration !== 0) {
          dispatch(setPlayerVolume({ player: 1, volume: playQueue.volume }));
          dispatch(setPlayerVolume({ player: 2, volume: 0 }));
          dispatch(setIsFading(false));
        }
        dispatch(setAutoIncremented(false));
      }
    }
  }, [cacheSongs, currentEntryList, dispatch, playQueue]);

  const handleGaplessPlayer1 = useCallback(() => {
    gaplessListenHandler(
      player1Ref,
      player2Ref,
      playQueue,
      1,
      dispatch,
      playQueue.pollingInterval,
      playQueue.scrobble,
      scrobbled,
      setScrobbled
    );
  }, [dispatch, playQueue, scrobbled]);

  const handleGaplessPlayer2 = useCallback(() => {
    gaplessListenHandler(
      player2Ref,
      player1Ref,
      playQueue,
      2,
      dispatch,
      playQueue.pollingInterval,
      playQueue.scrobble,
      scrobbled,
      setScrobbled
    );
  }, [dispatch, playQueue, scrobbled]);

  const handleOnPlay = useCallback(
    (playerNumber: 1 | 2) => {
      ipcRenderer.send('current-song', playQueue.current);

      // Don't run this if resuming a song, so we'll use a 30 second check
      if (playQueue.scrobble) {
        let fadeAtTime;
        let duration;
        let currentSeek;
        if (playerNumber === 1) {
          currentSeek = player1Ref.current.audioEl.current?.currentTime;
          duration = player1Ref.current.audioEl.current?.duration;
          fadeAtTime = duration - playQueue.fadeDuration;
        } else {
          currentSeek = player2Ref.current.audioEl.current?.currentTime;
          duration = player2Ref.current.audioEl.current?.duration;
          fadeAtTime = duration - playQueue.fadeDuration;
        }

        // Set the reset scrobble condition based on fade or gapless
        if (
          playQueue.fadeDuration > 0
            ? !(currentSeek >= 240 || currentSeek >= fadeAtTime - 15) && currentSeek <= fadeAtTime
            : !(currentSeek >= 240 || currentSeek >= duration * 0.9)
        ) {
          setScrobbled(false);
          if (playerNumber === 1) {
            scrobble({
              id: playQueue[currentEntryList][playQueue.player1.index]?.id,
              submission: false,
            });
          } else {
            scrobble({
              id: playQueue[currentEntryList][playQueue.player2.index]?.id,
              submission: false,
            });
          }
        }
      }
    },
    [currentEntryList, playQueue]
  );

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>

      <ReactAudioPlayer
        ref={player1Ref}
        src={playQueue.player1.src}
        onPlay={() => handleOnPlay(1)}
        listenInterval={playQueue.pollingInterval}
        preload="auto"
        onListen={playQueue.fadeDuration === 0 ? handleGaplessPlayer1 : handleListenPlayer1}
        onEnded={handleOnEndedPlayer1}
        volume={playQueue.player1.volume}
        autoPlay={
          playQueue.player1.index === playQueue.currentIndex &&
          playQueue.currentPlayer === 1 &&
          player.status === 'PLAYING'
        }
        onError={() => {
          if (playQueue[currentEntryList].length > 0) {
            player1Ref.current.audioEl.current.src = './components/player/dummy.mp3';
            player1Ref.current.audioEl.current.src = getSrc1();
          }
        }}
        crossOrigin="anonymous"
      />
      <ReactAudioPlayer
        ref={player2Ref}
        src={playQueue.player2.src}
        onPlay={() => handleOnPlay(2)}
        listenInterval={playQueue.pollingInterval}
        preload="auto"
        onListen={playQueue.fadeDuration === 0 ? handleGaplessPlayer2 : handleListenPlayer2}
        onEnded={handleOnEndedPlayer2}
        volume={playQueue.player2.volume}
        autoPlay={
          playQueue.player2.index === playQueue.currentIndex &&
          playQueue.currentPlayer === 2 &&
          player.status === 'PLAYING'
        }
        onError={() => {
          if (playQueue[currentEntryList].length > 0) {
            player2Ref.current.audioEl.current.src = './components/player/dummy.mp3';
            player2Ref.current.audioEl.current.src = getSrc2();
          }
        }}
        crossOrigin="anonymous"
      />
      {children}
    </>
  );
};

export default forwardRef(Player);
