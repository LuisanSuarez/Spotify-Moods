import axios from "axios";
import { useEffect, useRef, useState } from "react";
import SpotifyPlayer from "react-spotify-web-playback";
import styled from "styled-components";
import Loading from "../components/utilities/Loading";
import {
  usePlayingSongSelection,
  useSong,
  useSongSelection,
} from "../hooks/SongContext";
import { useTags, useTagsUpdating } from "../hooks/TagsContext";
import playlistsService from "../services/playlistsService";
import tracksService from "../services/tracksService";
import { COLOR, devUrl, prodUrl } from "../services/variables";
import "./musicPlayer.css";
import Track from "./Track";

const TrackContainer = styled.div``;

const styles = {
  color: COLOR.thirtyDarker,
  sliderHandleColor: COLOR.thirtyDarker,
  sliderColor: COLOR.thirtyLight,
};

function MusicPlayer({ token }) {
  let songObject = useSong();
  const setPlayingSong = usePlayingSongSelection();
  const setPlaylist = useSongSelection();
  const contextTags = useTags();
  const setContextTags = useTagsUpdating();
  const player = useRef();
  const [state, setStatefulness] = useState({});
  const [songs, setSongs] = useState(songObject.songs);
  const [wait, setWait] = useState(true);
  const [tags, setTags] = useState([]);
  const [dbTags, setDbTags] = useState([]);
  const [offset, setOffset] = useState(songObject.offset);
  const limit = 20;

  const url = process.env.NODE_ENV === "development" ? devUrl : prodUrl;

  const callback = async state => {
    if (songs && state.nextTracks?.length < 2) await addMoreSongsToQueue();

    if (state.deviceId) sessionStorage.setItem("deviceId", state.deviceId);
    const { uri } = state.track;
    let songTags = await getTags(uri);
    setTags(songTags);
    setContextTags({ tags: songTags || tags, uri });
    setStatefulness(artistsAsArray(state));
    setPlayingSong(uri);
  };

  const addMoreSongsToQueue = async () => {
    const { createdByUser, playlistId } = songObject;
    if (createdByUser) return;
    const start = songs.length;
    const nextLimit = start + limit;
    const trackIds = await playlistsService().getPlaylistTrackIds(playlistId);
    const newTracks = await tracksService().getTracksBulk(
      trackIds.slice(start, nextLimit)
    );
    const newSongs = newTracks.map(uri => "spotify:track:" + uri.id);
    const newSongArray = [...songs, ...newSongs];
    const newOffset = start - (state.nextTracks.length ? 2 : 1);
    setPlaylist({ songs: newSongArray, offset: newOffset });
  };

  const artistsAsArray = state => {
    if (Array.isArray(state.track.artists)) return state;

    const newState = Object.assign({}, state);
    const artists =
      typeof newState.track.artists === "string"
        ? newState.track.artists.split(", ")
        : [""];

    const addNameProp = name => {
      return { name: name };
    };
    const mappedArtists = artists[0] ? artists.map(addNameProp) : "";

    newState.track.artists = mappedArtists;
    return newState;
  };

  useEffect(() => {
    const isPlaylist = state.nextTracks?.length || state.previousTracks?.length;
    if (isPlaylist && songObject === state.track.uri) return;
    setSongs(songObject.songs);
    setOffset(songObject.offset);
  }, [songObject]);

  useEffect(() => {
    setWait(!wait);
  }, [songs]);

  useEffect(() => {
    if (!player.current) return;
    if (!state.isPlaying) {
      player.current.togglePlay();
    }
  }, [wait]);

  useEffect(() => {
    setTags(contextTags.tags);
  }, [contextTags]);

  const getTags = async uri => {
    let tags = await axios.get(url + "api/getSongTags", { params: { uri } });
    tags = Array.isArray(tags.data) ? tags.data : [];
    return tags;
  };

  useEffect(() => {
    function getAndSetTags() {
      const dbTags = playlistsService()
        .getTags()
        .then(res => setDbTags(res));
    }
    getAndSetTags();
  }, [contextTags]);

  return token ? (
    <>
      {" "}
      {state.track?.id ? (
        <TrackContainer>
          <Track
            key={state.track?.id}
            track={state.track}
            trackTags={tags}
            tagsCount={{}}
            isOnPlayer
            allTags={dbTags}
          />
        </TrackContainer>
      ) : (
        ""
      )}
      <div className="players">
        <SpotifyPlayer
          className="players"
          ref={player}
          token={token}
          uris={songs}
          offset={offset}
          callback={callback}
          autoPlay
          styles={styles}
        />
      </div>
    </>
  ) : (
    <Loading />
  );
}

export default MusicPlayer;
