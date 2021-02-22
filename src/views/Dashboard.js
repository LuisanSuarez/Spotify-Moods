import { useState, useEffect, useRef } from "react";
import { useTokenSelection } from "../hooks/TokenContext";
import { Route, useHistory } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import authService from "../services/authService";

import PlayMusic from "../views/PlayMusic";
import GetMusic from "../views/GetMusic";

import MusicPlayer from "../components/MusicPlayer";

const FixedBottom = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
`;

const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8880/"
    : "http://localhost:8880/";

function Dashboard({ setPlayerHeight, playerHeight, headerHeight }) {
  const [tokens, setTokens] = useState(
    JSON.parse(localStorage.getItem("tokens"))
  );

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

  useEffect(async () => {
    if (tokens) return;
    try {
      let tokens = await authService.getTokens();
      if (!tokens || !tokens.access_token) {
        alert("you session has ended");
        redirectToLogin();
        return;
      }
      localStorage.setItem("tokens", JSON.stringify(tokens));
      const newExpiryTime = new Date().getTime() + tokens.expires_in * 1000;
      localStorage.setItem("expiryTime", JSON.stringify(newExpiryTime));
      setExpiryTime(newExpiryTime);
      setHeaders({ authorization: "Bearer " + tokens.access_token });
      setTokens(tokens);
      setTokenContext(tokens);
    } catch (err) {
      if (err.data) {
        console.error({
          STATUS_CODE: err.data.status,
          ERROR_MESSAGE: err.data.message,
        });
      } else {
        console.error(err);
      }
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
      history.push("/login");
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
      <Route path="/dashboard/sync" component={GetMusic} />
      <FixedBottom ref={player}>
        <MusicPlayer token={tokens?.access_token} className="PLAYER" />
      </FixedBottom>
    </div>
  );
}

export default Dashboard;
