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
  const [dbTags, setDbTags] = useState([]);
  const [sidebarTags, setSidebarTags] = useState([]);

  const [allPlaylists, setAllPlaylists] = useState([]);

  const [sidebarWidth, setSidebarWidth] = useState("16vw");

  const contextTags = useTags();

  useEffect(() => {
    async function getAndSetTags() {
      const dbTags = await playlistsService().getTags();
      setDbTags(dbTags);
      const sideBarTags = [
        { _id: "Untagged songs", tag: "Untagged songs" },
        ...dbTags,
      ];
      if (displayPlaylist.createdByUser) {
        const { id } = displayPlaylist;
        const createdPlaylist = {
          id,
          _id: id,
          tag: id,
        };
        sideBarTags.unshift(createdPlaylist);
      }
      setSidebarTags(sideBarTags);
    }
    getAndSetTags();
  }, [contextTags]);

  useEffect(() => {
    async function getAndSetSavedPlaylists() {
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
    }
    getAndSetSavedPlaylists();
  }, []);

  useEffect(() => {
    async function compareAndSetSavedPlaylists() {
      const savedPlaylists = await playlistsService().getPlaylistsNames();
      if (JSON.stringify(savedPlaylists) !== JSON.stringify(allPlaylists)) {
        localStorage.setItem("saved_playlists", JSON.stringify(savedPlaylists));
        setAllPlaylists(savedPlaylists);
      }
    }
    compareAndSetSavedPlaylists();
  }, [allPlaylists]);

  const displayNewPlaylist = (songs, optionsObject) => {
    const createName = optionsObject => {
      let name = "";
      name += optionsObject.onlyWithTags
        ? "Feels only with "
        : "Feels also with ";
      optionsObject.includedTagsSorted.forEach(tag => (name += ` ${tag}`));
      name += optionsObject.excludedTagsSorted.length
        ? " but doesn't feel "
        : "";
      optionsObject.excludedTagsSorted.forEach(tag => (name += ` ${tag}`));
      return name;
    };

    const createId = optionsObject => {
      let id = "";
      id += optionsObject.onlyWithTags ? "exclusive" : "inclusive";
      optionsObject.includedTagsSorted.forEach(tag => (id += `+${tag}`));
      id += optionsObject.excludedTagsSorted.length ? "-excluding" : "";
      optionsObject.excludedTagsSorted.forEach(tag => (id += `-${tag}`));
      return id;
    };

    const name = createName(optionsObject);
    const id = createId(optionsObject);

    const displayPlaylist = {
      createdByUser: true,
      songs,
      optionsObject,
      name,
      id,
      _id: id,
      tag: id,
    };
    setDisplayPlaylist(displayPlaylist);
    setSidebarTags([{ id, _id: id, tag: id }, ...sidebarTags]);
  };

  return (
    <ContainerFlex
      sidebarWidth={sidebarWidth}
      playerHeight={playerHeight}
      headerHeight={headerHeight}
    >
      <SideBar
        playlists={allPlaylists}
        tags={sidebarTags}
        displayPlaylist={displayPlaylist}
        setDisplayPlaylist={setDisplayPlaylist}
        setSidebarWidth={setSidebarWidth}
        sidebarMB={sidebarMB}
      />
      <MusicFlex>
        <PlaylistCreator
          tags={dbTags}
          displayNewPlaylist={displayNewPlaylist}
        />
        <Tracks
          className="musics"
          authTokens={tokens}
          allTags={dbTags}
          displayPlaylist={displayPlaylist}
        />
      </MusicFlex>
    </ContainerFlex>
  );
}
