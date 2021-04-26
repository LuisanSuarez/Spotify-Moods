import React, { useContext, useState } from "react";

const SongContext = React.createContext();
const SongSelectionContext = React.createContext();
const PlayingSongContext = React.createContext();
const PlayingSongSelectionContext = React.createContext();

export function useSong() {
  return useContext(SongContext);
}

export function useSongSelection() {
  return useContext(SongSelectionContext);
}

export function usePlayingSong() {
  return useContext(PlayingSongContext);
}

export function usePlayingSongSelection() {
  return useContext(PlayingSongSelectionContext);
}

export function SongProvider({ children }) {
  const [song, setSong] = useState([""]);
  const [playingSong, setPlayingSong] = useState("");
  function selectSong(uri) {
    setSong(uri);
  }

  function setCurentSong(uri) {
    setPlayingSong(uri);
  }

  return (
    <SongContext.Provider value={song}>
      <SongSelectionContext.Provider value={selectSong}>
        <PlayingSongContext.Provider value={playingSong}>
          <PlayingSongSelectionContext.Provider value={setCurentSong}>
            {children}
          </PlayingSongSelectionContext.Provider>
        </PlayingSongContext.Provider>
      </SongSelectionContext.Provider>
    </SongContext.Provider>
  );
}
