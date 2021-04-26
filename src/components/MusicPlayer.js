import axios from "axios";
import { useEffect, useRef, useState } from "react";
import SpotifyPlayer from "react-spotify-web-playback";
import styled from "styled-components";
import Loading from "../components/utilities/Loading";
import { usePlayingSongSelection, useSong } from "../hooks/SongContext";
import { useTags, useTagsUpdating } from "../hooks/TagsContext";
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
  let song = useSong();
  const setPlayingSong = usePlayingSongSelection();
  const contextTags = useTags();
  const setContextTags = useTagsUpdating();
  const player = useRef();
  const [state, setStatefulness] = useState({});
  const [selectedSong, setSelectedSong] = useState(song);
  const [wait, setWait] = useState(true);
  const [tags, setTags] = useState([]);

  const url = process.env.NODE_ENV === "development" ? devUrl : prodUrl;

  const callback = async state => {
    if (state.deviceId) sessionStorage.setItem("deviceId", state.deviceId);
    let songTags = await getTags(state.track.uri);
    setTags(songTags);
    const { uri } = state.track;
    setContextTags({ tags: songTags || tags, uri });
    setStatefulness(artistsAsArray(state));
    setPlayingSong(uri);
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

  useEffect(async () => {
    const isPlaylist = state.nextTracks?.length || state.previousTracks?.length;
    if (isPlaylist && song === state.track.uri) return;
    setSelectedSong(song);
  }, [song]);

  useEffect(() => {
    setWait(!wait);
  }, [selectedSong]);

  useEffect(async () => {
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
          uris={selectedSong}
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
