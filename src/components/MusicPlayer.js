import axios from "axios";
import { useEffect, useRef, useState } from "react";
import SpotifyPlayer from "react-spotify-web-playback";
import styled from "styled-components";
import { useSong } from "../hooks/SongContext";
import "./musicPlayer.css";
import Track from "./Track";

const TrackContainer = styled.div``;

const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8880/"
    : "http://localhost:8880/";

function MusicPlayer({ token }) {
  let song = useSong();
  const player = useRef();
  const [state, setStatefulness] = useState({});
  const [selectedSong, setSelectedSong] = useState(song);
  const [wait, setWait] = useState(true);
  const [tags, setTags] = useState([]);

  const callback = state => {
    setStatefulness(state);
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
    if (!state.isPlaying && state.track?.uri !== song) {
      player.current.togglePlay();
    }
  }, [wait]);

  const getTags = async uri => {
    let tags = await axios.get(url + "api/getSongTags", { params: { uri } });
    tags = tags.data ? tags.data : [];
    return tags;
  };

  return (
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
  );
}

export default MusicPlayer;
