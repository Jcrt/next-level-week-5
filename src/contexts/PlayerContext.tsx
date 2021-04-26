import { createContext, ReactNode, useContext, useState } from 'react';

type Episode = {
  title: string;
  members: string;
  thumbnail: string;
  duration: number;
  url: string;
}

type PlayerContextData = {
  episodeList: Array<Episode>;
  currentEpisodeIndex: number;
  isPlaying: boolean;
  isLooping: boolean;
  isShuffle: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  play: (episode: Episode) => void;
  togglePlay: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  setPlayingState: (state: boolean) => void;
  playList: (list: Episode[], index: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  clearPlayerState: () => void;
}

type PlayerContetProviderProps = {
  children: ReactNode;
}

export const PlayerContext = createContext({} as PlayerContextData);

export function PlayerContextProvider({ children }: PlayerContetProviderProps) {

  const [epList, setEpisodeList] = useState([]);
  const [curEpIndex, setCurrentEpisodeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  const hasPrevious = (curEpIndex > 0);
  const hasNext = isShuffle || (curEpIndex < epList.length - 1);

  function play(episode: Episode) {
    setEpisodeList([episode]);
    setCurrentEpisodeIndex(0);
    setIsPlaying(!isPlaying);
  }

  function playList(list: Episode[], index: number) {
    setEpisodeList(list);
    setCurrentEpisodeIndex(index);
    setIsPlaying(true);
  }

  function togglePlay() {
    setIsPlaying(!isPlaying);
  }

  function toggleLoop() {
    setIsLooping(!isLooping);
  }

  function toggleShuffle() {
    setIsShuffle(!isShuffle);
  }

  function setPlayingState(state: boolean) {
    setIsPlaying(state);
  }

  function clearPlayerState() {
    setEpisodeList([]);
    setCurrentEpisodeIndex(0);
  }


  function playNext() {
    if (isShuffle) {
      const nextRandomEpIndex = Math.floor(Math.random() * epList.length);
      setCurrentEpisodeIndex(nextRandomEpIndex);
    } else if (hasNext)
      setCurrentEpisodeIndex(curEpIndex + 1);
  }

  function playPrevious() {
    if (hasPrevious)
      setCurrentEpisodeIndex(curEpIndex - 1);
  }

  return (
    <PlayerContext.Provider
      value={{
        episodeList: epList,
        currentEpisodeIndex: curEpIndex,
        play: play,
        isPlaying,
        togglePlay,
        setPlayingState,
        playList,
        playNext,
        playPrevious,
        hasNext,
        hasPrevious,
        toggleLoop,
        isLooping,
        isShuffle,
        toggleShuffle,
        clearPlayerState
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => {
  return useContext(PlayerContext)
}