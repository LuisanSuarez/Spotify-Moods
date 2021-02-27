import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import styled from "styled-components";
import "./App.css";
import { SongProvider } from "./hooks/SongContext";
import { TokenProvider } from "./hooks/TokenContext";
import { devUrl, prodUrl } from "./services/variables";
import Dashboard from "./views/Dashboard";
import GetMusic from "./views/GetMusic";
import Login from "./views/Login";

const FixedHeader = styled.header`
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  height: 10vh;
  max-height: 100px;
`;

function App() {
  const [playerHeight, setPlayerHeight] = useState("52px");
  const [headerHeight, setHeaderHeight] = useState("62px");

  const header = useRef(null);

  const url = process.env.NODE_ENV === "development" ? devUrl : prodUrl;

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

  return (
    <div className="App">
      <SongProvider>
        <TokenProvider>
          <BrowserRouter>
            <FixedHeader className="App-header" ref={header}>
              <h1
                className="App-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Moods
              </h1>
              <Link to="/dashboard/sync">Sync my Music</Link>
              <Link to="/dashboard/play">Dashsboard</Link>
            </FixedHeader>
            <Switch>
              <Route exact path="/" component={Login} />
              <Route exact path="/login" component={Login} />
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
        </TokenProvider>
      </SongProvider>
    </div>
  );
}

export default App;
