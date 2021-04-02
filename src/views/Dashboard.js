import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Route, useHistory } from "react-router-dom";
import styled from "styled-components";
import MusicPlayer from "../components/MusicPlayer";
import { useTokenSelection } from "../hooks/TokenContext";
import { devUrl, prodUrl } from "../services/variables";
import GetMusic from "../views/GetMusic";
import PlayMusic from "../views/PlayMusic";
import SpotifyAuth from "./SpotifyAuth";

const FixedBottom = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
`;

function Dashboard({ setPlayerHeight, playerHeight, headerHeight, warn }) {
  const [tokens, setTokens] = useState(
    JSON.parse(localStorage.getItem("tokens"))
  );
  console.log({ warn });
  const [dbName, setDbName] = useState(localStorage.getItem("dbName") || null);

  const [expiryTime, setExpiryTime] = useState(
    JSON.parse(localStorage.getItem("expiryTime")) || null
  );

  const [headers, setHeaders] = useState(
    { authorization: "Bearer " + tokens?.access_token } || ""
  );

  const [sidebarMB, setSidebarMB] = useState("52px");

  const player = useRef(null);
  const history = useHistory();

  const setTokenContext = useTokenSelection();

  const url = process.env.NODE_ENV === "development" ? devUrl : prodUrl;
  const { user, isAuthenticated, isLoading } = useAuth0();

  useEffect(async () => {
    if (dbName && tokens) return;
    const urlParams = new URLSearchParams(window.location.pathname);
    const newDbName = urlParams.get("dbName");
    const access_token = urlParams.get("access_token");
    const refresh_token = urlParams.get("refresh_token");
    if (newDbName) {
      localStorage.setItem("dbName", newDbName);
      setDbName(newDbName);
    }
    if (access_token && refresh_token) {
      const tokens = { access_token, refresh_token };
      localStorage.setItem("tokens", JSON.stringify(tokens));
      setTokens(tokens);
      setTokenContext(tokens);
      setHeaders({ authorization: "Bearer " + tokens.access_token });

      const newExpiryTime = new Date().getTime() + 3600 * 1000;
      localStorage.setItem("expiryTime", JSON.stringify(newExpiryTime));
      setExpiryTime(newExpiryTime);
    } else {
      alert("you session has ended");
      localStorage.setItem("redirectedToLogin", true);
      redirectToLogin();
    }
  }, []);

  useEffect(() => {
    const tokenRefresh = setInterval(() => {
      const time = new Date().getTime();
      if (time >= expiryTime && tokens && tokens.refresh_token) {
        axios
          .get(url + "auth/refresh_token", {
            params: {
              refresh_token: tokens.refresh_token,
            },
          })
          .then(res => res.data.access_token)
          .then(newAccessToken => {
            const newExpiryTime = time + 3600 * 1000 - 60000;
            localStorage.setItem("expiryTime", JSON.stringify(newExpiryTime));
            setExpiryTime(newExpiryTime);

            const tokens = JSON.parse(localStorage.getItem("tokens"));
            tokens.access_token = newAccessToken;
            localStorage.setItem("tokens", JSON.stringify(tokens));
            setTokens(tokens);

            setHeaders({ authorization: "Bearer " + newAccessToken });
            localStorage.setItem(
              "headers",
              JSON.stringify({ authorization: "Bearer " + newAccessToken })
            );
          })
          .catch(err => {
            console.error(err);
            if (err.message) alert(err.message);
            if (err.msg) alert(err.msg);
            redirectToLogin();
          });
      }
    }, 3000);
    return () => {
      clearInterval(tokenRefresh);
    };
  }, [expiryTime]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries =>
      rszObserverCallback(entries)
    );
    if (player.current) {
      resizeObserver.observe(player.current);
    }
    return () => {
      if (player.current) resizeObserver.unobserve(player.current);
    };
  }, [player.current]);

  const rszObserverCallback = entries => {
    for (let entry of entries) {
      let newHeight = entry.contentRect.height;
      newHeight += "px";
      setPlayerHeight(newHeight);
      setSidebarMB(newHeight);
    }
  };

  const redirectToLogin = () => {
    const redirectedToLogin = JSON.parse(
      localStorage.getItem("redirectedToLogin")
    );
    if (!redirectedToLogin) {
      localStorage.setItem("redirectedToLogin", "true");
      history.push("/");
      history.go(0);
    }
  };

  useEffect(() => {
    localStorage.setItem("redirectedToLogin", "false");
  }, []);

  return (
    <div style={{ maxWidth: "100vw", height: "100%" }}>
      <Route path="/dashboard/play">
        <PlayMusic
          tokens={tokens}
          sidebarMB={sidebarMB}
          headerHeight={headerHeight}
          playerHeight={playerHeight}
        />
      </Route>
      <Route path="/dashboard/sync">
        <GetMusic headerHeight={headerHeight} playerHeight={playerHeight} />
      </Route>
      <Route path="/dashboard/spotifylogin">
        <SpotifyAuth headerHeight={headerHeight} playerHeight={playerHeight} />
      </Route>
      <FixedBottom ref={player}>
        <MusicPlayer token={tokens?.access_token} className="PLAYER" />
      </FixedBottom>
    </div>
  );
}

export default Dashboard;
