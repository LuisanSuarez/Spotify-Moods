import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import authService from "../services/authService";
import { COLOR, devUrl, prodUrl } from "../services/variables";

const LogoutButton = styled.div`
  width: 120px;
  height: 40px;
  background: ${COLOR.sixty};
  border-radius: 8px;
  box-sixing: border-box;
  padding: 20px;
  color: ${COLOR.thirty};
`;

function Login({ headerHeight }) {
  const url = process.env.NODE_ENV === "development" ? devUrl : prodUrl;
  // const { user, isAuthenticated, isLoading } = useAuth0();

  const [user, setUser] = useState(false);
  useEffect(() => {
    async function getAndSetUser() {
      const user = await authService().getUser();
      setUser(user.display_name ? user : false);
    }
    getAndSetUser();
  }, []);

  const handleLogout = () => {
    alert("logging you out");
    localStorage.clear();
    setUser(false);
  };

  return (
    <div className="container" style={{ paddingTop: headerHeight }}>
      {user ? (
        <div>
          <h3> Hey, you're logged in as {user.display_name} </h3>
          <h4> And your email is {user.email}</h4>
          <Link to="/dashboard/play" style={{ textDecoration: "none" }}>
            {" "}
            Go to my music
          </Link>
          <br></br>
          <br></br>
          <h4> Not {user.display_name}? </h4>
          <LogoutButton onClick={handleLogout}> Log out </LogoutButton>
        </div>
      ) : (
        <div id="login">
          <h1> Welcome to Moods </h1>
          <br></br>
          <br></br>
          <a href={url + "auth/login"} className="btn btn-primary">
            Log in with Spotify
          </a>
        </div>
      )}
    </div>
  );
}

export default Login;
