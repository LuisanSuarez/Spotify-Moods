import { throttle } from "lodash";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useSongSelection } from "../hooks/SongContext";
import { useTagsUpdating } from "../hooks/TagsContext";
import playlistsService from "../services/playlistsService";
import sortingService from "../services/sortingService";
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

  const setContextTags = useTagsUpdating();
  const setSong = useSongSelection();

  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [startFetch, setStartFetch] = useState(false);
  const [lastPageFetched, setLastPageFetched] = useState(0);
  const [trackIds, setTrackIds] = useState([]);
  const scrollElement = useRef(null);
  const limit = 20;

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
      const nextLimit = limit;
      if (playlistId === "Untagged songs") {
        const skip = 0;
        newTracks = await playlistsService().getUntaggedSongs(limit, skip);
      } else if (displayPlaylist.createdByUser) {
        newTracks = await tracksService().getTracksBulk(displayPlaylist.songs);
      } else {
        trackIds = await playlistsService().getPlaylistTrackIds(playlistId);
        newTracks = await tracksService().getTracksBulk(
          trackIds.slice(0, nextLimit)
        );
        setTrackIds(trackIds);
      }
      setLastPageFetched(1);
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
    const skip = startsFrom;
    const nextLimit = (lastPageFetched + 1) * limit;
    let newTracks;
    try {
      if (playlistId === "Untagged songs") {
        newTracks = await playlistsService().getUntaggedSongs(limit, skip);
      } else {
        newTracks = await tracksService().getTracksBulk(
          trackIds.slice(startsFrom, nextLimit)
        );
      }
    } catch (error) {
      alert("present error:", JSON.stringify(error));
      console.error(error);
      newTracks = [];
    } finally {
      const newTracksArray = [...tracks, ...newTracks];
      setLastPageFetched(lastPageFetched + 1);
      setTracks(newTracksArray);
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

  const sort = filter => {
    let newTracks = [...tracks];
    const fns = sortingService();
    let filterFn;
    switch (filter) {
      case "name":
        filterFn = fns.filterName;
        break;
      case "artist_name":
        filterFn = fns.filterArtistName;
        break;
      case "tags":
        filterFn = fns.filterTags;
        break;
      default:
        filterFn = fns.filterName;
    }
    setTracks(newTracks.sort(filterFn));
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

  const handlePlay = ({ uri, tags, index }) => {
    setContextTags({ tags, uri });
    const songs = tracks.map(uri => "spotify:track:" + uri.id);
    setSong(songs.slice(index));
  };

  return (
    <>
      {displayPlaylist && !loading ? (
        <TracksContainer ref={scrollElement}>
          <h2 style={{ width: "100%" }}>{playlistName}</h2>
          <div onClick={() => sort("name")}>
            <h2>Sort by Name</h2>
          </div>
          <div onClick={() => sort("artist_name")}>
            <h2>Sort by Artist Name</h2>
          </div>
          <div onClick={() => sort("tags")}>
            <h2>Sort by Tags</h2>
          </div>
          {tracks[0] ? (
            tracks.map((track, index) => (
              <Track
                key={track.id}
                track={track}
                trackTags={track.tags}
                allTags={allTags}
                index={index}
                handlePlay={handlePlay}
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
