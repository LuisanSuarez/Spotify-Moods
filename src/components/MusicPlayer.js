import { useEffect, useRef, useState } from "react";
import SpotifyPlayer from "react-spotify-web-playback";
import { useSong } from "../hooks/SongContext";
import Track from "./Track";
import "./musicPlayer.css";

import styled from "styled-components";
import axios from "axios";

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
    console.log("state callback:", 2);
    // console.log({ stateTrack: state.track, song, type: state.type });
    setStatefulness(state);
  };

  useEffect(async () => {
    // console.log("uri song changes:", 0);
    if (song) {
      const songTags = await getTags(song);
      setTags(songTags);
      // console.log({ songTags, song });
    }
    console.log({ song });
    setSelectedSong(song);
    // if (song) {
    //   // const setInterval(() => {
    //   console.log();
    //   // })
    //   // if (!state.isPlaying && state.track?.uri !== song) {
    //   // console.log("firing");
    //   //   player.current.togglePlay();
    //   // }
    //   const songTags = await getTags(song);
    //   setTags(songTags);
    // console.log({ songTags, song });
    // }
  }, [song]);

  useEffect(() => {}, [tags]);

  useEffect(() => {
    // console.log("selected Song changes:", 1);
    // console.log({ state });
    setWait(!wait);
  }, [selectedSong]);

  useEffect(async () => {
    // console.log("wait changes");
    if (!state.isPlaying && state.track?.uri !== song) {
      // console.log("firing");
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
            // handleClick={handleClick}
            track={state.track}
            trackTags={tags}
            // index={index}
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
