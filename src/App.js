import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import styled from "styled-components";
import "./App.css";
import profileIcon from "./assets/img/icon/profile.png";
import { SongProvider } from "./hooks/SongContext";
import { TagsProvider } from "./hooks/TagsContext";
import { TokenProvider } from "./hooks/TokenContext";
import Dashboard from "./views/Dashboard";
import GetMusic from "./views/GetMusic";
import Login from "./views/Login";

const FixedHeader = styled.header`
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  height: 10vh;
  min-height: 65px;
  max-height: 100px;
  display: flex;
  justify-content: space-between;
  padding-left: 107px;
  box-sizing: border-box;
`;

const HeaderEnd = styled.div`
  margin-right: 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 105px;
  margin-bottom: -8px;
`;

function App() {
  const [playerHeight, setPlayerHeight] = useState("52px");
  const [headerHeight, setHeaderHeight] = useState("62px");
  const [isMainView, setIsMainView] = useState(
    window.location.pathname.split("/").pop() === "play"
  );

  const header = useRef(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries =>
      rszObserverCallback(entries)
    );
    if (header.current) {
      resizeObserver.observe(header.current);
    }
    return () => {
      if (header.current) resizeObserver.unobserve(header.current);
    };
  }, [header.current]);

  const rszObserverCallback = entries => {
    for (let entry of entries) {
      let newHeight = entry.contentRect.height;
      newHeight += "px";
      setHeaderHeight(newHeight);
    }
  };

  const handleNav = () => {
    const isMainView = window.location.pathname.split("/").pop() === "play";
    setIsMainView(isMainView);
  };

  return (
    <div className="App">
      p
      <SongProvider>
        <TokenProvider>
          <TagsProvider>
            <BrowserRouter>
              <FixedHeader className="App-header" ref={header}>
                <Link
                  to="/dashboard/play"
                  style={{ textDecoration: "none", marginTop: "-2px" }}
                >
                  <h1
                    className="App-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Moods
                  </h1>
                </Link>
                <HeaderEnd>
                  <div onClick={handleNav}>
                    {isMainView ? (
                      <Link
                        style={{ textDecoration: "none" }}
                        to="/dashboard/sync"
                      >
                        Sync{" "}
                      </Link>
                    ) : (
                      <Link
                        style={{ textDecoration: "none" }}
                        to="/dashboard/play"
                      >
                        Play{" "}
                      </Link>
                    )}
                  </div>
                  <Link to="#">
                    <img src={profileIcon} className="profile-icon" />
                  </Link>
                </HeaderEnd>
              </FixedHeader>
              <Switch>
                <Route exact path="/">
                  <Login headerHeight={headerHeight} />
                </Route>
                <Route exact path="/login">
                  <Login headerHeight={headerHeight} />
                </Route>

                <Route path="/dashboard">
                  <Dashboard
                    setPlayerHeight={setPlayerHeight}
                    playerHeight={playerHeight}
                    headerHeight={headerHeight}
                  />
                </Route>
                <Route path="dashboard/sync" component={GetMusic} />
              </Switch>
            </BrowserRouter>
          </TagsProvider>
        </TokenProvider>
      </SongProvider>
    </div>
  );
}

export default App;
