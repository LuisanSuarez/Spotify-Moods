import React, { useEffect, useState } from "react";
import styled from "styled-components";
import tracksService from "../services/tracksService";
import playlistsService from "../services/playlistsService";

import Track from "./Track";
import Error from "./utilities/Error";
import Loading from "./utilities/Loading";

const TracksContainer = styled.div`
  width: 84vw;
  border: 1px solid blue;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  margin: 0 auto;
  overflow-y: scroll;
`;

export default function Tracks({ tagsCount, displayPlaylist }) {
  const playlistId = displayPlaylist.id || displayPlaylist.tag;
  const playlistName = displayPlaylist.name || displayPlaylist.tag;
  const url =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8880/"
      : "http://localhost:8880/";

  const [tracks, setTracks] = useState([]);
  const [tokens, setTokens] = useState(
    JSON.parse(localStorage.getItem("tokens"))
  );
  const [song, setSong] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(async () => {
    if (!playlistId) return;

    setLoading(true);

    let newTracks;
    let tracksIds;
    try {
      if (playlistId === "Untagged songs") {
        newTracks = await playlistsService.getUntaggedSongs();
      } else {
        tracksIds = await playlistsService.getPlaylistTrackIds(playlistId);
        newTracks = await tracksService.getTracksBulk(tracksIds);
      }
    } catch (error) {
      console.error(error);
      alert("present error:", JSON.stringify(error));
      console.error(error);
      newTracks = [];
    } finally {
      setTracks(newTracks);
      setLoading(false);
    }
  }, [displayPlaylist]);

  const handleClick = uri => {
    setSong(uri);
    //XXX TODO play song
  };

  return (
    <>
      <h2>{playlistName}</h2>
      {displayPlaylist && !loading ? (
        <TracksContainer>
          {tracks[0] ? (
            tracks.map((track, index) => (
              <Track
                key={track.id}
                handleClick={handleClick}
                track={track}
                trackTags={track.tags}
                index={index}
                tagsCount={tagsCount}
              />
            ))
          ) : (
            <Error
              title="we didn't find your songs :("
              subtitle="choose another playlist, or try again"
            />
          )}
        </TracksContainer>
      ) : (
        <Loading />
      )}
    </>
  );
}
