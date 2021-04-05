import React from "react";
import PlaylistSelection from "../components/PlaylistSelection";

export default function GetMusic({ headerHeight, playerHeight }) {
  return (
    <PlaylistSelection
      playerHeight={playerHeight}
      headerHeight={headerHeight}
    />
  );
}
