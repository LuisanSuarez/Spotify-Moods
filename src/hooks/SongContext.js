import React, { useContext, useState } from "react";

const SongContext = React.createContext();
const SongSelectionContext = React.createContext();

export function useSong() {
  return useContext(SongContext);
}

export function useSongSelection() {
  return useContext(SongSelectionContext);
}

export function SongProvider({ children }) {
  const [song, setSong] = useState("");
  function selectSong(uri) {
    setSong(uri);
  }

  return (
    <SongContext.Provider value={song}>
      <SongSelectionContext.Provider value={selectSong}>
        {children}
      </SongSelectionContext.Provider>
    </SongContext.Provider>
  );
}
