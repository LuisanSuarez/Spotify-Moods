import { useState, useEffect } from "react";
import styled from "styled-components";
import playlistsService from "../services/playlistsService";

import SideBar from "../views/SideBar";
import PlaylistCreator from "../views/PlaylistCreator";
import Tracks from "../components/Tracks";

const ContainerFlex = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
  padding-top: ${props => props.headerHeight};
  padding-bottom: ${props => props.playerHeight};
  box-sizing: border-box;
  height: 100%;
`;

// margin-left: ${props => props.sidebarWidth};

const MusicFlex = styled.div`
  display: flex;
  flex-direction: column;
`;

export default function PlayMusic({
  tokens,
  sidebarMB,
  headerHeight,
  playerHeight,
}) {
  const [showPlaylists, setShowPlaylists] = useState(true);
  const [displayPlaylist, setDisplayPlaylist] = useState({
    name: "Dev Playlist",
    id: "3y1Jndo8RSD7sOtDAXnJO0",
  });
  const [allTags, setAllTags] = useState([]);

  const [allPlaylists, setAllPlaylists] = useState([]);

  const [tagsCount, setTagsCount] = useState({});

  const [sidebarWidth, setSidebarWidth] = useState("16vw");

  const url =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8880/"
      : "http://localhost:8880/";

  const spotifyUrl = "https://api.spotify.com/v1/me/";

  useEffect(async () => {
    const allTags = await playlistsService.getTags();

    setAllTags(allTags);
  }, []);

  useEffect(async () => {
    const allPlaylists = await playlistsService.getPlaylistsNames();
    // Array(10)
    //   .fill("playlist")
    //   .forEach(name => allPlaylists.push({ name, id: name }));
    setAllPlaylists(allPlaylists);
  }, []);

  const chooseCategory = showPlaylists => {
    setShowPlaylists(showPlaylists);
  };

  return (
    // <div>
    <ContainerFlex
      sidebarWidth={sidebarWidth}
      playerHeight={playerHeight}
      headerHeight={headerHeight}
    >
      <SideBar
        chooseCategory={chooseCategory}
        playlists={allPlaylists}
        tags={[{ tag: "Untagged songs" }, ...allTags]}
        setDisplayPlaylist={setDisplayPlaylist}
        setSidebarWidth={setSidebarWidth}
        sidebarMB={sidebarMB}
      />
      <MusicFlex>
        <PlaylistCreator tags={allTags} />
        <Tracks
          className="musics"
          authTokens={tokens}
          tagsCount={tagsCount}
          displayPlaylist={displayPlaylist}
        />
      </MusicFlex>
    </ContainerFlex>
    // </div>
  );
}
