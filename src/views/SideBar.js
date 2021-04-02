import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { COLOR } from "../services/variables";

const SideBarContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 16vw;
  max-width: 140px;
  height: 100%;
  left: 0;
  margin-bottom: ${props => props.sidebarMB};
`;

const NavBar = styled.nav`
  height: auto;
  background: blue;
  display: flex;
  padding: 0 10px;
  justify-content: space-around;
`;

const NavButton = styled.div`
  margin: 0 5px;
  background: #61dafb;
  border: 1px solid orange;
`;

const ListsDisplay = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background: ${COLOR.sixtyDarker};
  height: 100%;
  overflow-y: scroll;
`;

const Item = styled.div`
  width: 97%;
  border: 2px solid ${COLOR.sixtyLighter};
  transform: translateX(-1px);
  background: ${props =>
    props.isSelected ? COLOR.transparentShade : "transparent"};
  &:hover {
    background: ${COLOR.transparentShade};
  }
`;

const ItemName = styled.h4`
  color: ${COLOR.sixtyLighter};
`;

const PLAYLISTS = "PLAYLISTS";
const MOODS = "MOODS";

export default function SideBar({
  playlists = [],
  tags = [],
  displayPlaylist = { id: "" },
  setDisplayPlaylist,
  setSidebarWidth,
  sidebarMB,
}) {
  const [showPlaylists, setShowPlaylists] = useState(true);
  const sidebar = useRef(null);

  const setSidebarOption = category => {
    const showPlaylists = category === PLAYLISTS;
    setShowPlaylists(showPlaylists);
  };

  const handleList = list => {
    setDisplayPlaylist(list);
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries =>
      rszObserverCallback(entries)
    );
    if (sidebar.current) {
      resizeObserver.observe(sidebar.current);
    }
    return () => {
      if (sidebar.current) resizeObserver.unobserve(sidebar.current);
    };
  }, [sidebar.current]);

  const rszObserverCallback = entries => {
    for (let entry of entries) {
      let newWidth = entry.contentRect.width;
      newWidth += "px";
      setSidebarWidth(newWidth);
    }
  };
  return (
    <SideBarContainer className="SIDEBAR" ref={sidebar} sidebarMB={sidebarMB}>
      <NavBar>
        <NavButton onClick={() => setSidebarOption(PLAYLISTS)}>
          <p>playlists</p>
        </NavButton>
        <NavButton onClick={() => setSidebarOption(MOODS)}>
          <p>moods</p>
        </NavButton>
      </NavBar>
      <ListsDisplay>
        {showPlaylists
          ? playlists.map(playlist => (
              //make this a component
              <Item
                key={playlist.id}
                onClick={() => handleList(playlist)}
                isSelected={displayPlaylist._id === playlist._id}
              >
                <ItemName>{playlist.name}</ItemName>
              </Item>
            ))
          : tags.map(tag => (
              <Item
                key={tag._id}
                onClick={() => handleList(tag)}
                isSelected={displayPlaylist._id === tag._id}
              >
                <ItemName>{tag.tag}</ItemName>
              </Item>
            ))}
      </ListsDisplay>
    </SideBarContainer>
  );
}
