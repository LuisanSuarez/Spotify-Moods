import axios from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";
import SpotifyLogout from "../components/SpotifyLogout";
import User from "../components/User";
import Loading from "../components/utilities/Loading";
axios.defaults.withCredentials = false;

const ContainerFlex = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  padding-top: ${props => props.headerHeight};
  padding-bottom: ${props => props.playerHeight};
  box-sizing: border-box;
  height: 100%;
`;

export default function SpotifyLogin({ headerHeight, playerHeight }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const tokens = JSON.parse(localStorage.getItem("tokens"));

  useEffect(() => {
    async function getAndSetUserData() {
      const headers = {
        authorization: "Bearer " + tokens.access_token,
      };

      const url = "https://api.spotify.com/v1/me";

      const user = await axios.get(url, { headers });

      setUser(user.data);
      setLoading(false);
    }
    getAndSetUserData();
  }, []);

  return (
    <ContainerFlex playerHeight={playerHeight} headerHeight={headerHeight}>
      {loading ? (
        <Loading />
      ) : user.id ? (
        <>
          <User user={user} />
          <SpotifyLogout />
        </>
      ) : (
        <SpotifyLogin />
      )}
    </ContainerFlex>
  );
}
