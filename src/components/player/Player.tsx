import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
} from 'react';
import path from 'path';
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
} from '../../redux/playQueueSlice';
import { setCurrentSeek } from '../../redux/playerSlice';
import cacheSong from '../shared/cacheSong';
import { getSongCachePath, isCached } from '../../shared/utils';

const gaplessListenHandler = (
  currentPlayerRef: any,
  nextPlayerRef: any,
  playQueue: any,
  currentPlayer: number,
  dispatch: any,
  pollingInterval: number
) => {
  const seek =
    Math.round(currentPlayerRef.current.audioEl.current.currentTime * 100) /
    100;
  const duration =
    Math.round(currentPlayerRef.current.audioEl.current.duration * 100) / 100;

  const seekable =
    currentPlayerRef.current.audioEl.current.seekable.length >= 1
      ? currentPlayerRef.current.audioEl.current.seekable.end(
          currentPlayerRef.current.audioEl.current.seekable.length - 1
        )
      : 0;

  if (playQueue.currentPlayer === currentPlayer) {
    dispatch(
      setCurrentSeek({
        seek,
        seekable,
      })
    );
  }

  // Add a bit of leeway for the second track to start since the
  // seek value doesn't always reach the duration
  const durationPadding =
    pollingInterval <= 10 ? 0.13 : pollingInterval <= 20 ? 0.14 : 0.15;
  if (seek + durationPadding >= duration) {
    nextPlayerRef.current.audioEl.current.play();
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
  debug: boolean
) => {
  const currentSeek =
    currentPlayerRef.current?.audioEl.current?.currentTime || 0;
  const seekable =
    currentPlayerRef.current.audioEl.current.seekable.length >= 1
      ? currentPlayerRef.current.audioEl.current.seekable.end(
          currentPlayerRef.current.audioEl.current.seekable.length - 1
        )
      : 0;
  const duration = currentPlayerRef.current?.audioEl.current?.duration;
  const fadeAtTime = duration - fadeDuration;

  // Fade only if repeat is 'all' or if not on the last track
  if (
    playQueue[`player${player}`].index + 1 <
      playQueue[currentEntryList].length ||
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
            currentPlayerVolumeCalculation =
              (timeLeft / fadeDuration) * playQueue.volume;
            nextPlayerVolumeCalculation =
              ((fadeDuration - timeLeft) / fadeDuration) * playQueue.volume;
            break;
          case 'dipped':
            // https://math.stackexchange.com/a/4622
            percentageOfFadeLeft = timeLeft / fadeDuration;
            currentPlayerVolumeCalculation =
              percentageOfFadeLeft ** 2 * playQueue.volume;
            nextPlayerVolumeCalculation =
              (percentageOfFadeLeft - 1) ** 2 * playQueue.volume;
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
              Math.cos(
                (Math.PI / 4) *
                  ((2 * percentageOfFadeLeft - 1) ** (2 * n + 1) - 1)
              ) * playQueue.volume;
            nextPlayerVolumeCalculation =
              Math.cos(
                (Math.PI / 4) *
                  ((2 * percentageOfFadeLeft - 1) ** (2 * n + 1) + 1)
              ) * playQueue.volume;
            break;

          default:
            currentPlayerVolumeCalculation =
              (timeLeft / fadeDuration) * playQueue.volume;
            nextPlayerVolumeCalculation =
              ((fadeDuration - timeLeft) / fadeDuration) * playQueue.volume;
            break;
        }

        const currentPlayerVolume =
          currentPlayerVolumeCalculation >= 0
            ? currentPlayerVolumeCalculation
            : 0;

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
          dispatch(setPlayerVolume({ player: 2, volume: playQueue.volume }));
        }
        nextPlayerRef.current.audioEl.current.play();
        dispatch(setIsFading(true));
      }
    }
  }
  if (playQueue.currentPlayer === player) {
    dispatch(setCurrentSeek({ seek: currentSeek, seekable }));
  }
};

const Player = ({ currentEntryList, children }: any, ref: any) => {
  const dispatch = useAppDispatch();
  const player1Ref = useRef<any>();
  const player2Ref = useRef<any>();
  const [player1Src, setPlayer1Src] = useState('');
  const [player2Src, setPlayer2Src] = useState('');
  const playQueue = useAppSelector((state) => state.playQueue);
  const player = useAppSelector((state) => state.player);
  const cacheSongs = settings.getSync('cacheSongs');
  const [debug, setDebug] = useState(playQueue.showDebugWindow);
  const [title] = useState('');
  const [cachePath] = useState(path.join(getSongCachePath(), '/'));
  const [fadeDuration, setFadeDuration] = useState(playQueue.fadeDuration);
  const [fadeType, setFadeType] = useState(playQueue.fadeType);
  const [volumeFade, setVolumeFade] = useState(playQueue.volumeFade);
  const [pollingInterval, setPollingInterval] = useState(
    playQueue.pollingInterval
  );

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
      setTimeout(
        () => {
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
        },
        player1Src ? 0 : 500
      );
    } else {
      // Hacky way to pause the player because it sometimes doesn't pause if the
      // polling interval is set to a low value
      setTimeout(() => {
        player1Ref.current.audioEl.current.pause();
        player2Ref.current.audioEl.current.pause();
      }, 10);
      setTimeout(() => {
        player1Ref.current.audioEl.current.pause();
        player2Ref.current.audioEl.current.pause();
      }, 25);
      setTimeout(() => {
        player1Ref.current.audioEl.current.pause();
        player2Ref.current.audioEl.current.pause();
      }, 100);
      setTimeout(() => {
        player1Ref.current.audioEl.current.pause();
        player2Ref.current.audioEl.current.pause();
      }, 200);
    }
  }, [playQueue.currentPlayer, player.status, player1Src]);

  useEffect(() => {
    /* Adding a small delay when setting the track src helps to not break the player when we're modifying
    the currentSongIndex such as when sorting the table, shuffling, or drag and dropping rows.
     It can also prevent loading unneeded tracks when rapidly incrementing/decrementing the player. */
    const getSrc1 = () => {
      const cachedSongPath = `${cachePath}/${
        playQueue[currentEntryList][playQueue.player1.index]?.id
      }.mp3`;
      return isCached(cachedSongPath)
        ? cachedSongPath
        : playQueue[currentEntryList][playQueue.player1.index]?.streamUrl;
    };

    const getSrc2 = () => {
      const cachedSongPath = `${cachePath}/${
        playQueue[currentEntryList][playQueue.player2.index]?.id
      }.mp3`;
      return isCached(cachedSongPath)
        ? cachedSongPath
        : playQueue[currentEntryList][playQueue.player2.index]?.streamUrl;
    };

    /* Set the alternate player to a dummy src first to reset it, otherwise the player
    will continue running even when switched to the other due to the src not changing */
    if (playQueue.currentPlayer === 2) {
      setPlayer1Src('./components/player/dummy.mp3');
    }
    if (playQueue.currentPlayer === 1) {
      setPlayer2Src('./components/player/dummy.mp3');
    }

    if (playQueue[currentEntryList] && !playQueue.isFading) {
      const timer1 = setTimeout(() => {
        setPlayer1Src(getSrc1());
      }, 250);

      const timer2 = setTimeout(() => {
        setPlayer2Src(getSrc2());
      }, 250);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }

    /* If fading, just instantly switch the track, otherwise the player breaks
     from the timeout due to the listen handlers that run during the fade */
    setPlayer1Src(getSrc1());
    setPlayer2Src(getSrc2());
    return undefined;
  }, [cachePath, currentEntryList, playQueue]);

  useEffect(() => {
    // Update playback settings when changed in redux store
    setDebug(playQueue.showDebugWindow);
    setFadeDuration(playQueue.fadeDuration);
    setFadeType(playQueue.fadeType);
    setVolumeFade(playQueue.volumeFade);
    setPollingInterval(playQueue.pollingInterval);
  }, [
    playQueue.fadeDuration,
    playQueue.fadeType,
    playQueue.pollingInterval,
    playQueue.showDebugWindow,
    playQueue.volumeFade,
  ]);

  const handleListenPlayer1 = () => {
    listenHandler(
      player1Ref,
      player2Ref,
      playQueue,
      currentEntryList,
      dispatch,
      1,
      fadeDuration,
      fadeType,
      volumeFade,
      debug
    );
  };

  const handleListenPlayer2 = () => {
    listenHandler(
      player2Ref,
      player1Ref,
      playQueue,
      currentEntryList,
      dispatch,
      2,
      fadeDuration,
      fadeType,
      volumeFade,
      debug
    );
  };

  const handleOnEndedPlayer1 = () => {
    if (cacheSongs) {
      cacheSong(
        `${playQueue[currentEntryList][playQueue.player1.index].id}.mp3`,
        playQueue[currentEntryList][playQueue.player1.index].streamUrl.replace(
          /stream/,
          'download'
        )
      );
    }
    if (
      playQueue.repeat === 'none' &&
      playQueue.player1.index > playQueue.player2.index
    ) {
      dispatch(fixPlayer2Index());
      setTimeout(() => {
        player1Ref.current.audioEl.current.pause();
        player2Ref.current.audioEl.current.pause();
      }, 200);
    } else {
      if (!playQueue.autoIncremented) {
        dispatch(incrementCurrentIndex('none'));
        dispatch(
          setCurrentIndex(playQueue[currentEntryList][playQueue.player2.index])
        );
        dispatch(setAutoIncremented(true));
      }
      if (
        playQueue[currentEntryList].length > 1 ||
        playQueue.repeat === 'all'
      ) {
        dispatch(setCurrentPlayer(2));
        dispatch(incrementPlayerIndex(1));
        if (fadeDuration !== 0) {
          dispatch(setPlayerVolume({ player: 1, volume: 0 }));
          dispatch(setPlayerVolume({ player: 2, volume: playQueue.volume }));
          dispatch(setIsFading(false));
        }

        dispatch(setAutoIncremented(false));
      }
    }
  };

  const handleOnEndedPlayer2 = () => {
    if (cacheSongs) {
      cacheSong(
        `${playQueue[currentEntryList][playQueue.player2.index].id}.mp3`,
        playQueue[currentEntryList][playQueue.player2.index].streamUrl.replace(
          /stream/,
          'download'
        )
      );
    }
    if (
      playQueue.repeat === 'none' &&
      playQueue.player2.index > playQueue.player1.index
    ) {
      dispatch(fixPlayer2Index());
      setTimeout(() => {
        player1Ref.current.audioEl.current.pause();
        player2Ref.current.audioEl.current.pause();
      }, 200);
    } else {
      if (!playQueue.autoIncremented) {
        dispatch(incrementCurrentIndex('none'));
        dispatch(
          setCurrentIndex(playQueue[currentEntryList][playQueue.player1.index])
        );
        dispatch(setAutoIncremented(true));
      }
      if (
        playQueue[currentEntryList].length > 1 ||
        playQueue.repeat === 'all'
      ) {
        dispatch(setCurrentPlayer(1));
        dispatch(incrementPlayerIndex(2));
        if (fadeDuration !== 0) {
          dispatch(setPlayerVolume({ player: 1, volume: playQueue.volume }));
          dispatch(setPlayerVolume({ player: 2, volume: 0 }));
          dispatch(setIsFading(false));
        }
        dispatch(setAutoIncremented(false));
      }
    }
  };

  const handleGaplessPlayer1 = () => {
    gaplessListenHandler(
      player1Ref,
      player2Ref,
      playQueue,
      1,
      dispatch,
      pollingInterval
    );
  };

  const handleGaplessPlayer2 = () => {
    gaplessListenHandler(
      player2Ref,
      player1Ref,
      playQueue,
      2,
      dispatch,
      pollingInterval
    );
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>

      <ReactAudioPlayer
        ref={player1Ref}
        src={player1Src}
        listenInterval={pollingInterval}
        preload="auto"
        onListen={
          fadeDuration === 0 ? handleGaplessPlayer1 : handleListenPlayer1
        }
        onEnded={handleOnEndedPlayer1}
        volume={playQueue.player1.volume}
        autoPlay={
          playQueue.player1.index === playQueue.currentIndex &&
          playQueue.currentPlayer === 1
        }
        onError={(e: any) => {
          // player1Ref.current.audioEl.current.src = '';
          // player1Ref.current.audioEl.current.src =
          //   playQueue[currentEntryList][playQueue.player1.index].streamUrl;
          console.log('player error', e);
        }}
        crossOrigin="anonymous"
      />
      <ReactAudioPlayer
        ref={player2Ref}
        src={player2Src}
        listenInterval={pollingInterval}
        preload="auto"
        onListen={
          fadeDuration === 0 ? handleGaplessPlayer2 : handleListenPlayer2
        }
        onEnded={handleOnEndedPlayer2}
        volume={playQueue.player2.volume}
        autoPlay={
          playQueue.player2.index === playQueue.currentIndex &&
          playQueue.currentPlayer === 2
        }
        onError={(e: any) => {
          // player2Ref.current.audioEl.current.src = '';
          // player2Ref.current.audioEl.current.src =
          //   playQueue[currentEntryList][playQueue.player2.index].streamUrl;
          console.log('player error', e);
        }}
        crossOrigin="anonymous"
      />
      {children}
    </>
  );
};

export default forwardRef(Player);
