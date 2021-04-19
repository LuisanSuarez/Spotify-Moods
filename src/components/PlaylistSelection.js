import React, { useEffect, useState } from "react";
import styled from "styled-components";
import likedSongsImg from "../assets/img/play-button.png";
import playlistsService from "../services/playlistsService";
import spotifyService from "../services/spotifyService";
import tracksService from "../services/tracksService";
import { COLOR, spotifySavedTracks } from "../services/variables";
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

const LoadButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid ${COLOR.thirty};
  border-radius: 8px;
  box-sizing: border-box;
  padding: 8px 20px;
  background: ${props =>
    props.selectedPlaylists.length ? COLOR.transparentShade : "transparent"};
  color: ${COLOR.thirty};
  width: 200px;
  height: 85px;
  margin: 16px auto;
`;

const LoadingContainer = styled.div`
  height: 185px;
  width: 90vw;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const StagedPlaylists = styled.div`
  overflow-y: scroll;
  height: 100%;
`;

export default function PlaylistSelection({ headerHeight, playerHeight }) {
  const [playlists, setPlaylists] = useState([]);
  const [savedPlaylists, setSavedPlaylists] = useState([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState([]);
  const [selectedPlaylists, xyz] = useState(new Set());
  const [filterLoaded, setFilterLoaded] = useState(false);
  const [stagedPlaylists, setStagedPlaylists] = useState([]);

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

  useEffect(() => {
    const savedPlaylists =
      JSON.parse(localStorage.getItem("saved_playlists")) ||
      playlistsService().getPlaylistsNames();
    setSavedPlaylists(savedPlaylists);
  }, []);

  useEffect(() => {
    const savedPlaylistsIds = new Set(
      savedPlaylists.map(playlist => playlist.id)
    );

    const filteredPlaylists = playlists.filter(
      playlist => !savedPlaylistsIds.delete(playlist.id)
    );
    setFilteredPlaylists(filteredPlaylists);
  }, [savedPlaylists]);

  const loadPlaylists = async () => {
    const playlistsCopy = [...playlists];
    // const playlistsToFetch = playlistsCopy.filter(playlist =>
    //   selectedPlaylists.delete(playlist.id)
    // );
    const playlistsToFetch = Array.from(selectedPlaylists);

    clearAll();

    const failures = [];
    const successes = [];
    // with forEach and async, we'll finish before all fetch calls are done.
    // failures array will still be empty, no matter what happens
    // if we want it to wait, either use a for loop or check this out
    // https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
    // update: we've since changed it to a for loop. want to keep this link
    // around for a little longer though.
    for (let i = 0; i < playlistsToFetch.length; i++) {
      let playlist = playlistsToFetch[i];
      const result = await spotifyService().fetchTracks(playlist.tracks.href);
      if (!result.error) {
        const tracks = tracksService().sanitizeTracksArray(result.data);
        tracksService().addTracksToDatabase(tracks);
        playlistsService().createOrUpdatePlaylistCollection(
          playlist.id,
          tracks
        );
        playlistsService().addPlaylistToAllPlaylists(playlist);
        successes.push(playlist);
      } else {
        failures.push(playlist);
      }
    }

    const updatedSavedPlaylists = [
      ...savedPlaylists,
      ...preparePlaylistForCache(successes),
    ];

    setSavedPlaylists(updatedSavedPlaylists);
    localStorage.setItem(
      "saved_playlists",
      JSON.stringify(updatedSavedPlaylists)
    );
  };

  const preparePlaylistForCache = playlistArray => {
    const arrayCopy = [...playlistArray];
    return arrayCopy.map(playlist => {
      const { name, id } = playlist;
      return { _id: id, id, name };
    });
  };

  const handlePlaylistClick = (playlist, index) => {
    const playlistId = playlist.id;
    const newPlaylists = [...playlists];
    let newStagedPlaylists = [...stagedPlaylists];
    if (selectedPlaylists.delete(playlistId)) {
      delete newPlaylists[index].selected;
      newStagedPlaylists = newStagedPlaylists.filter(
        stagedPlaylist => stagedPlaylist.id !== playlistId
      );
    } else {
      selectedPlaylists.add(playlistId);
      newPlaylists[index].selected = true;
      newStagedPlaylists.push(playlist);
    }
    setPlaylists(newPlaylists);
    setStagedPlaylists(newStagedPlaylists);
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
      if (selected) selectedPlaylists.add(playlist.id);
    });
    if (!selected) {
      selectedPlaylists.clear();
      setStagedPlaylists([]);
    } else {
      setStagedPlaylists(newPlaylists);
    }
    setPlaylists(newPlaylists);
  };

  const toggleShowLoaded = () => setFilterLoaded(!filterLoaded);

  return (
    <ContainerFlex playerHeight={playerHeight} headerHeight={headerHeight}>
      {stagedPlaylists[0] ? (
        <LoadingContainer>
          <LoadButton
            selectedPlaylists={Array.from(selectedPlaylists)}
            onClick={() => loadPlaylists()}
          >
            <h2>Load Playlists</h2>
          </LoadButton>
          <StagedPlaylists>
            {stagedPlaylists.map(playlist => (
              <Playlist key={playlist.id} playlist={playlist} size="sm" />
            ))}
          </StagedPlaylists>
        </LoadingContainer>
      ) : (
        ""
      )}
      <div onClick={selectAll}>Select All</div>
      <div onClick={clearAll}>Clear All</div>
      <div onClick={toggleShowLoaded}>
        {filterLoaded ? "Show" : "Hide"} loaded playlists
      </div>

      <div style={{ overflowY: "scroll", height: "90vh" }}>
        {!filterLoaded ? (
          playlists[0] ? (
            playlists.map((playlist, index) => (
              <div
                key={playlist.id}
                onClick={() => handlePlaylistClick(playlist, index)}
              >
                <Playlist playlist={playlist} />
              </div>
            ))
          ) : (
            <Loading />
          )
        ) : filteredPlaylists[0] ? (
          filteredPlaylists.map((playlist, index) => (
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
