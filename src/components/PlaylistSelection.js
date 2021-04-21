import React, { useEffect, useState } from "react";
import styled from "styled-components";
import staged from "../assets/img/icon/black-circle.png";
import loaded from "../assets/img/icon/check.png";
import loading from "../assets/img/icon/ellipsis.png";
import failed from "../assets/img/icon/failed.png";
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
  width: 94vw;
  max-width: 1250px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 0 auto;
`;

const StagedPlaylists = styled.div`
  overflow-y: scroll;
  height: 100%;
  width: 60vw;
  min-width: 400px;
  max-width: 750px;
`;

const StagedList = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const LoadingStatus = styled.img`
  width: 30px;
  height: 30px;
  margin: 0 auto;
`;

export default function PlaylistSelection({ headerHeight, playerHeight }) {
  const [playlists, setPlaylists] = useState([]);
  const [savedPlaylists, setSavedPlaylists] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState([]);
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

  useEffect(async () => {
    const newLoadingQueue = JSON.parse(JSON.stringify(loadingQueue));
    const newStagedPlaylists = JSON.parse(JSON.stringify(stagedPlaylists));
    if (!newLoadingQueue[0]) {
      const finishedLoadingPlaylists =
        newStagedPlaylists[0] &&
        newStagedPlaylists.every(
          playlist =>
            playlist.status === "loaded" || playlist.status === "failed"
        );
      if (finishedLoadingPlaylists) updateCachedPlaylists(newStagedPlaylists);

      return;
    }

    const { status } = newLoadingQueue[0];

    if (status === "staged") {
      const currentPlaylistId = newLoadingQueue[0].id;
      const stagedIndex = newStagedPlaylists.findIndex(
        stagedPlaylist => stagedPlaylist.id === currentPlaylistId
      );

      newStagedPlaylists[stagedIndex].status = "loading";
      setStagedPlaylists(newStagedPlaylists);
    }

    if (status === "loading") {
      const result = await loadOnePlaylist(newLoadingQueue[0]);
      setStagedPlaylists(result);
    }

    if (status === "loaded" || status === "failed") {
      newLoadingQueue.shift();
      setLoadingQueue(newLoadingQueue);
    }
  }, [loadingQueue]);

  useEffect(() => {
    const newLoadingQueue = JSON.parse(JSON.stringify(loadingQueue));
    const newStagedPlaylists = JSON.parse(JSON.stringify(stagedPlaylists));

    if (!newLoadingQueue[0]) return;
    if (!newStagedPlaylists[0]) return;

    const stagedStatus = newStagedPlaylists[0].status;
    if (stagedStatus === "staged") return;

    const { status } = newLoadingQueue[0];

    if (status === "staged") newLoadingQueue[0].status = "loading";

    if (status === "loading") newLoadingQueue[0].status = "loaded";

    if (status === "failed") newLoadingQueue[0].status = "failed";

    setLoadingQueue(newLoadingQueue);
  }, [stagedPlaylists]);

  const loadPlaylists = async () => {
    clearAll();

    const newLoadingQueue = stagedPlaylists.map(playlist => {
      playlist.status = "staged";
      return playlist;
    });

    const newStagedPlaylists = JSON.parse(JSON.stringify(newLoadingQueue));

    setStagedPlaylists(newStagedPlaylists);
    setLoadingQueue(newLoadingQueue);
  };

  const loadOnePlaylist = async playlist => {
    const playlistId = playlist.id;
    const newStagedPlaylists = JSON.parse(JSON.stringify(stagedPlaylists));

    const updateIndex = newStagedPlaylists.findIndex(
      list => list.id === playlistId
    );
    const result = await spotifyService().fetchTracks(playlist.tracks.href);
    if (!result.error) {
      const tracks = tracksService().sanitizeTracksArray(result.data);
      // error handling in all these steps
      await tracksService().addTracksToDatabase(tracks);
      await playlistsService().createOrUpdatePlaylistCollection(
        playlist.id,
        tracks
      );
      await playlistsService().addPlaylistToAllPlaylists(playlist);

      newStagedPlaylists[updateIndex].status = "loaded";
    } else {
      newStagedPlaylists[updateIndex].status = "failed";
    }
    return newStagedPlaylists;
  };

  const updateCachedPlaylists = newStagedPlaylists => {
    const successes = newStagedPlaylists.filter(
      playlist => playlist.status === "loaded"
    );

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
    const finishedLoadingPlaylists =
      stagedPlaylists[0] &&
      stagedPlaylists.every(
        playlist => playlist.status === "loaded" || playlist.status === "failed"
      );
    const playlistId = playlist.id;
    const newPlaylists = [...playlists];
    let newStagedPlaylists = finishedLoadingPlaylists
      ? []
      : [...stagedPlaylists];
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

  const getLoadingStatusIcon = status => {
    let icon;
    switch (status) {
      case "staged":
        icon = <LoadingStatus src={staged} />;
        break;
      case "loading":
        icon = <LoadingStatus src={loading} />;
        // https://www.npmjs.com/package/react-loading
        break;
      case "loaded":
        icon = <LoadingStatus src={loaded} />;
        break;
      case "failed":
        icon = <LoadingStatus src={failed} />;
        break;
      default:
        icon = <LoadingStatus src={staged} />;
    }
    return icon;
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
              <StagedList key={playlist.id}>
                <Playlist playlist={playlist} size="sm" />
                {getLoadingStatusIcon(playlist.status)}
              </StagedList>
            ))}
          </StagedPlaylists>
        </LoadingContainer>
      ) : (
        ""
      )}
      <div onClick={selectAll}>Select All</div>
      <div onClick={clearAll}>Clear All</div>
      {/* <div onClick={toggleShowLoaded}>
        {filterLoaded ? "Show" : "Hide"} loaded playlists
      </div> */}

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
