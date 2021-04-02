import axios from "axios";
import { useEffect, useRef, useState } from "react";
import SpotifyPlayer from "react-spotify-web-playback";
import styled from "styled-components";
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

  const url = process.env.NODE_ENV === "development" ? devUrl : prodUrl;

  const callback = state => {
    setStatefulness(artistsAsArray(state));
  };

  const artistsAsArray = state => {
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
    if (song) {
      const songTags = await getTags(song);
      setTags(songTags);
    }
    setSelectedSong(song);
  }, [song]);

  useEffect(() => {}, [tags]);

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
      {song ? (
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
    ""
  );
}

export default MusicPlayer;
