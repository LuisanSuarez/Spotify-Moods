import React, { useEffect, useState } from "react";
import styled from "styled-components";
import likedSongsImg from "../assets/img/play-button.png";
import playlistsService from "../services/playlistsService";
import spotifyService from "../services/spotifyService";
import tracksService from "../services/tracksService";
import { devUrl, prodUrl, spotifySavedTracks } from "../services/variables";
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
  const [selectedPlaylists, xyz] = useState(new Set());

  const [tokens, setTokens] = useState(
    JSON.parse(localStorage.getItem("tokens"))
  );

  const url = process.env.NODE_ENV === "development" ? devUrl : prodUrl;

  // const spotifyPlaylists = "https://api.spotify.com/v1/me/playlists/";
  // const savedTracks = "https://api.spotify.com/v1/me/tracks";

  useEffect(async () => {
    const fetchedPlaylists = await spotifyService().fetchPlaylists();
    if (!fetchedPlaylists.error) {
      const likedSongs = {
        name: "Liked Songs",
        id: "Liked_Songs",
        tracks: { href: spotifySavedTracks },
        images: [likedSongsImg],
      };
      setPlaylists([likedSongs, ...fetchedPlaylists.data]);
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

  const handleClick = (playlistId, index) => {
    //toggle if we fetch playlist items or not
    const newPlaylists = [...playlists];
    if (selectedPlaylists.delete(playlistId)) {
      delete newPlaylists[index].selected;
    } else {
      selectedPlaylists.add(playlistId);
      newPlaylists[index].selected = true;
    }
    setPlaylists(newPlaylists);
  };

  return (
    <ContainerFlex playerHeight={playerHeight} headerHeight={headerHeight}>
      <div onClick={() => loadPlaylists()}>
        <h2>Load Playlists</h2>
      </div>
      <div onClick={() => console.log("SELECT ALL")}>Select All</div>
      <div onClick={() => console.log("CLEAR ALL")}>Clear All</div>
      <div style={{ overflowY: "scroll", height: "90vh" }}>
        {playlists[0] ? (
          playlists.map((playlist, index) => (
            <div onClick={() => handleClick(playlist.id, index)}>
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
