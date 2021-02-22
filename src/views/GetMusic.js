import React from "react";
import PlaylistSelection from "../components/PlaylistSelection";

export default function GetMusic() {
  return (
    <div>
      <h1>Load your Music to Moods</h1>
      <PlaylistSelection selectedPlaylists playlists />
    </div>
  );
}
