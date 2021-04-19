import { throttle } from "lodash";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import playlistsService from "../services/playlistsService";
import tracksService from "../services/tracksService";
import variables from "../services/variables";
import Track from "./Track";
import Error from "./utilities/Error";
import Loading from "./utilities/Loading";

const TracksContainer = styled.div`
  width: 84vw;
  border: 1px solid blue;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin: 0 auto;
  overflow-y: scroll;
`;

export default function Tracks({ allTags, displayPlaylist }) {
  const playlistId = displayPlaylist.id || displayPlaylist.tag;
  const playlistName = displayPlaylist.name || displayPlaylist.tag;

  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [startFetch, setStartFetch] = useState(false);
  const [lastPageFetched, setLastPageFetched] = useState(0);
  const [trackIds, setTrackIds] = useState([]);
  const scrollElement = useRef(null);
  const limit = 20;

  const [force, deploy] = useState("this will be a");

  useEffect(() => {
    console.log("forced deploy");
    force = force + "deploy";
    deploy("forcing a deploy");
  }, []);

  useEffect(async () => {
    if (!playlistId) return;

    setLoading(true);
    if (playlistId === variables.newUserId) {
      setLoading(false);
      return;
    }
    let newTracks;
    let trackIds;
    try {
      if (playlistId === "Untagged songs") {
        newTracks = await playlistsService().getUntaggedSongs();
      } else {
        trackIds = await playlistsService().getPlaylistTrackIds(playlistId);
        const nextLimit = limit;
        newTracks = await tracksService().getTracksBulk(
          trackIds.slice(0, nextLimit)
        );
        setLastPageFetched(1);
        setTrackIds(trackIds);
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

  useEffect(() => {
    if (startFetch) getMoreTracks();
  }, [startFetch]);

  const getMoreTracks = async () => {
    if (loading || fetchingMore) return;
    setFetchingMore(true);
    const startsFrom = lastPageFetched * limit;
    const nextLimit = (lastPageFetched + 1) * limit;

    let newTracks;
    try {
      newTracks = await tracksService().getTracksBulk(
        trackIds.slice(startsFrom, nextLimit)
      );
    } catch (error) {
      alert("present error:", JSON.stringify(error));
      console.error(error);
      newTracks = [];
    } finally {
      setLastPageFetched(lastPageFetched + 1);
      setTracks([...tracks, ...newTracks]);
      setFetchingMore(false);
      setStartFetch(false);
    }
  };

  function getScrollDistToBottom() {
    const target = scrollElement ? scrollElement.current : document.body;
    const { scrollTop, offsetHeight, scrollHeight } = target;
    return scrollHeight - (offsetHeight + scrollTop);
  }

  const handleScroll = param => {
    const target = scrollElement.current;
    const distance = getScrollDistToBottom(target);
    if (distance < 250) {
      if (!fetchingMore) setStartFetch(true);
    }
  };

  useEffect(() => {
    if (!scrollElement.current) return;
    const target = scrollElement.current;

    target.addEventListener("scroll", throttle(handleScroll));

    return () => {
      if (target) {
        target.removeEventListener("scroll", throttle(handleScroll));
      }
    };
  }, [scrollElement.current, displayPlaylist]);

  return (
    <>
      {displayPlaylist && !loading ? (
        <TracksContainer ref={scrollElement}>
          <h2 style={{ width: "100%" }}>{playlistName}</h2>
          {tracks[0] ? (
            tracks.map((track, index) => (
              <Track
                key={track.id}
                track={track}
                trackTags={track.tags}
                allTags={allTags}
              />
            ))
          ) : playlistId === variables.newUserId ? (
            ""
          ) : (
            <Error
              title="we didn't find your songs :("
              subtitle="choose another playlist, or try again"
            />
          )}
        </TracksContainer>
      ) : (
        <>
          <h2>{playlistName}</h2>
          <Loading />
        </>
      )}
    </>
  );
}
