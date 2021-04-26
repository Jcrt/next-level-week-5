import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Slider from 'rc-slider';

import styles from './styles.module.scss';
import 'rc-slider/assets/index.css';
import { usePlayer } from '../../contexts/PlayerContext';
import convertDurationToTimeString from '../../utils/convertDurationToTimeString';

export function Player() {

  const [progress, setProgress] = useState(0);

  const player = usePlayer();
  const episode = player.episodeList[player.currentEpisodeIndex];
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!audioRef.current)
      return;

    if (player.isPlaying)
      audioRef.current.play();
    else
      audioRef.current.pause();

  }, [player.isPlaying])

  function setupProgressListener() {
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener('timeupdate', event => {
      setProgress(Math.floor(audioRef.current.currentTime));
    })
  }

  function handleSeek(amount: number) {
    audioRef.current.currentTime = amount;
    setProgress(amount);
  }

  function handleEpisodeEnded() {
    if (player.hasNext)
      player.playNext();
    else
      player.clearPlayerState();
  }

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src="/playing.svg" alt="Player" />
        <strong>Tocando agora</strong>
      </header>

      {episode ? (
        <div className={styles.currentEpisode}>
          <Image
            width={592}
            height={592}
            src={episode.thumbnail}
            objectFit="cover"
          />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}

      <footer className={!episode ? styles.empty : ""}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>
          <div className={styles.slider}>
            {episode ? (
              <Slider
                max={episode.duration}
                value={progress}
                onChange={handleSeek}
                trackStyle={{ backgroundColor: "#04d361" }}
                railStyle={{ backgroundColor: "#9f75ff" }}
                handleStyle={{ borderColor: "#04d361", borderWidth: 4 }}
              />
            ) : (
              <div className={styles.emptySlider} />
            )}
          </div>
          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>

        {episode && (
          <audio
            src={episode.url}
            ref={audioRef}
            autoPlay
            onPlay={() => player.setPlayingState(true)}
            loop={player.isLooping}
            onPause={() => player.setPlayingState(false)}
            onLoadedMetadata={setupProgressListener}
            onEnded={handleEpisodeEnded}
          />
        )}

        <div className={styles.buttons}>
          <button type="button" disabled={!episode} onClick={player.toggleShuffle} className={player.isShuffle ? styles.isActive : ''}>
            <img src="/shuffle.svg" alt="Embaralhar" />
          </button>
          <button type="button" disabled={!episode || !player.hasPrevious} onClick={player.playPrevious}>
            <img src="/play-previous.svg" alt="Tocar anterior" />
          </button>
          <button
            type="button"
            className={styles.playButton}
            disabled={!episode || player.episodeList.length == 1}
            onClick={() => player.togglePlay()}
          >
            <img
              src={player.isPlaying ? "/pause.svg" : "/play.svg"}
              alt="Tocar"
            />
          </button>
          <button type="button" disabled={!episode || !player.hasNext} onClick={player.playNext}>
            <img src="/play-next.svg" alt="Tocar próxima" />
          </button>
          <button type="button" disabled={!episode} onClick={player.toggleLoop} className={player.isLooping ? styles.isActive : ''}>
            <img src="/repeat.svg" alt="Repetir" />
          </button>
        </div>
      </footer>
    </div>
  );
}