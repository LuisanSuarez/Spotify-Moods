import axios from "axios";
import { useEffect, useRef, useState } from "react";
import SpotifyPlayer from "react-spotify-web-playback";
import styled from "styled-components";
import Loading from "../components/utilities/Loading";
import { useSong } from "../hooks/SongContext";
import { devUrl, prodUrl } from "../services/variables";
import "./musicPlayer.css";
import Track from "./Track";

const TrackContainer = styled.div``;

function MusicPlayer({ token }) {
  let song = useSong();
  const player = useRef();
  const [state, setStatefulness] = useState({});
  const [selectedSong, setSelectedSong] = useState(song);
  const [wait, setWait] = useState(true);
  const [tags, setTags] = useState([]);
  const [deviceId, setDeviceId] = useState("");

  const url = process.env.NODE_ENV === "development" ? devUrl : prodUrl;

  const callback = async state => {
    if (state.deviceId) sessionStorage.setItem("deviceId", state.deviceId);
    console.log({ state });
    if (state.nextTracks.length || state.previousTracks.length) {
      console.log("runs");
      const songTags = await getTags(state.track.uri);
      setTags(songTags);
      console.log({ songTags });
    }
    setStatefulness(artistsAsArray(state));
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
    // if (Array.isArray(song)) song = song[0];
    if (song) {
      console.log({ song });
      const songTags = await getTags(song);
      setTags(songTags);
    }
    setSelectedSong(song);
  }, [song]);

  useEffect(() => {
    console.log({ tags });
  }, [tags]);

  useEffect(() => {
    setWait(!wait);
  }, [selectedSong]);

  useEffect(async () => {
    if (!player.current) return;
    if (!state.isPlaying && state.track?.uri !== song) {
      player.current.togglePlay();
    }
  }, [wait]);

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
        />
      </div>
    </>
  ) : (
    <Loading />
  );
}

export default MusicPlayer;
