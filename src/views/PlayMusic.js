import { useEffect, useState } from "react";
import styled from "styled-components";
import Tracks from "../components/Tracks";
import { useTags } from "../hooks/TagsContext";
import playlistsService from "../services/playlistsService";
import variables from "../services/variables";
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
  const [displayPlaylist, setDisplayPlaylist] = useState({});
  const [allTags, setAllTags] = useState([]);

  const [allPlaylists, setAllPlaylists] = useState([]);

  const [sidebarWidth, setSidebarWidth] = useState("16vw");

  const contextTags = useTags();

  useEffect(async () => {
    const allTags = await playlistsService().getTags();
    setAllTags(allTags);
  }, [contextTags]);

  useEffect(async () => {
    const savedPlaylists =
      JSON.parse(localStorage.getItem("saved_playlists")) ||
      (await playlistsService().getPlaylistsNames());
    localStorage.setItem("saved_playlists", JSON.stringify(savedPlaylists));
    if (savedPlaylists.length) {
      setAllPlaylists(savedPlaylists);
      setDisplayPlaylist(savedPlaylists[0]);
    } else {
      setDisplayPlaylist({
        id: variables.newUserId,
        name: variables.newUserWelcome,
      });
    }
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
          allTags={allTags}
          displayPlaylist={displayPlaylist}
        />
      </MusicFlex>
    </ContainerFlex>
  );
}
