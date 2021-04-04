import React, { useEffect, useState } from "react";
import styled from "styled-components";
import likedSongsImg from "../assets/img/play-button.png";
import playlistsService from "../services/playlistsService";
import spotifyService from "../services/spotifyService";
import tracksService from "../services/tracksService";
import { spotifySavedTracks } from "../services/variables";
import Playlist from "./Playlist";
import Loading from "./utilities/Loading";

const ContainerFlex = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  padding-top: ${props => props.headerHeight};
  padding-bottom: ${props => props.playerHeight};
  box-sizing: border-box;
  height: 100%;
`;

export default function PlaylistSelection({ headerHeight, playerHeight }) {
  const [playlists, setPlaylists] = useState([]);
  const selectedPlaylists = new Set();

  useEffect(async () => {
    const fetchedPlaylists =
      JSON.parse(localStorage.getItem("spotify_playlists")) ||
      (await spotifyService().fetchPlaylists());

    if (!fetchedPlaylists.error) {
      const likedSongs = {
        name: "Liked Songs",
        id: "Liked_Songs",
        tracks: { href: spotifySavedTracks },
        images: [likedSongsImg],
      };

      setPlaylists([likedSongs, ...fetchedPlaylists.data]);
      localStorage.setItem(
        "spotify_playlists",
        JSON.stringify(fetchedPlaylists)
      );
    } else {
      alert(fetchedPlaylists.msg);
    }
  }, []);

  const loadPlaylists = () => {
    const playlistsCopy = [...playlists];
    const playlistsToFetch = playlistsCopy.filter(playlist =>
      selectedPlaylists.delete(playlist.id)
    );
    const failures = [];

    // with forEach and async, we'll finish before all fetch calls are done.
    // failures array will still be empty, no matter what happens
    // if we want it to wait, either use a for loop or check this out
    // https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
    playlistsToFetch.forEach(async playlist => {
      const result = await spotifyService().fetchTracks(playlist.tracks.href);
      if (!result.error) {
        const tracks = tracksService().sanitizeTracksArray(result.data);
        tracksService().addTracksToDatabase(tracks);
        playlistsService().createOrUpdatePlaylistCollection(
          playlist.id,
          tracks
        );
        playlistsService().addPlaylistToAllPlaylists(playlist);
      } else {
        failures.push(playlist);
      }
    });
  };

  const handlePlaylistClick = (playlistId, index) => {
    const newPlaylists = [...playlists];
    if (selectedPlaylists.delete(playlistId)) {
      delete newPlaylists[index].selected;
    } else {
      selectedPlaylists.add(playlistId);
      newPlaylists[index].selected = true;
    }
    setPlaylists(newPlaylists);
  };

  const selectAll = () => {
    const selected = true;
    bulkSelectAction(selected);
  };

  const clearAll = () => {
    const selected = false;
    bulkSelectAction(selected);
  };

  const bulkSelectAction = selected => {
    const newPlaylists = [...playlists];
    newPlaylists.forEach(playlist => {
      playlist.selected = selected;
      selected
        ? selectedPlaylists.add(playlist.id)
        : selectedPlaylists.delete(playlist.id);
    });
    setPlaylists(newPlaylists);
  };

  return (
    <ContainerFlex playerHeight={playerHeight} headerHeight={headerHeight}>
      <div onClick={() => loadPlaylists()}>
        <h2>Load Playlists</h2>
      </div>
      <div onClick={selectAll}>Select All</div>
      <div onClick={clearAll}>Clear All</div>
      <div style={{ overflowY: "scroll", height: "90vh" }}>
        {playlists[0] ? (
          playlists.map((playlist, index) => (
            <div
              key={playlist.id}
              onClick={() => handlePlaylistClick(playlist.id, index)}
            >
              <Playlist playlist={playlist} />
            </div>
          ))
        ) : (
          <Loading />
        )}
      </div>
    </ContainerFlex>
  );
}
