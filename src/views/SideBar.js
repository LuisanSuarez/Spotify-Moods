import { useState, useEffect, useRef } from "react";
import styled from "styled-components";

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
  background: pink;
  height: 100%;
  overflow-y: scroll;
`;

const PLAYLISTS = "PLAYLISTS";
const MOODS = "MOODS";

export default function SideBar({
  playlists = [],
  tags = [],
  chooseCategory,
  setDisplayPlaylist,
  setSidebarWidth,
  sidebarMB,
}) {
  // creo que podria solo ser list,
  // y los chooseCategory handlers solo le avisan arriba que pasa
  const [showPlaylists, setShowPlaylists] = useState(true);
  const sidebar = useRef(null);

  const setSidebarOption = category => {
    const showPlaylists = category === PLAYLISTS;
    setShowPlaylists(showPlaylists);
    chooseCategory(showPlaylists);
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
              <div key={playlist.id} onClick={() => handleList(playlist)}>
                <h4>{playlist.name}</h4>
              </div>
            ))
          : tags.map(tag => (
              <div key={tag.id} onClick={() => handleList(tag)}>
                <h4>{tag.tag}</h4>
              </div>
            ))}
      </ListsDisplay>
    </SideBarContainer>
  );
}
