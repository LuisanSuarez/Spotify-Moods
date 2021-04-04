import { useEffect, useState } from "react";
import styled from "styled-components";
import Tracks from "../components/Tracks";
import playlistsService from "../services/playlistsService";
import PlaylistCreator from "../views/PlaylistCreator";
import SideBar from "../views/SideBar";

const ContainerFlex = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
  padding-top: ${props => props.headerHeight};
  padding-bottom: ${props => props.playerHeight};
  box-sizing: border-box;
  height: 100%;
`;

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
  const [displayPlaylist, setDisplayPlaylist] = useState({
    name: "Dev Playlist",
    id: "3y1Jndo8RSD7sOtDAXnJO0",
  });
  const [allTags, setAllTags] = useState([]);

  const [allPlaylists, setAllPlaylists] = useState([]);

  const [tagsCount, setTagsCount] = useState({});

  const [sidebarWidth, setSidebarWidth] = useState("16vw");

  useEffect(async () => {
    const allTags = await playlistsService().getTags();

    setAllTags(allTags);
  }, []);

  useEffect(async () => {
    const allPlaylists = await playlistsService().getPlaylistsNames();
    setAllPlaylists(allPlaylists);
  }, []);

  return (
    <ContainerFlex
      sidebarWidth={sidebarWidth}
      playerHeight={playerHeight}
      headerHeight={headerHeight}
    >
      <SideBar
        playlists={allPlaylists}
        tags={[{ _id: "Untagged songs", tag: "Untagged songs" }, ...allTags]}
        displayPlaylist={displayPlaylist}
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
  );
}
