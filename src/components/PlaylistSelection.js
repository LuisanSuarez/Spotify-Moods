import React, { useState, useEffect } from "react";
import axios from "axios";
import Playlist from "./Playlist";
import tracksService from "../services/tracksService";
import Loading from "./utilities/Loading";
import likedSongsImg from "../assets/img/play-button.png";

export default function PlaylistSelection() {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylists, xyz] = useState(new Set());

  const [tokens, setTokens] = useState(
    JSON.parse(localStorage.getItem("tokens"))
  );

  const url =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8880/"
      : "http://localhost:8880/";

  const spotifyPlaylists = "https://api.spotify.com/v1/me/playlists/";
  const savedTracks = "https://api.spotify.com/v1/me/tracks";

  useEffect(async () => {
    const fetchedPlaylists = await fetchPlaylists();
    if (!fetchedPlaylists.error) {
      const likedSongs = {
        name: "Liked Songs",
        id: "Liked_Songs",
        tracks: { href: savedTracks },
        images: [likedSongsImg],
      };
      setPlaylists([likedSongs, ...fetchedPlaylists.data]);
    } else {
      alert(fetchedPlaylists.msg);
    }
  }, []);

  const fetchPlaylists = async () => {
    return fetch(spotifyPlaylists);
  };

  const fetchTracks = async url => {
    console.log({ url });
    return await fetch(url);
  };

  const fetch = async url => {
    let result;
    try {
      const headers = {
        authorization: "Bearer " + tokens.access_token,
      };

      let playlists = [];
      let response;

      do {
        response = await axios.get(url, { headers });
        playlists = [...playlists, ...response.data.items];
        url = response.data.next;
      } while (response.data.next);
      result = { data: playlists, error: false };
    } catch (err) {
      result = { error: true, msg: err.msg };
    } finally {
      return result;
    }
  };

  const loadPlaylists = () => {
    console.log("will load");
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
      const result = await fetchTracks(playlist.tracks.href);
      if (!result.error) {
        const tracks = tracksService.sanitizeTracksArray(result.data);
        console.log({ tracks });
        addTracksToDatabase(tracks);
        // createOrUpdatePlaylistCollection(playlist.id, tracks);
        addPlaylistToAllPlaylists(playlist);
      } else {
        failures.push(playlist);
      }
    });
  };

  const addTracksToDatabase = async tracks => {
    console.log({ tracks });
    while (tracks) {
      console.log(1, tracks.length);
      const result = await axios.post(url + "api/loadTracksFromPlaylist", {
        tracks: tracks.splice(0, 100),
      });

      console.log(tracks.length, { result });
    }
  };

  const createOrUpdatePlaylistCollection = async (playlistId, tracks) => {
    const trackIds = tracks.map(track => {
      return { id: track.id };
    });
    console.log({ trackIds });
    const result = await axios.post(
      url + "api/createOrUpdatePlaylistCollection",
      {
        playlistId,
        trackIds,
      }
    );
    return result;
  };

  const addPlaylistToAllPlaylists = async playlist => {
    const { name, id } = playlist;
    const result = await axios.post(url + "api/addPlaylistToAllPlaylists", {
      name,
      id,
    });
    console.log({ result });
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
    <div>
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
    </div>
  );
}
